# Kill anything on port 9090 and all java processes, then start the backend
Write-Host "Clearing port 9090 and any stale Java processes..."

Get-Process -Name "java" -ErrorAction SilentlyContinue | ForEach-Object {
    $_.Kill()
    Write-Host "  Killed java PID $($_.Id)"
}

$portLine = netstat -ano | Select-String ":9090 " | Where-Object { $_ -match "LISTENING" } | Select-Object -First 1
if ($portLine) {
    $portPid = $portLine.ToString().Trim().Split()[-1]
    Stop-Process -Id $portPid -Force -ErrorAction SilentlyContinue
    Write-Host "  Killed PID $portPid on port 9090"
}

Write-Host "Starting backend on http://localhost:9090 ..."
.\mvnw.cmd spring-boot:run
