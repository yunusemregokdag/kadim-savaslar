Add-Type -AssemblyName System.Drawing

$path = "c:\Users\yunus\OneDrive\Masaüstü\Kadim savaşlar\public"
$files = Get-ChildItem $path -Recurse -Filter *.png

Write-Output "Checking images in $path..."

foreach ($f in $files) {
    try {
        $img = [System.Drawing.Image]::FromFile($f.FullName)
        
        # Check if PixelFormat supports Alpha
        $isAlpha = [System.Drawing.Image]::IsAlphaPixelFormat($img.PixelFormat)
        
        if (-not $isAlpha) {
            Write-Output "Has Background (No Alpha): $($f.FullName)"
        }
        else {
            # Even with Alpha, it might be fully opaque.
            # We can check specific pixels but that's slow.
            # For now, just suspecting files without Alpha channel is a good start (e.g. JPG saved as PNG or simple 24bit PNGs)
        }
        $img.Dispose()
    }
    catch {
        Write-Output "Error reading $($f.FullName)"
    }
}
