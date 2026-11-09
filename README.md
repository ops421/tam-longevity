# TAM Longevity website

Static site for tamlongevity.com. Plain HTML, CSS and a little JS. No framework.

## Change prices, products or links
All content that changes lives in two files:

- `_src/products.json`: one entry per product (name, pricing, copy, safety info, FAQs).
  Prices are `perMonth` for each plan. "Save $X" is calculated automatically
  from the 1-month price, so edit only the monthly numbers.
- `_src/site.json`: assessment button target (`assessmentUrl`), pricing note,
  footer contact details, nav links, legal page list, and `noindex`.

Then rebuild:

```bash
node _src/build.mjs
```

### Add a product
Copy an entry in `products.json`, change `slug`, names and copy, rebuild. The
product page, home card, nav dropdown, footer link and sitemap all appear
automatically. The vial photo is a blank label with the name drawn in HTML,
so it works for any product. Pages that do not use the GLP-1 safety layout
will need their own `isi` content.

## Preview locally
```bash
python3 -m http.server 8095 --bind 0.0.0.0
```
Open http://localhost:8095 (or this machine's tailnet / LAN address from a phone).

## Before launch
- Replace placeholder pages: about, resources, get-started, and the four legal pages.
- Set `assessmentUrl` to the real intake form.
- Fill `contact` in `site.json`.
- Medical/legal review of the Important Safety Information in `products.json`.
- Set `noindex` to `false` (this also flips `robots.txt`).
- GitHub Pages: add a `CNAME` file containing `tamlongevity.com`, then at GoDaddy
  add A records for `@` to 185.199.108.153, .109.153, .110.153, .111.153 and a
  CNAME for `www` to `ops421.github.io`.

## Brand files
`brand/` holds every logo version (SVG and PNG at 512/1024/2048), icons, the
social share image, the source photos, and the scripts that generated them.
See `brand/README.md`.
