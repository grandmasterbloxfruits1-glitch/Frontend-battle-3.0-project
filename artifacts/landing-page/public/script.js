/**
 * Axon — AI Data Automation Platform
 * script.js — Vanilla JS only. Zero libraries. Zero frameworks.
 *
 * Features:
 *   1. Matrix-driven pricing — performance-isolated currency + billing toggle
 *   2. Bento-to-accordion wrapper with context lock on breakpoint crossing
 *   3. IntersectionObserver scroll-reveal (CSS does all animation)
 *   4. Mobile nav toggle
 */

/* ============================================================
   FEATURE 1: MATRIX-DRIVEN PRICING
   ============================================================ */

const pricingMatrix = {
  tiers: [
    { id: 'starter',    name: 'Starter',    baseMonthlyRateUSD: 19  },
    { id: 'pro',        name: 'Pro',        baseMonthlyRateUSD: 49  },
    { id: 'enterprise', name: 'Enterprise', baseMonthlyRateUSD: 99  }
  ],
  currencies: {
    USD: { symbol: '$',  exchangeRate: 1,    regionalTariff: 1.00 },
    INR: { symbol: '₹',  exchangeRate: 83,   regionalTariff: 1.08 },
    EUR: { symbol: '€',  exchangeRate: 0.92, regionalTariff: 1.03 }
  },
  annualDiscountMultiplier: 0.8
};

/* Pricing state */
let currentCurrency = 'USD';
let currentCycle    = 'monthly';

/**
 * Cache DOM references once. Never query again after this.
 * Pricing updates touch ONLY these cached nodes.
 */
const cachedPriceVals = document.querySelectorAll('.price-val');
const cachedPriceSyms = document.querySelectorAll('.price-sym');

function computePrice(tier) {
  const c = pricingMatrix.currencies[currentCurrency];
  const cycleMult = currentCycle === 'annual' ? pricingMatrix.annualDiscountMultiplier : 1;
  return Math.round(tier.baseMonthlyRateUSD * c.exchangeRate * c.regionalTariff * cycleMult);
}

/**
 * Update ONLY the cached price text nodes and currency symbols.
 * This function never reads or writes any parent container.
 * No innerHTML, no re-render, no DOM creation of any kind.
 */
function updatePriceDisplay() {
  const c = pricingMatrix.currencies[currentCurrency];
  cachedPriceVals.forEach((span, i) => {
    const tier = pricingMatrix.tiers[i];
    if (!tier) return;
    const computed = computePrice(tier);
    span.textContent = computed;
    span.setAttribute('aria-label', `Monthly price: ${c.symbol}${computed}`);
  });
  cachedPriceSyms.forEach(span => {
    span.textContent = c.symbol;
  });
}

/* Billing toggle */
const billingBtns = document.querySelectorAll('.billing-btn');
billingBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.cycle === currentCycle) return;
    currentCycle = btn.dataset.cycle;
    billingBtns.forEach(b => {
      const active = b.dataset.cycle === currentCycle;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    updatePriceDisplay();
  });
});

/* Currency switcher */
const currencyBtns = document.querySelectorAll('.currency-btn');
currencyBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    if (btn.dataset.currency === currentCurrency) return;
    currentCurrency = btn.dataset.currency;
    currencyBtns.forEach(b => {
      const active = b.dataset.currency === currentCurrency;
      b.classList.toggle('active', active);
      b.setAttribute('aria-pressed', String(active));
    });
    updatePriceDisplay();
  });
});

/* Initial render with default state */
updatePriceDisplay();


/* ============================================================
   FEATURE 2: BENTO-TO-ACCORDION + CONTEXT LOCK
   ============================================================ */

const featureCards   = document.querySelectorAll('.feature-card');
const accPanels      = document.querySelectorAll('.acc-panel');
const accTriggers    = document.querySelectorAll('.acc-trigger');

/**
 * activeFeatureIndex — single JS variable tracking which bento
 * card is actively hovered/focused on desktop.
 * null = no active card.
 */
let activeFeatureIndex = null;

/* matchMedia — fires ONLY on breakpoint crossing, not every pixel */
const mobileBreakpoint = window.matchMedia('(max-width: 768px)');
let isMobile = mobileBreakpoint.matches;

/* ---- Bento hover/focus tracking (desktop) ---- */
featureCards.forEach((card, index) => {
  card.addEventListener('pointerenter', () => {
    if (isMobile) return;
    activeFeatureIndex = index;
  });

  card.addEventListener('pointerleave', () => {
    if (isMobile) return;
    /* Only clear if we're leaving this specific card */
    if (activeFeatureIndex === index) activeFeatureIndex = null;
  });

  /* Keyboard accessibility */
  card.addEventListener('focusin', () => {
    if (isMobile) return;
    activeFeatureIndex = index;
  });

  card.addEventListener('focusout', (e) => {
    if (isMobile) return;
    /* Only clear if focus left this card entirely */
    if (!card.contains(e.relatedTarget)) {
      if (activeFeatureIndex === index) activeFeatureIndex = null;
    }
  });
});

/* ---- Accordion helpers ---- */
function openPanel(index) {
  accPanels.forEach((panel, i) => {
    const isTarget = (i === index);
    panel.classList.toggle('is-open', isTarget);
    panel.setAttribute('aria-hidden', String(!isTarget));
  });
  accTriggers.forEach((trigger, i) => {
    trigger.setAttribute('aria-expanded', String(i === index));
  });
}

function closeAllPanels() {
  accPanels.forEach(p => {
    p.classList.remove('is-open');
    p.setAttribute('aria-hidden', 'true');
  });
  accTriggers.forEach(t => t.setAttribute('aria-expanded', 'false'));
}

/* ---- Accordion trigger click (mobile) ---- */
accTriggers.forEach((trigger, index) => {
  trigger.addEventListener('click', () => {
    const currentlyOpen = trigger.getAttribute('aria-expanded') === 'true';
    if (currentlyOpen) {
      /* Toggle closed */
      accPanels[index].classList.remove('is-open');
      accPanels[index].setAttribute('aria-hidden', 'true');
      trigger.setAttribute('aria-expanded', 'false');
    } else {
      openPanel(index);
    }
  });
});

/* ---- Context Lock: breakpoint change handler ---- */
function handleBreakpointChange(e) {
  isMobile = e.matches;

  if (isMobile) {
    /*
     * Desktop → Mobile transition.
     * If a bento card was hovered, transfer that context to the accordion.
     * The CSS transition is already defined, so classList.add triggers
     * the smooth grid-template-rows animation automatically.
     */
    if (activeFeatureIndex !== null) {
      openPanel(activeFeatureIndex);
    } else {
      closeAllPanels();
    }
  } else {
    /*
     * Mobile → Desktop transition.
     * Close all accordion panels; reset bento state.
     */
    closeAllPanels();
    activeFeatureIndex = null;
  }
}

mobileBreakpoint.addEventListener('change', handleBreakpointChange);

/* Init accordion aria state */
accPanels.forEach(panel => panel.setAttribute('aria-hidden', 'true'));


/* ============================================================
   SCROLL REVEAL — IntersectionObserver
   CSS handles opacity/transform transition (no JS animation loop)
   ============================================================ */
const revealEls = document.querySelectorAll('.reveal-scroll');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        observer.unobserve(entry.target); /* fire once */
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  revealEls.forEach(el => observer.observe(el));
} else {
  /* Fallback: show all immediately for older browsers */
  revealEls.forEach(el => el.classList.add('is-visible'));
}


/* ============================================================
   MOBILE NAV TOGGLE
   ============================================================ */
const hamburger = document.querySelector('.nav-hamburger');
const mobileNav = document.getElementById('mobile-nav');

if (hamburger && mobileNav) {
  hamburger.addEventListener('click', () => {
    const open = hamburger.getAttribute('aria-expanded') === 'true';
    hamburger.setAttribute('aria-expanded', String(!open));
    mobileNav.hidden = open;
  });

  mobileNav.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => {
      hamburger.setAttribute('aria-expanded', 'false');
      mobileNav.hidden = true;
    });
  });
}
