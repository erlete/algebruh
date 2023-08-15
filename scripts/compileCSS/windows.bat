@echo off

:: Check argument count:
if "%1"=="" (
    echo No development mode specified
    exit /b 1
) else if "%2"=="" (
    echo No compilation mode specified
    exit /b 1
)

:: Check argument values:
if "%1"=="Production" (
    set dir=src
) else if "%1"=="DevTools" (
    set dir=devtools
) else (
    echo Invalid development mode specified
    exit /b 1
)

if "%2"=="Single" (
    set extraArg=
) else if "%2"=="Continuous" (
    set extraArg=-w
) else (
    echo Invalid compilation mode specified
    exit /b 1
)

:: Compile CSS:
npx tailwindcss -i %dir%\\styles\\template.css -o %dir%\\styles\\output.css %extraArg%
