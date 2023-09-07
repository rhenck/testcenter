<?php
declare(strict_types=1);

use JetBrains\PhpStorm\NoReturn;
use org\bovigo\vfs\vfsStream;
use org\bovigo\vfs\vfsStreamContent;
use org\bovigo\vfs\vfsStreamWrapper;

class TestEnvironment {
  const staticDate = 1627545600;

  public static function setup(string $testMode, ?string $testClock = null): void {
    $testMode = in_array($testMode, ['prepare', 'api', 'integration', 'prepare-integration']) ? $testMode : 'api';
    $testClock = $testClock ?? self::staticDate;

    try {
      SystemConfig::$debug_useStaticTime = '@' . (int) $testClock;
      self::makeRandomStatic();
      DB::connectToTestDB();

      if ($testMode == 'integration') {
        // this is called every single call from integration tests
        self::setUpTestDataDir(false);
      }

      if (in_array($testMode, ['prepare-integration', 'prepare'])) {
        // this is called once before the api tests (dredd) and one time before each integration test (cypress)
        self::setUpTestDataDir(true);
        self::createTestFiles($testMode == 'prepare-integration');
        self::overwriteModificationDatesTestDataDir();
        self::buildTestDB();
        self::createTestData();
      }

      if ($testMode == 'api') {
        // api tests can use vfs for more speed
        self::setUpVirtualFilesystem();
        self::createTestFiles(false);
        self::overwriteModificationDatesVfs();
        // in api-tests every call is atomic and the test db gets restored afterwards
        // the test db must be set up before with $testMode == 'prepare'
        $initDAO = new InitDAO();
        $initDAO->beginTransaction();
        register_shutdown_function([self::class, "rollback"]);
      }
    } catch (Throwable $exception) {
      TestEnvironment::bailOut($exception);
    }
  }

  public static function makeRandomStatic(): void {
    srand(1);
  }

  private static function setUpVirtualFilesystem(): void {
    $vfs = vfsStream::setup('root', 0777);
    vfsStream::newDirectory('data', 0777)->at($vfs);
    vfsStream::newDirectory('data/ws_1', 0777)->at($vfs);

    define('DATA_DIR', vfsStream::url('root/data'));
  }

  private static function createTestFiles(bool $includeSystemTestFiles): void {
    $initializer = new WorkspaceInitializer();
    $initializer->importSampleFiles(1, 'default');
    Folder::createPath(DATA_DIR . "/ws_1/UnitAttachments");
    $initializer->createSampleScanImage("UnitAttachments/h5ki-bd-va4dg-jc2to2mp_6tga4teiw.png", 1);
    if ($includeSystemTestFiles) {
      $initializer->importSampleFiles(1, 'system-test');
      $initializer->importSampleFiles(2, 'default');
    }
  }

  private static function createTestData(): void {
    $initDAO = new InitDAO();

    $initDAO->createWorkspace('sample_workspace');
    $initDAO->createWorkspace('second_workspace');

    $adminId = $initDAO->createAdmin('super', 'user123');
    $initDAO->addWorkspacesToAdmin($adminId, [1, 2]);

    (new Workspace(1))->storeAllFiles();
    (new Workspace(2))->storeAllFiles();

    $initDAO->createSampleLoginsReviewsLogs();
    $initDAO->createSampleExpiredSessions();
    $initDAO->createSampleWorkspaceAdmins();
    $initDAO->createSampleMetaData();
    $personSessions = $initDAO->createSampleMonitorSessions();
    $groupMonitor = $personSessions['test-group-monitor'];
    /* @var $groupMonitor PersonSession */
    $initDAO->createSampleCommands($groupMonitor->getPerson()->getId());

    $initializer = new WorkspaceInitializer();
    $initializer->createSampleScanImage('sample_scanned_image.png', 1);
    $initDAO->importScanImage(1, 'sample_scanned_image.png');
  }

  public static function overwriteModificationDatesVfs(vfsStreamContent $dir = null): void {
    if (!$dir) {
      $dir = vfsStreamWrapper::getRoot()->getChild('data');
    }
    $dir->lastModified(TestEnvironment::staticDate);
    foreach ($dir->getChildren() as $child) {
      $child->lastModified(TestEnvironment::staticDate);
      if (is_dir($child->url())) {
        TestEnvironment::overwriteModificationDatesVfs($child);
      }
    }
  }

  static function buildTestDB(): void {
    $initDAO = new InitDAO();
    $nextPatchPath = ROOT_DIR . '/scripts/database/patches.d/next.sql';
    $fullSchemePath = ROOT_DIR . '/scripts/database/full.sql';
    $patchFileChanged = (file_exists($nextPatchPath) and (filemtime($nextPatchPath) > filemtime($fullSchemePath)));

    if (!file_exists($fullSchemePath) or $patchFileChanged) {
      TestEnvironment::updateDataBaseScheme();
      return;
    }
    $initDAO->clearDB();
    $initDAO->runFile(ROOT_DIR . '/scripts/database/full.sql');
  }

  private static function updateDataBaseScheme(): void {
    $initDAO = new InitDAO();
    $initDAO->clearDB();
    $initDAO->runFile(ROOT_DIR . "/scripts/database/base.sql");
    $initDAO->installPatches(ROOT_DIR . "/scripts/database/patches.d", false);

    $scheme = '-- IQB-Testcenter DB --';
    foreach ($initDAO::tables as $table) {
      $scheme .= "\n\n" . $initDAO->_("show create table $table")['Create Table'] .  ";";
      $scheme .= "\n" . "truncate $table; -- to reset auto-increment";
    }
    file_put_contents(ROOT_DIR . '/scripts/database/full.sql', $scheme);
  }

  private static function rollback(): void {
    $initDAO = new InitDAO();
    $initDAO->rollBack();
  }

  #[NoReturn]
  private static function bailOut(Throwable $exception): void {
    // TestEnvironment::debugVirtualEnvironment();
    $errorUniqueId = ErrorHandler::logException($exception, true);
    http_response_code(500);
    header("Error-ID:$errorUniqueId");
    echo "Could not create environment: " . $exception->getMessage();
    exit(1);
  }

  private static function setUpTestDataDir(bool $reset): void {
    define('DATA_DIR', ROOT_DIR . '/data-TEST');
    if (!$reset) {
      return;
    }
    Folder::createPath(DATA_DIR);
    Folder::deleteContentsRecursive(DATA_DIR);
  }

  private static function overwriteModificationDatesTestDataDir(?string $dir = DATA_DIR): void {
    touch($dir,TestEnvironment::staticDate);
    foreach (new DirectoryIterator($dir) as $child) {
      if ($child->isDot() or $child->isLink()) {
        continue;
      }
      touch($child->getPathname(), TestEnvironment::staticDate);
      if ($child->isDir()) {
        self::overwriteModificationDatesTestDataDir($child->getPathname());
      }
    }
  }
}
