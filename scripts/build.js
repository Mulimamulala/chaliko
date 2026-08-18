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

// Real, currently-published vehicle specs (seats/fuel/transmission), taken
// directly from fleet.html's car-list-service markup. No pricing is included
// because none is published on the site yet (Manual Action — see plan.md).
const VEHICLES = [
  { name: 'Toyota Allion', seats: 5, fuel: 'Petrol', transmission: 'Automatic' },
  { name: 'Toyota Mark X', seats: 5, fuel: 'Petrol', transmission: 'Automatic' },
  { name: 'Lexus IS250', seats: 5, fuel: 'Petrol', transmission: 'Automatic' },
  { name: 'Honda Fit', seats: 5, fuel: 'Petrol', transmission: 'Automatic' },
  { name: 'Mitsubishi Pajero', seats: 7, fuel: 'Diesel', transmission: 'Automatic' },
  { name: 'Mitsubishi Shogun', seats: 7, fuel: 'Diesel', transmission: 'Automatic' },
  { name: 'Toyota Fortuner', seats: 7, fuel: 'Diesel', transmission: 'Automatic' },
  { name: 'Toyota Hilux', seats: 5, fuel: 'Diesel', transmission: 'Manual' },
  { name: 'Ford Ranger', seats: 5, fuel: 'Diesel', transmission: 'Automatic' },
  { name: 'Toyota Quantum', seats: 14, fuel: 'Diesel', transmission: 'Manual' },
  { name: 'Mitsubishi Rosa', seats: 26, fuel: 'Diesel', transmission: 'Manual' },
];

// Real FAQ content, taken directly from the published accordion on index.html.
const FAQS = [
  {
    question: 'Do I need a credit card to book?',
    answer:
      'We accept mobile money (MTN/Airtel), bank transfer, cash at pick-up, and debit or credit cards. A 30% deposit is required to confirm your reservation.',
  },
  {
    question: 'What documents do I need to hire?',
    answer:
      "You'll need: a valid driver's licence (Zambian or international), a national ID or passport, and funds for the security deposit. Minimum age is 23 years.",
  },
  {
    question: 'What is the minimum rental period?',
    answer: 'Our minimum hire period is two days (48 hours). Weekly and monthly rates are available at a discount.',
  },
  {
    question: 'Is fuel included in the rental price?',
    answer:
      'No. Vehicles must be returned at the same fuel level they were given at pick-up. A fuel surcharge can be pre-paid at collection if preferred.',
  },
  {
    question: 'Can I drive to other countries?',
    answer:
      'Cross-border travel requires prior approval and an additional fee. Please inform us when booking if you plan to travel outside Zambia.',
  },
];

function jsonLdScript(obj) {
  return `    <script type="application/ld+json">\n${JSON.stringify(obj, null, 4)}\n    </script>`;
}

function breadcrumbJsonLd(items) {
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  });
}

function vehicleListJsonLd() {
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Chaliko Car Hire Fleet',
    itemListElement: VEHICLES.map((v, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'Vehicle',
        name: v.name,
        brand: { '@type': 'Brand', name: v.name.split(' ')[0] },
        vehicleSeatingCapacity: v.seats,
        fuelType: v.fuel,
        vehicleTransmission: v.transmission,
      },
    })),
  });
}

function serviceJsonLd({ name, description, url, serviceType, areaServed }) {
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name,
    description,
    url,
    serviceType,
    areaServed,
    provider: { '@id': 'https://chaliko.com/#business' },
  });
}

function faqPageJsonLd() {
  return jsonLdScript({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQS.map((f) => ({
      '@type': 'Question',
      name: f.question,
      acceptedAnswer: { '@type': 'Answer', text: f.answer },
    })),
  });
}

const HOME_BREADCRUMB = [{ name: 'Home', url: 'https://chaliko.com/' }];

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
    // The homepage's fleet teaser is a plain grid, not an Isotope filter -
    // only fleet.html actually uses isotope.js.
    isotope: false,
    // jQuery UI (datepicker) and Swiper (hero/testimonial/category sliders)
    // are only used on the homepage - keep them off every other page.
    jqueryUi: true,
    swiper: true,
    heroImage: 'assets/images/banner/5.webp',
    extraJsonLd: [faqPageJsonLd()],
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
    jqueryUi: false,
    swiper: false,
    heroImage: 'assets/images/banner/2.webp',
    extraJsonLd: [
      breadcrumbJsonLd([...HOME_BREADCRUMB, { name: 'About Us', url: 'https://chaliko.com/about' }]),
    ],
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
    // book.html links out to /fleet rather than embedding an isotope grid -
    // confirmed no .main-isotop markup on this page.
    isotope: false,
    jqueryUi: false,
    swiper: false,
    heroImage: 'assets/images/banner/2.webp',
    extraJsonLd: [
      breadcrumbJsonLd([...HOME_BREADCRUMB, { name: 'Book Now', url: 'https://chaliko.com/book' }]),
    ],
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
    jqueryUi: false,
    swiper: false,
    extraJsonLd: [
      breadcrumbJsonLd([...HOME_BREADCRUMB, { name: 'Contact', url: 'https://chaliko.com/contact' }]),
    ],
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
    jqueryUi: false,
    swiper: false,
    extraJsonLd: [
      breadcrumbJsonLd([...HOME_BREADCRUMB, { name: 'Our Fleet', url: 'https://chaliko.com/fleet' }]),
      vehicleListJsonLd(),
    ],
  },
  {
    file: 'car-hire-lusaka-airport.html',
    title: 'Car Hire at Lusaka Airport | Chaliko Car Hire Limited',
    description:
      'Arriving at Kenneth Kaunda International Airport? Chaliko Car Hire offers self-drive and chauffeur-driven vehicle hire from Lusaka. Call +260 979 517 732.',
    url: 'https://chaliko.com/car-hire-lusaka-airport',
    activeNav: null,
    headerInner: true,
    contactForm: false,
    isotope: false,
    jqueryUi: false,
    swiper: false,
    heroImage: 'assets/images/banner/6.webp',
    extraJsonLd: [
      breadcrumbJsonLd([
        ...HOME_BREADCRUMB,
        { name: 'Car Hire Lusaka Airport', url: 'https://chaliko.com/car-hire-lusaka-airport' },
      ]),
      serviceJsonLd({
        name: 'Car Hire at Lusaka Airport',
        description:
          'Self-drive and chauffeur-driven vehicle hire serving Kenneth Kaunda International Airport and Lusaka, Zambia.',
        url: 'https://chaliko.com/car-hire-lusaka-airport',
        serviceType: 'Car Rental',
        areaServed: { '@type': 'Airport', name: 'Kenneth Kaunda International Airport' },
      }),
    ],
  },
  {
    file: 'car-rental-livingstone.html',
    title: 'Car Rental in Livingstone & Victoria Falls | Chaliko',
    description:
      "Self-drive and chauffeur-driven car rental in Livingstone, Zambia. Explore Victoria Falls with Chaliko's fully insured fleet. Call +260 979 517 732.",
    url: 'https://chaliko.com/car-rental-livingstone',
    activeNav: null,
    headerInner: true,
    contactForm: false,
    isotope: false,
    jqueryUi: false,
    swiper: false,
    heroImage: 'assets/images/banner/2.webp',
    extraJsonLd: [
      breadcrumbJsonLd([
        ...HOME_BREADCRUMB,
        { name: 'Car Rental Livingstone', url: 'https://chaliko.com/car-rental-livingstone' },
      ]),
      serviceJsonLd({
        name: 'Car Rental in Livingstone & Victoria Falls',
        description:
          'Self-drive and chauffeur-driven car rental serving Livingstone and Victoria Falls, Zambia.',
        url: 'https://chaliko.com/car-rental-livingstone',
        serviceType: 'Car Rental',
        areaServed: { '@type': 'City', name: 'Livingstone' },
      }),
    ],
  },
  {
    file: '4x4-rental-zambia.html',
    title: '4x4 & SUV Rental in Zambia | Chaliko Car Hire',
    description:
      'Hire a 4x4 in Zambia for safari and off-road travel. Toyota Hilux, Fortuner, Mitsubishi Pajero & Shogun, fully insured, self-drive or chauffeur-driven.',
    url: 'https://chaliko.com/4x4-rental-zambia',
    activeNav: null,
    headerInner: true,
    contactForm: false,
    isotope: false,
    jqueryUi: false,
    swiper: false,
    heroImage: 'assets/images/banner/6.webp',
    extraJsonLd: [
      breadcrumbJsonLd([
        ...HOME_BREADCRUMB,
        { name: '4x4 Rental Zambia', url: 'https://chaliko.com/4x4-rental-zambia' },
      ]),
      serviceJsonLd({
        name: '4x4 & SUV Rental in Zambia',
        description:
          'Self-drive and chauffeur-driven 4x4 and SUV rental for safari and off-road travel across Zambia.',
        url: 'https://chaliko.com/4x4-rental-zambia',
        serviceType: '4x4 and SUV Rental',
        areaServed: { '@type': 'Country', name: 'Zambia' },
      }),
    ],
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
    const isActive = link.key === activeKey;
    if (isActive) liClasses.push('active');
    const aClasses = ['main-menu'];
    // "Contact" has always carried this extra class in the original design
    // (last-item styling hook), independent of which page is active.
    if (link.key === 'contact') aClasses.push('main-menu-ls');
    const ariaCurrent = isActive ? ' aria-current="page"' : '';
    return `                                    <li class="${liClasses.join(' ')}"><a class="${aClasses.join(' ')}" href="${link.href}"${ariaCurrent}>${link.label}</a></li>`;
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
    EXTRA_JSONLD: (page.extraJsonLd || []).join('\n'),
    PRELOAD_HERO: page.heroImage
      ? `    <link rel="preload" as="image" href="${page.heroImage}">`
      : '',
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
    CONTACT_FORM_SCRIPT: page.contactForm ? '<script src="assets/js/plugins/contact-form.js" defer></script>' : '',
    ISOTOPE_SCRIPT: page.isotope ? '<script src="assets/js/plugins/isotope.js" defer></script>' : '',
    JQUERY_UI_SCRIPT: page.jqueryUi ? '<script src="assets/js/plugins/jquery-ui.js" defer></script>' : '',
    SWIPER_SCRIPT: page.swiper ? '<script src="assets/js/plugins/swiper.js" defer></script>' : '',
  })
    .split('\n')
    .filter((line) => line.trim() !== '')
    .join('\n');
  content = replaceMarkerBlock(content, 'SCRIPTS', scriptsRendered);

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`built ${page.file}`);
}
