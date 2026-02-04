param([string]$cmd = "up")

switch ($cmd.ToLower()) {
  "up" { docker compose -f docker-compose.dev.yml up -d }
  "down" { docker compose -f docker-compose.dev.yml down }
  default { Write-Host "Usage: .\scripts\dev.ps1 [up|down]" }
}
