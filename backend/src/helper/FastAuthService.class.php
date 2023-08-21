<?php

class FastAuthService {
  private static Redis $redis;

  private static function connect(): void {
    if (!isset(self::$redis)) {
      try {
        self::$redis = new Redis();
        self::$redis->connect('testcenter-fastauth-service');
      } catch (Exception $exception) {
        throw new Exception("Could not reach FastAuthService: " . $exception->getMessage());
      }
    }
  }

  static function storeAuthentication(PersonSession $personSession): void {
    self::connect();
    self::$redis->set(
      $personSession->getLoginSession()->getGroupToken(),
      $personSession->getLoginSession()->getLogin()->getWorkspaceId(),
      $personSession->getLoginSession()->getLogin()->getValidTo()
        ? $personSession->getLoginSession()->getLogin()->getValidTo() - time()
        : 24*60*60
    );
  }

  public static function removeAuthentication(PersonSession $personSession): void {
    self::connect();
    self::$redis->del($personSession->getPerson()->getToken());
  }
}