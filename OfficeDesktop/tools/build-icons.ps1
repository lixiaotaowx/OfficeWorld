# Builds the Windows icon set and the NSIS installer artwork.
#
# Why this exists: the shipped assets/icon.ico held a single 256x256 PNG entry, so the
# notification area had no native small size to draw and the tray icon came out blank.
# A proper .ico must carry the sizes the shell actually asks for (16/20/24/32 px), so
# this regenerates it from one square master image.
#
# Usage:  powershell -ExecutionPolicy Bypass -File tools/build-icons.ps1
# Inputs: assets/icon-256.png  (created from the old .ico on first run)
# Outputs: assets/icon.ico, assets/installerSidebar.bmp, assets/installerHeader.bmp
#
# The file is ASCII-only on purpose: a Windows PowerShell 5.1 script is read as ANSI,
# so non-ASCII source would be mis-decoded.

param(
  [string]$Assets = (Join-Path $PSScriptRoot '..\assets')
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Drawing

$Assets = (Resolve-Path $Assets).Path
$masterPng = Join-Path $Assets 'icon-256.png'
$icoPath = Join-Path $Assets 'icon.ico'

# --- master image -----------------------------------------------------------
# Prefer the extracted master; otherwise lift the 256x256 PNG out of the current .ico
# (entry 0 of an ICO whose payload starts with the PNG signature).
if (-not (Test-Path $masterPng)) {
  $bytes = [System.IO.File]::ReadAllBytes($icoPath)
  $count = [BitConverter]::ToUInt16($bytes, 4)
  $offset = [BitConverter]::ToUInt32($bytes, 6 + 12)
  $length = [BitConverter]::ToUInt32($bytes, 6 + 8)
  if ($bytes[$offset] -ne 0x89 -or $bytes[$offset + 1] -ne 0x50) {
    throw 'assets/icon.ico entry 0 is not a PNG; supply assets/icon-256.png instead.'
  }
  $slice = New-Object byte[] $length
  [Array]::Copy($bytes, $offset, $slice, 0, $length)
  [System.IO.File]::WriteAllBytes($masterPng, $slice)
  Write-Host "extracted master -> $masterPng ($($count) entry/entries in the old icon)"
}

$master = [System.Drawing.Image]::FromFile($masterPng)
if ($master.Width -ne $master.Height) { throw 'the master image must be square' }
Write-Host "master: $($master.Width)x$($master.Height)"

function Resize-Square([System.Drawing.Image]$source, [int]$size) {
  $bitmap = New-Object System.Drawing.Bitmap($size, $size, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  try {
    $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $graphics.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphics.Clear([System.Drawing.Color]::Transparent)
    $graphics.DrawImage($source, (New-Object System.Drawing.Rectangle 0, 0, $size, $size))
  } finally { $graphics.Dispose() }
  return $bitmap
}

function To-PngBytes([System.Drawing.Bitmap]$bitmap) {
  $stream = New-Object System.IO.MemoryStream
  try { $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png); return $stream.ToArray() }
  finally { $stream.Dispose() }
}

# --- multi-size icon --------------------------------------------------------
# PNG payloads are used for every entry: Electron decodes the .ico itself and only
# needs a real small bitmap present, which is exactly what was missing before.
$sizes = @(16, 20, 24, 32, 40, 48, 64, 128, 256)
$payloads = @()
foreach ($size in $sizes) {
  $bitmap = Resize-Square $master $size
  try { $payloads += , (To-PngBytes $bitmap) } finally { $bitmap.Dispose() }
}

$stream = New-Object System.IO.MemoryStream
$writer = New-Object System.IO.BinaryWriter($stream)
try {
  $writer.Write([uint16]0)                 # reserved
  $writer.Write([uint16]1)                 # type: icon
  $writer.Write([uint16]$sizes.Count)
  $offset = 6 + 16 * $sizes.Count
  for ($i = 0; $i -lt $sizes.Count; $i++) {
    $size = $sizes[$i]
    $writer.Write([byte]($(if ($size -ge 256) { 0 } else { $size })))
    $writer.Write([byte]($(if ($size -ge 256) { 0 } else { $size })))
    $writer.Write([byte]0)                 # palette size
    $writer.Write([byte]0)                 # reserved
    $writer.Write([uint16]1)               # colour planes
    $writer.Write([uint16]32)              # bits per pixel
    $writer.Write([uint32]$payloads[$i].Length)
    $writer.Write([uint32]$offset)
    $offset += $payloads[$i].Length
  }
  # Payloads go through the stream, not BinaryWriter.Write(): PowerShell binds that
  # call to the single-byte overload and silently writes one byte per icon.
  $writer.Flush()
  foreach ($payload in $payloads) { $stream.Write($payload, 0, $payload.Length) }
  [System.IO.File]::WriteAllBytes($icoPath, $stream.ToArray())
} finally { $writer.Dispose(); $stream.Dispose() }
Write-Host "icon.ico -> $($sizes -join ', ') px"

# --- installer artwork ------------------------------------------------------
# NSIS wants plain 24-bit BMPs. The colours match the desktop shell: #222824 bar,
# #f6f2e8 ink, #f0d274 gold.
function New-Canvas([int]$width, [int]$height) {
  $bitmap = New-Object System.Drawing.Bitmap($width, $height, [System.Drawing.Imaging.PixelFormat]::Format24bppRgb)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
  $graphics.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::ClearTypeGridFit
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  return @{ Bitmap = $bitmap; Graphics = $graphics }
}

function New-Font([single]$size, [System.Drawing.FontStyle]$style) {
  return New-Object System.Drawing.Font('Segoe UI', $size, $style, [System.Drawing.GraphicsUnit]::Pixel)
}

# Sidebar: 164x314, the tall panel the assisted installer shows on the left.
$sidebar = New-Canvas 164 314
try {
  $rect = New-Object System.Drawing.Rectangle 0, 0, 164, 314
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush(
    $rect,
    [System.Drawing.Color]::FromArgb(34, 40, 36),
    [System.Drawing.Color]::FromArgb(47, 64, 52),
    [System.Drawing.Drawing2D.LinearGradientMode]::Vertical)
  $sidebar.Graphics.FillRectangle($brush, $rect)
  $brush.Dispose()

  $gold = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(240, 210, 116))
  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(246, 242, 232))
  $dim = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(154, 168, 154))

  $mark = Resize-Square $master 84
  $sidebar.Graphics.DrawImage($mark, 40, 46, 84, 84)
  $mark.Dispose()

  $sidebar.Graphics.FillRectangle($gold, 40, 160, 40, 3)

  $titleFont = New-Font 19 ([System.Drawing.FontStyle]::Bold)
  $sidebar.Graphics.DrawString('iruler dream', $titleFont, $ink, 38, 178)
  $titleFont.Dispose()

  $bodyFont = New-Font 11 ([System.Drawing.FontStyle]::Regular)
  $sidebar.Graphics.DrawString('A SPACE FOR PEOPLE.', $bodyFont, $gold, 40, 208)
  $sidebar.Graphics.DrawString('work together, in one room', $bodyFont, $dim, 40, 226)
  $bodyFont.Dispose()

  $footerFont = New-Font 9 ([System.Drawing.FontStyle]::Regular)
  $sidebar.Graphics.DrawString('office.iruler', $footerFont, $dim, 40, 282)
  $footerFont.Dispose()

  $ink.Dispose(); $gold.Dispose(); $dim.Dispose()
  $sidebar.Bitmap.Save((Join-Path $Assets 'installerSidebar.bmp'), [System.Drawing.Imaging.ImageFormat]::Bmp)
} finally { $sidebar.Graphics.Dispose(); $sidebar.Bitmap.Dispose() }

# Header: 150x57, the strip above the page an assisted installer walks through.
$header = New-Canvas 150 57
try {
  $header.Graphics.Clear([System.Drawing.Color]::FromArgb(34, 40, 36))
  $mark = Resize-Square $master 34
  $header.Graphics.DrawImage($mark, 14, 11, 34, 34)
  $mark.Dispose()
  $ink = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::FromArgb(246, 242, 232))
  $titleFont = New-Font 14 ([System.Drawing.FontStyle]::Bold)
  $header.Graphics.DrawString('iruler dream', $titleFont, $ink, 56, 19)
  $titleFont.Dispose()
  $ink.Dispose()
  $header.Bitmap.Save((Join-Path $Assets 'installerHeader.bmp'), [System.Drawing.Imaging.ImageFormat]::Bmp)
} finally { $header.Graphics.Dispose(); $header.Bitmap.Dispose() }

$master.Dispose()
Write-Host 'installer art -> assets/installerSidebar.bmp (164x314), assets/installerHeader.bmp (150x57)'
