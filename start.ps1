Write-Host "========================================================" -ForegroundColor Amber
Write-Host "       CS2 TACTICAL HQ - DEMARRAGE LOCAL" -ForegroundColor Yellow
Write-Host "========================================================" -ForegroundColor Amber

$root = $PSScriptRoot

Write-Host "`nDemarrage du Backend FastAPI sur le port 8000..." -ForegroundColor Cyan
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\backend'; & '.\.venv\Scripts\python.exe' -m uvicorn app.main:app --port 8000 --host 127.0.0.1 --reload"

Start-Sleep -Seconds 2

Write-Host "Demarrage du Frontend Vite sur le port 5173..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$root\frontend'; npm run dev"

Write-Host "`n========================================================" -ForegroundColor Amber
Write-Host "Application lancee avec succes !" -ForegroundColor Green
Write-Host "Interface Web React : http://127.0.0.1:5173" -ForegroundColor White
Write-Host "API Swagger Backend : http://127.0.0.1:8000/docs" -ForegroundColor White
Write-Host "========================================================" -ForegroundColor Amber
