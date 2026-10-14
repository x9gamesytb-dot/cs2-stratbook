$WshShell = New-Object -ComObject WScript.Shell
$Shortcut = $WshShell.CreateShortcut('C:\Users\x9gam\Desktop\Partager CS2 Strat.lnk')
$Shortcut.TargetPath = 'C:\Users\x9gam\Desktop\CS2 Strat\partager_avec_un_ami.bat'
$Shortcut.WorkingDirectory = 'C:\Users\x9gam\Desktop\CS2 Strat'
$Shortcut.IconLocation = 'C:\Users\x9gam\Desktop\CS2 Strat\cs2_icon.ico,0'
$Shortcut.Save()
