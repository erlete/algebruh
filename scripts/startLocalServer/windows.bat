@echo off

:: Check argument count:
if "%1"=="" (
    echo No development mode specified
    exit /b 1
) else if "%2"=="" (
    echo No port specified
    exit /b 1
)

:: Check argument values:
if "%1"=="Production" (
    set dir=src
) else if "%1"=="DevTools" (
    set dir=.
) else (
    echo Invalid development mode specified
    exit /b 1
)

:: Start local server:
php -S localhost:%2 -t %dir%
