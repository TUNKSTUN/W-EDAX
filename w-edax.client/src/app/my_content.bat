@echo off
setlocal enabledelayedexpansion

rem Define output files
set DIR_OUTPUT_FILE=directory_structure.txt
set CONTENT_OUTPUT_FILE=file_contents.txt

rem Clear the output files
> %DIR_OUTPUT_FILE% echo Directory Structure
> %CONTENT_OUTPUT_FILE% echo File Contents

rem List directory structure and add it to the directory structure file
tree /F >> %DIR_OUTPUT_FILE%
echo. >> %DIR_OUTPUT_FILE%

rem Read each file and append its content to the file contents file
for /r %%F in (*) do (
    echo File: %%F >> %CONTENT_OUTPUT_FILE%
    type "%%F" >> %CONTENT_OUTPUT_FILE%
    echo. >> %CONTENT_OUTPUT_FILE%
)

echo Done.
