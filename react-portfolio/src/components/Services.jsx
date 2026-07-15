import React from 'react';

export default function Services() {
  const servicesData = [
    {
      num: '01',
      title: 'Short-Form Systems',
      desc: 'High-retention reels, shorts, and TikToks designed specifically for algorithms. We focus on psychological hooks, snappy pacing, and dynamic captions.',
      bullets: ['Script & Hook Consultation', 'A/B Testing Variations', 'Platform-Native Delivery']
    },
    {
      num: '02',
      title: 'Cinematic Long-Form',
      desc: 'Premium YouTube edits, documentaries, and course modules. We craft narrative arcs that keep viewers engaged for 20+ minutes.',
      bullets: ['Narrative Pacing & Flow', 'Advanced Color Grading', 'Immersive Sound Design']
    },
    {
      num: '03',
      title: 'Motion & Branding',
      desc: 'Bespoke motion graphics packages, 3D elements, and visual identity systems that make your content instantly recognizable.',
      bullets: ['Custom Transitions & LUTs', 'Kinetic Typography', 'Intro & Outro Packages']
    }
  ];

  return (
    <section className="services-section" id="services">
      <div className="services-glow"></div>
      <div className="container">
        
        <div className="about-header">
          <span className="section-pill">Our Services</span>
          <h2 className="section-title">Everything you need to <span className="text-purple">dominate</span>.</h2>
          <p className="about-subtitle">We act as your dedicated post-production powerhouse, handling everything from raw footage dump to final polished export.</p>
        </div>

        <div className="services-grid">
          {servicesData.map((srv, idx) => (
            <div className="service-card" key={idx}>
              <div className="sc-icon-wrap">
                <span className="sc-icon">✦</span>
              </div>
              <span>{srv.num}</span>
              <h3>{srv.title}</h3>
              <p>{srv.desc}</p>
              <ul className="sc-bullets">
                {srv.bullets.map((b, i) => (
                  <li key={i}><span className="sc-bullet-icon">●</span> {b}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
