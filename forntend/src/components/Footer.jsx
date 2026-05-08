
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail } from 'lucide-react';
import { getStoreInfo } from '../api/api';

const LINKS = {
  Shop: [
    { label: "Boys' Clothing",  to: '/?gender=boys' },
    { label: "Girls' Clothing", to: '/?gender=girls' },
    { label: 'Unisex',          to: '/?gender=unisex' },
    { label: 'Newborn (0-6M)',  to: '/?age_group=0-6M' },
    { label: 'In Stock Now',    to: '/?in_stock=true' },
  ],
  Help: [
    { label: 'Track My Order', to: '/orders' },
    { label: 'Return Policy',  to: '/' },
    { label: 'Size Guide',     to: '/' },
    { label: 'FAQs',           to: '/' },
  ],
};

const DEFAULT_INFO = {
  tagline:   'Dressing little ones with love. Soft, safe, and stylish clothing for babies and kids.',
  address:   '123, Baby Lane, Chennai, Tamil Nadu, India',
  phone:     '+91 98765 43210',
  email:     'hello@yellowbaby.in',
  instagram: '#',
  facebook:  '#',
  twitter:   '#',
};

const SOCIAL_ICONS = { instagram: '📸', facebook: '👥', twitter: '🐦' };

export default function Footer() {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const [footerLinks, setFooterLinks] = useState(LINKS);
  const font = 'Outfit, sans-serif';

  useEffect(() => {
    getStoreInfo()
      .then(({ data }) => {
        setInfo({ ...DEFAULT_INFO, ...data });
        if (data.footer_links && data.footer_links.length > 0) {
          const grouped = {};
          data.footer_links.forEach(link => {
            if (!grouped[link.section_name]) grouped[link.section_name] = [];
            grouped[link.section_name].push({ label: link.label, to: link.url });
          });
          setFooterLinks(grouped);
        }
      })
      .catch(() => {}); // keep default on failure
  }, []);

  const socials = [
    { key: 'instagram', icon: SOCIAL_ICONS.instagram, label: 'Instagram', href: info.instagram },
    { key: 'facebook',  icon: SOCIAL_ICONS.facebook,  label: 'Facebook',  href: info.facebook  },
    { key: 'twitter',   icon: SOCIAL_ICONS.twitter,   label: 'Twitter',   href: info.twitter   },
  ].filter(s => s.href && s.href !== '#' || true); // show all, even # placeholders

  const contact = [
    { Icon: MapPin, text: info.address },
    { Icon: Phone,  text: info.phone   },
    { Icon: Mail,   text: info.email   },
  ];

  return (
    <footer style={{ background: 'linear-gradient(180deg,#FFFBEB,#FEF3C7)', borderTop: '1.5px solid #FDE68A', fontFamily: font, marginTop: 'auto' }}>
      {/* Top section */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '48px 20px 32px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: '36px' }}>

        {/* Brand */}
        <div style={{ gridColumn: 'span 1' }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '12px', textDecoration: 'none', marginBottom: '16px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 14px rgba(251,191,36,0.35)' }}>
              <img src="/logo.png" alt="Yellow Baby" style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: '14px' }} />
            </div>
            <span style={{ fontSize: '24px', fontWeight: '800', color: '#4E3728' }}>Yellow <span style={{ color: '#F59E0B' }}>Baby</span></span>
          </Link>
          <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.65, margin: '0 0 16px' }}>
            {info.tagline}
          </p>
          <div style={{ display: 'flex', gap: '8px' }}>
            {socials.map(({ key, icon, label, href }) => (
              <a key={key} href={href} title={label} style={{
                width: '36px', height: '36px', borderRadius: '12px',
                background: '#fff', border: '1.5px solid #FDE68A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                textDecoration: 'none', fontSize: '16px',
                boxShadow: '0 2px 6px rgba(251,191,36,0.1)',
                transition: 'transform 0.18s, box-shadow 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.1)'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(251,191,36,0.25)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 2px 6px rgba(251,191,36,0.1)'; }}
              >{icon}</a>
            ))}
          </div>
        </div>

        {/* Link columns */}
        {Object.entries(footerLinks).map(([title, items]) => (
          <div key={title}>
            <p style={{ fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>{title}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {items.map(({ label, to }) => (
                <Link key={label} to={to} style={{ fontSize: '13px', color: '#6B7280', textDecoration: 'none', transition: 'color 0.15s', fontWeight: '500' }}
                  onMouseEnter={e => e.target.style.color = '#D97706'}
                  onMouseLeave={e => e.target.style.color = '#6B7280'}
                >{label}</Link>
              ))}
            </div>
          </div>
        ))}

        {/* Contact */}
        <div>
          <p style={{ fontSize: '12px', fontWeight: '800', color: '#374151', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: '14px' }}>Contact Us</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {contact.map(({ Icon, text }) => (
              <div key={text} style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
                <Icon size={14} color="#FBBF24" style={{ flexShrink: 0, marginTop: '2px' }} />
                <span style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.5 }}>{text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid #FDE68A', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', maxWidth: '1280px', margin: '0 auto' }}>
        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
          © {new Date().getFullYear()} Yellow Baby. Made with ❤️ for little ones.
        </p>
        <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0, fontWeight: '500' }}>
          Made by Kriss 🤍
        </p>
      </div>
    </footer>
  );
}
