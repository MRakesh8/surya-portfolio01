/* ============================================
   SURYA — JavaScript
   All interactive features for the portfolio
============================================ */

document.addEventListener('DOMContentLoaded', () => {

  /* ─── NAVBAR SCROLL ─────────────────── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });


  /* ─── MOBILE MENU ───────────────────── */
  const hamburger = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobileMenu');
  let menuOpen = false;

  hamburger.addEventListener('click', () => {
    menuOpen = !menuOpen;
    mobileMenu.classList.toggle('open', menuOpen);
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    const spans = hamburger.querySelectorAll('span');
    if (menuOpen) {
      spans[0].style.transform = 'translateY(7px) rotate(45deg)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'translateY(-7px) rotate(-45deg)';
    } else {
      spans.forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    }
  });

  document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
      menuOpen = false;
      mobileMenu.classList.remove('open');
      document.body.style.overflow = '';
      hamburger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
    });
  });


  /* ─── SCROLL FADE-IN OBSERVER ────────── */
  /* ─── ABOUT SECTION PHONE INTERACTIVITY ─ */
  const aboutPhoneImg = document.querySelector('.ac-phone-img');
  const aboutHoverItems = document.querySelectorAll('.about-stat-item, .about-feature-item');
  
  // We have 3 creator images available
  const availableImages = ['img/creator1.png', 'img/creator2.png', 'img/creator3.png'];
  
  if (aboutPhoneImg && aboutHoverItems.length > 0) {
    aboutHoverItems.forEach((item, index) => {
      // Map each hoverable item to one of the 3 images in a loop
      const imgIndex = index % availableImages.length;
      
      item.addEventListener('mouseenter', () => {
        aboutPhoneImg.style.opacity = '0'; // Fade out
        setTimeout(() => {
          aboutPhoneImg.src = availableImages[imgIndex];
          aboutPhoneImg.style.opacity = '1'; // Fade in
        }, 150);
      });
    });
  }

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -40px 0px' });

  document.querySelectorAll('.fade-up, .fade-up-delay, .fade-up-delay2')
    .forEach(el => observer.observe(el));


  /* ─── SERVICES ACCORDION ────────────── */
  document.querySelectorAll('.service-item').forEach(item => {
    item.querySelector('.service-header').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.service-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });


  /* ─── FAQ ACCORDION ─────────────────── */
  document.querySelectorAll('.faq-item').forEach(item => {
    item.querySelector('.faq-q').addEventListener('click', () => {
      const isOpen = item.classList.contains('open');
      document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
      if (!isOpen) item.classList.add('open');
    });
  });


  /* ─── MOUSE PARALLAX ON HERO GLOW ───── */
  const heroGlow = document.querySelector('.hero-glow');
  let raf;
  document.addEventListener('mousemove', (e) => {
    if (!heroGlow) return;
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const xPct = (e.clientX / window.innerWidth - 0.5) * 2;
      const yPct = (e.clientY / window.innerHeight - 0.5) * 2;
      heroGlow.style.transform = `translateX(calc(-50% + ${xPct * 45}px)) translateY(${yPct * 22}px)`;
    });
  }, { passive: true });


  /* ─── PHONE CARD 3D TILT ────────────── */
  document.querySelectorAll('.phone-frame').forEach(card => {
    const isFeatured = card.classList.contains('phone-frame-featured');
    const isRight = !!card.closest('.phone-right');
    const baseRotate = isFeatured ? 0 : isRight ? 4 : -4;
    const baseScale = isFeatured ? 1 : 0.9;

    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * 14;
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -14;
      card.style.transition = 'none';
      card.style.transform = `scale(${isFeatured ? 1.03 : 0.93}) rotate(${baseRotate + x * 0.25}deg) rotateX(${y}deg) translateY(-6px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      card.style.transform = `scale(${baseScale}) rotate(${baseRotate}deg) translateY(0)`;
    });
  });


  /* ─── PROJECT CARDS STAGGER ──────────── */
  const projectCards = document.querySelectorAll('.project-card');
  const projectObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(projectCards).indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, (idx % 4) * 80);
        projectObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  projectCards.forEach(card => {
    card.style.opacity = '0';
    card.style.transform = 'translateY(28px)';
    card.style.transition = 'opacity 0.6s ease, transform 0.6s ease, border-color 0.3s, box-shadow 0.3s';
    projectObserver.observe(card);
  });


  /* ─── SERVICE ITEMS STAGGER ──────────── */
  const serviceItems = document.querySelectorAll('.service-item');
  const serviceObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = parseInt(entry.target.dataset.index) || 0;
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateX(0)';
        }, idx * 70);
        serviceObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05 });

  serviceItems.forEach(item => {
    item.style.opacity = '0';
    item.style.transform = 'translateX(-12px)';
    item.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
    serviceObserver.observe(item);
  });


  /* ─── TOOL CHIPS STAGGER ─────────────── */
  const toolCategories = document.querySelectorAll('.tool-category');
  const toolObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const idx = Array.from(toolCategories).indexOf(entry.target);
        setTimeout(() => {
          entry.target.style.opacity = '1';
          entry.target.style.transform = 'translateY(0)';
        }, idx * 100);
        toolObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  toolCategories.forEach(cat => {
    cat.style.opacity = '0';
    cat.style.transform = 'translateY(20px)';
    cat.style.transition = 'opacity 0.6s ease, transform 0.6s ease, background 0.3s, border-color 0.3s';
    toolObserver.observe(cat);
  });


  /* ─── SMOOTH SCROLL ─────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const id = a.getAttribute('href');
      if (id === '#') return;
      const target = document.querySelector(id);
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });


  /* ─── ACTIVE NAV LINK HIGHLIGHT ─────── */
  const sections = document.querySelectorAll('section[id], footer[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  const navObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        navLinks.forEach(link => {
          link.style.color = '';
          link.style.background = '';
          if (link.getAttribute('href') === `#${entry.target.id}`) {
            link.style.color = '#ffffff';
            link.style.background = 'rgba(255,255,255,0.07)';
          }
        });
      }
    });
  }, { threshold: 0.4 });

  sections.forEach(s => navObserver.observe(s));

});
