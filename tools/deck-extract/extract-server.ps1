# One-off helper used to extract deck pages/crops (accepts POST /save). Not for production.
param([string]$Root = (Resolve-Path "$PSScriptRoot\..\..").Path, [int]$Port = 5178)
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$Port/")
$listener.Start()
Write-Output "Serving $Root on http://localhost:$Port/"
$types = @{ ".html"="text/html"; ".js"="application/javascript"; ".mjs"="application/javascript"; ".css"="text/css"; ".pdf"="application/pdf"; ".png"="image/png"; ".jpg"="image/jpeg"; ".svg"="image/svg+xml"; ".json"="application/json"; ".woff2"="font/woff2"; ".webp"="image/webp" }
while ($listener.IsListening) {
  $ctx = $listener.GetContext()
  $req = $ctx.Request; $res = $ctx.Response
  try {
    $path = [Uri]::UnescapeDataString($req.Url.AbsolutePath)
    if ($req.HttpMethod -eq "POST" -and $path -eq "/save") {
      $name = $req.QueryString["name"] -replace '[^A-Za-z0-9_.-]', ''
      $outDir = Join-Path $Root "tools\deck-extract\out"
      if (-not (Test-Path $outDir)) { New-Item -ItemType Directory $outDir | Out-Null }
      $fs = [System.IO.File]::Create((Join-Path $outDir $name))
      $req.InputStream.CopyTo($fs); $fs.Close()
      $res.StatusCode = 200
    } else {
      if ($path -eq "/") { $path = "/index.html" }
      $file = Join-Path $Root ($path.TrimStart('/') -replace '/', '\')
      if (Test-Path $file -PathType Leaf) {
        $ext = [IO.Path]::GetExtension($file).ToLower()
        if ($types.ContainsKey($ext)) { $res.ContentType = $types[$ext] }
        $bytes = [IO.File]::ReadAllBytes($file)
        $res.ContentLength64 = $bytes.Length
        $res.OutputStream.Write($bytes, 0, $bytes.Length)
      } else { $res.StatusCode = 404 }
    }
  } catch { $res.StatusCode = 500 }
  $res.OutputStream.Close()
}
