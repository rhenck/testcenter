/* eslint-disable no-console,import/no-extraneous-dependencies,implicit-arrow-linebreak,function-paren-newline */
const fs = require('fs');
const Dredd = require('dredd');
const gulp = require('gulp');
const redis = require('redis');
const YAML = require('yamljs');
const request = require('request');
const cliPrint = require('../../scripts/helper/cli-print');
const jsonTransform = require('../../scripts/helper/json-transformer');
const testConfig = require('../config.json');
const { mergeSpecFiles, clearTmpDir } = require('../../scripts/update-specs');

const tmpDir = fs.realpathSync(`${__dirname}'/../../tmp`);

const getStatus = statusRequest => new Promise(resolve => {
  request(
    statusRequest,
    (error, response) =>
      resolve((!response || response.statusCode < 200 || response.statusCode >= 400) ? -1 : response.statusCode)
  );
});

const sleep = ms => new Promise(resolve => { setTimeout(resolve, ms); });

const confirmTestConfig = (serviceUrl, statusRequest) => (async done => {
  if (!serviceUrl) {
    throw new Error(cliPrint.get.error('No API Url given!'));
  }

  cliPrint.headline(`Running Dredd tests against service: ${serviceUrl}`);

  let retries = 10;
  let status = 0;
  // eslint-disable-next-line no-plusplus
  while ((status !== 200) && retries--) {
    // eslint-disable-next-line no-await-in-loop
    status = await getStatus(statusRequest);
    if (status === 200) {
      return done();
    }
    console.log(`Connection attempt failed; ${retries} retries left`);
    // eslint-disable-next-line no-await-in-loop
    await sleep(5000);
  }

  throw new Error(cliPrint.get.error(`Could not connect to ${serviceUrl}`));
});

const prepareSpecsForDredd = done => {
  const compiledFileName = `${tmpDir}/compiled.specs.yml`;
  cliPrint.headline(`Creating Dredd-compatible API-spec version from ${compiledFileName}`);

  /**
   * Before testing the standard OpenApi3-file have to be manipulated:
   * * dredd does not support multiple examples, so we generate multiple spec files for dredd.
   *   The first contains everything and the first example each if multiple are given,
   *   the subsequent ones only the paths with left out examples
   * * Dredd supports only in-file-references
   * * For more quirks of Dredd see:
   *   @see https://github.com/apiaryio/api-elements.js/blob/master/packages/fury-adapter-oas3-parser/STATUS.md
   * * [500] Server errors get not tested (how could that be)
   * * [202] get not tested // TODO why? is this necessary
   */

  const specsJson = YAML.parse(fs.readFileSync(compiledFileName, 'utf8'));
  let iterations = 1;
  let iteration = 0;
  let splitPaths = [];

  const resolveReference = (key, val) => {
    const referenceString = val.substring(val.lastIndexOf('/') + 1);
    return {
      key: null,
      val: specsJson.components.schemas[referenceString]
    };
  };

  const takeOnlyOneExample = (key, val, matches) => {
    iterations = Math.max(iterations, Object.keys(val).length);
    const currentExample = val[Object.keys(val)[iteration - 1]];
    if (typeof currentExample === 'undefined') {
      return null;
    }
    splitPaths.push(matches[1]);
    return {
      key: 'example',
      val: currentExample.value
    };
  };

  const makeDreddCompatible = {
    '^(paths > [^> ]+ > [^> ]+) > .*? > examples$': takeOnlyOneExample,
    '^info > title$': 'specs',
    'parameters > \\d+ > schema$': null,
    'text/xml > example$': null,
    'application/octet-stream > example$': null,
    '^paths > .*? > .*? > responses > (500|202)$': null,
    'schema > \\$ref$': resolveReference,
    'items > \\$ref$': resolveReference,
    deprecated: null,
    'properties > .*? > format': null,
    'schema > format': null,
    '^(paths > [^> ]+ > [^> ]+) > tags$': null,
    'responses > .*? > headers > .*? > description': null,
    'responses > .*? > headers > .*? > schema': null
  };

  const deleteAllPathsButSplit = {
    '^(paths > [^> ]+ > [^> ]+)$': (key, val, matches) => {
      if (splitPaths.indexOf(matches[1]) > -1) {
        return { key, val };
      }
      return null;
    }
  };

  // eslint-disable-next-line no-plusplus
  while (iteration++ < iterations) {
    splitPaths = [];
    const targetFileName = `${tmpDir}/transformed.specs.${iteration}.yml`;
    let transformedSpecsJson = jsonTransform(specsJson, makeDreddCompatible);
    if (iteration > 1) {
      transformedSpecsJson = jsonTransform(transformedSpecsJson, deleteAllPathsButSplit);
    }
    fs.writeFileSync(targetFileName, YAML.stringify(transformedSpecsJson, 10), 'utf8');
    console.log(`${iteration}/${iterations}: ${targetFileName} written.`);
  }

  done();
};

const runDredd = serviceUrl => (async done => {
  cliPrint.headline(`Run API-test against ${serviceUrl}`);
  new Dredd({
    endpoint: serviceUrl,
    path: [`${tmpDir}/transformed.specs.*.yml`],
    hookfiles: ['hooks.js'],
    output: [`${tmpDir}/report.html`], // TODO do something with it
    reporter: ['html'],
    names: false // use sth like this to restrict: only: ['specs > /workspace/{ws_id}/file > upload file > 403']
  }).run((err, stats) => {
    console.log(stats);
    if (err) {
      throw new Error(cliPrint.get.error(`Dredd Tests: ${err}`));
    }
    if (stats.errors + stats.failures > 0) {
      throw new Error(cliPrint.get.error(`Dredd Tests: ${stats.failures} failed and ${stats.errors} finished with error.`));
    }
    done();
  });
});

const insertGroupTokenToCacheService = async () => {
  cliPrint.headline('Inject group-token into cache');
  const client = redis.createClient({ url: 'redis://testcenter-cache-service' });
  await client.connect();
  await client.set('group-token:static:group:sample_group', 1, { EX: 60 });
  await client.quit();
};

exports.runDreddTest = gulp.series(
  confirmTestConfig(
    testConfig.backend_url, {
      url: `${testConfig.backend_url}/system/config`,
      headers: {
        TestMode: 'prepare'
      }
    }
  ),
  clearTmpDir,
  mergeSpecFiles('api/*.spec.yml'),
  prepareSpecsForDredd,
  runDredd(testConfig.backend_url)
);

exports.runDreddTestFs = gulp.series(
  confirmTestConfig(
    testConfig.file_service_url,
    {
      url: `${testConfig.file_service_url}/health`
    }
  ),
  clearTmpDir,
  mergeSpecFiles('api/file.spec.yml'),
  prepareSpecsForDredd,
  insertGroupTokenToCacheService,
  runDredd(testConfig.file_service_url)
);
