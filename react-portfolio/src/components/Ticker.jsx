import React from 'react';

export default function Ticker() {
  const items = [
    'Motion Graphics', 'Color Grading', 'Sound Design', 'Short Form Editing', 
    'Cinematic Vlogs', 'Educational Content', 'Podcast Cutdowns', 'YouTube Intros'
  ];

  const content = items.map((item, index) => (
    <React.Fragment key={index}>
      <span>{item}</span>
      <span className="ticker-dot">•</span>
    </React.Fragment>
  ));

  return (
    <section className="ticker-section">
      <div className="ticker-track">
        <div className="ticker-inner">
          {content}
          {content}
          {content}
          {content}
        </div>
      </div>
    </section>
  );
}
