import React, { useEffect, useState } from 'react';
import Hero from '../components/Hero';
import Ticker from '../components/Ticker';
import About from '../components/About';
import Services from '../components/Services';
import Projects from '../components/Projects';
import usePortfolioStore from '../store/usePortfolioStore';

export default function Portfolio() {
  const [scrolled, setScrolled] = useState(false);
  const { fetchContent, loading } = usePortfolioStore();

  useEffect(() => {
    fetchContent();
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [fetchContent]);

  if (loading) {
    return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', color: '#fff' }}>Loading Portfolio...</div>;
  }

  return (
    <>
      <nav className={`navbar ${scrolled ? 'scrolled' : ''}`}>
        <div className="nav-inner">
          <a href="#" className="nav-logo">
            <span style={{ color: 'var(--purple)' }}>✦</span> Scrollz
          </a>
          <div className="nav-links">
            <a href="#about">Why Us</a>
            <a href="#services">Services</a>
            <a href="#work">Work</a>
            <a href="#contact">Contact</a>
          </div>
          <a href="#contact" className="btn btn-nav">Book Call</a>
        </div>
      </nav>

      <main>
        <Hero />
        <Ticker />
        <About />
        <Services />
        <Projects />
        
        {/* Contact/CTA Section mapping to basic CSS classes */}
        <section className="section" id="contact" style={{ textAlign: 'center', padding: '120px 24px', background: '#050505', borderTop: '1px solid var(--border)' }}>
          <h2 style={{ fontSize: '4rem', marginBottom: '24px', fontFamily: 'var(--font-display)', fontWeight: 900 }}>Ready to <span className="text-purple">scale?</span></h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', marginBottom: '40px', maxWidth: '600px', margin: '0 auto 40px' }}>Stop wasting time on edits that don't convert. Let our team build your visual retention system today.</p>
          <a href="mailto:hello@scrollz.com" className="btn btn-primary btn-lg">Book Your Strategy Call</a>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 24px', textAlign: 'center', background: 'var(--bg)' }}>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>© 2026 Scrollz Editing Agency. All rights reserved.</p>
      </footer>
    </>
  );
}
