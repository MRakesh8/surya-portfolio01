import re

html = '''<!doctype html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Scrollz – Premium Short-Form Video Agency</title>
  <meta name="description" content="Premium short-form video agency. We transform raw footage into viral-ready content.">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Outfit:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="index.css">
</head>
<body>
<div class="site-wrapper">

<!-- ====== NAVBAR ====== -->
<nav class="navbar" id="navbar">
  <div class="nav-inner">
    <a href="#" class="nav-logo"><div class="nl-ico">✦</div>Scrollz</a>
    <div class="hamburger" id="hamburger"><span></span><span></span><span></span></div>
    <div class="nav-links">
      <a href="projects.html">Projects</a>
      <a href="#about">About</a>
      <a href="#services">Services</a>
      <a href="#testimonials">Reviews</a>
      <a href="#contact">Contact</a>
      <a href="#faqs">FAQs</a>
    </div>
    <a href="#contact" class="btn-book btn-nav">Book a Call</a>
  </div>
</nav>

<!-- MOBILE MENU -->
<div class="mobile-menu" id="mobileMenu">
  <a href="projects.html" class="mobile-link">Projects</a>
  <a href="#about" class="mobile-link">About</a>
  <a href="#services" class="mobile-link">Services</a>
  <a href="#testimonials" class="mobile-link">Reviews</a>
  <a href="#contact" class="mobile-link">Contact</a>
  <a href="#faqs" class="mobile-link">FAQs</a>
  <a href="#contact" class="btn-book mobile-link" style="margin-top:20px;text-align:center">Book a Call</a>
</div>

<!-- ====== HERO ====== -->
<section class="hero section" id="work">
  <div class="grid-overlay"></div>
  <div class="noise-overlay"></div>
  <div class="hero-glow"></div>
  <div class="container">
    <div class="hero-content fade-up">
      <h1 class="hero-title">Dominate Social Media with Video.</h1>
      
      <!-- Staggered animation layout to match Framer -->
      <div class="hero-stats">
        <div class="hs-avatars">
          <div class="hs-av" style="background:linear-gradient(135deg,#ff2d55,#ff8c69)">M</div>
          <div class="hs-av" style="background:linear-gradient(135deg,#00aeff,#7932ec)">C</div>
          <div class="hs-av" style="background:linear-gradient(135deg,#ffa200,#ff2d55)">J</div>
          <div class="hs-av" style="background:linear-gradient(135deg,#7932ec,#23005c)">R</div>
        </div>
        <div class="hs-text">
          <div class="hs-stars">★★★★★</div>
          <div class="hs-label"><span style="color:var(--text-muted)">Trusted by </span><strong>250+ Creators</strong></div>
        </div>
      </div>
      
      <p class="hero-desc">We help our clients absolutely crush it on any social media platform.</p>
      
      <div class="hero-actions">
        <a href="#services" class="btn-lg">View Projects</a>
      </div>
    </div>
  </div>

  <!-- Phone Gallery (Screenshot Match) -->
  <div class="phone-gallery-wrap fade-up-delay">
    <div class="phone-gallery-inner" id="pgTrack">
      
      <!-- EDITED 1 -->
      <div class="pg-phone pg-phone-featured">
        <div class="pg-frame pg-frame-featured">
          <div class="pg-screen">
            <img src="https://framerusercontent.com/images/47wthKW9QtyzWe0HNbIOQJNmqR0.png?width=400" alt="Natalie" class="pg-img" loading="lazy">
            <div class="pg-overlay"></div>
            <div class="pg-top-tags">
              <span class="pg-pill pg-pill-orange"><span class="pg-pill-dot orange-dot"></span>1M+ Views</span>
              <span class="pg-pill pg-pill-green"><span class="pg-pill-dot green-dot"></span>1k+ Sales</span>
            </div>
            <div class="pg-actions">
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>4,654</span></div>
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>264</span></div>
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span>1,200</span></div>
            </div>
            <div class="pg-creator-bar">
              <div class="pg-avatar av-blue">N</div>
              <div class="pg-creator-text">
                <p class="pg-creator-name">Natalie <span class="pg-verified">✓</span></p>
                <p class="pg-creator-caption">Ever seen an outfit this…</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- EDITED 2 -->
      <div class="pg-phone pg-phone-featured">
        <div class="pg-frame pg-frame-featured">
          <div class="pg-screen">
            <img src="https://framerusercontent.com/images/WDrNOfg5iUyT57XmspvbapLbX7s.png?width=400" alt="Marie" class="pg-img" loading="lazy">
            <div class="pg-overlay"></div>
            <div class="pg-top-tags">
              <span class="pg-pill pg-pill-orange"><span class="pg-pill-dot orange-dot"></span>100K+ Views</span>
              <span class="pg-pill pg-pill-green"><span class="pg-pill-dot green-dot"></span>300+ Enrollments</span>
            </div>
            <div class="pg-actions">
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>50,120</span></div>
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>1,320</span></div>
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span>640</span></div>
            </div>
            <div class="pg-creator-bar">
              <div class="pg-avatar av-pink">M</div>
              <div class="pg-creator-text">
                <p class="pg-creator-name">Marie Gonzales <span class="pg-verified">✓</span></p>
                <p class="pg-creator-caption">Enrollments to my new…</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- EDITED 3 -->
      <div class="pg-phone pg-phone-featured">
        <div class="pg-frame pg-frame-featured">
          <div class="pg-screen">
            <img src="https://framerusercontent.com/images/tu9fv4cUMeAN8YUzlfGB29gpM.png?width=400" alt="Cameron" class="pg-img" loading="lazy">
            <div class="pg-overlay"></div>
            <div class="pg-top-tags">
              <span class="pg-pill pg-pill-orange"><span class="pg-pill-dot orange-dot"></span>200K+ Views</span>
              <span class="pg-pill pg-pill-green"><span class="pg-pill-dot green-dot"></span>50+ Calls Booked</span>
            </div>
            <div class="pg-actions">
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>6,552</span></div>
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>2,120</span></div>
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span>994</span></div>
            </div>
            <div class="pg-creator-bar">
              <div class="pg-avatar av-blue" style="background:linear-gradient(135deg,#ff2d55,#ff8c69)">C</div>
              <div class="pg-creator-text">
                <p class="pg-creator-name">Cameron <span class="pg-verified">✓</span></p>
                <p class="pg-creator-caption">Watch me speak LIVE at…</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- RAW 1 -->
      <div class="pg-phone">
        <div class="pg-frame">
          <div class="pg-screen">
            <img src="https://framerusercontent.com/images/tu9fv4cUMeAN8YUzlfGB29gpM.png?width=400" alt="Raw Footage" class="pg-img pg-img-raw" loading="lazy">
            <div class="pg-overlay"></div>
            <div class="pg-top-tags">
              <span class="pg-pill pg-pill-raw">Raw Footage</span>
            </div>
            <div class="pg-actions" style="opacity:0.4">
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg><span>—</span></div>
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg><span>—</span></div>
              <div class="pg-action-btn"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="1.8"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg><span>—</span></div>
            </div>
            <div class="pg-creator-bar">
              <div class="pg-avatar av-gray">?</div>
              <div class="pg-creator-text">
                <p class="pg-creator-name" style="color:rgba(255,255,255,0.7)">Unedited Clip</p>
                <p class="pg-creator-caption" style="color:rgba(255,255,255,0.4)">Before Scrollz edit…</p>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  </div>
</section>

<!-- ====== TICKER ====== -->
<section class="ticker-section">
  <div class="ticker-inner">
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(255,162,0,.15)">🎬</span>ViralCraft</div><div class="ticker-dot"></div>
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(0,174,255,.12)">📱</span>ReelFlow</div><div class="ticker-dot"></div>
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(121,50,236,.2)">⚡</span>Volt Energy Co.</div><div class="ticker-dot"></div>
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(5,161,18,.15)">🎯</span>GrowthLab</div><div class="ticker-dot"></div>
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(255,45,85,.15)">🔥</span>HookMedia</div><div class="ticker-dot"></div>
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(255,162,0,.15)">🎬</span>ViralCraft</div><div class="ticker-dot"></div>
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(0,174,255,.12)">📱</span>ReelFlow</div><div class="ticker-dot"></div>
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(121,50,236,.2)">⚡</span>Volt Energy Co.</div><div class="ticker-dot"></div>
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(5,161,18,.15)">🎯</span>GrowthLab</div><div class="ticker-dot"></div>
    <div class="ticker-item"><span class="ti-icon" style="background:rgba(255,45,85,.15)">🔥</span>HookMedia</div>
  </div>
</section>

<!-- ====== ABOUT ====== -->
<section class="section about-section" id="about">
  <div class="grid-overlay"></div>
  <div class="noise-overlay"></div>
  <div class="about-glow"></div>
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-badge">Who We Are</div>
      <h2>Built by creators,<br>for creators.</h2>
      <p>We're a team of editors, strategists and storytellers who live and breathe short-form video. We help you build a powerful presence across every platform.</p>
    </div>
    
    <div class="about-layout fade-up-delay">
      <div class="about-stats-left">
        <div class="about-stat-item">
          <div class="about-stat-num">500+</div>
          <div class="about-stat-label">Videos Edited for Clients</div>
        </div>
        <div class="about-stat-item">
          <div class="about-stat-num">600+</div>
          <div class="about-stat-label">Reviews from Happy Creators</div>
        </div>
        <div class="about-stat-item">
          <div class="about-stat-num">$200K+</div>
          <div class="about-stat-label">Generated in Client Revenue</div>
        </div>
      </div>
      
      <div class="about-center-phone">
        <div class="ac-phone-frame">
          <img src="https://framerusercontent.com/images/WDrNOfg5iUyT57XmspvbapLbX7s.png?width=500" alt="Creator" class="ac-phone-img">
        </div>
      </div>
      
      <div class="about-features-right">
        <div class="about-feature-item">
          <div class="af-header"><span class="af-play">▶</span> Revisions</div>
          <p>Not happy? We'll fix it. Every project comes with multiple revision rounds.</p>
        </div>
        <div class="about-feature-item">
          <div class="af-header"><span class="af-play">▶</span> 24/7 Support</div>
          <p>Questions don't wait, and neither do we. Our team is always just a message away.</p>
        </div>
        <div class="about-feature-item">
          <div class="af-header"><span class="af-play">▶</span> Fast Delivery</div>
          <p>Zero compromise on speed. Your content, delivered on time, every time.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== SERVICES ====== -->
<section class="section services-section" id="services">
  <div class="grid-overlay"></div>
  <div class="noise-overlay"></div>
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-badge">What We Offer</div>
      <h2>Everything your content needs.<br>Nothing it doesn't.</h2>
      <p>From raw clip to ready-to-post reel, we handle every layer of your short-form pipeline.</p>
    </div>
    
    <div class="services-grid">
      <!-- S1 -->
      <div class="service-card-wrapper fade-up-delay">
        <div class="sc-glow"></div>
        <div class="service-card">
          <div class="sc-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="23 7 16 12 23 17 23 7"></polygon><rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect></svg></div>
          <h3 class="sc-title">Short-Form Editing</h3>
          <div class="sc-divider"></div>
          <p class="sc-desc">Precision-paced edits built for maximum watch time. Every second intentional, every cut earns its place.</p>
          <ul class="sc-bullets">
            <li><span class="chk">✓</span> Reels, Shorts & TikToks</li>
            <li><span class="chk">✓</span> Hook optimization</li>
            <li><span class="chk">✓</span> Platform-native delivery</li>
          </ul>
        </div>
      </div>
      
      <!-- S2 -->
      <div class="service-card-wrapper fade-up-delay2">
        <div class="sc-glow"></div>
        <div class="service-card">
          <div class="sc-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg></div>
          <h3 class="sc-title">Audio Finetuning</h3>
          <div class="sc-divider"></div>
          <p class="sc-desc">We balance and enhance your audio so every word lands clearly and every sound reinforces your brand.</p>
          <ul class="sc-bullets">
            <li><span class="chk">✓</span> Noise removal & cleanup</li>
            <li><span class="chk">✓</span> EQ & volume balancing</li>
            <li><span class="chk">✓</span> Music & SFX mixing</li>
          </ul>
        </div>
      </div>
      
      <!-- S3 -->
      <div class="service-card-wrapper fade-up-delay">
        <div class="sc-glow"></div>
        <div class="service-card">
          <div class="sc-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg></div>
          <h3 class="sc-title">Scripting</h3>
          <div class="sc-divider"></div>
          <p class="sc-desc">Your message, structured for maximum impact and high conversions. Written in your tone and voice.</p>
          <ul class="sc-bullets">
            <li><span class="chk">✓</span> Hook, body & CTA included</li>
            <li><span class="chk">✓</span> Written in your tone</li>
            <li><span class="chk">✓</span> Unlimited topic research</li>
          </ul>
        </div>
      </div>
      
      <!-- S4 -->
      <div class="service-card-wrapper fade-up-delay2">
        <div class="sc-glow"></div>
        <div class="service-card">
          <div class="sc-icon-wrap"><svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"></path><path d="M2 12h20"></path></svg></div>
          <h3 class="sc-title">Color Grading</h3>
          <div class="sc-divider"></div>
          <p class="sc-desc">Every frame color-treated to feel intentional and premium. A consistent visual identity across all content.</p>
          <ul class="sc-bullets">
            <li><span class="chk">✓</span> Custom color profile</li>
            <li><span class="chk">✓</span> LUT & skin correction</li>
            <li><span class="chk">✓</span> Consistent across edits</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== PROCESS ====== -->
<section class="section process-section" id="process">
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-badge">How it works</div>
      <h2>Our Process</h2>
      <p>From first contact to final delivery, here's exactly how we work together.</p>
    </div>
    
    <div class="process-grid fade-up-delay">
      
      <div class="process-card">
        <div class="process-num">01</div>
        <h3>Discovery Call</h3>
        <p>We learn about your brand, goals, and content needs to make sure we're the perfect fit.</p>
      </div>
      <div class="process-connector"></div>
      
      <div class="process-card">
        <div class="process-num">02</div>
        <h3>Client Onboarding</h3>
        <p>We set up your workflow, gather your assets, and align on style preferences and deadlines.</p>
      </div>
      <div class="process-connector"></div>
      
      <div class="process-card">
        <div class="process-num">03</div>
        <h3>Project Kickoff</h3>
        <p>Our editors get to work, keeping you updated every step of the way until delivery.</p>
      </div>
      <div class="process-connector"></div>
      
      <div class="process-card">
        <div class="process-num">04</div>
        <h3>Final Delivery</h3>
        <p>Your polished content lands in your inbox, ready to post. Revisions included until you're fully satisfied.</p>
      </div>
      
    </div>
  </div>
</section>

<!-- ====== REVIEWS (Testimonials) ====== -->
<section class="reviews-section" id="testimonials">
  <div class="noise-overlay"></div>
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-badge">Testimonials</div>
      <h2>What Clients Say</h2>
    </div>
  </div>
  
  <div class="reviews-marquee-wrap fade-up-delay">
    <div class="reviews-marquee">
      <!-- Set A -->
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p>"Working with this team completely transformed my content. My engagement tripled within the first month."</p>
        <div class="review-author">
          <div class="ra-avatar" style="background:linear-gradient(135deg,#ffa200,#ff2d55)">J</div>
          <div><h4>James Carter</h4><span>Fitness Creator</span></div>
        </div>
      </div>
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p>"Working with Scrollz literally changed the future trajectory of my channel. Best decision I ever made."</p>
        <div class="review-author">
          <div class="ra-avatar" style="background:linear-gradient(135deg,#00aeff,#7932ec)">A</div>
          <div><h4>Alex Rivera</h4><span>Lifestyle Vlogger</span></div>
        </div>
      </div>
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p>"They nailed my brand's aesthetic from day one. I haven't looked for another editor since."</p>
        <div class="review-author">
          <div class="ra-avatar" style="background:linear-gradient(135deg,#7932ec,#23005c)">M</div>
          <div><h4>Marcus Bell</h4><span>Finance YouTuber</span></div>
        </div>
      </div>
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p>"The fastest turnaround I've ever experienced. Professional, reliable, and the quality speaks for itself."</p>
        <div class="review-author">
          <div class="ra-avatar" style="background:linear-gradient(135deg,#ff2d55,#ff8c69)">S</div>
          <div><h4>Sofia Reyes</h4><span>Lifestyle Vlogger</span></div>
        </div>
      </div>
      <!-- Set B -->
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p>"Working with this team completely transformed my content. My engagement tripled within the first month."</p>
        <div class="review-author">
          <div class="ra-avatar" style="background:linear-gradient(135deg,#ffa200,#ff2d55)">J</div>
          <div><h4>James Carter</h4><span>Fitness Creator</span></div>
        </div>
      </div>
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p>"Working with Scrollz literally changed the future trajectory of my channel. Best decision I ever made."</p>
        <div class="review-author">
          <div class="ra-avatar" style="background:linear-gradient(135deg,#00aeff,#7932ec)">A</div>
          <div><h4>Alex Rivera</h4><span>Lifestyle Vlogger</span></div>
        </div>
      </div>
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p>"They nailed my brand's aesthetic from day one. I haven't looked for another editor since."</p>
        <div class="review-author">
          <div class="ra-avatar" style="background:linear-gradient(135deg,#7932ec,#23005c)">M</div>
          <div><h4>Marcus Bell</h4><span>Finance YouTuber</span></div>
        </div>
      </div>
      <div class="review-card">
        <div class="review-stars">★★★★★</div>
        <p>"The fastest turnaround I've ever experienced. Professional, reliable, and the quality speaks for itself."</p>
        <div class="review-author">
          <div class="ra-avatar" style="background:linear-gradient(135deg,#ff2d55,#ff8c69)">S</div>
          <div><h4>Sofia Reyes</h4><span>Lifestyle Vlogger</span></div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- ====== CTA ====== -->
<section class="cta-section" id="contact">
  <div class="cta-glow"></div>
  <div class="container fade-up">
    <div class="cta-stats">
      <div class="cta-stat"><div class="cstat-num">90%</div><div class="cstat-label">Conversion Rate</div></div>
      <div class="cstat-div"></div>
      <div class="cta-stat"><div class="cstat-num">50+</div><div class="cstat-label">Bookings per month</div></div>
      <div class="cstat-div"></div>
      <div class="cta-stat"><div class="cstat-num">10K+</div><div class="cstat-label">Likes Generated</div></div>
      <div class="cstat-div"></div>
      <div class="cta-stat"><div class="cstat-num">1M+</div><div class="cstat-label">Comments</div></div>
    </div>
    
    <div class="cta-body">
      <h2>Start Your Path To A Better<br>Media Presence.</h2>
      <p>Get started with Scrollz with a free 30-minute discovery call. Build the business of your dreams with video.</p>
      
      <div class="cta-buttons">
        <a href="mailto:scrollz@gmail.com" class="btn-book">Book a Free Call</a>
        <a href="#faqs" class="btn-secondary">Ask a Question</a>
      </div>
      
      <div class="spots-badge">
        <div class="spot-dot"></div>
        Only 2 spots left for June
      </div>
    </div>
  </div>
</section>

<!-- ====== FAQ ====== -->
<section class="faq-section" id="faqs">
  <div class="container">
    <div class="section-header fade-up">
      <div class="section-badge">FAQs</div>
      <h2>Everything you need to know.</h2>
      <p>Common questions before working with us. Can't find what you're looking for? Just email us.</p>
    </div>
    
    <div class="faq-list fade-up-delay">
      <div class="faq-item">
        <div class="faq-q"><span>How fast is your turnaround?</span><div class="faq-icon">+</div></div>
        <div class="faq-a"><p>We deliver most short-form edits within 48 hours of receiving your raw footage. Rush delivery (24h) is available on higher-tier plans.</p></div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>How do revisions work?</span><div class="faq-icon">+</div></div>
        <div class="faq-a"><p>All plans include unlimited revisions. Leave timestamped feedback directly on the video and we update within 24 hours — no extra fees, ever.</p></div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>What do I need to provide?</span><div class="faq-icon">+</div></div>
        <div class="faq-a"><p>Just your raw footage. We handle all editing, captions, music, color grading, and formatting. Even shaky, unpolished clips work.</p></div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>Which platforms do you optimize for?</span><div class="faq-icon">+</div></div>
        <div class="faq-a"><p>TikTok, Instagram Reels, YouTube Shorts, LinkedIn Video, and X. Each gets the correct aspect ratio, safe zones, and caption style.</p></div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>Do you offer a free trial?</span><div class="faq-icon">+</div></div>
        <div class="faq-a"><p>Yes! One complimentary sample edit using your own footage — zero risk, no credit card required. Book a strategy call to get started.</p></div>
      </div>
      <div class="faq-item">
        <div class="faq-q"><span>How do I get started?</span><div class="faq-icon">+</div></div>
        <div class="faq-a"><p>Book a free 30-minute strategy call. If we're a good fit, you'll be fully onboarded within 24 hours.</p></div>
      </div>
    </div>
  </div>
</section>

<!-- ====== FOOTER ====== -->
<footer class="footer">
  <div class="footer-glow"></div>
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        <a href="#" class="footer-logo">✦ Scrollz</a>
        <p>Premium short-form video editing for creators who want to grow faster and smarter.</p>
        <div class="footer-contact">
          <a href="mailto:scrollz@gmail.com">scrollz@gmail.com</a>
          <a href="tel:5550123456">(555) 012-3456</a>
        </div>
      </div>
      <div class="footer-links">
        <div class="footer-col">
          <h4>Quick Links</h4>
          <a href="#testimonials">Reviews</a>
          <a href="#faqs">FAQs</a>
          <a href="#contact">Contact</a>
          <a href="#about">About</a>
        </div>
        <div class="footer-col">
          <h4>Ready?</h4>
          <span>Book a discovery call today</span>
          <a href="mailto:scrollz@gmail.com" class="footer-book-btn">Book a Call</a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <div class="fb-left">Copyright © 2026 Scrollz</div>
      <div class="fb-right">Created by Scrollz Agency</div>
    </div>
  </div>
</footer>

</div> <!-- /site-wrapper -->

<script src="index.js"></script>
<script>
  // Clone phone gallery elements for seamless loop
  document.addEventListener('DOMContentLoaded', () => {
    const pgTrack = document.getElementById('pgTrack');
    if (pgTrack) {
      const children = Array.from(pgTrack.children);
      children.forEach(child => {
        const clone = child.cloneNode(true);
        pgTrack.appendChild(clone);
      });
    }
  });
</script>
</body>
</html>
'''

with open('d:/Project/Surya_portfolio_new/index.html', 'w', encoding='utf-8') as f:
    f.write(html)
print("index.html rewritten successfully!")
