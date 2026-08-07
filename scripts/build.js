#!/usr/bin/env node
// Regenerates the shared <head>/header/footer/script regions of the 5 static
// HTML pages from the partials/ directory. The source of truth for those
// regions is partials/*.html plus the PAGES config below — edit those, then
// run `npm run build`. Do not hand-edit the content between BUILD:* markers
// in the page files themselves; the next build overwrites it.
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PARTIALS_DIR = path.join(ROOT, 'partials');

const PAGES = [
  {
    file: 'index.html',
    title: 'Car Rental in Zambia | Chaliko Car Hire Limited',
    description:
      "Chaliko Car Hire Limited, Zambia's premier car rental company. Premium, fully insured vehicles available across Lusaka, Ndola, Livingstone and beyond.",
    url: 'https://chaliko.com/',
    activeNav: 'home',
    headerInner: false,
    contactForm: true,
    isotope: true,
  },
  {
    file: 'about.html',
    title: 'About Chaliko Car Hire Limited | Car Hire in Zambia',
    description:
      "About Chaliko Car Hire Limited, Zambia's trusted car hire company serving clients across six cities with a premium fleet and exceptional service.",
    url: 'https://chaliko.com/about',
    activeNav: 'about',
    headerInner: true,
    contactForm: false,
    isotope: false,
  },
  {
    file: 'book.html',
    title: 'Book a Car Online in Zambia | Chaliko Car Hire',
    description:
      'Book a car with Chaliko Car Hire Limited. Reserve your vehicle online in minutes, fast confirmation within 2 hours.',
    url: 'https://chaliko.com/book',
    activeNav: 'book',
    headerInner: true,
    contactForm: true,
    isotope: true,
  },
  {
    file: 'contact.html',
    title: 'Contact Chaliko Car Hire Limited | Zambia',
    description:
      'Contact Chaliko Car Hire Limited. Call, email, or message us, we respond within 2 hours, Monday to Saturday.',
    url: 'https://chaliko.com/contact',
    activeNav: 'contact',
    headerInner: true,
    contactForm: true,
    isotope: false,
  },
  {
    file: 'fleet.html',
    title: 'Our Fleet: Sedans, SUVs, 4x4s & Vans | Chaliko Car Hire',
    description:
      "Browse Chaliko's full fleet, sedans, hatchbacks, SUVs, 4x4 vehicles, and buses & vans for hire across Zambia.",
    url: 'https://chaliko.com/fleet',
    activeNav: 'fleet',
    headerInner: true,
    contactForm: false,
    isotope: true,
  },
];

const NAV_LINKS = [
  { key: 'home', href: '/', label: 'Home' },
  { key: 'about', href: '/about', label: 'About Us' },
  { key: 'fleet', href: '/fleet', label: 'Our Fleet' },
  { key: 'book', href: '/book', label: 'Book Now' },
  { key: 'contact', href: '/contact', label: 'Contact' },
];

function escapeHtml(value) {
  return value.replace(/&/g, '&amp;').replace(/"/g, '&quot;');
}

function renderTemplate(template, tokens) {
  return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
    if (!(key in tokens)) throw new Error(`Missing token {{${key}}}`);
    return tokens[key];
  });
}

function renderNavItems(activeKey) {
  return NAV_LINKS.map((link) => {
    const liClasses = ['main-nav'];
    if (link.key === activeKey) liClasses.push('active');
    const aClasses = ['main-menu'];
    // "Contact" has always carried this extra class in the original design
    // (last-item styling hook), independent of which page is active.
    if (link.key === 'contact') aClasses.push('main-menu-ls');
    return `                                    <li class="${liClasses.join(' ')}"><a class="${aClasses.join(' ')}" href="${link.href}">${link.label}</a></li>`;
  }).join('\n');
}

function readPartial(name) {
  return fs.readFileSync(path.join(PARTIALS_DIR, name), 'utf8').replace(/\s+$/, '');
}

function replaceMarkerBlock(content, name, renderedInner) {
  const openRe = new RegExp(`<!-- BUILD:${name}\\s*-->`);
  const closeMarker = `<!-- /BUILD:${name} -->`;
  const openMatch = content.match(openRe);
  if (!openMatch) throw new Error(`Marker BUILD:${name} not found`);
  const startIdx = content.indexOf(openMatch[0]);
  const afterOpen = startIdx + openMatch[0].length;
  const closeIdx = content.indexOf(closeMarker, afterOpen);
  if (closeIdx === -1) throw new Error(`Closing marker for BUILD:${name} not found`);
  return `${content.slice(0, afterOpen)}\n${renderedInner}\n${content.slice(closeIdx)}`;
}

const headTemplate = readPartial('head.html');
const headerTemplate = readPartial('header.html');
const footerPartial = readPartial('footer.html');
const scriptsTemplate = readPartial('scripts.html');

for (const page of PAGES) {
  const filePath = path.join(ROOT, page.file);
  let content = fs.readFileSync(filePath, 'utf8');

  const headRendered = renderTemplate(headTemplate, {
    TITLE: escapeHtml(page.title),
    DESCRIPTION: escapeHtml(page.description),
    URL: page.url,
  });
  content = replaceMarkerBlock(content, 'HEAD', headRendered);

  const headerClass = page.headerInner
    ? 'header-one header-three header-inner header--sticky'
    : 'header-one header-three header--sticky';
  const headerRendered = renderTemplate(headerTemplate, {
    HEADER_CLASS: headerClass,
    NAV_ITEMS: renderNavItems(page.activeNav),
  });
  content = replaceMarkerBlock(content, 'HEADER', headerRendered);

  content = replaceMarkerBlock(content, 'FOOTER', footerPartial);

  const scriptsRendered = renderTemplate(scriptsTemplate, {
    CONTACT_FORM_SCRIPT: page.contactForm ? '<script src="assets/js/plugins/contact-form.js"></script>' : '',
    ISOTOPE_SCRIPT: page.isotope ? '<script src="assets/js/plugins/isotope.js"></script>' : '',
  })
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n');
  content = replaceMarkerBlock(content, 'SCRIPTS', scriptsRendered);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`built ${page.file}`);
}
