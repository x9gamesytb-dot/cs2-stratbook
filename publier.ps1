$Host.UI.RawUI.WindowTitle = "CS2 Tactical HQ - Envoi vers GitHub"
Clear-Host
Write-Host "======================================================================" -ForegroundColor Green
Write-Host "           PUBLICATION DE TON STRATBOOK VERS GITHUB" -ForegroundColor Green
Write-Host "======================================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Depot cible : https://github.com/x9gamesytb-dot/cs2-stratbook.git" -ForegroundColor Cyan
Write-Host "Envoi des dossiers backend et frontend en cours..." -ForegroundColor Yellow
Write-Host ""

Set-Location "C:\Users\x9gam\Desktop\CS2 Strat"
$git = "C:\Users\x9gam\AppData\Local\Microsoft\WinGet\Packages\Git.MinGit_Microsoft.Winget.Source_8wekyb3d8bbwe\cmd\git.exe"

& $git add .
& $git commit -m "Projet complet avec backend et frontend"
& $git branch -M main
& $git push -f -u origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "======================================================================" -ForegroundColor Green
    Write-Host " SUCCES ! Tout ton projet est maintenant en ligne sur GitHub !" -ForegroundColor Green
    Write-Host " Verifie sur : https://github.com/x9gamesytb-dot/cs2-stratbook" -ForegroundColor Green
    Write-Host " Tu verras bien les dossiers backend et frontend sur ton GitHub !" -ForegroundColor Green
    Write-Host "======================================================================" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "Une erreur est survenue lors de l'envoi." -ForegroundColor Red
}

Write-Host ""
Read-Host "Appuie sur Entree pour quitter..."