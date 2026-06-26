/**
 * Axon — AI Data Automation Platform
 * script.js — Vanilla JS, no libraries, no frameworks
 *
 * Features:
 *  1. Matrix-driven pricing with performance-isolated currency + billing toggle
 *  2. Bento-to-accordion wrapper with context lock on breakpoint crossing
 *  3. Scroll reveal via IntersectionObserver (CSS does the animation)
 *  4. Mobile nav toggle
 */

/* ============================================================
   FEATURE 1 — PRICING MATRIX
   ============================================================ */

const pricingMatrix = {
  tiers: [
    { id: 'starter', name: 'Starter', baseMonthlyRateUSD: 19 },
    { id: 'pro',     name: 'Pro',     baseMonthlyRateUSD: 49 },
    { id: 'enterprise', name: 'Enterprise', baseMonthlyRateUSD: 99 }
  ],
  currencies: {
    USD: { symbol: '$', exchangeRate: 1,    regionalTariff: 1.00 },
    INR: { symbol: '₹', exchangeRate: 83,   regionalTariff: 1.08 },
    EUR: { symbol: '€', exchangeRate: 0.92, regionalTariff: 1.03 }
  },
  annualDiscountMultiplier: 0.8
};

/* ---- Pricing state ---- */
let currentCurrency = 'USD';
let currentCycle    = 'monthly';

/* ---- Cache price span references ONCE at page load ---- */
const priceValueSpans    = document.querySelectorAll('.price-value');
const priceCurrencySpans = document.querySelectorAll('.price-currency');

/**
 * Compute the final price for a tier given current state.
 * Only reads pricingMatrix — does NOT touch the DOM.
 */
function computePrice(tier) {
  const c = pricingMatrix.currencies[currentCurrency];
  const cycleMult = currentCycle === 'annual' ? pricingMatrix.annualDiscountMultiplier : 1;
  const raw = tier.baseMonthlyRateUSD * c.exchangeRate * c.regionalTariff * cycleMult;
  return Math.round(raw);
}

/**
 * Update ONLY the cached price text nodes and currency symbols.
 * Never touches a parent container or recreates any DOM node.
 */
function updatePriceDisplay() {
  const c = pricingMatrix.currencies[currentCurrency];

  priceValueSpans.forEach((span, i) => {
    const tier = pricingMatrix.tiers[i];
    if (!tier) return;
    span.textContent = computePrice(tier);
    span.setAttribute('aria-label', 'Price: ' + computePrice(tier) + ' ' + currentCurrency);
  });

  priceCurrencySpans.forEach(span => {
    span.textContent = c.symbol;
  });
}

/* ---- Billing toggle ---- */
const billingBtns = document.querySelectorAll('.billing-btn');

billingBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.cycle === currentCycle) return;
    currentCycle = btn.dataset.cycle;

    billingBtns.forEach(b => {
      const isActive = b.dataset.cycle === currentCycle;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });

    updatePriceDisplay();
  });
});

/* ---- Currency switcher ---- */
const currencyBtns = document.querySelectorAll('.currency-btn');

currencyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.currency === currentCurrency) return;
    currentCurrency = btn.dataset.currency;

    currencyBtns.forEach(b => {
      const isActive = b.dataset.currency === currentCurrency;
      b.classList.toggle('active', isActive);
      b.setAttribute('aria-pressed', String(isActive));
    });

    updatePriceDisplay();
  });
});

/* Run once on load to set correct initial display */
updatePriceDisplay();


/* ============================================================
   FEATURE 2 — BENTO / ACCORDION WITH CONTEXT LOCK
   ============================================================ */

const featureCards    = document.querySelectorAll('.feature-card');
const accordionPanels = document.querySelectorAll('.accordion-panel');
const accordionTriggers = document.querySelectorAll('.accordion-trigger');

/* Single JS variable tracking which bento card is active/hovered */
let activeFeatureIndex = null;

/* ---- matchMedia — fires ONLY on breakpoint crossing, not every pixel ---- */
const mobileQuery = window.matchMedia('(max-width: 768px)');
let isMobile = mobileQuery.matches;

/* ---- Bento hover tracking (desktop) ---- */
featureCards.forEach((card, index) => {
  card.addEventListener('pointerenter', () => {
    if (isMobile) return;
    activeFeatureIndex = index;
    featureCards.forEach((c, i) => c.classList.toggle('bento-active', i === index));
  });

  card.addEventListener('pointerleave', () => {
    if (isMobile) return;
    activeFeatureIndex = null;
    featureCards.forEach(c => c.classList.remove('bento-active'));
  });

  card.addEventListener('focus', () => {
    if (isMobile) return;
    activeFeatureIndex = index;
  }, true);

  card.addEventListener('blur', () => {
    if (isMobile) return;
    activeFeatureIndex = null;
  }, true);
});

/* ---- Accordion open/close (mobile) ---- */
function openAccordion(index, instant) {
  accordionPanels.forEach((panel, i) => {
    const isTarget = i === index;
    const trigger  = accordionTriggers[i];
    if (isTarget) {
      if (instant) {
        /* Temporarily disable transition for instant open (context lock smooth requirement
           is handled by the CSS transition already being defined — the class add triggers it) */
        panel.style.transition = 'none';
        panel.classList.add('is-open');
        panel.removeAttribute('aria-hidden');
        void panel.offsetHeight; /* force reflow to flush no-transition */
        panel.style.transition = '';
      } else {
        panel.classList.add('is-open');
        panel.removeAttribute('aria-hidden');
      }
      if (trigger) trigger.setAttribute('aria-expanded', 'true');
    } else {
      panel.classList.remove('is-open');
      panel.setAttribute('aria-hidden', 'true');
      if (trigger) trigger.setAttribute('aria-expanded', 'false');
    }
  });
}

function closeAllAccordions() {
  accordionPanels.forEach(panel => {
    panel.classList.remove('is-open');
    panel.setAttribute('aria-hidden', 'true');
  });
  accordionTriggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
}

accordionTriggers.forEach((trigger, index) => {
  trigger.addEventListener('click', () => {
    const isOpen = trigger.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      /* Close this panel */
      accordionPanels[index].classList.remove('is-open');
      accordionPanels[index].setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      openAccordion(index, false);
    }
  });
});

/* ---- Context Lock: breakpoint crossing handler ---- */
function handleBreakpointChange(e) {
  isMobile = e.matches;

  if (isMobile) {
    /* Switched to mobile */
    featureCards.forEach(c => c.classList.remove('bento-active'));

    if (activeFeatureIndex !== null) {
      /* Expand the previously hovered bento card WITH the CSS transition */
      openAccordion(activeFeatureIndex, false);
    } else {
      closeAllAccordions();
    }
  } else {
    /* Switched to desktop — close all accordions, clear bento active */
    closeAllAccordions();
    activeFeatureIndex = null;
    featureCards.forEach(c => c.classList.remove('bento-active'));
  }
}

mobileQuery.addEventListener('change', handleBreakpointChange);

/* ---- Initial accordion aria state setup ---- */
accordionPanels.forEach(panel => {
  panel.setAttribute('aria-hidden', 'true');
});


/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   CSS handles the actual opacity/transform animation
   ============================================================ */

const revealEls = document.querySelectorAll('.reveal-scroll');

if ('IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target); /* reveal once */
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealEls.forEach(el => revealObserver.observe(el));
} else {
  /* Fallback: show everything immediately for older browsers */
  revealEls.forEach(el => el.classList.add('is-visible'));
}


/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */

const hamburger = document.querySelector('.nav-hamburger');
const mobileNav = document.getElementById('mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const isOpen = hamburger.getAttribute('aria-expanded') === 'true';
    const nextState = !isOpen;
    hamburger.setAttribute('aria-expanded', String(nextState));
    mobileNav.hidden = !nextState;
  });

  /* Close mobile nav when a link inside is clicked */
  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
    });
  });
}
