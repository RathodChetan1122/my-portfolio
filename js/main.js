/* ════════════════════════════════════════════════════════
   MAIN.JS — All Interactions & Animations
   Chetan Rathod Portfolio
════════════════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── 0. PROJECT SHOWCASE ── */
  const projectsTrack = document.getElementById('projectsTrack');
  const projectsSection = document.getElementById('projects');
  const previousProject = document.querySelector('.project-nav-prev');
  const nextProject = document.querySelector('.project-nav-next');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(pointer: fine)').matches;
  const cursorEnabled = finePointer && !reducedMotion;
  let projectsRendered = false;
  let isMenuOpen = false;
  let isModalOpen = false;

  function projectLink(url, label, unavailableLabel) {
    if (!url) {
      return `<button class="project-action is-disabled" type="button" disabled>${unavailableLabel}</button>`;
    }
    const cursorLabel = label === 'Live Demo' ? 'Demo' : label;
    return `<a class="project-action" href="${url}" target="_blank" rel="noopener noreferrer" data-cursor-label="${cursorLabel}">
      ${label}<span aria-hidden="true">↗</span>
    </a>`;
  }

  function renderProjects() {
    if (!projectsTrack || projectsRendered || !Array.isArray(window.projectsData)) return;

    projectsTrack.innerHTML = window.projectsData.map(project => {
      const metrics = project.metrics?.length
        ? `<div class="project-metrics-row">${project.metrics.map(metric => `
            <div><div class="p-metric-val">${metric.value}</div><div class="p-metric-lbl">${metric.label}</div></div>
          `).join('')}</div>`
        : '';

      return `<article class="project-card" aria-labelledby="project-${project.number}" data-cursor-label="View Project">
        <div class="project-ghost-num" aria-hidden="true">${project.number}</div>
        <div class="project-card-head">
          <span class="project-number">Project ${project.number}</span>
          ${project.featured ? '<span class="project-featured">Featured</span>' : ''}
        </div>
        <div class="project-tags">
          ${project.categories.map(category => `<span class="project-tag-badge">${category}</span>`).join('')}
        </div>
        <h3 class="project-title" id="project-${project.number}">${project.name}</h3>
        <p class="project-desc">${project.description}</p>
        ${metrics}
        <div class="project-stack-block">
          <span class="project-stack-label">Technology Stack</span>
          <div class="project-stack-row">
            ${project.technologies.map(technology => `<span class="p-stack-tag">${technology}</span>`).join('')}
          </div>
        </div>
        <div class="project-actions">
          ${projectLink(project.githubUrl, 'GitHub', 'Repository Unavailable')}
          ${projectLink(project.liveUrl, 'Live Demo', 'Deployment Coming Soon')}
        </div>
      </article>`;
    }).join('');

    projectsRendered = true;
    requestAnimationFrame(updateProjectControls);
  }

  function projectScrollDistance() {
    const card = projectsTrack?.querySelector('.project-card');
    const gap = projectsTrack ? parseFloat(getComputedStyle(projectsTrack).columnGap) || 0 : 0;
    return card ? card.getBoundingClientRect().width + gap : 0;
  }

  function updateProjectControls() {
    if (!projectsTrack) return;
    const atStart = projectsTrack.scrollLeft <= 2;
    const atEnd = projectsTrack.scrollLeft + projectsTrack.clientWidth >= projectsTrack.scrollWidth - 2;
    if (previousProject) previousProject.disabled = atStart;
    if (nextProject) nextProject.disabled = atEnd;
  }

  let controlsFrame = 0;
  let momentumFrame = 0;
  let horizontalVelocity = 0;
  let isDragging = false;
  let dragStartX = 0;
  let dragStartScroll = 0;
  let lastDragX = 0;
  let lastDragTime = 0;

  function scheduleProjectControlsUpdate() {
    if (controlsFrame) return;
    controlsFrame = requestAnimationFrame(() => {
      controlsFrame = 0;
      updateProjectControls();
    });
  }

  function snapToNearestProject() {
    if (!projectsTrack) return;
    const distance = projectScrollDistance();
    if (!distance) return;
    const target = Math.round(projectsTrack.scrollLeft / distance) * distance;
    projectsTrack.scrollTo({ left: target, behavior: reducedMotion ? 'auto' : 'smooth' });
  }

  function stopProjectMomentum(shouldSnap = false) {
    if (momentumFrame) cancelAnimationFrame(momentumFrame);
    momentumFrame = 0;
    horizontalVelocity = 0;
    projectsTrack?.classList.remove('is-scrolling');
    if (shouldSnap) requestAnimationFrame(snapToNearestProject);
  }

  function runProjectMomentum() {
    if (!projectsTrack || Math.abs(horizontalVelocity) < 0.35) {
      stopProjectMomentum(true);
      return;
    }

    const maxScroll = projectsTrack.scrollWidth - projectsTrack.clientWidth;
    const nextScroll = Math.min(maxScroll, Math.max(0, projectsTrack.scrollLeft + horizontalVelocity));
    const reachedEdge = nextScroll <= 0 || nextScroll >= maxScroll;
    projectsTrack.scrollLeft = nextScroll;
    horizontalVelocity *= 0.86;

    if (reachedEdge) {
      stopProjectMomentum();
      return;
    }
    momentumFrame = requestAnimationFrame(runProjectMomentum);
  }

  function startProjectMomentum() {
    if (!projectsTrack || momentumFrame) return;
    projectsTrack.classList.add('is-scrolling');
    momentumFrame = requestAnimationFrame(runProjectMomentum);
  }

  const renderProjectsObserver = 'IntersectionObserver' in window && projectsSection
    ? new IntersectionObserver(entries => {
      if (entries.some(entry => entry.isIntersecting)) {
        renderProjects();
        renderProjectsObserver.disconnect();
      }
    }, { rootMargin: '180px 0px' })
    : null;

  if (renderProjectsObserver) {
    renderProjectsObserver.observe(projectsSection);
  } else {
    renderProjects();
  }

  previousProject?.addEventListener('click', () => {
    stopProjectMomentum();
    projectsTrack.scrollBy({ left: -projectScrollDistance(), behavior: reducedMotion ? 'auto' : 'smooth' });
  });
  nextProject?.addEventListener('click', () => {
    stopProjectMomentum();
    projectsTrack.scrollBy({ left: projectScrollDistance(), behavior: reducedMotion ? 'auto' : 'smooth' });
  });
  projectsTrack?.addEventListener('scroll', scheduleProjectControlsUpdate, { passive: true });
  projectsTrack?.addEventListener('wheel', event => {
    // Keep vertical scrolling native; mirror it horizontally only while room remains.
    if (Math.abs(event.deltaY) <= Math.abs(event.deltaX)) return;
    const maxScroll = projectsTrack.scrollWidth - projectsTrack.clientWidth;
    const movingForward = event.deltaY > 0 && projectsTrack.scrollLeft < maxScroll - 2;
    const movingBackward = event.deltaY < 0 && projectsTrack.scrollLeft > 2;
    if (!movingForward && !movingBackward) return;

    const deltaScale = event.deltaMode === WheelEvent.DOM_DELTA_LINE ? 18 :
      event.deltaMode === WheelEvent.DOM_DELTA_PAGE ? projectsTrack.clientWidth : 1;
    horizontalVelocity += event.deltaY * deltaScale * 0.4;
    horizontalVelocity = Math.max(-100, Math.min(100, horizontalVelocity));
    startProjectMomentum();
  }, { passive: true });

  projectsTrack?.addEventListener('pointerdown', event => {
    if (event.pointerType !== 'mouse' || event.button !== 0 || event.target.closest('a, button')) return;
    stopProjectMomentum();
    isDragging = true;
    dragStartX = event.clientX;
    dragStartScroll = projectsTrack.scrollLeft;
    lastDragX = event.clientX;
    lastDragTime = performance.now();
    projectsTrack.classList.add('is-dragging');
    projectsTrack.setPointerCapture(event.pointerId);
  });
  projectsTrack?.addEventListener('pointermove', event => {
    if (!isDragging) return;
    const now = performance.now();
    const elapsed = Math.max(1, now - lastDragTime);
    projectsTrack.scrollLeft = dragStartScroll + dragStartX - event.clientX;
    horizontalVelocity = Math.max(-80, Math.min(80, (lastDragX - event.clientX) / elapsed * 16));
    lastDragX = event.clientX;
    lastDragTime = now;
  });

  function endProjectDrag(event) {
    if (!isDragging) return;
    isDragging = false;
    projectsTrack.classList.remove('is-dragging');
    if (projectsTrack.hasPointerCapture(event.pointerId)) projectsTrack.releasePointerCapture(event.pointerId);
    startProjectMomentum();
  }
  projectsTrack?.addEventListener('pointerup', endProjectDrag);
  projectsTrack?.addEventListener('pointercancel', endProjectDrag);
  projectsTrack?.addEventListener('keydown', event => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    stopProjectMomentum();
    projectsTrack.scrollBy({
      left: event.key === 'ArrowRight' ? projectScrollDistance() : -projectScrollDistance(),
      behavior: reducedMotion ? 'auto' : 'smooth'
    });
  });
  window.addEventListener('resize', scheduleProjectControlsUpdate, { passive: true });
  requestAnimationFrame(updateProjectControls);

  /* ── 1. CUSTOM CURSOR ────────────────────────────────── */
  const cursor     = document.getElementById('cursor');
  const cursorRing = document.getElementById('cursorRing');
  const cursorLabel = document.getElementById('cursorLabel');
  const cursorTargets = '[data-cursor-label], .project-card, .project-action, .social-btn, .btn, .nav-cta, .hamburger, .nav-links a, button, a';
  let cursorFrame = 0;
  let cursorVisible = false;
  let pointerDown = false;
  let pointerX = window.innerWidth / 2;
  let pointerY = window.innerHeight / 2;
  let ringX = pointerX;
  let ringY = pointerY;
  let cursorTarget = null;
  let cursorLabelText = '';
  let labelSwapTimer = 0;
  let hoverScale = 1;
  let hoverMagnet = 0;

  function findCursorTarget() {
    const element = document.elementFromPoint(pointerX, pointerY);
    return element?.closest(cursorTargets) || null;
  }

  function cursorConfig(target) {
    if (!target) {
      return { label: '', scale: 1, magnet: 0 };
    }

    if (target.dataset.cursorLabel) {
      const label = target.dataset.cursorLabel;
      if (target.matches('.project-card')) return { label, scale: 2.15, magnet: 0.08 };
      if (target.matches('.project-action')) return { label, scale: 1.95, magnet: 0.1 };
      if (target.matches('.btn, .nav-cta, .social-btn, .hamburger')) return { label, scale: 1.8, magnet: 0.09 };
      if (target.matches('.nav-links a')) return { label, scale: 1.45, magnet: 0.06 };
      return { label, scale: 1.6, magnet: 0.06 };
    }

    if (target.matches('.project-card')) return { label: 'View Project', scale: 2.15, magnet: 0.08 };
    if (target.matches('.project-action[href*="github"], .social-btn[href*="github"]')) return { label: 'GitHub', scale: 1.9, magnet: 0.1 };
    if (target.matches('.project-action[href*="vercel"], .project-action[href*="live"]')) return { label: 'Demo', scale: 1.9, magnet: 0.1 };
    if (target.matches('.nav-links a')) return { label: 'Open', scale: 1.45, magnet: 0.06 };
    if (target.matches('button, .btn, .nav-cta, .project-action, .social-btn, .hamburger')) return { label: 'View', scale: 1.8, magnet: 0.08 };
    return { label: '', scale: 1.2, magnet: 0 };
  }

  function swapCursorLabel(nextLabel) {
    if (!cursorLabel || nextLabel === cursorLabelText) return;
    cursorLabel.classList.remove('is-visible');
    clearTimeout(labelSwapTimer);
    labelSwapTimer = window.setTimeout(() => {
      cursorLabelText = nextLabel;
      cursorLabel.textContent = nextLabel;
      cursorLabel.classList.toggle('is-visible', Boolean(nextLabel));
    }, nextLabel ? 60 : 0);
  }

  function setCursorTarget(target) {
    if (target === cursorTarget) return;
    cursorTarget = target;
    const config = cursorConfig(target);
    hoverScale = config.scale;
    hoverMagnet = config.magnet;
    cursorRing.dataset.mode = target ? (target.matches('.project-card') ? 'card' : target.matches('.nav-links a') ? 'link' : 'button') : 'default';
    cursorRing.style.setProperty('--cursor-scale', String(hoverScale));
    cursorRing.classList.toggle('has-target', Boolean(target));
    swapCursorLabel(config.label);
  }

  function renderCursor() {
    cursorFrame = 0;
    if (!cursorEnabled || !cursor || !cursorRing || !cursorLabel) return;

    const target = findCursorTarget();
    setCursorTarget(target);

    const targetRect = cursorTarget?.getBoundingClientRect();
    const magnetX = targetRect ? (targetRect.left + targetRect.width / 2 - pointerX) * hoverMagnet : 0;
    const magnetY = targetRect ? (targetRect.top + targetRect.height / 2 - pointerY) * hoverMagnet : 0;
    const targetRingX = pointerX + magnetX;
    const targetRingY = pointerY + magnetY;

    ringX += (targetRingX - ringX) * 0.18;
    ringY += (targetRingY - ringY) * 0.18;

    cursor.style.opacity = cursorVisible ? '1' : '0';
    cursorRing.style.opacity = cursorVisible ? '1' : '0';
    cursor.style.transform = `translate3d(${pointerX - 4}px, ${pointerY - 4}px, 0) scale(${pointerDown ? 0.92 : 1})`;
    cursorRing.style.transform = `translate3d(${ringX}px, ${ringY}px, 0) translate(-50%, -50%) scale(${hoverScale * (pointerDown ? 0.94 : 1)})`;
    cursorRing.classList.toggle('is-pressed', pointerDown);
    cursorRing.classList.toggle('is-active', Boolean(cursorTarget));

    if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
  }

  if (cursorEnabled && cursor && cursorRing && cursorLabel) {
    document.body.classList.add('custom-cursor-active');
    cursor.style.opacity = '0';
    cursorRing.style.opacity = '0';

    document.addEventListener('pointermove', event => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      cursorVisible = true;
      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    }, { passive: true });

    document.addEventListener('pointerdown', () => {
      pointerDown = true;
      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    });

    document.addEventListener('pointerup', () => {
      pointerDown = false;
      if (!cursorFrame) cursorFrame = requestAnimationFrame(renderCursor);
    });

    window.addEventListener('blur', () => {
      cursorVisible = false;
      setCursorTarget(null);
      swapCursorLabel('');
    });

    document.addEventListener('mouseleave', () => {
      cursorVisible = false;
      setCursorTarget(null);
      swapCursorLabel('');
    });

    requestAnimationFrame(renderCursor);
  } else {
    cursor?.style.setProperty('display', 'none');
    cursorRing?.style.setProperty('display', 'none');
    cursorLabel?.style.setProperty('display', 'none');
  }


  /* ── 2. NAVBAR SCROLL ────────────────────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });


  /* ── 3. ACTIVE NAV LINK ──────────────────────────────── */
  const navLinks = document.querySelectorAll('.nav-links a[data-section]');
  const sections = document.querySelectorAll('section[id]');

  function setActiveNav(sectionId) {
    navLinks.forEach(link => {
      const isActive = link.dataset.section === sectionId;
      link.classList.toggle('active', isActive);
      if (isActive) {
        link.setAttribute('aria-current', 'page');
      } else {
        link.removeAttribute('aria-current');
      }
    });
  }

  if ('IntersectionObserver' in window) {
    const activeObserver = new IntersectionObserver(entries => {
      const visibleSections = entries.filter(entry => entry.isIntersecting)
        .sort((left, right) => right.intersectionRatio - left.intersectionRatio);
      if (visibleSections[0]) setActiveNav(visibleSections[0].target.id);
    }, { rootMargin: '-35% 0px -50% 0px', threshold: [0.12, 0.2, 0.35] });
    sections.forEach(section => activeObserver.observe(section));
  } else {
    function updateActiveNavFallback() {
      let current = '';
      sections.forEach(section => {
        if (window.scrollY >= section.offsetTop - 220) current = section.id;
      });
      setActiveNav(current);
    }
    window.addEventListener('scroll', updateActiveNavFallback, { passive: true });
    updateActiveNavFallback();
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
    'Computer Vision Engineer',
    'AI/ML Developer',
    'Full Stack Developer',
    'Backend Developer',
    'Internship Ready'
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
    if (reducedMotion) {
      el.textContent = target.toFixed(decimals) + suffix;
      return;
    }

    const startTime = performance.now();
    const duration = 1100;
    function frame(now) {
      const progress = Math.min(1, (now - startTime) / duration);
      const eased = 1 - Math.pow(1 - progress, 3);
      const value = target * eased;
      el.dataset.val = value.toFixed(decimals) + suffix;
      el.textContent = value.toFixed(decimals) + suffix;
      if (progress < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
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
  let heroFrame = 0;
  let heroPointerX = 0;
  let heroPointerY = 0;

  function updateHeroGrid() {
    heroFrame = 0;
    if (!heroGrid) return;
    const x = (heroPointerX / window.innerWidth - 0.5) * 18;
    const y = (heroPointerY / window.innerHeight - 0.5) * 18;
    heroGrid.style.transform = `translate3d(${x}px, ${y}px, 0)`;
  }

  document.addEventListener('pointermove', event => {
    if (!heroGrid || !finePointer) return;
    heroPointerX = event.clientX;
    heroPointerY = event.clientY;
    if (!heroFrame) heroFrame = requestAnimationFrame(updateHeroGrid);
  }, { passive: true });


  /* ── 8. SMOOTH SCROLL ────────────────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const target = document.querySelector(a.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = (navbar?.offsetHeight || 0) + 12;
      const top = target.getBoundingClientRect().top + window.scrollY - offset;
      window.scrollTo({ top, behavior: reducedMotion ? 'auto' : 'smooth' });
    });
  });


  /* ── 8B. MAGNETIC CTA EFFECT ────────────────────────── */
  document.querySelectorAll('.magnetic').forEach(element => {
    if (!finePointer) return;
    let magneticFrame = 0;
    let offsetX = 0;
    let offsetY = 0;

    function applyMagnetic() {
      magneticFrame = 0;
      element.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
    }

    element.addEventListener('pointermove', event => {
      const bounds = element.getBoundingClientRect();
      const x = event.clientX - (bounds.left + bounds.width / 2);
      const y = event.clientY - (bounds.top + bounds.height / 2);
      offsetX = x * 0.12;
      offsetY = y * 0.12;
      if (!magneticFrame) magneticFrame = requestAnimationFrame(applyMagnetic);
    });

    element.addEventListener('pointerleave', () => {
      offsetX = 0;
      offsetY = 0;
      if (!magneticFrame) magneticFrame = requestAnimationFrame(applyMagnetic);
    });
  });


  /* ── 9. HIRE ME MODAL ────────────────────────────────── */
  const modal       = document.getElementById('hireModal');
  const hireBtns    = document.querySelectorAll('[data-hire]');
  const closeBtn    = document.getElementById('modalClose');
  const hireForm    = document.getElementById('hireForm');
  const submitBtn   = document.getElementById('formSubmit');
  const successDiv  = document.getElementById('formSuccess');

  function syncBodyLock() {
    document.body.style.overflow = (isModalOpen || isMenuOpen) ? 'hidden' : '';
  }

  function openModal() {
    if (!modal) return;
    isModalOpen = true;
    modal.classList.add('open');
    syncBodyLock();
  }
  function closeModal() {
    if (!modal) return;
    isModalOpen = false;
    modal.classList.remove('open');
    syncBodyLock();
  }

  hireBtns.forEach(b => b.addEventListener('click', openModal));
  closeBtn?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      closeModal();
      setMobileMenuOpen(false);
    }
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

  function setMobileMenuOpen(open) {
    if (!mobileMenu || !hamburger) return;
    isMenuOpen = open;
    mobileMenu.classList.toggle('open', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    hamburger.setAttribute('aria-expanded', String(open));
    syncBodyLock();

    const bars = hamburger.querySelectorAll('span');
    if (open) {
      bars[0].style.transform = 'rotate(45deg) translate(5px,5px)';
      bars[1].style.opacity = '0';
      bars[2].style.transform = 'rotate(-45deg) translate(5px,-5px)';
    } else {
      bars.forEach(bar => { bar.style.transform = ''; bar.style.opacity = ''; });
    }
  }

  hamburger?.addEventListener('click', () => {
    setMobileMenuOpen(!isMenuOpen);
  });

  document.querySelectorAll('#mobileMenu a').forEach(a => {
    a.addEventListener('click', () => {
      setMobileMenuOpen(false);
    });
  });

  console.log('%c Chetan Rathod Portfolio ', 'background:#C8102E;color:white;font-size:14px;padding:4px 10px;border-radius:4px;font-weight:bold;');
  console.log('%c Built with passion, not a template. ', 'color:#8888aa;');

});
