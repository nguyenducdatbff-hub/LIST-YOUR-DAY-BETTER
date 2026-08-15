@echo off
chcp 65001 >nul
title Day Code Len GitHub - Aesthetic Focus To-Do
cd /d "%~dp0"

echo ========================================================
echo   🌸 DONG GOI VA DAY CODE LEN GITHUB (1-CLICK) 🌸
echo ========================================================
echo.

:: 1. Kiem tra kho Git
if not exist ".git" (
    echo [1/4] Khoi tao Git repository...
    git init
    git branch -M main
) else (
    echo [1/4] Git repository da ton tai.
)

:: 2. Add tat ca file
echo [2/4] Dang gom tat ca file ung dung...
git add .

:: 3. Commit
echo [3/4] Dang tao ban commit...
git commit -m "Release: Aesthetic Focus To-Do & Companion App"

:: 4. Kiem tra Remote
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo ========================================================
    echo   CHUA KET NOI VOI KHO GITHUB!
    echo ========================================================
    echo Hay tao mot Repository MOI tren GitHub (vi du: aesthetic-todo)
    echo Sau do copy link HTTPS (dang: https://github.com/user/repo.git)
    echo.
    set /p REPO_URL=">> Dan link GitHub repository cua ban vao day roi go Enter: "
    if not "%REPO_URL%"=="" (
        git remote add origin %REPO_URL%
        echo Dang day code len branch main...
        git push -u origin main
    )
) else (
    echo [4/4] Dang day code len GitHub...
    git push origin main
)

echo.
echo ========================================================
echo   DA HOAN TAT!
echo   Hay vao Settings > Pages tren GitHub de bat link 24/7!
echo ========================================================
echo.
pause
