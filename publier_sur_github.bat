@echo off
chcp 65001 > nul
title CS2 Tactical HQ - Envoi vers GitHub
color 0A
cls

cd /d "C:\Users\x9gam\Desktop\CS2 Strat"

echo ======================================================================
echo           PUBLICATION DE TON STRATBOOK VERS GITHUB
echo ======================================================================
echo.
echo Dépôt cible : https://github.com/x9gamesytb-dot/cs2-stratbook.git
echo.
echo Envoi des fichiers complets (avec backend et frontend) en cours...
echo.

set GIT_PATH="C:\Users\x9gam\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

%GIT_PATH% add .
%GIT_PATH% commit -m "Projet complet avec backend et frontend"
%GIT_PATH% branch -M main
%GIT_PATH% push -f -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo  SUCCÈS ! Tout ton projet est maintenant en ligne sur GitHub !
    echo  Vérifie sur : https://github.com/x9gamesytb-dot/cs2-stratbook
    echo ======================================================================
    echo.
    echo  Tu verras bien les dossiers "backend" et "frontend" sur ton GitHub !
    echo ======================================================================
) else (
    echo.
    echo Une erreur est survenue lors de l'envoi.
)

pause
