<#!
  Full MySQL copy: dev (docker-compose.dev.yml -> blog-mysql-dev, db blog_db)
  overwrites prod (docker-compose.prod.yml -> blog-mysql, db from .env.prod).

  Steps:
    1) docker compose -f docker-compose.dev.yml up -d
    2) powershell -ExecutionPolicy Bypass -File .\scripts\migrate-dev-db-to-prod.ps1

  Or import an existing dump:
    .\scripts\migrate-dev-db-to-prod.ps1 -DumpFile C:\path\to\blog_db.sql

  WARNING: Drops and recreates the production blog_db database.
  Copy packages\server\uploads to prod backend volume separately if needed.
#>
param(
  [string]$DumpFile = "",
  [string]$EnvProd = ".env.prod",
  [string]$ComposeProd = "docker-compose.prod.yml",
  [string]$DevContainer = "blog-mysql-dev",
  [string]$ProdContainer = "blog-mysql",
  [string]$DevRootPassword = "password",
  [string]$DevDatabase = "blog_db"
)

$ErrorActionPreference = "Stop"

function Read-DotEnv {
  param([string]$Path)
  if (-not (Test-Path $Path)) { throw "Missing env file: $Path" }
  $map = @{}
  Get-Content $Path | ForEach-Object {
    $line = $_.Trim()
    if (-not $line -or $line.StartsWith("#")) { return }
    $idx = $line.IndexOf("=")
    if ($idx -lt 1) { return }
    $k = $line.Substring(0, $idx).Trim()
    $v = $line.Substring($idx + 1).Trim()
    if (($v.StartsWith('"') -and $v.EndsWith('"')) -or ($v.StartsWith("'") -and $v.EndsWith("'"))) {
      $v = $v.Substring(1, $v.Length - 2)
    }
    $map[$k] = $v
  }
  return $map
}

function Test-ContainerRunning {
  param([string]$Name)
  try {
    $out = docker inspect -f "{{.State.Running}}" $Name 2>$null
    return $out -eq "true"
  } catch {
    return $false
  }
}

$root = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
Set-Location $root

$prod = Read-DotEnv (Join-Path $root $EnvProd)
$prodRoot = $prod["MYSQL_ROOT_PASSWORD"]
$prodDb = $prod["MYSQL_DATABASE"]
$prodUser = $prod["MYSQL_USER"]
$prodPass = $prod["MYSQL_PASSWORD"]
if (-not $prodRoot -or -not $prodDb -or -not $prodUser -or -not $prodPass) {
  throw ".env.prod must define MYSQL_ROOT_PASSWORD, MYSQL_DATABASE, MYSQL_USER, MYSQL_PASSWORD"
}

if (-not (Test-ContainerRunning $ProdContainer)) {
  throw "Production MySQL container '$ProdContainer' is not running. Start: docker compose --env-file $EnvProd -f $ComposeProd up -d"
}

$sqlDropCreate = @"
DROP DATABASE IF EXISTS ``$prodDb``;
CREATE DATABASE ``$prodDb`` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
GRANT ALL PRIVILEGES ON ``$prodDb``.* TO '$prodUser'@'%';
FLUSH PRIVILEGES;
"@

Write-Host "[migrate] Recreating production database $prodDb ..."
docker exec $ProdContainer mysql -uroot "-p$prodRoot" -e $sqlDropCreate
if ($LASTEXITCODE -ne 0) { throw "Failed to recreate production database" }

if ($DumpFile) {
  if (-not (Test-Path $DumpFile)) { throw "Dump file not found: $DumpFile" }
  $resolved = (Resolve-Path $DumpFile).Path
  Write-Host "[migrate] Importing from file: $resolved"
  Get-Content -LiteralPath $resolved -Raw -Encoding UTF8 | docker exec -i $ProdContainer mysql -uroot "-p$prodRoot" $prodDb
  if ($LASTEXITCODE -ne 0) { throw "Import failed" }
} else {
  if (-not (Test-ContainerRunning $DevContainer)) {
    throw @"
Dev MySQL '$DevContainer' is not running.
Start: docker compose -f docker-compose.dev.yml up -d
Or pass a dump: -DumpFile C:\path\to\blog_db.sql
"@
  }
  Write-Host "[migrate] Piping mysqldump from $DevContainer -> $ProdContainer ($DevDatabase) ..."
  docker exec $DevContainer mysqldump -uroot "-p$DevRootPassword" `
    --single-transaction --routines --triggers --events `
    --default-character-set=utf8mb4 `
    --set-gtid-purged=OFF `
    $DevDatabase | docker exec -i $ProdContainer mysql -uroot "-p$prodRoot" $prodDb
  if ($LASTEXITCODE -ne 0) { throw "Dump or import failed" }
}

Write-Host "[migrate] Database migration finished."
Write-Host ""
Write-Host "If you have local files under packages\server\uploads, copy them to prod backend /app/uploads (uploads_data volume)."
Write-Host "Recommended: docker compose --env-file $EnvProd -f $ComposeProd restart backend"
