@echo off
chcp 65001 > nul
title CS2 Tactical HQ - Partager avec un coéquipier
color 0B
cls
echo ======================================================================
echo         CS2 TACTICAL STRATBOOK - PARTAGE AVEC TON COÉQUIPIER
echo ======================================================================
echo.
echo  Assure-toi que CS2 Tactical HQ est bien lancé sur ton PC.
echo.
echo  Choisis comment tu veux partager :
echo.
echo  [1] Partager sur INTERNET (Ton pote est chez lui) - via LocalTunnel
echo  [2] Partager sur INTERNET (Ton pote est chez lui) - via Tunnel SSH direct (Pinggy)
echo  [3] Partager sur le RESEAU LOCAL (Ton pote est sur le même Wi-Fi / box)
echo.
set /p choix="Entre ton choix (1, 2 ou 3) : "

if "%choix%"=="1" (
    cls
    echo ======================================================================
    echo  CREATION DU LIEN INTERNET (LOCALTUNNEL)
    echo ======================================================================
    echo.
    echo  Le lien HTTPS va s'afficher ci-dessous.
    echo  Copie-le et envoie-le à ton pote sur Discord / Steam !
    echo.
    echo  NOTE: Laisse cette fenêtre OUVERTE tant qu'il utilise le site.
    echo ======================================================================
    echo.
    npx --yes localtunnel --port 5173
    pause
    exit /b
)

if "%choix%"=="2" (
    cls
    echo ======================================================================
    echo  CREATION DU LIEN INTERNET (TUNNEL SSH PINGGY)
    echo ======================================================================
    echo.
    echo  Connexion au tunnel sécurisé en cours...
    echo  Le lien HTTPS apparaîtra ci-dessous.
    echo.
    echo  NOTE: Laisse cette fenêtre OUVERTE tant qu'il utilise le site.
    echo ======================================================================
    echo.
    ssh -p 443 -R0:localhost:5173 -o StrictHostKeyChecking=no a.pinggy.io
    pause
    exit /b
)

if "%choix%"=="3" (
    cls
    echo ======================================================================
    echo  PARTAGE RESEAU LOCAL (MEME WI-FI)
    echo ======================================================================
    echo.
    echo  Voici les adresses IP de ton PC :
    ipconfig | findstr /i "IPv4"
    echo.
    echo  Donne à ton pote l'adresse avec le port :5173
    echo  Exemple : http://172.20.10.4:5173 (ou l'IP affichée ci-dessus)
    echo.
    pause
    exit /b
)

echo Choix invalide.
pause
