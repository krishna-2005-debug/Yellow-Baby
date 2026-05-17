import { Layers, ExternalLink } from 'lucide-react';
import { BASE_URL } from '../api/api';

export default function AdminContent() {
  const sections = [
    { name: 'Hero Slides',        url: '/admin/content/heroslide/',       count: 3,  icon: '🎠' },
    { name: 'Quick Categories',   url: '/admin/content/quickcategory/',   count: 6,  icon: '📂' },
    { name: 'Age Groups',         url: '/admin/content/agegroup/',        count: 4,  icon: '👶' },
    { name: 'Trust Bar Items',    url: '/admin/content/trustitem/',       count: 5,  icon: '⭐' },
    { name: 'Feature Cards',      url: '/admin/content/featurecard/',     count: 4,  icon: '✨' },
    { name: 'Store Info',         url: '/admin/content/storeinfo/',       count: 1,  icon: '🏪' },
  ];
  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Content Manager</h1>
          <p className="adm-page-sub">Manage homepage sections and store information</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 14 }}>
        {sections.map(s => (
          <a key={s.name} href={`${BASE_URL}${s.url}`} target="_blank" rel="noreferrer"
            style={{ textDecoration: 'none' }}>
            <div className="adm-kpi" style={{ cursor: 'pointer' }}>
              <div className="adm-kpi-stripe" style={{ background: '#F59E0B' }} />
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ fontSize: 28 }}>{s.icon}</div>
                  <div>
                    <div style={{ fontWeight: 700, color: 'var(--adm-text)', fontSize: 14 }}>{s.name}</div>
                    <div style={{ fontSize: 12, color: 'var(--adm-text-muted)', marginTop: 2 }}>{s.count} items</div>
                  </div>
                </div>
                <ExternalLink size={14} color="var(--adm-text-muted)" />
              </div>
            </div>
          </a>
        ))}
      </div>
      <div style={{ marginTop: 20 }}>
        <a href={`${BASE_URL}/admin/content/`} target="_blank" rel="noreferrer"
          className="adm-btn adm-btn-primary">
          <Layers size={14} /> Open Django Admin Content
        </a>
      </div>
    </div>
  );
}



