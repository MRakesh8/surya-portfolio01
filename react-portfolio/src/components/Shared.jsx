import React from 'react';
import { motion } from 'framer-motion';

export function FadeIn({ children, delay = 0, className = '' }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30, filter: 'blur(5px)' }}
      whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      viewport={{ once: true, margin: '-10%' }}
      transition={{ duration: 0.8, delay, ease: [0.16, 1, 0.3, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

export function GlassCard({ children, className = '', ...props }) {
  return (
    <motion.article 
      className={`glass-card ${className}`} 
      whileHover={{ y: -6, borderColor: 'rgba(255,255,255,0.34)', boxShadow: '0 34px 100px rgba(0,0,0,0.42), 0 0 48px rgba(121, 50, 236, 0.18)' }}
      transition={{ duration: 0.3 }}
      {...props}
    >
      {children}
    </motion.article>
  );
}

export function SectionHeading({ eyebrow, title, text, align = 'left' }) {
  return (
    <FadeIn className={`section-heading ${align === 'center' ? 'center' : ''}`}>
      <span className="eyebrow">{eyebrow}</span>
      <h2>{title}</h2>
      {text ? <p>{text}</p> : null}
    </FadeIn>
  );
}
