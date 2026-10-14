@echo off
chcp 65001 > nul
title CS2 Tactical HQ - Envoi vers GitHub
color 0A
cls
echo ======================================================================
echo           PUBLICATION DE TON STRATBOOK VERS GITHUB
echo ======================================================================
echo.
echo Dépôt cible : https://github.com/x9gamesytb-dot/cs2-stratbook.git
echo.
echo Envoi des fichiers en cours...
echo (Si GitHub te demande de te connecter dans ton navigateur, clique sur Autoriser)
echo.

set GIT_PATH="C:\Users\x9gam\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

%GIT_PATH% branch -M main
%GIT_PATH% push -u origin main

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================================================
    echo  SUCCÈS ! Tout ton projet est maintenant en ligne sur GitHub !
    echo  Vérifie sur : https://github.com/x9gamesytb-dot/cs2-stratbook
    echo ======================================================================
    echo.
    echo  Dernière étape - Activer Render :
    echo  1. Ouvre https://dashboard.render.com
    echo  2. Clique sur "New +" -> "Web Service"
    echo  3. Sélectionne ton dépôt "cs2-stratbook"
    echo  4. Clique sur "Deploy Web Service" (Gratuit / Free)
    echo.
    echo  Ton application sera en ligne 24h/24 !
    echo ======================================================================
) else (
    echo.
    echo Une erreur est survenue lors de l'envoi.
)

pause
