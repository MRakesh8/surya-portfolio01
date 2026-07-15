import React, { useState, useEffect } from 'react';
import { supabase } from '../../supabaseClient';
import { Save } from 'lucide-react';

export default function Settings() {
  const [settings, setSettings] = useState({
    site_title: '',
    site_keywords: '',
    theme_color: '#9333ea',
    footer_text: ''
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase.from('site_settings').select('*').limit(1);
      if (error) throw error;
      if (data && data.length > 0) {
        setSettings({
          site_title: data[0].site_title || '',
          site_keywords: data[0].site_keywords || '',
          theme_color: data[0].theme_color || '#9333ea',
          footer_text: data[0].footer_text || ''
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const { data: existing } = await supabase.from('site_settings').select('id').limit(1);
      
      if (existing && existing.length > 0) {
        const { error } = await supabase
          .from('site_settings')
          .update({
            site_title: settings.site_title,
            site_keywords: settings.site_keywords,
            theme_color: settings.theme_color,
            footer_text: settings.footer_text
          })
          .eq('id', existing[0].id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('site_settings')
          .insert([settings]);
        if (error) throw error;
      }
      alert('Settings saved globally!');
    } catch (err) {
      alert('Error saving settings: ' + err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div style={{ padding: '24px', color: '#888' }}>Loading settings...</div>;

  return (
    <div style={{ maxWidth: '800px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '24px', margin: 0 }}>Site Settings</h2>
        <button 
          onClick={handleSave}
          disabled={saving}
          style={{ 
            background: '#9333ea', border: 'none', color: '#fff', 
            padding: '8px 16px', borderRadius: '6px', cursor: 'pointer',
            fontWeight: 500, display: 'flex', alignItems: 'center', gap: '8px'
          }}
        >
          <Save size={16} /> {saving ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      <div style={{ background: '#111', border: '1px solid #222', borderRadius: '8px', padding: '24px' }}>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px' }}>
            Website Title (SEO)
          </label>
          <input 
            type="text" 
            value={settings.site_title}
            onChange={(e) => setSettings({...settings, site_title: e.target.value})}
            style={{ 
              width: '100%', padding: '10px 14px', background: '#0a0a0a', 
              border: '1px solid #333', borderRadius: '6px', color: '#fff'
            }}
            placeholder="e.g. Scrollz - Premium Video Agency"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px' }}>
            SEO Keywords
          </label>
          <input 
            type="text" 
            value={settings.site_keywords}
            onChange={(e) => setSettings({...settings, site_keywords: e.target.value})}
            style={{ 
              width: '100%', padding: '10px 14px', background: '#0a0a0a', 
              border: '1px solid #333', borderRadius: '6px', color: '#fff'
            }}
            placeholder="e.g. video editing, short form, tiktok editor"
          />
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px' }}>
            Global Brand Color
          </label>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input 
              type="color" 
              value={settings.theme_color}
              onChange={(e) => setSettings({...settings, theme_color: e.target.value})}
              style={{ 
                width: '40px', height: '40px', padding: '0', background: 'transparent', 
                border: 'none', cursor: 'pointer'
              }}
            />
            <span style={{ color: '#ccc', fontFamily: 'monospace' }}>{settings.theme_color}</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '12px', color: '#666' }}>
            Note: This color will be passed to your website's CSS variables.
          </p>
        </div>

        <div style={{ marginBottom: '0' }}>
          <label style={{ display: 'block', fontSize: '13px', color: '#888', marginBottom: '6px' }}>
            Footer Copyright Text
          </label>
          <input 
            type="text" 
            value={settings.footer_text}
            onChange={(e) => setSettings({...settings, footer_text: e.target.value})}
            style={{ 
              width: '100%', padding: '10px 14px', background: '#0a0a0a', 
              border: '1px solid #333', borderRadius: '6px', color: '#fff'
            }}
            placeholder="e.g. © 2026 Scrollz. All rights reserved."
          />
        </div>

      </div>
    </div>
  );
}
