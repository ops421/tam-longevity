# TAM Longevity brand files

## Logo (`logo/svg`, `logo/png` at 512, 1024, 2048 px wide)
| File | Use |
|---|---|
| tam-longevity-logo-gold | Primary. Gold gradient, transparent, for black or dark backgrounds |
| tam-longevity-logo-gold-on-black | Same with a black background baked in |
| tam-longevity-logo-gold-dark | Deeper gold, for white or light backgrounds |
| tam-longevity-logo-flat-gold | One solid gold, for print, embroidery, foil |
| tam-longevity-logo-black / -white | One color |
| tam-longevity-logo-currentcolor | SVG that takes the surrounding text color (web use) |
| tam-longevity-mark-* | "TAM" with the arc, no LONGEVITY line, for small spaces and avatars |

Letters are converted to outlines, so the SVGs need no font installed.
Typeface basis: Montserrat (SIL Open Font License).

## Icons (`icons/`)
favicon.svg, favicon.ico, 16/32/48/180/192/512 px PNGs, apple-touch-icon.

## Social (`social/og-image.png`)
1200 x 630 link preview image.

## Source images (`source-images/`)
Full-resolution AI-generated photos and the blank-label vial used on the site.

## Rebuild
`_build/make_logo.py` (needs fonttools) writes the SVGs;
`_build/render_brand.sh` (needs Chrome and ffmpeg) renders PNGs, icons and the OG image.
