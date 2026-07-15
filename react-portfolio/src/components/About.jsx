import React from 'react';

export default function About() {
  return (
    <section className="about-section" id="about">
      <div className="about-container">
        
        <div className="about-header">
          <span className="section-pill">Why Us</span>
          <h2 className="section-title">The agency for <span className="text-purple">Top 1%</span> creators.</h2>
          <p className="about-subtitle">We don't just chop videos; we build visual retention systems. Our proven workflows increase watch time and convert viewers into loyal communities.</p>
        </div>

        <div className="about-layout">
          
          <div className="about-stats-left">
            <div className="about-stat-item">
              <h3>2.4B+</h3>
              <p>Organic views generated for our clients across all platforms in 2025 alone.</p>
            </div>
            <div className="about-divider"></div>
            <div className="about-stat-item">
              <h3>68%</h3>
              <p>Average increase in retention rate within the first 30 days of working with us.</p>
            </div>
          </div>

          <div className="about-center-phone">
            <div className="ac-phone-frame">
              <div className="ac-phone-notch"></div>
              <div className="ac-phone-screen">
                <img src="/img/creator3.png" alt="Process" className="ac-phone-img" />
              </div>
            </div>
          </div>

          <div className="about-features-right">
            <div className="about-feature-item">
              <h4>
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Cinematic Quality
              </h4>
              <p>We apply high-end color grading and sound design usually reserved for TV commercials.</p>
            </div>
            <div className="about-feature-item">
              <h4>
                <svg width="24" height="24" viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2"/><path d="M12 6v6l4 2" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                Fast Turnaround
              </h4>
              <p>A streamlined pipeline guarantees fresh content is always ready to publish when you need it.</p>
            </div>
            <div className="about-feature-item">
              <h4>
                <svg width="24" height="24" viewBox="0 0 24 24"><path d="M12 20V10M18 20V4M6 20v-4" fill="none" stroke="currentColor" strokeWidth="2"/></svg>
                Data-Driven Edits
              </h4>
              <p>We analyze retention graphs to refine pacing, hooks, and pop-ups on a weekly basis.</p>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
