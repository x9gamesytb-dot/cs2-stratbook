Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\x9gam\Desktop\CS2 Strat"
WshShell.Run "powershell.exe -ExecutionPolicy Bypass -NoProfile -File ""C:\Users\x9gam\Desktop\CS2 Strat\launch_app.ps1""", 0, False
