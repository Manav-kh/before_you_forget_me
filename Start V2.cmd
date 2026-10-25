@echo off
cd /d "%~dp0"
if not exist node_modules call npm.cmd install
if errorlevel 1 goto failed
if not exist .local\admin-access.txt call npm.cmd run setup
if errorlevel 1 goto failed
call npm.cmd run dev
goto :eof
:failed
echo Setup could not finish. Review the message above.
pause
