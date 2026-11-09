#!/bin/bash
# Renders every SVG lockup to PNG (512/1024/2048 wide, transparent) and builds
# favicon, app icons and the social share image. Needs google-chrome and ffmpeg.
set -e
cd "$(dirname "$0")/.."            # brand/
SITE=$(cd .. && pwd)
mkdir -p logo/png icons social "$SITE/assets/brand"
shot() { google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars \
  --default-background-color=00000000 --window-size="$2,$3" --screenshot="$4" "file://$1" >/dev/null 2>&1; }

for f in logo/svg/*.svg; do
  n=$(basename "$f" .svg)
  vb=$(grep -o 'viewBox="[^"]*"' "$f" | head -1 | tr -d '"' | cut -d= -f2)
  read -r _ _ vw vh <<<"$vb"
  for w in 512 1024 2048; do
    h=$(python3 -c "print(round($w*$vh/$vw))")
    shot "$PWD/$f" $w $h "logo/png/$n-$w.png"
  done
done

# Favicon: gold mark on a black rounded square
python3 - <<'PY'
import re
s = open('logo/svg/tam-longevity-mark-gold.svg').read()
vb = re.search(r'viewBox="([^"]+)"', s).group(1)
inner = s.split('</title>', 1)[1].rsplit('</svg>', 1)[0]
fav = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><rect width="64" height="64" rx="14" fill="#000"/><svg x="5" y="17" width="54" height="34" viewBox="{vb}">{inner}</svg></svg>
'''
open('icons/favicon.svg', 'w').write(fav)
PY
for s in 16 32 48 180 192 512; do shot "$PWD/icons/favicon.svg" $s $s "icons/icon-$s.png"; done
cp icons/icon-180.png icons/apple-touch-icon.png
ffmpeg -loglevel error -y -i icons/icon-48.png icons/favicon.ico

# Social share image 1200x630
cat > social/og.html <<HTML
<!doctype html><html><head><style>
html,body{margin:0;width:1200px;height:630px;background:radial-gradient(ellipse at 50% 130%,#3a2800 0%,#000 62%);font-family:Montserrat,Arial,sans-serif;overflow:hidden}
.c{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:34px}
img{width:520px}p{margin:0;color:#f3ead2;font-size:40px;font-weight:700;letter-spacing:.01em}
svg{position:absolute;left:0;right:0;bottom:0;width:100%;height:300px}
</style></head><body>
<svg viewBox="0 0 1400 340" preserveAspectRatio="none"><defs><linearGradient id="g" x1="0" x2="1"><stop offset="0" stop-color="#7a4f00" stop-opacity="0"/><stop offset=".4" stop-color="#f5b915"/><stop offset=".75" stop-color="#ffe28a"/><stop offset="1" stop-color="#c98908" stop-opacity=".2"/></linearGradient></defs>
<path d="M-100 250 C 200 160, 420 300, 700 210 S 1150 100, 1500 190" stroke="url(#g)" stroke-width="2.4" fill="none" opacity=".9"/>
<path d="M-100 280 C 220 200, 460 330, 720 240 S 1160 140, 1500 230" stroke="url(#g)" stroke-width="1.4" fill="none" opacity=".5"/>
<path d="M-100 310 C 240 240, 480 360, 740 270 S 1170 180, 1500 270" stroke="url(#g)" stroke-width="1" fill="none" opacity=".3"/></svg>
<div class="c"><img src="../logo/svg/tam-longevity-logo-gold.svg"><p>Personalized Medical Weight Management</p></div>
</body></html>
HTML
google-chrome --headless=new --disable-gpu --no-sandbox --hide-scrollbars --window-size=1200,630 --screenshot="social/og-image.png" "file://$PWD/social/og.html" >/dev/null 2>&1

# Copy what the website uses
cp logo/svg/tam-longevity-logo-gold.svg icons/favicon.svg social/og-image.png icons/favicon.ico icons/apple-touch-icon.png "$SITE/assets/brand/"
cp icons/icon-32.png "$SITE/assets/brand/favicon-32.png"
cp icons/icon-192.png icons/icon-512.png "$SITE/assets/brand/"
echo "brand assets rendered"
