# Script de lancement automatique CS2 Tactical HQ
$ErrorActionPreference = "SilentlyContinue"
$root = "C:\Users\x9gam\Desktop\CS2 Strat"
$python = "$root\backend\.venv\Scripts\python.exe"
$npm = if (Test-Path "C:\Program Files\nodejs\npm.cmd") { "C:\Program Files\nodejs\npm.cmd" } else { "npm.cmd" }

# 1. Vérification du Backend (Port 8000)
$backendRunning = $false
try {
    $tcpBackend = New-Object System.Net.Sockets.TcpClient
    $tcpBackend.Connect("127.0.0.1", 8000)
    $backendRunning = $true
    $tcpBackend.Close()
} catch {
    $backendRunning = $false
}

if (-not $backendRunning) {
    Start-Process -FilePath $python `
        -ArgumentList "-m uvicorn app.main:app --port 8000 --host 127.0.0.1" `
        -WorkingDirectory "$root\backend" `
        -WindowStyle Hidden
}

# 2. Vérification du Frontend (Port 5173)
$frontendRunning = $false
try {
    $tcpFrontend = New-Object System.Net.Sockets.TcpClient
    $tcpFrontend.Connect("127.0.0.1", 5173)
    $frontendRunning = $true
    $tcpFrontend.Close()
} catch {
    $frontendRunning = $false
}

if (-not $frontendRunning) {
    Start-Process -FilePath "cmd.exe" `
        -ArgumentList "/c `"$npm`" run dev" `
        -WorkingDirectory "$root\frontend" `
        -WindowStyle Hidden
}

# 3. Attente active que l'interface Vite soit prête
$ready = $false
for ($i = 0; $i -lt 15; $i++) {
    Start-Sleep -Milliseconds 800
    try {
        $tcpCheck = New-Object System.Net.Sockets.TcpClient
        $tcpCheck.Connect("127.0.0.1", 5173)
        $ready = $true
        $tcpCheck.Close()
        break
    } catch {}
}

# 4. Ouverture automatique du navigateur web par défaut
Start-Process "http://127.0.0.1:5173"
