<?php
/** @noinspection PhpUnhandledExceptionInspection */
declare(strict_types=1);
// TODO unit test

use Slim\Exception\HttpException;
use Slim\Http\Request;
use Slim\Http\Response;

class ErrorHandler {

    static function logException(Throwable $throwable, bool $logTrace = false): string {

        $ip = explode(".", $_SERVER['REMOTE_ADDR']);
        $ipAnon = "user-" . md5($ip[0] . ($ip[1] ?? '') . ($ip[2] ?? '') . $_SERVER['HTTP_USER_AGENT']);

        $errorUniqueId = uniqid('error-', true);
        $code = ErrorHandler::getHTTPSaveExceptionCode($throwable);

        $logHeadline = [$ipAnon, $errorUniqueId];

        if (method_exists($throwable, 'getTitle') and $throwable->getTitle()) {
            $logHeadline[] = "({$throwable->getTitle()})";
        } else {
            $logHeadline[] = "($code)";
        }

        $logHeadline[] = "`{$throwable->getMessage()}`";

        if (is_a($throwable, "Slim\Exception\HttpException")) {
            $request = $throwable->getRequest();
            $serverParams = $request->getServerParams();
            $logHeadline[] = "on `[{$serverParams['REQUEST_METHOD']}] {$serverParams['REQUEST_URI']}`";
        }

        if ($logTrace) {
            $logHeadline[] = "at {$throwable->getFile()}:{$throwable->getLine()}";
        }

        error_log(implode(' ', $logHeadline));

        return $errorUniqueId;
    }


    static function getHTTPSaveExceptionCode(Throwable $throwable): int {

        if (is_a($throwable, "Slim\Exception\HttpException") or is_a($throwable, 'HttpError')) {
            return $throwable->getCode();
        }

        return 500;
    }


    public function __invoke(Request $request, Response $response, Throwable $throwable): Response {

        $code = ErrorHandler::getHTTPSaveExceptionCode($throwable);
        $errorUniqueId = ErrorHandler::logException($throwable, $code >= 500);

        if (!is_a($throwable, "Slim\Exception\HttpException")) {
            $newThrowable = new HttpException($request, $throwable->getMessage(), $code, $throwable);
            if (method_exists($throwable, 'getTitle')) {
                $newThrowable->setTitle($throwable->getTitle());
            }
            $throwable = $newThrowable;
        }

        return $response
            ->withStatus($throwable->getCode(), $throwable->getTitle())
            ->withHeader('Content-Type', 'text/html')
            ->withHeader('Error-ID', $errorUniqueId)
            ->write($throwable->getMessage() ? $throwable->getMessage() : $throwable->getDescription());
    }
}
