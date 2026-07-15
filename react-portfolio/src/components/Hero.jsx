import React from 'react';

const Phone = ({ featured, img, overlayColor, tags, views, likes, comments, initial, creatorName, caption, avatarClass }) => {
  return (
    <div className={`pg-phone ${featured ? 'pg-phone-featured' : ''}`}>
      <div className={`pg-frame ${featured ? 'pg-frame-featured' : ''}`}>
        <div className="pg-screen">
          <img src={img} alt={creatorName} className={`pg-img ${overlayColor === 'raw' ? 'pg-img-raw' : ''}`} />
          <div className="pg-overlay"></div>
          
          <div className="pg-top-tags">
            {tags.map((tag, i) => (
              <span key={i} className={`pg-pill ${tag.colorClass}`}>
                {tag.hasDot && <span className={`pg-pill-dot ${tag.dotClass}`}></span>}
                {tag.text}
              </span>
            ))}
          </div>
          
          <div className="pg-actions">
            <div className="pg-action-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
              <span>{views}</span>
            </div>
            <div className="pg-action-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
              </svg>
              <span>{likes}</span>
            </div>
            <div className="pg-action-btn">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8">
                <line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/>
              </svg>
              <span>{comments}</span>
            </div>
          </div>
          
          <div className="pg-creator-bar">
            <div className={`pg-avatar ${avatarClass}`}>{initial}</div>
            <div className="pg-creator-text">
              <p className="pg-creator-name">
                {creatorName} {overlayColor !== 'raw' && <span className="pg-verified">✓</span>}
              </p>
              <p className="pg-creator-caption">{caption}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

import usePortfolioStore from '../store/usePortfolioStore';

export default function Hero() {
  const { sections } = usePortfolioStore();
  const heroContent = sections['hero'] || {};
  
  const phones = (
    <>
      <Phone 
        img="/img/creator3.png" 
        tags={[{colorClass: 'pg-pill-orange', hasDot: true, dotClass: 'orange-dot', text: '100K+ Views'}, {colorClass: 'pg-pill-green', hasDot: true, dotClass: 'green-dot', text: '300+ Enrollments'}]}
        views="6,552" likes="2,120" comments="994" initial="M" creatorName="Marie Gonzales" caption="Enrollments to my new…" avatarClass="av-pink"
      />
      <Phone 
        featured 
        img="/img/creator2.png" 
        tags={[{colorClass: 'pg-pill-orange', hasDot: true, dotClass: 'orange-dot', text: '200K+ Views'}, {colorClass: 'pg-pill-green', hasDot: true, dotClass: 'green-dot', text: '50+ Calls Booked'}]}
        views="4,654" likes="264" comments="1,200" initial="C" creatorName="Cameron" caption="Watch me speak LIVE at…" avatarClass="av-blue"
      />
      <Phone 
        overlayColor="raw"
        img="/img/creator1.png" 
        tags={[{colorClass: 'pg-pill-raw', hasDot: false, text: 'Raw Footage'}]}
        views="—" likes="—" comments="—" initial="?" creatorName="Unedited Clip" caption="Before Surya's edit…" avatarClass="av-gray"
      />
    </>
  );

  return (
    <section className="hero">
      <div className="hero-glow"></div>
      <div className="hero-grid-overlay"></div>
      
      <div className="hero-content">
        <div className="badge">
          <span className="badge-star">✦</span> Premium Editing Agency
        </div>
        <h1 className="hero-title">{heroContent.heading || "High-Retention Video For Top Creators"}</h1>
        <p className="hero-sub">
          {heroContent.subheading || "We transform raw footage into premium, algorithm-optimized short-form content that drives views, builds authority, and books calls."}
        </p>
        <div className="hero-actions">
          <a href="#work" className="btn btn-primary">See Our Work</a>
          <a href="#contact" className="btn btn-ghost">Book a Strategy Call</a>
        </div>
      </div>

      <div className="phone-gallery-wrap">
        <div className="phone-gallery-inner">
          {phones}
          {phones}
          {phones}
          {phones}
        </div>
      </div>
    </section>
  );
}
