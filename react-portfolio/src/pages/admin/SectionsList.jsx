import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Edit3 } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function SectionsList() {
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSections();
  }, []);

  const fetchSections = async () => {
    try {
      const { data, error } = await supabase
        .from('sections')
        .select('*')
        .order('display_order', { ascending: true });
      
      if (error) throw error;
      setSections(data || []);
    } catch (err) {
      console.error('Error fetching sections:', err.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading sections...</div>;

  return (
    <div>
      <h2 style={{ fontSize: '24px', marginBottom: '24px' }}>Pages & Sections</h2>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {sections.map(section => (
          <div key={section.id} style={{ 
            display: 'flex', 
            justifyContent: 'space-between',
            alignItems: 'center',
            background: '#111', 
            padding: '16px 24px', 
            borderRadius: '8px',
            border: '1px solid #222'
          }}>
            <div>
              <h3 style={{ fontSize: '16px', margin: '0 0 4px 0', color: '#fff' }}>{section.title}</h3>
              <p style={{ fontSize: '12px', margin: 0, color: '#888' }}>
                Status: {section.is_visible ? (
                  <span style={{ color: '#10b981' }}>Visible</span>
                ) : (
                  <span style={{ color: '#ef4444' }}>Hidden</span>
                )}
              </p>
            </div>
            
            <Link to={`/pages/${section.section_key}`} style={{ textDecoration: 'none' }}>
              <button style={{
                background: '#222',
                border: '1px solid #333',
                color: '#fff',
                padding: '8px 16px',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                transition: '0.2s'
              }}
              onMouseOver={e => e.currentTarget.style.background = '#9333ea'}
              onMouseOut={e => e.currentTarget.style.background = '#222'}
              >
                <Edit3 size={14} /> Edit Content
              </button>
            </Link>
          </div>
        ))}
        {sections.length === 0 && (
          <div style={{ color: '#888' }}>No sections found. Did you run the SQL schema?</div>
        )}
      </div>
    </div>
  );
}
