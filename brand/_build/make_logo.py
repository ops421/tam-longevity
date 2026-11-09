"""Builds the TAM Longevity wordmark as outlined SVG (no font dependency).
Run with the fonttools env: ~/.local/micromamba/envs/fonttools/bin/python make_logo.py <Montserrat[wght].ttf> <outdir>"""
import sys, os
from fontTools.ttLib import TTFont
from fontTools.varLib.instancer import instantiateVariableFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

src, out = sys.argv[1], sys.argv[2]
def inst(w):
    return instantiateVariableFont(TTFont(src), {"wght": w})
heavy, medium = inst(800), inst(500)

def text_path(font, text, x0, y0, size, tracking=0, hx=1.0):
    gs, cmap, hmtx = font.getGlyphSet(), font.getBestCmap(), font["hmtx"]
    upm = font["head"].unitsPerEm; s = size / upm
    pen = SVGPathPen(gs); x = x0
    for ch in text:
        g = cmap[ord(ch)]
        gs[g].draw(TransformPen(pen, (s * hx, 0, 0, -s, x, y0)))
        x += hmtx[g][0] * s * hx + tracking
    return pen.getCommands(), x - tracking

def bbox_w(font, text, size):
    cmap, hmtx = font.getBestCmap(), font["hmtx"]
    return sum(hmtx[cmap[ord(c)]][0] for c in text) * size / font["head"].unitsPerEm

# Geometry (units): TAM cap height 700, baseline y=700
cap_ratio = heavy["OS/2"].sCapHeight / heavy["head"].unitsPerEm
TAM_SIZE = 700 / cap_ratio
tam, tam_end = text_path(heavy, "TAM", 0, 700, TAM_SIZE, tracking=10, hx=1.16)
TAM_W = tam_end
# LONGEVITY tracked to span the same width as TAM
L_SIZE = 250 / cap_ratio
lw = bbox_w(medium, "LONGEVITY", L_SIZE)
track = (TAM_W - 20 - lw) / 8
lon, lon_end = text_path(medium, "LONGEVITY", 10, 700 + 150 + 250, L_SIZE, tracking=track)
tm, _ = text_path(medium, "TM", lon_end + 40, 700 + 150 + 80, 80 / cap_ratio, tracking=6)
swoosh = "M %d,-60 Q %d,-640 %d,190 Q %d,-490 %d,-60 Z" % (TAM_W*0.11, TAM_W*0.6, TAM_W + 780, TAM_W*0.6, TAM_W*0.11)
mark_w, top = TAM_W + 800, -400

VB_FULL = f"-20 {top} {mark_w + 40} {1100 - top + 40}"
VB_MARK = f"-20 {top} {mark_w + 40} {700 - top + 30}"

GRAD = """<defs>
<linearGradient id="g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FFE68A"/><stop offset=".45" stop-color="#F5BE1E"/><stop offset="1" stop-color="#C98908"/></linearGradient>
<linearGradient id="gd" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#E0A814"/><stop offset=".5" stop-color="#C08A0C"/><stop offset="1" stop-color="#94660A"/></linearGradient>
<linearGradient id="s" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#C98908" stop-opacity=".2"/><stop offset=".45" stop-color="#F5BE1E"/><stop offset="1" stop-color="#FFF1BF"/></linearGradient>
<linearGradient id="sd" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#94660A" stop-opacity=".25"/><stop offset=".5" stop-color="#C08A0C"/><stop offset="1" stop-color="#E0A814"/></linearGradient>
</defs>"""

def svg(vb, fill_word, fill_swoosh, fill_sub, with_sub, bg=None, defs=True):
    parts = [f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{vb}" role="img" aria-label="TAM Longevity">',
             '<title>TAM Longevity</title>']
    if defs: parts.append(GRAD)
    if bg:
        x, y, w, h = vb.split()
        parts.append(f'<rect x="{x}" y="{y}" width="{w}" height="{h}" fill="{bg}"/>')
    parts.append(f'<path fill="{fill_swoosh}" d="{swoosh}"/>')
    parts.append(f'<path fill="{fill_word}" d="{tam}"/>')
    if with_sub:
        parts.append(f'<path fill="{fill_sub}" d="{lon}"/><path fill="{fill_sub}" d="{tm}"/>')
    parts.append('</svg>')
    return "\n".join(parts) + "\n"

V = {
  # full lockups
  "tam-longevity-logo-gold.svg":          (VB_FULL, "url(#g)", "url(#s)", "#F5BE1E", True, None),
  "tam-longevity-logo-gold-on-black.svg": (VB_FULL, "url(#g)", "url(#s)", "#F5BE1E", True, "#000000"),
  "tam-longevity-logo-gold-dark.svg":     (VB_FULL, "url(#gd)", "url(#sd)", "#B07E0B", True, None),
  "tam-longevity-logo-flat-gold.svg":     (VB_FULL, "#E3A812", "#E3A812", "#E3A812", True, None),
  "tam-longevity-logo-black.svg":         (VB_FULL, "#111111", "#111111", "#111111", True, None),
  "tam-longevity-logo-white.svg":         (VB_FULL, "#FFFFFF", "#FFFFFF", "#FFFFFF", True, None),
  "tam-longevity-logo-currentcolor.svg":  (VB_FULL, "currentColor", "currentColor", "currentColor", True, None),
  # mark only (TAM + arc), for avatars and small sizes
  "tam-longevity-mark-gold.svg":          (VB_MARK, "url(#g)", "url(#s)", None, False, None),
  "tam-longevity-mark-gold-on-black.svg": (VB_MARK, "url(#g)", "url(#s)", None, False, "#000000"),
  "tam-longevity-mark-black.svg":         (VB_MARK, "#111111", "#111111", None, False, None),
  "tam-longevity-mark-white.svg":         (VB_MARK, "#FFFFFF", "#FFFFFF", None, False, None),
}
os.makedirs(out, exist_ok=True)
for name, (vb, fw, fs, fsub, sub, bg) in V.items():
    with open(os.path.join(out, name), "w") as f:
        f.write(svg(vb, fw, fs, fsub, sub, bg))
print("viewBox full", VB_FULL, "mark", VB_MARK)
