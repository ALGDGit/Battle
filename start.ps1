# Zero-install local static server (PowerShell only — no Python, no npm).
# Double-click start.bat, or: powershell -ExecutionPolicy Bypass -File .\start.ps1

$ErrorActionPreference = "Continue"
$port = 8080
$root = [System.IO.Path]::GetFullPath($PSScriptRoot).TrimEnd("\") + "\"
$url = "http://127.0.0.1:$port/"

$mime = @{
  ".html" = "text/html; charset=utf-8"
  ".js"   = "text/javascript; charset=utf-8"
  ".css"  = "text/css; charset=utf-8"
  ".json" = "application/json; charset=utf-8"
  ".png"  = "image/png"
  ".jpg"  = "image/jpeg"
  ".jpeg" = "image/jpeg"
  ".gif"  = "image/gif"
  ".svg"  = "image/svg+xml"
  ".webp" = "image/webp"
  ".ico"  = "image/x-icon"
  ".woff" = "font/woff"
  ".woff2"= "font/woff2"
  ".map"  = "application/json"
}

function Send-Bytes([System.Net.HttpListenerResponse]$Response, [byte[]]$Bytes, [string]$ContentType, [int]$StatusCode = 200) {
  try {
    $Response.StatusCode = $StatusCode
    $Response.ContentType = $ContentType
    $Response.ContentLength64 = $Bytes.Length
    if ($Bytes.Length -gt 0) {
      $Response.OutputStream.Write($Bytes, 0, $Bytes.Length)
    }
  } catch {
    # Client disconnected — ignore
  } finally {
    try { $Response.OutputStream.Close() } catch {}
    try { $Response.Close() } catch {}
  }
}

$listener = [System.Net.HttpListener]::new()
$listener.Prefixes.Add($url)

try {
  $listener.Start()
} catch {
  Write-Host "No se pudo abrir el puerto $port. ¿Hay otra app usándolo?"
  Write-Host $_
  exit 1
}

Write-Host "Battle listo en $url"
Write-Host "Cierra esta ventana para parar el servidor."
Start-Process $url

while ($listener.IsListening) {
  try {
    $context = $listener.GetContext()
  } catch {
    break
  }

  $request = $context.Request
  $response = $context.Response

  try {
    $rel = [Uri]::UnescapeDataString($request.Url.AbsolutePath.TrimStart("/"))
    if ([string]::IsNullOrWhiteSpace($rel)) {
      $rel = "index.html"
    }
    $rel = $rel -replace "/", [System.IO.Path]::DirectorySeparatorChar

    $full = [System.IO.Path]::GetFullPath((Join-Path $root $rel))
    if (-not $full.StartsWith($root, [System.StringComparison]::OrdinalIgnoreCase)) {
      Send-Bytes $response ([Text.Encoding]::UTF8.GetBytes("Forbidden")) "text/plain; charset=utf-8" 403
      continue
    }

    if (-not (Test-Path -LiteralPath $full -PathType Leaf)) {
      Send-Bytes $response ([Text.Encoding]::UTF8.GetBytes("Not found: $rel")) "text/plain; charset=utf-8" 404
      continue
    }

    $ext = [System.IO.Path]::GetExtension($full).ToLowerInvariant()
    $contentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { "application/octet-stream" }
    $bytes = [System.IO.File]::ReadAllBytes($full)
    Send-Bytes $response $bytes $contentType 200
  } catch {
    Send-Bytes $response ([Text.Encoding]::UTF8.GetBytes("Server error")) "text/plain; charset=utf-8" 500
  }
}
