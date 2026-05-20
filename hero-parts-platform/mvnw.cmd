@REM ----------------------------------------------------------------------------
@REM Hero Parts Platform - Maven Wrapper (auto-downloads Maven 3.9.9 on first run)
@REM ----------------------------------------------------------------------------
@echo off
setlocal enabledelayedexpansion

set MAVEN_VERSION=3.9.9
set MAVEN_DIST_DIR=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%
set MVN_CMD=%MAVEN_DIST_DIR%\bin\mvn.cmd

if not exist "%MVN_CMD%" (
    echo [INFO] Maven %MAVEN_VERSION% not found. Downloading...
    set DOWNLOAD_URL=https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip
    set ZIP_FILE=%TEMP%\apache-maven-%MAVEN_VERSION%-bin.zip

    powershell -NoProfile -NonInteractive -Command ^
        "try { Invoke-WebRequest -Uri '!DOWNLOAD_URL!' -OutFile '!ZIP_FILE!' -UseBasicParsing; Write-Host '[INFO] Download complete.'; Expand-Archive -Path '!ZIP_FILE!' -DestinationPath '%USERPROFILE%\.m2\wrapper\dists' -Force; Remove-Item '!ZIP_FILE!' } catch { Write-Error $_.Exception.Message; exit 1 }"

    if errorlevel 1 (
        echo [ERROR] Failed to download Maven. Please install it manually from:
        echo         https://maven.apache.org/download.cgi
        echo         Then add it to your PATH and re-run.
        exit /b 1
    )

    echo [INFO] Maven %MAVEN_VERSION% installed to %MAVEN_DIST_DIR%
)

"%MVN_CMD%" %*
endlocal
