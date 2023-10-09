<?php /** @noinspection PhpUnhandledExceptionInspection */

class CacheService {
  private static Redis|null $redis = null;

  private static function connect(): void {
    if (!isset(self::$redis)) {
      try {
        self::$redis = new Redis();
        self::$redis->connect(SystemConfig::$cacheService_host);
      } catch (RedisException $exception) {
        throw new Exception("Could not reach Cache-Service: " . $exception->getMessage());
      }
    }
  }

  static function storeAuthentication(PersonSession $personSession): void {
    self::connect();
    if (!self::$redis) {
      return;
    }
    self::$redis->set(
      'group-token:' . $personSession->getLoginSession()->getGroupToken(),
      $personSession->getLoginSession()->getLogin()->getWorkspaceId(),
      $personSession->getLoginSession()->getLogin()->getValidTo()
        ? $personSession->getLoginSession()->getLogin()->getValidTo() - time()
        : 24*60*60
    );
  }

  public static function removeAuthentication(PersonSession $personSession): void {
    self::connect();
    if (!self::$redis) {
      return;
    }
    self::$redis->del('group-token:' . $personSession->getPerson()->getToken());
  }

  public static function storeFile(string $filePath): void {
    if (!SystemConfig::$cacheService_includeFiles) {
      return;
    }
    self::connect();
    if (self::$redis->exists("file:$filePath")) {
      self::$redis->expire("file:$filePath", 24*60*60);
    } else {
      try {
        self::$redis->set("file:$filePath", file_get_contents(DATA_DIR . $filePath), 24 * 60 * 60);
      } catch (RedisException $e) {
        error_log('Cache exhausted: ' . $filePath);
      }
    }
  }

  static function getStatusFilesCache(): string {
    if (!SystemConfig::$cacheService_includeFiles) {
      return 'off';
    }
    self::connect();
    try {
      self::$redis = new Redis();
      self::$redis->connect(SystemConfig::$cacheService_host);
    } catch (RedisException $exception) {
      return 'unreachable';
    }
    return 'on';
  }
}