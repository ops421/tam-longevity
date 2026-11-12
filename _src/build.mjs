#!/usr/bin/env node
// TAM Longevity static site builder. Zero dependencies.
// Edit _src/site.json (links, CTA target, contact) and _src/products.json (products, pricing),
// then run:  node _src/build.mjs
// Output is plain HTML in the site root, ready for GitHub Pages.

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const SRC = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(SRC, '..');
const site = JSON.parse(fs.readFileSync(path.join(SRC, 'site.json'), 'utf8'));
const products = JSON.parse(fs.readFileSync(path.join(SRC, 'products.json'), 'utf8'));
const faqData = JSON.parse(fs.readFileSync(path.join(SRC, 'faq.json'), 'utf8'));
const YEAR = new Date().getFullYear();

// ---------- icons (Lucide, MIT) ----------
const ICONS = {
  stethoscope: '<path d="M11 2v2"/><path d="M5 2v2"/><path d="M5 3H4a2 2 0 0 0-2 2v4a6 6 0 0 0 12 0V5a2 2 0 0 0-2-2h-1"/><path d="M8 15a6 6 0 0 0 12 0v-3"/><circle cx="20" cy="10" r="2"/>',
  clipboardList: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="M12 11h4"/><path d="M12 16h4"/><path d="M8 11h.01"/><path d="M8 16h.01"/>',
  clipboardCheck: '<rect width="8" height="4" x="8" y="2" rx="1"/><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><path d="m9 14 2 2 4-4"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
  package: '<path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z"/><path d="M12 22V12"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="m7.5 4.27 9 5.15"/>',
  laptop: '<path d="M20 16V7a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v9m16 0H4m16 0 1.28 2.55a1 1 0 0 1-.9 1.45H3.62a1 1 0 0 1-.9-1.45L4 16"/>',
  provider: '<circle cx="12" cy="7" r="4"/><path d="M5.5 21a6.5 6.5 0 0 1 13 0"/><path d="M9.5 15.5 12 19l2.5-3.5"/>',
  truck: '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
  check: '<circle cx="12" cy="12" r="10"/><path d="m9 12 2 2 4-4"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/><path d="m9 12 2 2 4-4"/>',
  info: '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="M18 6 6 18M6 6l12 12"/>'
};
const icon = (name, cls = '') =>
  `<svg class="ico ${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[name]}</svg>`;

// ---------- helpers ----------
const money = (n) => '$' + n.toLocaleString('en-US');
const plans = (p) => {
  const base = p.pricing.find((x) => x.months === 1)?.perMonth ?? p.pricing[0].perMonth;
  return p.pricing.map((x) => ({ ...x, save: (base - x.perMonth) * x.months }));
};
const lowest = (p) => Math.min(...p.pricing.map((x) => x.perMonth));
// url: a product's own intake form (absolute https link); defaults to the site's assessment page.
const cta = (r, label = site.assessmentLabel, cls = '', url = '') =>
  `<a class="btn btn-gold ${cls}" href="${url || r + site.assessmentUrl}">${label}${icon('arrow')}</a>`;
const write = (rel, html) => {
  const out = path.join(ROOT, rel);
  fs.mkdirSync(path.dirname(out), { recursive: true });
  fs.writeFileSync(out, html);
  console.log('wrote', rel);
};

// ---------- shared chrome ----------
function head({ title, desc, r, canonical }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<script>document.documentElement.className="js"</script>
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${desc}">
${site.noindex ? '<meta name="robots" content="noindex, nofollow">\n' : ''}<link rel="canonical" href="${site.baseUrl}/${canonical}">
<meta name="theme-color" content="#000000">
<meta property="og:type" content="website">
<meta property="og:site_name" content="${site.siteName}">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${desc}">
<meta property="og:image" content="${site.baseUrl}/assets/brand/og-image.png">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="${r}assets/brand/favicon.svg" type="image/svg+xml">
<link rel="icon" href="${r}assets/brand/favicon-32.png" sizes="32x32" type="image/png">
<link rel="apple-touch-icon" href="${r}assets/brand/apple-touch-icon.png">
<link rel="manifest" href="${r}site.webmanifest">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Montserrat:wght@600;700;800&display=swap" rel="stylesheet">
<link rel="stylesheet" href="${r}assets/css/site.css">
<script src="${r}assets/js/site.js" defer></script>
</head>`;
}

function header(r, localAnchors) {
  const link = (n) =>
    n.href.startsWith('#') ? (localAnchors ? n.href : `${r}${n.href}`) : `${r}${n.href}`;
  const treatments = products
    .map((p) => `<a href="${r}${p.slug}/">${p.fullName}</a>`)
    .join('');
  return `<a class="skip" href="#main">Skip to content</a>
<header class="site-header">
  <div class="wrap header-row">
    <a class="logo" href="${r}" aria-label="TAM Longevity home"><img src="${r}assets/brand/tam-longevity-logo-gold.svg" alt="TAM Longevity" width="140" height="60"></a>
    <nav class="nav" id="site-nav" aria-label="Main">
      <div class="nav-group">
        <button class="nav-drop" aria-expanded="false" aria-controls="drop-treatments">Treatments${icon('chevron')}</button>
        <div class="drop" id="drop-treatments">${treatments}<a href="${r}">All Weight Management</a></div>
      </div>
      ${site.nav.map((n) => `<a href="${link(n)}">${n.label}</a>`).join('\n      ')}
    </nav>
    <a class="btn btn-gold btn-sm header-cta" href="${r}${site.assessmentUrl}">Get Started${icon('arrow')}</a>
    <button class="menu-btn" aria-label="Open menu" aria-expanded="false" aria-controls="site-nav">${icon('menu', 'i-open')}${icon('close', 'i-close')}</button>
  </div>
</header>`;
}

function waves() {
  // Decorative gold light waves for the closing banner.
  const lines = [
    ['M-100 210 C 200 120, 420 260, 700 170 S 1150 60, 1500 150', 0.9, 2.2],
    ['M-100 240 C 220 160, 460 290, 720 200 S 1160 100, 1500 190', 0.55, 1.4],
    ['M-100 270 C 240 200, 480 320, 740 230 S 1170 140, 1500 230', 0.35, 1],
    ['M-100 160 C 180 60, 400 220, 680 120 S 1140 20, 1500 110', 0.4, 1.2],
    ['M-100 300 C 260 250, 500 350, 760 270 S 1180 190, 1500 270', 0.25, 0.8]
  ];
  return `<svg class="waves" viewBox="0 0 1400 340" preserveAspectRatio="none" aria-hidden="true">
  <defs><linearGradient id="wg" x1="0" x2="1"><stop offset="0" stop-color="#7a4f00" stop-opacity="0"/><stop offset=".35" stop-color="#f5b915"/><stop offset=".7" stop-color="#ffe28a"/><stop offset="1" stop-color="#c98908" stop-opacity=".2"/></linearGradient></defs>
  ${lines.map(([d, o, w], i) => `<path class="wave w${i}" d="${d}" stroke="url(#wg)" stroke-width="${w}" fill="none" opacity="${o}"/>`).join('\n  ')}
</svg>`;
}

function ctaBand(r, title, sub, label, fine = '', url = '') {
  return `<section class="cta-band">
  ${waves()}
  <div class="wrap cta-inner reveal">
    <h2>${title}</h2>
    <p>${sub}</p>
    ${cta(r, label, '', url)}
    ${fine ? `<p class="cta-fine">${fine}</p>` : ''}
  </div>
</section>`;
}

function footer(r) {
  const c = site.contact;
  const contact = [c.address, c.phone && `<a href="tel:${c.phone.replace(/[^0-9+]/g, '')}">${c.phone}</a>`, c.email && `<a href="mailto:${c.email}">${c.email}</a>`]
    .filter(Boolean)
    .map((x) => `<li>${x}</li>`)
    .join('');
  return `<footer class="site-footer">
  <div class="wrap footer-grid">
    <div class="footer-brand">
      <img src="${r}assets/brand/tam-longevity-logo-gold.svg" alt="TAM Longevity" width="150" height="64" loading="lazy">
      <p>Personalized medical weight management with licensed healthcare providers.</p>
      ${contact ? `<ul class="footer-contact">${contact}</ul>` : ''}
    </div>
    <div>
      <h3>Treatments</h3>
      <ul>${products.map((p) => `<li><a href="${r}${p.slug}/">${p.fullName}</a></li>`).join('')}</ul>
    </div>
    <div>
      <h3>Company</h3>
      <ul><li><a href="${r}about/">About</a></li><li><a href="${r}faq/">FAQ</a></li><li><a href="${r}${site.assessmentUrl}">Get Started</a></li></ul>
    </div>
    <div>
      <h3>Legal</h3>
      <ul>${site.legal.map((l) => `<li><a href="${r}${l.slug}/">${l.label}</a></li>`).join('')}</ul>
    </div>
  </div>
  <div class="wrap footer-legal">
    <p>${site.legalName} is not the prescribing clinician or dispensing pharmacy. Independent licensed healthcare providers make all medical decisions, and licensed pharmacies dispense prescriptions in accordance with applicable law. Compounded medications are not FDA-approved; the FDA does not review compounded medications for safety, effectiveness, or quality before marketing. A prescription is required, and treatment is available only when medically appropriate. This website does not provide medical advice. In an emergency, call 911.</p>
    <p>&copy; ${YEAR} ${site.legalName}. All rights reserved.</p>
  </div>
</footer>`;
}

function page({ title, desc, depth, canonical, body, localAnchors = false, extra = '' }) {
  const r = '../'.repeat(depth);
  return `${head({ title, desc, r, canonical })}
<body>
${header(r, localAnchors)}
<main id="main">
${body}
</main>
${footer(r)}
${extra}
</body>
</html>
`;
}

// ---------- reusable sections ----------
function vial(p, sizes = '(max-width: 760px) 60vw, 360px') {
  const [l1, l2] = p.vialLabel;
  return `<figure class="vial" aria-label="${l1} ${l2} vial illustration">
  <img src="../assets/img/vial-600.webp" srcset="../assets/img/vial-300.webp 300w, ../assets/img/vial-600.webp 600w, ../assets/img/vial-900.webp 900w" sizes="${sizes}" alt="" width="600" height="920" fetchpriority="high">
  <span class="vial-label"><b>${l1}</b><span>${l2}</span><i>Rx Only</i></span>
</figure>`;
}

function howItWorks(stepCopy, eyebrow = '') {
  const icons = ['laptop', 'provider', 'clipboardCheck', 'truck'];
  const steps = stepCopy.map(([h, t], i) => [icons[i], h, t]);
  return `<section class="section how" id="how-it-works">
  <div class="wrap">
    <div class="section-head reveal">
      ${eyebrow ? `<p class="eyebrow">${eyebrow}</p>` : ''}
      <h2>${eyebrow ? 'Your Health Journey, Simplified.' : 'How It Works'}</h2>
      <p>Get started in four simple steps, all online.</p>
    </div>
    <ol class="steps">
      ${steps
        .map(
          ([ic, h, t], i) => `<li class="step reveal">
        <div class="step-top"><span class="step-num">${i + 1}</span><span class="step-ico">${icon(ic)}</span></div>
        <h3>${h}</h3>
        <p>${t}</p>
      </li>`
        )
        .join('\n      ')}
    </ol>
  </div>
</section>`;
}

function faqList(items) {
  return `<div class="faq-list">
      ${items
        .map(
          (f) => `<details class="faq">
        <summary>${f.q}${icon('chevron')}</summary>
        <div class="faq-a"><p>${f.a}</p></div>
      </details>`
        )
        .join('\n      ')}
    </div>`;
}

function isiBody(p) {
  const i = p.isi;
  return `<p class="isi-lede"><strong>${p.fullName} is not FDA-approved.</strong> The information below summarizes important risks associated with ${p.name.toLowerCase()}. It does not include all possible risks. Discuss your full medical history and all medications with your healthcare provider.</p>
      <div class="boxed"><h3>Warning: Risk of Thyroid C-Cell Tumors</h3><p>${i.boxed}</p></div>
      <h3>Do not use ${p.name.toLowerCase()} if:</h3>
      <ul>${i.doNotUse.map((x) => `<li>${x}</li>`).join('')}</ul>
      <h3>Possible serious side effects include:</h3>
      <ul>${i.serious.map((x) => `<li>${x}</li>`).join('')}</ul>
      <h3>Common side effects</h3>
      <p>Common side effects may include ${i.common}</p>
      <h3>Pregnancy and breastfeeding</h3>
      <p>${i.pregnancy}</p>
      ${i.tellProvider ? `<p>${i.tellProvider}</p>` : ''}
      <p>This is a summary, not a complete list of risks. Your prescribing provider and dispensing pharmacist should review the full safety information relevant to your treatment.</p>
      <p class="isi-report"><strong>To report a side effect,</strong> contact your care team or call TAM Longevity at <a href="tel:${site.contact.phone.replace(/[^0-9]/g, '')}">${site.contact.phone}</a>. For a medical emergency, call 911.</p>
      <p>Tell your provider about all medicines you take, including insulin or sulfonylureas. You are encouraged to report negative side effects of prescription drugs to the FDA. Visit <a href="https://www.fda.gov/medwatch" rel="noopener">www.fda.gov/medwatch</a> or call 1-800-FDA-1088.</p>`;
}

// ---------- product page ----------
function productPage(p) {
  const pl = plans(p);
  const priceCells = pl
    .map(
      (x) => `<li class="plan">
          <span class="plan-term">${x.months} Month${x.months > 1 ? 's' : ''}</span>
          <span class="plan-price"><strong>${money(x.perMonth)}</strong>/mo</span>
          <span class="plan-save">${x.save > 0 ? `(Save ${money(x.save)})` : '&nbsp;'}</span>
        </li>`
    )
    .join('\n        ');
  const included = p.included;
  const body = `
<section class="product-hero">
  <div class="wrap hero-grid">
    <div class="hero-media reveal">${vial(p)}</div>
    <div class="hero-copy">
      <p class="eyebrow">TAM Longevity</p>
      <h1>${p.fullName} Injection</h1>
      <p class="hero-sub">${p.category}</p>
      <p class="hero-intro">${p.heroIntro}</p>
      <ul class="pricing" aria-label="Pricing">
        ${priceCells}
      </ul>
      <div class="hero-cta">${cta('../', site.assessmentLabel, '', p.assessmentUrl)}<p class="price-note">${site.pricingNote}</p></div>
      <p class="elig-note">${p.eligibilityNote}</p>
    </div>
  </div>
  <div class="wrap">
    <div class="notice reveal">${icon('info')}<p><strong>${p.fullName} is not FDA-approved.</strong> The FDA has not reviewed this compounded medication for safety, effectiveness, or quality before marketing. A prescription is required, and treatment is available only when medically appropriate.</p></div>
    <p class="img-note">Product image is an illustration and does not represent the actual packaging from the dispensing pharmacy.</p>
  </div>
</section>

<section class="section what">
  <div class="wrap what-grid reveal">
    <h2>What Is ${p.fullName}?</h2>
    <div class="what-copy">${p.what.map((t) => `<p>${t}</p>`).join('')}</div>
  </div>
</section>

<section class="section included">
  <div class="wrap">
    <h2 class="center reveal">What&rsquo;s Included With TAM Longevity</h2>
    <ul class="cards4">
      ${included.map(([ic, h, t]) => `<li class="card reveal">${icon(ic, 'card-ico')}<div><h3>${h}</h3><p>${t}</p></div></li>`).join('\n      ')}
    </ul>
  </div>
</section>

${howItWorks(p.steps)}

<section class="section admin">
  <div class="wrap what-grid reveal">
    <h2>How Is ${p.fullName} Administered?</h2>
    <div class="what-copy">${p.administration.map((t) => `<p>${t}</p>`).join('')}</div>
  </div>
</section>

<section class="section why">
  <div class="wrap">
    <div class="why-card reveal">
      <picture class="why-img"><img src="../assets/img/${p.photo}-1024.webp" srcset="../assets/img/${p.photo}-640.webp 640w, ../assets/img/${p.photo}-1024.webp 1024w, ../assets/img/${p.photo}-1600.webp 1600w" sizes="(max-width: 860px) 100vw, 50vw" alt="${p.photoAlt}" width="1024" height="576" loading="lazy"></picture>
      <div class="why-copy">
        <p class="eyebrow">Why TAM Longevity</p>
        <h2>A Trusted Partner in Your Health Journey.</h2>
        <ul class="checks">
          <li>${icon('check')}Care from licensed U.S. healthcare providers</li>
          <li>${icon('check')}Personalized treatment plans and dosing</li>
          <li>${icon('check')}Convenient online care, with delivery from licensed U.S. pharmacy partners</li>
          <li>${icon('check')}Clear pricing and ongoing support</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<section class="section isi" id="isi" aria-labelledby="isi-title">
  <div class="wrap">
    <div class="isi-card">
      <div class="isi-head">${icon('shield')}<h2 id="isi-title">Important Safety Information</h2></div>
      <div class="isi-body">
      ${isiBody(p)}
      </div>
    </div>
  </div>
</section>

<section class="section faq-sec" id="faq">
  <div class="wrap narrow">
    <div class="section-head reveal">
      <h2>Frequently Asked Questions</h2>
      <p>Get answers to common questions about ${p.fullName.toLowerCase()} and our program.</p>
    </div>
    ${faqList(p.faqs)}
  </div>
</section>

${ctaBand('../', 'Your Care Starts Here.', p.ctaSub, site.assessmentLabel, 'Prescription eligibility and medication availability are subject to medical evaluation and applicable law.', p.assessmentUrl)}
`;
  const tray = `<aside class="isi-tray" id="isi-tray" aria-label="Important Safety Information summary">
  <button class="isi-tray-toggle" aria-expanded="false" aria-controls="isi-tray-body"><span><strong>Important Safety Information</strong><em>${p.fullName} is not FDA-approved. Boxed warning: risk of thyroid C-cell tumors.</em></span>${icon('chevron')}</button>
  <div class="isi-tray-body" id="isi-tray-body" hidden>${isiBody(p)}</div>
</aside>`;
  write(`${p.slug}/index.html`, page({
    title: `${p.fullName} Injection | TAM Longevity`,
    desc: `Explore ${p.fullName.toLowerCase()} for medical weight management with a licensed healthcare provider. Prescription required. Not FDA-approved.`,
    depth: 1,
    canonical: `${p.slug}/`,
    body,
    localAnchors: true,
    extra: tray
  }));
}

// ---------- home (hub) ----------
function homePage() {
  const cards = products
    .map(
      (p) => `<li class="prod-card reveal">
        <a class="prod-media" href="${p.slug}/" tabindex="-1" aria-hidden="true">${vial(p, '160px').replaceAll('../assets', 'assets').replace(' fetchpriority="high"', '')}</a>
        <div class="prod-copy">
          <h2><a href="${p.slug}/">${p.fullName}</a></h2>
          <p>${p.cardBlurb}</p>
          <a class="btn btn-gold btn-sm" href="${p.slug}/">Learn More${icon('arrow')}</a>
        </div>
      </li>`
    )
    .join('\n      ');
  const names = products.map((p) => p.name.toLowerCase());
  const nameList = names.length > 1 ? names.slice(0, -1).join(', ') + ' and ' + names.at(-1) : names[0];
  const compNames = products.map((p) => p.fullName.toLowerCase());
  const compList = compNames.length > 1 ? compNames.slice(0, -1).join(', ') + ' and ' + compNames.at(-1) : compNames[0];
  const pl = plans(products[0]);
  const priceSentence = pl
    .slice()
    .reverse()
    .map((x) => `${money(x.perMonth)} per month with a ${x.months}-month plan`)
    .join(', ');
  const faqs = [
    { q: `Are ${compList} FDA-approved?`, a: `No. ${compList.charAt(0).toUpperCase() + compList.slice(1)} are not FDA-approved, and the FDA does not review compounded medications for safety, effectiveness, or quality before they are marketed. Compounded medications are prepared by a licensed pharmacy for an individual patient based on a valid prescription.` },
    { q: `Who can take ${compNames.join(' or ')}?`, a: 'Only a licensed healthcare provider can determine whether treatment is appropriate for you, after reviewing your medical history, current medications, and health goals. These medications are not right for everyone, including people with a personal or family history of medullary thyroid carcinoma (MTC) or Multiple Endocrine Neoplasia syndrome type 2 (MEN 2).' },
    { q: 'How is the medication prescribed?', a: 'You complete a secure online health assessment. A licensed healthcare provider reviews your information and, if treatment is appropriate, issues a prescription written for you.' },
    { q: 'Where is my medication shipped from?', a: 'If prescribed, your medication is dispensed by a licensed U.S. pharmacy partner, including Rush Pharmacy and Epiq Scripts, and shipped to your address where permitted by law. Typical pharmacy processing is 24 to 48 hours after prescription approval; carrier delivery times vary.' },
    { q: 'How much does it cost?', a: `Illustrative pricing is ${priceSentence}. Final pricing is confirmed with you before you are charged. No insurance is required.` },
    { q: 'What kind of support will I receive during treatment?', a: 'Your care team is available for treatment-related questions and follow-up care throughout your program, and your provider can adjust your plan as needed.' }
  ];
  const body = `
<section class="hub-hero">
  <div class="wrap center">
    <p class="eyebrow">TAM Longevity</p>
    <h1>Medical Weight Management.<span>Personalized For You.</span></h1>
    <p class="hero-intro">Compounded GLP-1 treatment options with licensed healthcare providers, personalized care, and ongoing support.</p>
  </div>
  <div class="wrap">
    <ul class="prod-cards">
      ${cards}
    </ul>
    <div class="notice reveal">${icon('info')}<p><strong>Important Medication Information:</strong> ${compList.charAt(0).toUpperCase() + compList.slice(1)} are not FDA-approved medications. The FDA has not reviewed these products for safety, effectiveness, or quality before marketing. A prescription is required, and treatment is available only when medically appropriate.</p></div>
  </div>
</section>

${howItWorks([
  ['Complete Your Health Assessment', 'Provide information about your medical history, current medications, and health concerns.'],
  ['Connect With a Provider', 'A licensed healthcare provider reviews your information and determines whether treatment is appropriate.'],
  ['Receive Your Treatment Plan', 'Your provider discusses available options, potential risks, and recommended follow-up care.'],
  ['Receive Your Medication', 'If prescribed, medication is dispensed by a licensed pharmacy and shipped where permitted by law.']
], 'How It Works')}

<section class="section why hub-why">
  <div class="wrap">
    <div class="why-card reveal">
      <picture class="why-img"><img src="assets/img/couple-hub-1024.webp" srcset="assets/img/couple-hub-640.webp 640w, assets/img/couple-hub-1024.webp 1024w, assets/img/couple-hub-1600.webp 1600w" sizes="(max-width: 860px) 100vw, 40vw" alt="Smiling active middle-aged couple outdoors" width="1024" height="576" loading="lazy"></picture>
      <div class="why-copy">
        <p class="eyebrow">Why TAM Longevity</p>
        <h2>A Trusted Partner in Your Weight Management Journey.</h2>
      </div>
      <ul class="checks checks-detail">
        <li>${icon('check')}<span><strong>Licensed U.S. Providers</strong>Care from experienced, licensed healthcare professionals.</span></li>
        <li>${icon('check')}<span><strong>Personalized Treatment</strong>Treatment plans based on your health history and goals.</span></li>
        <li>${icon('check')}<span><strong>National Access</strong>Patients served in all 50 states through licensed U.S. pharmacy partners, including Rush Pharmacy and Epiq Scripts.</span></li>
        <li>${icon('check')}<span><strong>Transparent and Simple</strong>Clear pricing with no hidden fees. No insurance required.</span></li>
        <li>${icon('check')}<span><strong>Ongoing Support</strong>Guidance from your care team throughout your program.</span></li>
      </ul>
    </div>
  </div>
</section>

<section class="section faq-sec" id="faq">
  <div class="wrap faq-grid">
    <picture class="faq-img reveal"><img src="assets/img/faq-woman-400.webp" srcset="assets/img/faq-woman-400.webp 400w, assets/img/faq-woman-800.webp 800w" sizes="(max-width: 860px) 0px, 280px" alt="Smiling woman with silver curly hair" width="400" height="400" loading="lazy"></picture>
    <div>
      <div class="section-head reveal">
        <p class="eyebrow">FAQ</p>
        <h2>Frequently Asked Questions</h2>
        <p>Get answers to common questions about our treatments, process, and care.</p>
      </div>
      ${faqList(faqs)}
      <p class="faq-more"><a href="faq/">See all frequently asked questions${icon('arrow')}</a></p>
    </div>
  </div>
</section>

${ctaBand('', 'Start Your Journey Today.', 'Complete a medical assessment to explore your treatment options with a licensed healthcare provider.', 'Get Started')}
`;
  const bar = `<div class="sticky-cta" id="sticky-cta" aria-hidden="true">${cta('', site.assessmentLabel, 'btn-block')}</div>`;
  write('index.html', page({
    title: 'TAM Longevity | Personalized Medical Weight Management',
    desc: 'Compounded GLP-1 treatment options with licensed healthcare providers, personalized care, and ongoing support. Prescription required.',
    depth: 0,
    canonical: '',
    body,
    localAnchors: true,
    extra: bar
  }));
}

// ---------- simple content pages ----------
function simplePage(slug, title, eyebrow, html, desc) {
  write(`${slug}/index.html`, page({
    title: `${title} | TAM Longevity`,
    desc,
    depth: 1,
    canonical: `${slug}/`,
    body: `
<section class="simple">
  <div class="wrap narrow">
    <p class="eyebrow">${eyebrow}</p>
    <h1>${title}</h1>
    ${html}
  </div>
</section>
${ctaBand('../', 'Your Care Starts Here.', 'Explore treatment options with a licensed healthcare provider.', 'Get Started')}`
  }));
}

const soon = (what) => `<div class="placeholder"><p>${what}</p></div>`;

homePage();
products.forEach(productPage);
simplePage('get-started', 'Online Assessment', 'Get Started',
  // Each treatment opens its own intake form when it has one, otherwise its product page.
  `<p class="lead">Choose a treatment below to start your secure online health assessment.</p>
    <p>You will answer questions about your medical history, current medications, and health goals. A licensed healthcare provider will review your information and determine whether treatment is appropriate.</p>
    <div class="chooser">${products.map((p) => `<a class="chooser-item" href="${p.assessmentUrl || `../${p.slug}/`}"><span>${p.chooserLabel || p.fullName}</span>${icon('arrow')}</a>`).join('')}</div>
    <p class="chooser-more">Want to learn more first? Read about ${products.map((p) => `<a href="../${p.slug}/">${p.fullName.toLowerCase()}</a>`).join(' and ')}.</p>`,
  'Start your TAM Longevity online health assessment.');
simplePage('about', 'About TAM Longevity', 'About',
  `<p class="lead">TAM Longevity is an online healthcare platform that connects patients with licensed medical providers for personalized medical evaluations, treatment options, and ongoing care.</p>
    <p>When medically appropriate, prescription medications may be dispensed and shipped directly to patients by licensed U.S. pharmacies.</p>
    <h2>Our Network</h2>
    <ul class="about-list">
      <li><strong>Provider network.</strong> TAM Longevity works with <a href="https://locumtele.org/" rel="noopener" target="_blank">LocumTele</a>, a healthcare provider network that connects patients with licensed medical professionals for telehealth evaluations and treatment planning. Prescribing decisions are made independently by licensed healthcare providers based on each patient's medical needs.</li>
      <li><strong>Pharmacy partners.</strong> Prescriptions are fulfilled by licensed U.S. pharmacy partners, including <a href="https://rushpharmacy.com/" rel="noopener" target="_blank">Rush Pharmacy</a> and <a href="https://epiqscripts.com/" rel="noopener" target="_blank">Epiq Scripts</a>. The dispensing pharmacy may vary based on your location, medication availability, and applicable state requirements.</li>
      <li><strong>Where we serve.</strong> TAM Longevity serves patients in all 50 U.S. states through its network of licensed healthcare providers and pharmacy partners. Specific treatments and medications may not be available in every state.</li>
    </ul>
    <h2>Contact</h2>
    <p>${site.legalName}<br>${site.contact.address}<br><a href="tel:${site.contact.phone.replace(/[^0-9]/g, '')}">${site.contact.phone}</a><br><a href="mailto:${site.contact.email}">${site.contact.email}</a></p>`,
  'About TAM Longevity: online medical evaluations with licensed providers and licensed U.S. pharmacy partners.');
// Legal pages from _src/legal/<slug>.md
//   "## " heading, "- " bullet, "!! " draft banner, "@@ a | b" address block,
//   [BRACKETED NOTES] shown as highlighted draft notes while site.draft is true, removed otherwise.
const esc = (t) => t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
function inline(t) {
  t = esc(t);
  return t.replace(/\s*\[([^\]]+)\]/g, (_, n) => (site.draft ? ` <mark class="draft-note">Draft note: ${n}</mark>` : ''));
}
function legalHtml(md) {
  const out = [];
  let list = null;
  const flush = () => { if (list) { out.push(`<ul>${list.join('')}</ul>`); list = null; } };
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    if (!line) { flush(); continue; }
    if (line.startsWith('- ')) { (list ||= []).push(`<li>${inline(line.slice(2))}</li>`); continue; }
    flush();
    if (line.startsWith('## ')) out.push(`<h2>${esc(line.slice(3))}</h2>`);
    else if (line.startsWith('!! ')) { if (site.draft) out.push(`<div class="draft-banner"><strong>Draft</strong><p>${esc(line.slice(3))}</p></div>`); }
    else if (line.startsWith('@@ ')) out.push(`<p class="address">${line.slice(3).split(' | ').map(esc).join('<br>')}</p>`);
    else if (line.startsWith('Last Updated')) out.push(`<p class="updated">${esc(line)}</p>`);
    else { const html = inline(line).trim(); if (html) out.push(`<p>${html}</p>`); }
  }
  flush();
  return out.join('\n    ');
}
site.legal.forEach((l) => {
  const md = fs.readFileSync(path.join(SRC, 'legal', `${l.slug}.md`), 'utf8');
  simplePage(l.slug, l.label, 'Legal', `<div class="legal">${legalHtml(md)}</div>`, `${site.legalName} ${l.label}.`);
});

// Full FAQ page from _src/faq.json
simplePage('faq', 'Frequently Asked Questions', 'FAQ',
  `<p class="lead">Find answers to common questions about TAM Longevity, our medical services, prescriptions, shipping, and patient support.</p>
    <nav class="faq-jump" aria-label="FAQ topics">${faqData.map((c, i) => `<a href="#topic-${i + 1}">${c.title}</a>`).join('')}</nav>
    ${faqData.map((c, i) => `<section class="faq-topic" id="topic-${i + 1}"><h2>${c.title}</h2>
    <div class="faq-list">${c.items.map((f) => `<details class="faq"><summary>${f.q}${icon('chevron')}</summary><div class="faq-a">${f.a.map((x) => (x.startsWith('<ol') ? x : `<p>${x}</p>`)).join('').replaceAll('{r}', '../')}</div></details>`).join('')}</div></section>`).join('\n    ')}`,
  'Answers to common questions about TAM Longevity, prescriptions, shipping, billing, and our provider and pharmacy network.');

// 404 uses absolute paths because it can be served from any depth.
write('404.html', page({
  title: 'Page Not Found | TAM Longevity',
  desc: 'Page not found.',
  depth: 0,
  canonical: '404.html',
  body: `<section class="simple"><div class="wrap narrow center"><p class="eyebrow">404</p><h1>Page Not Found</h1><p class="lead">The page you are looking for does not exist or has moved.</p><a class="btn btn-gold" href="/">Back to Home${icon('arrow')}</a></div></section>`
}));

// sitemap
const urls = ['', ...products.map((p) => p.slug + '/'), 'get-started/', 'about/', 'faq/', ...site.legal.map((l) => l.slug + '/')];
write('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${site.baseUrl}/${u}</loc></url>`).join('\n')}
</urlset>
`);
write('robots.txt', site.noindex ? 'User-agent: *\nDisallow: /\n' : `User-agent: *\nAllow: /\nSitemap: ${site.baseUrl}/sitemap.xml\n`);
