(function () {
  'use strict';

  /* ── Config ── */
  const CONFIG = { ca: '', twitter: '', community: '', buy: '' };

  async function loadConfig() {
    try {
      const res = await fetch('/api/config');
      const data = await res.json();
      Object.assign(CONFIG, data);
      applyConfig();
    } catch (e) {}
  }

  function applyConfig() {
    const navCA = document.getElementById('navCA');
    if (CONFIG.ca) {
      navCA.textContent = CONFIG.ca;
    } else {
      navCA.textContent = 'CA not set';
    }

    const communityLink = document.getElementById('communityLink');
    if (CONFIG.community) communityLink.href = CONFIG.community;

    const footerTwitter = document.getElementById('footerTwitter');
    if (CONFIG.twitter) footerTwitter.href = CONFIG.twitter;

    const footerCommunity = document.getElementById('footerCommunity');
    if (CONFIG.community) footerCommunity.href = CONFIG.community;

    const footerBuy = document.getElementById('footerBuy');
    if (CONFIG.buy) footerBuy.href = CONFIG.buy;
  }

  /* ── Copy CA ── */
  function initCopy() {
    const navCA = document.getElementById('navCA');
    const toast = document.getElementById('toast');

    navCA.addEventListener('click', async () => {
      if (!CONFIG.ca) return;
      try {
        await navigator.clipboard.writeText(CONFIG.ca);
      } catch (e) {
        const ta = document.createElement('textarea');
        ta.value = CONFIG.ca;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2000);
    });
  }

  /* ── Trade Counter ── */
  let tradeCount = 0;
  let scrollAccumulator = 0;
  let lastScrollY = window.scrollY;

  const MILESTONES = {
    10: 'just warming up',
    25: 'you said one more',
    50: "it's 3am",
    100: "you can't stop"
  };

  function updateTradeCounter() {
    const delta = Math.abs(window.scrollY - lastScrollY);
    lastScrollY = window.scrollY;
    scrollAccumulator += delta;

    const newTrades = Math.floor(scrollAccumulator / 100);
    if (newTrades > 0) {
      scrollAccumulator -= newTrades * 100;
      tradeCount += newTrades;

      const el = document.getElementById('tradeCount');
      el.textContent = String(tradeCount).padStart(3, '0');

      document.getElementById('finalTradeCount').textContent = tradeCount;

      // Check milestones
      for (const [m, msg] of Object.entries(MILESTONES)) {
        const milestone = parseInt(m);
        if (tradeCount >= milestone && tradeCount - newTrades < milestone) {
          showMilestone(milestone + ' — ' + msg);
        }
      }
    }
  }

  function showMilestone(text) {
    const el = document.getElementById('milestone');
    el.textContent = text;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
  }

  /* ── Health Bar ── */
  function updateHealthBar() {
    const maxScroll = document.body.scrollHeight - window.innerHeight;
    if (maxScroll <= 0) return;

    const scrollPct = window.scrollY / maxScroll;
    const health = Math.max(5, 100 - scrollPct * 95);

    const fill = document.getElementById('healthFill');
    const label = document.getElementById('healthLabel');
    const bar = fill.parentElement;

    fill.style.width = health + '%';
    label.textContent = 'HP: ' + Math.round(health) + '%';

    if (health < 30) {
      bar.classList.add('critical');
    } else {
      bar.classList.remove('critical');
    }
  }

  /* ── HUD Visibility ── */
  function updateHUD() {
    const hero = document.getElementById('level0');
    const hud = document.getElementById('hud');

    if (window.scrollY > hero.offsetHeight) {
      hud.classList.add('visible');
    } else {
      hud.classList.remove('visible');
    }
  }

  /* ── Level 1 Progress Bar ── */
  function updateProgressBar() {
    const section = document.getElementById('level1');
    const bar = document.getElementById('level1Progress');
    if (!section || !bar) return;

    const rect = section.getBoundingClientRect();
    const sectionHeight = rect.height - window.innerHeight;
    if (sectionHeight <= 0) return;

    const progress = Math.min(1, Math.max(0, -rect.top / sectionHeight));
    bar.style.width = (progress * 100) + '%';
  }

  /* ── Typewriter ── */
  function initTypewriter() {
    const el = document.getElementById('typewriter');
    const text = el.getAttribute('data-text') || '';
    el.textContent = '';

    let i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, 30);
      }
    }

    // Start after a short delay
    setTimeout(type, 800);
  }

  /* ── Scroll Reveal (Achievements, Time Blocks, Arcade Steps) ── */
  function initScrollReveal() {
    const elements = document.querySelectorAll('.scroll-reveal');

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          // Stagger based on sibling index
          const parent = entry.target.parentElement;
          const siblings = Array.from(parent.querySelectorAll('.scroll-reveal'));
          const index = siblings.indexOf(entry.target);
          const delay = index * 150;

          setTimeout(() => {
            entry.target.classList.add('visible');
          }, delay);

          observer.unobserve(entry.target);
        }
      });
    }, {
      threshold: 0.15,
      rootMargin: '0px 0px -40px 0px'
    });

    elements.forEach(el => observer.observe(el));
  }

  /* ── Loop Animation (Level 2) ── */
  function initLoopAnimation() {
    const steps = document.querySelectorAll('.loop-step');
    if (!steps.length) return;

    let current = 0;
    steps[0].classList.add('active');

    setInterval(() => {
      steps[current].classList.remove('active');
      current = (current + 1) % steps.length;
      steps[current].classList.add('active');
    }, 1200);
  }

  /* ── Tweet iframe resize ── */
  function initTweetResize() {
    window.addEventListener('message', function (e) {
      if (e.origin.indexOf('twitter.com') === -1) return;
      try {
        var data = typeof e.data === 'string' ? JSON.parse(e.data) : e.data;
        if (data['twttr.embed'] && data['twttr.embed'].method === 'twttr.private.resize') {
          var params = data['twttr.embed'].params;
          if (params && params.length) {
            var frame = document.getElementById('tweetFrame');
            if (frame) frame.style.height = params[0].height + 'px';
          }
        }
      } catch (err) {}
    });
  }

  /* ── Start Button ── */
  function initStartButton() {
    const btn = document.getElementById('startBtn');
    btn.addEventListener('click', () => {
      document.getElementById('level1').scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ── Scroll Handler (RAF throttled) ── */
  let ticking = false;

  function onScroll() {
    if (!ticking) {
      requestAnimationFrame(() => {
        updateTradeCounter();
        updateHealthBar();
        updateHUD();
        updateProgressBar();
        ticking = false;
      });
      ticking = true;
    }
  }

  /* ── Init ── */
  document.addEventListener('DOMContentLoaded', () => {
    loadConfig();
    initCopy();
    initTypewriter();
    initScrollReveal();
    initLoopAnimation();
    initStartButton();
    initTweetResize();

    window.addEventListener('scroll', onScroll, { passive: true });

    // Initial state
    updateHealthBar();
    updateHUD();
  });
})();
