/* ════════════════════════════════════════════════════════
   MAIN.JS — All Interactions & Animations
   Chetan Rathod Portfolio
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 1. CUSTOM CURSOR ────────────────────────────────── */
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  let mx = 0, my = 0, rx = 0, ry = 0;

  document.addEventListener('mousemove', e => {
    mx = e.clientX; my = e.clientY;
    cursor.style.left = (mx - 5) + 'px';
    cursor.style.top  = (my - 5) + 'px';
  });

  document.addEventListener('mousedown', () => cursorRing.classList.add('clicking'));
  document.addEventListener('mouseup',   () => cursorRing.classList.remove('clicking'));

  function animRing() {
    rx += (mx - rx - 19) * 0.14;
    ry += (my - ry - 19) * 0.14;
    cursorRing.style.left = rx + 'px';
    cursorRing.style.top  = ry + 'px';
    requestAnimationFrame(animRing);
  }
  animRing();

  document.querySelectorAll('a, button, .project-card, .skill-card, .ach-card, .about-card, .kpi, .cert-chip')
    .forEach(el => {
      el.addEventListener('mouseenter', () => cursorRing.classList.add('hovered'));
      el.addEventListener('mouseleave', () => cursorRing.classList.remove('hovered'));
    });


  /* ── 2. NAVBAR SCROLL ────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
    updateActiveNav();
  }, { passive: true });


  /* ── 3. ACTIVE NAV LINK ──────────────────────────────── */
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');
  const sections = document.querySelectorAll('section[id]');

  function updateActiveNav() {
    let current = '';
    sections.forEach(s => {
      if (window.scrollY >= s.offsetTop - 220) current = s.id;
    });
    navLinks.forEach(a => {
      a.classList.toggle('active', a.dataset.section === current);
    });
  }


  /* ── 4. SCROLL REVEAL ────────────────────────────────── */
  const revealEls = document.querySelectorAll('[data-reveal]');
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        revealObserver.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });
  revealEls.forEach(el => revealObserver.observe(el));


  /* ── 5. TYPING EFFECT ────────────────────────────────── */
  const phrases = [
    'Software Engineer & AI Developer',
    'Computer Vision Builder',
    'ML Pipeline Engineer',
    'Backend Developer',
    'IIT Hyderabad SURE Applicant',
    'Salesforce AMTS Candidate'
  ];
  const typedEl = document.getElementById('typedText');
  let pi = 0, ci = 0, deleting = false, waiting = false;

  function typeLoop() {
    if (waiting) { waiting = false; setTimeout(typeLoop, 1800); return; }
    const phrase = phrases[pi];
    if (!deleting) {
      typedEl.textContent = phrase.slice(0, ++ci);
      if (ci === phrase.length) { deleting = true; waiting = true; }
      setTimeout(typeLoop, 65);
    } else {
      typedEl.textContent = phrase.slice(0, --ci);
      if (ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; }
      setTimeout(typeLoop, 32);
    }
  }
  if (typedEl) typeLoop();


  /* ── 6. STAT COUNTERS ────────────────────────────────── */
  function countUp(el, target, decimals = 0, suffix = '') {
    let start = 0;
    const step = target / 55;
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { start = target; clearInterval(timer); }
      el.dataset.val = start.toFixed(decimals) + suffix;
      el.textContent = start.toFixed(decimals) + suffix;
    }, 18);
  }

  const counterEls = document.querySelectorAll('[data-counter]');
  const counterObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        const el = e.target;
        const { counter, suffix = '', decimals = '0' } = el.dataset;
        countUp(el, parseFloat(counter), parseInt(decimals), suffix);
        counterObs.unobserve(el);
      }
    });
  }, { threshold: 0.5 });
  counterEls.forEach(el => counterObs.observe(el));


  /* ── 7. PARALLAX HERO GRID ───────────────────────────── */
  const heroGrid = document.querySelector('.hero-grid-bg');
  document.addEventListener('mousemove', e => {
    if (!heroGrid) return;
    const x = (e.clientX / window.innerWidth - 0.5) * 18;
    const y = (e.clientY / window.innerHeight - 0.5) * 18;
    heroGrid.style.transform = `translate(${x}px, ${y}px)`;
  });


  /* ── 8. SMOOTH SCROLL ────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });


  /* ── 9. HIRE ME MODAL ────────────────────────────────── */
  const modal       = document.getElementById('hireModal');
  const hireBtns    = document.querySelectorAll('[data-hire]');
  const closeBtn    = document.getElementById('modalClose');
  const hireForm    = document.getElementById('hireForm');
  const submitBtn   = document.getElementById('formSubmit');
  const successDiv  = document.getElementById('formSuccess');

  function openModal() {
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }
  function closeModal() {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  }

  hireBtns.forEach(b => b.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeModal();
  });

  /* EmailJS Form Submit */
  hireForm?.addEventListener('submit', async e => {
    e.preventDefault();
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    const data = {
      from_name:    hireForm.querySelector('[name=from_name]').value,
      from_email:   hireForm.querySelector('[name=from_email]').value,
      phone:        hireForm.querySelector('[name=phone]').value,
      company:      hireForm.querySelector('[name=company]').value,
      role_type:    hireForm.querySelector('[name=role_type]').value,
      duration:     hireForm.querySelector('[name=duration]').value,
      message:      hireForm.querySelector('[name=message]').value,
      to_email:     'chetanrathodmrec@gmail.com',
    };

    try {
      /* ── EmailJS send ──
         Replace SERVICE_ID / TEMPLATE_ID / PUBLIC_KEY with your EmailJS credentials
         Sign up free at https://www.emailjs.com/
      */
      await emailjs.send('SERVICE_ID', 'TEMPLATE_ID', data, 'PUBLIC_KEY');
      hireForm.style.display = 'none';
      successDiv.classList.add('show');
    } catch (err) {
      /* Fallback: open mailto if EmailJS not configured */
      const subject = encodeURIComponent(`Internship Enquiry — ${data.role_type}`);
      const body = encodeURIComponent(
        `Name: ${data.from_name}\nEmail: ${data.from_email}\nPhone: ${data.phone}\nCompany: ${data.company}\nRole: ${data.role_type}\nDuration: ${data.duration}\n\nMessage:\n${data.message}`
      );
      window.location.href = `mailto:chetanrathodmrec@gmail.com?subject=${subject}&body=${body}`;
      submitBtn.classList.remove('loading');
      submitBtn.disabled = false;
    }
  });


  /* ── 10. MOBILE MENU ─────────────────────────────────── */
  const hamburger  = document.querySelector('.hamburger');
  const mobileMenu = document.getElementById('mobileMenu');

  hamburger?.addEventListener('click', () => {
    const open = mobileMenu?.classList.toggle('open');
    const bars = hamburger.querySelectorAll('span');
    if (open) {
      bars[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      bars[1].style.opacity   = '0';
      bars[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      bars.forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    }
  });

  document.querySelectorAll('#mobileMenu a').forEach(a => {
    a.addEventListener('click', () => {
      mobileMenu?.classList.remove('open');
      hamburger?.querySelectorAll('span').forEach(b => { b.style.transform = ''; b.style.opacity = ''; });
    });
  });

  console.log('%c Chetan Rathod Portfolio ', 'background:#C8102E;color:white;font-size:14px;padding:4px 10px;border-radius:4px;font-weight:bold;');
  console.log('%c Built with passion, not a template. ', 'color:#8888aa;');

});
