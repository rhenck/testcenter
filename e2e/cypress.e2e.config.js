// eslint-disable-next-line import/no-extraneous-dependencies
const { defineConfig } = require('cypress');
const deleteFolder = require('./cypress/plugins/delete-folder');
const waitForServer = require('./cypress/plugins/wait-for-server');

const frontendURL = 'http://testcenter-frontend:4200';
const backendURL = 'http://testcenter-backend';
const fileServiceURL = 'http://testcenter-file-service';

module.exports = defineConfig({
  reporter: 'junit',
  reporterOptions: {
    mochaFile: 'cypress/results/output.xml'
  },
  requestTimeout: 10000,
  e2e: {
    setupNodeEvents(on) {
      // return require('./cypress/plugins/index.js')(on, config);
      on('task', { deleteFolder });
      on('before:run', async () => {
        await waitForServer(`${backendURL}/system/config`);
        await waitForServer(frontendURL);
        await waitForServer(`${fileServiceURL}/health`);
      });
    },
    env: {
      TC_API_URL: backendURL,
      TC_FILE_SERVICE_URL: fileServiceURL
    },
    testIsolation: true
  }
});

// Keeping the old configuration here for futire reference, in case something does not work as expected.
// Also in case the coverage report is to be re-enabled.

// const { defineConfig } = require('cypress');
// const downloadFile = require('cypress-downloadfile/lib/addPlugin');
// const registerCodeCoverageTasks = require('@cypress/code-coverage/task');
// const deleteFolder = require('./cypress/plugins/delete-folder');
// const waitForBackend = require('./cypress/plugins/wait-for-backend');
// const createCodeCoverageReport = require('./cypress/plugins/create-coverage-report');
//
// const tcApiURL = 'http://testcenter-system-test-backend';
//
// module.exports = defineConfig({
//   e2e: {
//     trashAssetsBeforeRuns: true,
//     baseUrl: 'http://localhost:4200',
//     video: false,
//     screenshotOnRunFailure: false,
//     setupNodeEvents(on, config) {
//       on('task', { downloadFile });
//       on('task', { deleteFolder });
//       if (config.env.TC_TESTMODE === 'cli') {
//         on('after:run', createCodeCoverageReport);
//         registerCodeCoverageTasks(on, config);
//       }
//       on('before:run', () => waitForBackend(tcApiURL));
//       return config;
//     },
//     env: {
//       TC_API_URL: tcApiURL
//     }
//   }
// });
