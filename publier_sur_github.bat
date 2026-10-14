@echo off
chcp 65001 > nul
title CS2 Tactical HQ - Publication GitHub
color 0A
cls
echo ======================================================================
echo           PUBLICATION DE TON STRATBOOK SUR GITHUB
echo ======================================================================
echo.
echo  1. Ouvre https://github.com/new dans ton navigateur
echo  2. Nomme ton dépôt (ex: cs2-stratbook), coche Public
echo     (NE coche PAS "Add README file", laisse tout vide)
echo  3. Clique sur "Create repository"
echo.
echo  4. Copie l'URL HTTPS de ton dépôt
echo     (ex: https://github.com/ton-pseudo/cs2-stratbook.git)
echo ======================================================================
echo.
set /p repourl="Colle l'URL de ton dépôt GitHub ici et appuie sur Entrée : "

if "%repourl%"=="" (
    echo URL vide. Opération annulée.
    pause
    exit /b
)

set GIT_PATH="C:\Users\x9gam\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

echo.
echo Envoi du code sur GitHub en cours...
%GIT_PATH% remote remove origin 2>nul
%GIT_PATH% remote add origin %repourl%
%GIT_PATH% branch -M main
%GIT_PATH% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo  SUCCÈS ! Ton code est maintenant disponible sur GitHub !
    echo ======================================================================
    echo.
    echo  Dernière étape pour le déployer sur Render.com :
    echo  1. Va sur https://dashboard.render.com
    echo  2. Clique sur "New +" en haut à droite -> "Web Service"
    echo  3. Connecte ton compte GitHub et sélectionne le dépôt
    echo  4. Render détectera automatiquement la configuration Docker gratuite
    echo  5. Clique sur "Deploy Web Service"
    echo.
    echo  Ton site sera alors accessible 24h/24 en ligne gratuitement !
    echo ======================================================================
) else (
    echo.
    echo Une erreur est survenue lors du push.
    echo Vérifie que tu as bien les droits sur ce dépôt ou authentifie-toi si GitHub te le demande.
)
pause
