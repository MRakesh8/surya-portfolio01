/* ============================================================
   SCROLLZ ΓÇö index.js (Upgraded to Ultra-Premium Next-Level)
   Contains all interaction, carousel logic, sound synthesis,
   3D tilt, and dynamic filtering for the Scrollz Agency.
   ============================================================ */

// ΓöÇΓöÇ Web Audio Synth for Latency-Free Futuristic UI Sounds ΓöÇΓöÇ
const UISound = {
  ctx: null,
  enabled: false,

  init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || window.webkitAudioContext)();
      this.enabled = localStorage.getItem('ui_sound_enabled') === 'true';
    }
  },

  toggle() {
    this.init();
    this.enabled = !this.enabled;
    localStorage.setItem('ui_sound_enabled', this.enabled);
    if (this.enabled && this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    this.showToast();
    this.updateButtons();
  },

  playClick() {
    if (!this.enabled) return;
    this.init();
    try {
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(250, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0.06, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.log("Audio play blocked", e);
    }
  },

  playHover() {
    if (!this.enabled) return;
    this.init();
    try {
      const ctx = this.ctx;
      if (ctx.state === 'suspended') ctx.resume();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(140, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(320, ctx.currentTime + 0.14);
      
      gain.gain.setValueAtTime(0.03, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + 0.14);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + 0.14);
    } catch (e) {
      console.log("Audio play blocked", e);
    }
  },

  updateButtons() {
    const btns = document.querySelectorAll('.sound-toggle');
    btns.forEach(btn => {
      if (btn.id === 'mobileSoundToggle') {
        btn.textContent = this.enabled ? '≡ƒöè Sound On' : '≡ƒöç Sound Off';
      } else {
        btn.textContent = this.enabled ? '≡ƒöè' : '≡ƒöç';
      }
      btn.title = this.enabled ? 'Mute UI Sounds' : 'Unmute UI Sounds';
    });
  },

  showToast() {
    const toast = document.getElementById('soundToast');
    if (toast) {
      toast.querySelector('span').textContent = this.enabled ? '≡ƒöè' : '≡ƒöç';
      toast.childNodes[1].textContent = this.enabled ? ' UI Sound Effects Enabled' : ' UI Sound Effects Muted';
      toast.classList.add('show');
      setTimeout(() => toast.classList.remove('show'), 2200);
    }
  }
};


// ΓöÇΓöÇ Initialization of HomePage Logic ΓöÇΓöÇ
window.initHomePage = function() {
  console.log("Initializing Home Page Interactions");
  
  // Initialize Sound System State
  UISound.init();
  UISound.updateButtons();

  // Sound toggles event listeners
  const soundBtn = document.getElementById('soundToggle');
  const mobSoundBtn = document.getElementById('mobileSoundToggle');
  [soundBtn, mobSoundBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        UISound.toggle();
        UISound.playClick();
      });
    }
  });

  // Sound Hover Bindings for Buttons and Cards
  const hoverElements = document.querySelectorAll('.btn-book-call, .btn-view-projects, .btn-cta-primary, .btn-cta-secondary, .svc-card, .testi-card, .proc-card, .phone-card');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => UISound.playHover());
  });

  const clickElements = document.querySelectorAll('a, button, .faq-q');
  clickElements.forEach(el => {
    el.addEventListener('click', () => {
      if (!el.classList.contains('sound-toggle')) {
        UISound.playClick();
      }
    });
  });

  /* ΓöÇΓöÇΓöÇ NAVBAR SCROLL EFFECT ΓöÇΓöÇΓöÇ */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ΓöÇΓöÇΓöÇ HAMBURGER & MOBILE MENU ΓöÇΓöÇΓöÇ */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      document.body.style.overflow = menuOpen ? 'hidden' : '';
      hamburger.classList.toggle('active', menuOpen);
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.classList.remove('active');
      });
    });
  }

  /* ─── ULTRA-FAST VIDEO PERFORMANCE OBSERVER (Zero Lag) ─── */
  (function initVideoPerformanceObserver() {
    const allVideos = document.querySelectorAll('video');
    if (allVideos.length === 0) return;

    const videoObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        const vid = entry.target;
        if (entry.isIntersecting) {
          vid.play().catch(() => {});
        } else {
          vid.pause();
        }
      });
    }, {
      rootMargin: '300px 0px 300px 0px',
      threshold: 0
    });

    allVideos.forEach(vid => videoObserver.observe(vid));
  })();

  /* ─── PHONE GALLERY AUTO MARQUEE LOOP (Optimized GPU) ─── */
  const track = document.getElementById('phoneTrack');
  if (track) {
    // Clone children to ensure seamless continuous scroll
    const originals = Array.from(track.children);
    originals.forEach(c => track.appendChild(c.cloneNode(true)));

    let pos = 0;
    let paused = false;
    const speed = 0.8;
    let cachedHalf = track.scrollWidth / 2;

    window.addEventListener('resize', () => {
      cachedHalf = track.scrollWidth / 2;
    }, { passive: true });

    function animateMarquee() {
      if (!paused && cachedHalf > 0) {
        pos += speed;
        if (pos >= cachedHalf) {
          pos -= cachedHalf;
        }
        track.style.transform = `translate3d(${-pos}px, 0, 0)`;
      }
      requestAnimationFrame(animateMarquee);
    }
    requestAnimationFrame(animateMarquee);

    track.parentElement.addEventListener('mouseenter', () => paused = true);
    track.parentElement.addEventListener('mouseleave', () => paused = false);
  }

  /* ΓöÇΓöÇΓöÇ ABOUT SECTION PHONE HOVER SWAP ΓöÇΓöÇΓöÇ */
  const aboutPhoneImg = document.querySelector('.about-phone-img');
  const aboutFeatures = document.querySelectorAll('.about-feature');
  const aboutStats = document.querySelectorAll('.about-stat');
  
  // Available premium client visual images
  const creativeImages = [
    'https://framerusercontent.com/images/47wthKW9QtyzWe0HNbIOQJNmqR0.png?width=500',
    'https://framerusercontent.com/images/WDrNOfg5iUyT57XmspvbapLbX7s.png?width=500',
    'https://framerusercontent.com/images/tu9fv4cUMeAN8YUzlfGB29gpM.png?width=500'
  ];

  // Merge stats & features into a hover array
  const hoverTriggers = [...aboutStats, ...aboutFeatures];
  if (aboutPhoneImg && hoverTriggers.length > 0) {
    hoverTriggers.forEach((el, i) => {
      el.addEventListener('mouseenter', () => {
        const imgUrl = creativeImages[i % creativeImages.length];
        if (aboutPhoneImg.src !== imgUrl) {
          aboutPhoneImg.style.opacity = '0';
          setTimeout(() => {
            aboutPhoneImg.src = imgUrl;
            aboutPhoneImg.style.opacity = '1';
          }, 150);
        }
      });
    });
  }

  /* ΓöÇΓöÇΓöÇ 3D TILT EFFECT ΓöÇΓöÇΓöÇ */
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 16;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -16;
      card.style.transition = 'none';
      card.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px) scale(1.03)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    });
  });

  /* ΓöÇΓöÇΓöÇ MOUSE MOVEMENT PARALLAX ON HERO GLOW ΓöÇΓöÇΓöÇ */
  const heroGlow = document.querySelector('.hero-glow');
  if (heroGlow) {
    let animFrame;
    document.addEventListener('mousemove', (e) => {
      cancelAnimationFrame(animFrame);
      animFrame = requestAnimationFrame(() => {
        const xVal = (e.clientX / window.innerWidth - 0.5) * 50;
        const yVal = (e.clientY / window.innerHeight - 0.5) * 30;
        heroGlow.style.transform = `translateX(calc(-50% + ${xVal}px)) translateY(${yVal}px)`;
      });
    }, { passive: true });
  }

  /* ─── PERMANENT SCROLL-REVEAL & ANIMATION ENGINE ─── */
  /* ─── PERMANENT SCROLL-REVEAL & TICKER ANIMATION ENGINE ─── */
  (function initScrollRevealEngine() {
    function setupRevealElements() {
      // 1. Setup Scroll-Reveal for Framer Appear & Reveal Elements
      const framerEls = document.querySelectorAll('[data-framer-appear-id]');
      const revealEls = document.querySelectorAll('.reveal, .reveal-on-scroll');

      if (typeof IntersectionObserver !== 'undefined') {
        let staggerTimeout = null;
        let intersectingFramerEls = [];
        let intersectingRevealEls = [];

        const framerObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              intersectingFramerEls.push(entry.target);
              framerObserver.unobserve(entry.target);
            }
          });
          if (intersectingFramerEls.length > 0) {
            clearTimeout(staggerTimeout);
            staggerTimeout = setTimeout(() => {
              intersectingFramerEls.forEach((el, i) => {
                el.style.animationDelay = `${i * 0.1}s`;
                el.classList.add('framer-animate-reveal');
              });
              intersectingFramerEls = [];
            }, 10);
          }
        }, { threshold: 0.05, rootMargin: '60px 0px 60px 0px' });

        framerEls.forEach((el, i) => {
          const rect = el.getBoundingClientRect();
          if (rect.top < window.innerHeight + 60) {
            el.style.animationDelay = `${(i % 10) * 0.08}s`;
            el.classList.add('framer-animate-reveal');
          } else {
            framerObserver.observe(el);
          }
        });

        const revealObserver = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              intersectingRevealEls.push(entry.target);
              revealObserver.unobserve(entry.target);
            }
          });
          if (intersectingRevealEls.length > 0) {
            setTimeout(() => {
              intersectingRevealEls.forEach((el, i) => {
                el.style.transitionDelay = `${i * 0.1}s`;
                el.classList.add('visible');
              });
              intersectingRevealEls = [];
            }, 10);
          }
        }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

        revealEls.forEach(el => revealObserver.observe(el));
      } else {
        framerEls.forEach(el => el.classList.add('framer-animate-reveal'));
        revealEls.forEach(el => el.classList.add('visible'));
      }

      // 2. Continuous Ticker / Marquee Duping for Seamless Loop
      const tickerContainers = document.querySelectorAll('.framer-6lep06, .framer-18eru5x, [data-framer-name="Edited Video Wrapper"], [data-framer-name="Row 2"], [data-framer-name="Row 3"], .ticker-track');
      tickerContainers.forEach(container => {
        const ul = container.querySelector('ul');
        if (ul && !ul.dataset.duped) {
          ul.dataset.duped = 'true';
          const children = Array.from(ul.children);
          if (children.length > 0 && children.length <= 6) {
            children.forEach(child => ul.appendChild(child.cloneNode(true)));
          }
        }
      });
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', setupRevealElements);
    } else {
      setupRevealElements();
    }
  })();

  /* ΓöÇΓöÇΓöÇ PROCESS STEPS TIMELINE SCROLL SCALING ΓöÇΓöÇΓöÇ */
  const procCards = document.querySelectorAll('.proc-card');
  const procDot = document.getElementById('processDot');
  const procLine = document.getElementById('processLine');

  function updateProcessTimeline() {
    const vh = window.innerHeight;
    let activeIdx = 0;
    let maxProgress = 0;

    procCards.forEach((card, idx) => {
      const rect = card.getBoundingClientRect();
      const center = rect.top + rect.height / 2;
      const distanceFromCenter = Math.abs(center - vh / 2);
      const progress = Math.max(0, 1 - distanceFromCenter / (vh * 0.6));
      
      card.style.transform = `scale(${(0.9 + progress * 0.1).toFixed(3)})`;
      card.style.opacity = (0.45 + progress * 0.55).toFixed(3);

      if (progress > maxProgress) {
        maxProgress = progress;
        activeIdx = idx;
      }
    });

    if (procDot && procLine && procCards.length > 0) {
      const pct = procCards.length > 1 ? activeIdx / (procCards.length - 1) : 0;
      procDot.style.top = (pct * procLine.offsetHeight).toFixed(1) + 'px';
    }
  }

  window.addEventListener('scroll', updateProcessTimeline, { passive: true });
  updateProcessTimeline();

  /* ΓöÇΓöÇΓöÇ TESTIMONIAL VIDEO CAROUSEL SYSTEM ΓöÇΓöÇΓöÇ */
  const testiSlides = document.querySelectorAll('.testi-video-slide');
  const testiCards = document.querySelectorAll('.testi-card');
  const playBtn = document.getElementById('testiPlayPause');
  const muteBtn = document.getElementById('testiMuteUnmute');
  const btnPrev = document.getElementById('testiPrev');
  const btnNext = document.getElementById('testiNext');

  let currentSlide = 0;
  let isPlaying = true;
  let isMuted = true;
  let progressInterval;
  const slideDuration = 7000; // 7 seconds per slide
  let startTime = Date.now();
  let remainingTime = slideDuration;

  // Run progress bar animation loop
  function startProgressBar() {
    clearInterval(progressInterval);
    startTime = Date.now() - (slideDuration - remainingTime);
    
    progressInterval = setInterval(() => {
      if (!isPlaying) return;
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / slideDuration) * 100);
      
      const currentFill = document.getElementById(`tpFill${currentSlide}`);
      if (currentFill) {
        currentFill.style.width = pct + '%';
      }

      if (elapsed >= slideDuration) {
        remainingTime = slideDuration;
        nextSlide();
      }
    }, 50);
  }

  function pauseProgressBar() {
    clearInterval(progressInterval);
    const elapsed = Date.now() - startTime;
    remainingTime = Math.max(0, slideDuration - elapsed);
  }

  function resetProgressBars() {
    clearInterval(progressInterval);
    for (let i = 0; i < testiSlides.length; i++) {
      const fill = document.getElementById(`tpFill${i}`);
      if (fill) {
        fill.style.width = i < currentSlide ? '100%' : '0%';
      }
    }
  }

  function showSlide(index) {
    if (index < 0) index = testiSlides.length - 1;
    if (index >= testiSlides.length) index = 0;
    
    // Pause old video
    const oldVideo = testiSlides[currentSlide];
    if (oldVideo) {
      oldVideo.classList.remove('active');
      oldVideo.pause();
    }

    currentSlide = index;
    remainingTime = slideDuration;
    resetProgressBars();

    // Play new video
    const activeVideo = testiSlides[currentSlide];
    if (activeVideo) {
      activeVideo.classList.add('active');
      activeVideo.muted = isMuted;
      if (isPlaying) {
        activeVideo.play().catch(e => console.log('Autoplay blocked:', e));
      }
    }

    // Update active state on side author cards
    testiCards.forEach(card => {
      const cardIdx = parseInt(card.dataset.videoIdx) || 0;
      card.classList.toggle('active-author', cardIdx === currentSlide);
    });

    startProgressBar();
  }

  function nextSlide() {
    showSlide(currentSlide + 1);
  }

  function prevSlide() {
    showSlide(currentSlide - 1);
  }

  if (testiSlides.length > 0) {
    showSlide(0);

    if (btnPrev && btnNext) {
      btnPrev.addEventListener('click', () => { prevSlide(); UISound.playClick(); });
      btnNext.addEventListener('click', () => { nextSlide(); UISound.playClick(); });
    }

    // Connect side author cards to trigger specific slides on click
    testiCards.forEach(card => {
      card.addEventListener('click', () => {
        const targetIdx = parseInt(card.dataset.videoIdx);
        if (targetIdx !== undefined && !isNaN(targetIdx)) {
          showSlide(targetIdx);
        }
      });
    });

    // Carousel Play/Pause
    if (playBtn) {
      playBtn.addEventListener('click', () => {
        isPlaying = !isPlaying;
        playBtn.textContent = isPlaying ? 'ΓÅ╕' : 'Γû╢';
        const activeVideo = testiSlides[currentSlide];
        if (activeVideo) {
          if (isPlaying) {
            activeVideo.play();
            startProgressBar();
          } else {
            activeVideo.pause();
            pauseProgressBar();
          }
        }
      });
    }

    // Carousel Mute/Unmute
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        isMuted = !isMuted;
        muteBtn.textContent = isMuted ? '≡ƒöç' : '≡ƒöè';
        testiSlides.forEach(v => v.muted = isMuted);
      });
    }
  }

  /* ΓöÇΓöÇΓöÇ FAQ ACCORDION TIMELINES ΓöÇΓöÇΓöÇ */
  document.querySelectorAll('.faq-item').forEach(item => {
    const btn = item.querySelector('.faq-q');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) {
          item.classList.add('open');
        }
      });
    }
  });

  /* ΓöÇΓöÇΓöÇ SMOOTH ANCHOR LINK SCROLLS ΓöÇΓöÇΓöÇ */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        e.preventDefault();
        const navOffset = 90;
        const targetPosition = targetElement.getBoundingClientRect().top + window.scrollY - navOffset;
        window.scrollTo({ top: targetPosition, behavior: 'smooth' });
      }
    });
  });

  /* ΓöÇΓöÇΓöÇ DYNAMIC NAV ACTIVE LINK HIGHLIGHTER ΓöÇΓöÇΓöÇ */
  const pageSections = document.querySelectorAll('section[id], footer[id]');
  const navigationLinks = document.querySelectorAll('.nav-links a');

  const navScrollObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navigationLinks.forEach(link => {
          const href = link.getAttribute('href');
          const isMatch = href === `index.html#${entry.target.id}` || href === `#${entry.target.id}`;
          link.classList.toggle('active', isMatch);
        });
      }
    });
  }, { threshold: 0.35, rootMargin: '-40px 0px -40px 0px' });

  pageSections.forEach(sec => navScrollObserver.observe(sec));
};


// ΓöÇΓöÇ Initialization of ProjectsPage Logic ΓöÇΓöÇ
window.initProjectsPage = function() {
  console.log("Initializing Projects Page Interactions");
  
  // Initialize Sound System State
  UISound.init();
  UISound.updateButtons();

  // Sound controls event listeners
  const soundBtn = document.getElementById('soundToggle');
  const mobSoundBtn = document.getElementById('mobileSoundToggle');
  [soundBtn, mobSoundBtn].forEach(btn => {
    if (btn) {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        UISound.toggle();
        UISound.playClick();
      });
    }
  });

  // Sound Hover Bindings for Buttons and Cards
  const hoverElements = document.querySelectorAll('.btn-white, .p-card, .filter-tab-btn');
  hoverElements.forEach(el => {
    el.addEventListener('mouseenter', () => UISound.playHover());
  });

  const clickElements = document.querySelectorAll('a, button');
  clickElements.forEach(el => {
    el.addEventListener('click', () => {
      if (!el.classList.contains('sound-toggle')) {
        UISound.playClick();
      }
    });
  });

  /* ΓöÇΓöÇΓöÇ NAVBAR SCROLL ΓöÇΓöÇΓöÇ */
  const navbar = document.getElementById('navbar');
  if (navbar) {
    window.addEventListener('scroll', () => {
      navbar.classList.toggle('scrolled', window.scrollY > 40);
    }, { passive: true });
  }

  /* ΓöÇΓöÇΓöÇ HAMBURGER & MOBILE MENU ΓöÇΓöÇΓöÇ */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', () => {
      menuOpen = !menuOpen;
      mobileMenu.classList.toggle('open', menuOpen);
      document.body.style.overflow = menuOpen ? 'hidden' : '';
      hamburger.classList.toggle('active', menuOpen);
    });

    document.querySelectorAll('.mobile-link').forEach(link => {
      link.addEventListener('click', () => {
        menuOpen = false;
        mobileMenu.classList.remove('open');
        document.body.style.overflow = '';
        hamburger.classList.remove('active');
      });
    });
  }

  /* ΓöÇΓöÇΓöÇ 3D TILT ON PROJECT CARDS ΓöÇΓöÇΓöÇ */
  const tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
      card.style.transition = 'none';
      card.style.transform = `perspective(1000px) rotateX(${y}deg) rotateY(${x}deg) translateY(-8px) scale(1.02)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
      card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0) scale(1)';
    });
  });

  /* ΓöÇΓöÇΓöÇ INTERACTION CARDS STAGGERED FADE-UP ΓöÇΓöÇΓöÇ */
  const pCards = document.querySelectorAll('.p-card');
  const cardObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const card = entry.target;
        const index = Array.from(pCards).indexOf(card);
        const col = index % 3;
        card.style.transitionDelay = `${col * 0.08}s`;
        card.classList.add('visible');
        cardObserver.unobserve(card);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  pCards.forEach(c => cardObserver.observe(c));

  /* ΓöÇΓöÇΓöÇ LIVE ADVANCED TAB FILTER & SEARCH ΓöÇΓöÇΓöÇ */
  const searchInput = document.getElementById('projectSearch');
  const tabsService = document.querySelectorAll('#tabsService .filter-tab-btn');
  const tabsNiche = document.querySelectorAll('#tabsNiche .filter-tab-btn');
  const tabsStyle = document.querySelectorAll('#tabsStyle .filter-tab-btn');
  
  let filterValService = 'all';
  let filterValNiche = 'all';
  let filterValStyle = 'all';
  let filterSearchQuery = '';

  function applyFilters() {
    let visibleCount = 0;

    pCards.forEach(card => {
      const cSvc = card.dataset.service;
      const cNiche = card.dataset.niche;
      const cStyle = card.dataset.style;
      
      const authorName = card.querySelector('.p-name').textContent.toLowerCase();
      const description = card.querySelector('.p-desc').textContent.toLowerCase();

      // Check filters match
      const matchSvc = filterValService === 'all' || cSvc === filterValService;
      const matchNiche = filterValNiche === 'all' || cNiche === filterValNiche;
      const matchStyle = filterValStyle === 'all' || cStyle === filterValStyle;
      
      const matchSearch = filterSearchQuery === '' || 
                          authorName.includes(filterSearchQuery) || 
                          description.includes(filterSearchQuery) || 
                          cSvc.includes(filterSearchQuery) || 
                          cNiche.includes(filterSearchQuery);

      const isShow = matchSvc && matchNiche && matchStyle && matchSearch;

      if (isShow) {
        card.style.display = '';
        setTimeout(() => {
          card.style.opacity = '1';
          card.style.transform = 'translateY(0)';
        }, 30);
        visibleCount++;
      } else {
        card.style.opacity = '0';
        card.style.transform = 'translateY(20px)';
        card.style.display = 'none';
      }
    });

    const noRes = document.getElementById('noResults');
    if (noRes) {
      noRes.classList.toggle('show', visibleCount === 0);
    }
  }

  // Bind Search Input
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterSearchQuery = e.target.value.toLowerCase().trim();
      applyFilters();
    });
  }

  // Bind Service Tabs
  tabsService.forEach(btn => {
    btn.addEventListener('click', () => {
      tabsService.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterValService = btn.dataset.val;
      applyFilters();
    });
  });

  // Bind Niche Tabs
  tabsNiche.forEach(btn => {
    btn.addEventListener('click', () => {
      tabsNiche.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterValNiche = btn.dataset.val;
      applyFilters();
    });
  });

  // Bind Style Tabs
  tabsStyle.forEach(btn => {
    btn.addEventListener('click', () => {
      tabsStyle.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      filterValStyle = btn.dataset.val;
      applyFilters();
    });
  });
};


// ── Reliable Page Boot Trigger ──
function bootPageLogic() {
  const isProjects = window.location.pathname.includes('projects');
  if (isProjects && typeof window.initProjectsPage === 'function') {
    window.initProjectsPage();
  } else if (typeof window.initHomePage === 'function') {
    window.initHomePage();
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', bootPageLogic);
} else {
  bootPageLogic();
}
