import React from 'react';

export default function Projects() {
  const projectsData = [
    {
      id: 1, img: '/img/creator1.png', title: 'Tech Review Series', 
      creator: 'MKBHD Style', views: '2.1M', type: 'tag-purple'
    },
    {
      id: 2, img: '/img/creator2.png', title: 'Finance Explainer', 
      creator: 'Iman Gadzhi Style', views: '800K', type: 'tag-blue'
    },
    {
      id: 3, img: '/img/creator3.png', title: 'Fitness Motivation', 
      creator: 'Gymshark Vibe', views: '5.4M', type: 'tag-orange'
    },
    {
      id: 4, img: '/img/creator1.png', title: 'Podcast Cutdown', 
      creator: 'Rogan Format', views: '1.2M', type: 'tag-red'
    },
    {
      id: 5, img: '/img/creator2.png', title: 'Travel Vlog', 
      creator: 'Cinematic', views: '3.3M', type: 'tag-purple'
    },
    {
      id: 6, img: '/img/creator3.png', title: 'Real Estate Tour', 
      creator: 'Luxury Flow', views: '950K', type: 'tag-blue'
    }
  ];

  return (
    <section className="projects-section" id="work">
      <div className="container">
        
        <div className="projects-header-split">
          <div className="ph-left">
            <h2>Our best performing <br/><span className="text-purple">video systems.</span></h2>
            <p>Explore a selection of our recent edits that drove massive engagement.</p>
          </div>
          <div className="ph-right">
            <div className="filter-row">
              <div className="filter-group">
                <label>Style</label>
                <select>
                  <option>All Styles</option>
                  <option>Cinematic</option>
                  <option>Fast Paced</option>
                  <option>Podcast</option>
                </select>
              </div>
              <div className="filter-group">
                <label>Niche</label>
                <select>
                  <option>All Niches</option>
                  <option>Tech & Crypto</option>
                  <option>Finance</option>
                  <option>Fitness</option>
                </select>
              </div>
            </div>
            <div className="filter-row checkboxes">
              <label className="cb-label">
                <input type="checkbox" defaultChecked />
                <span className="cb-custom"></span> Short Form
              </label>
              <label className="cb-label">
                <input type="checkbox" />
                <span className="cb-custom"></span> Long Form
              </label>
            </div>
          </div>
        </div>

        <div className="projects-grid framer-grid">
          {projectsData.map(p => (
            <div className="framer-card" key={p.id}>
              <img src={p.img} alt={p.title} className="fc-bg" />
              <div className="fc-overlay">
                <div className="fc-top">
                  <span className={`project-type-tag ${p.type}`}>{p.views} Views</span>
                </div>
                <div className="fc-bottom">
                  <div className="fc-title-row">
                    <div className="fc-avatar">{p.creator.charAt(0)}</div>
                    <h3>{p.title} <span className="verified">✓</span></h3>
                  </div>
                  <p>{p.creator}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
