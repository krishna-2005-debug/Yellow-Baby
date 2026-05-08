import { useState } from 'react';
import { X, ChevronDown } from 'lucide-react';

const AGE_GROUPS = ['0-6M', '6-12M', '1-2Y', '2-3Y', '3-5Y', '5-8Y', '8-12Y'];
const SIZES = ['NB', 'S', 'M', 'L', 'XL', '2XL'];
const GENDERS = [
  { value: 'boys',   label: 'Boys',   icon: '💙' },
  { value: 'girls',  label: 'Girls',  icon: '💗' },
  { value: 'unisex', label: 'Unisex', icon: '💛' },
];

function FilterSection({ title, defaultOpen = false, children }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          display: 'flex', justifyContent: 'space-between', alignItems: 'center', 
          width: '100%', background: 'none', border: 'none', padding: '0', 
          cursor: 'pointer', marginBottom: isOpen ? '12px' : '0'
        }}
      >
        <p style={{ fontSize: '12px', fontWeight: '700', color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Outfit, sans-serif', margin: 0 }}>{title}</p>
        <ChevronDown size={14} color="#6B7280" style={{ transition: 'transform 0.2s', transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)' }} />
      </button>
      {isOpen && <div>{children}</div>}
    </div>
  );
}

export default function FilterSidebar({ filters, onChange, categories = [], onClose }) {
  const [maxPrice, setMaxPrice] = useState(filters.max_price || 2000);
  const [minPrice, setMinPrice] = useState(filters.min_price || 0);

  const update = (key, value) => onChange({ ...filters, [key]: value });
  const toggle = (key, value) => update(key, filters[key] === value ? '' : value);

  const clearAll = () => {
    setMaxPrice(2000);
    setMinPrice(0);
    onChange({});
  };

  const hasFilters = Object.values(filters).some(Boolean);
  const activeCount = Object.values(filters).filter(Boolean).length;

  return (
    <div style={{
      background: '#fff', borderRadius: '24px',
      border: '1.5px solid #FEF3C7',
      boxShadow: '0 4px 24px rgba(251,191,36,0.1)',
      padding: '20px', position: 'sticky', top: '88px',
      display: 'flex', flexDirection: 'column', gap: '20px',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '18px' }}>🔧</span>
          <span style={{ fontSize: '15px', fontWeight: '800', color: '#4E3728', fontFamily: 'Outfit, sans-serif' }}>Filters</span>
          {activeCount > 0 && (
            <span style={{
              background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
              color: '#fff', fontSize: '11px', fontWeight: '800',
              padding: '2px 7px', borderRadius: '100px',
              fontFamily: 'Outfit, sans-serif',
            }}>{activeCount}</span>
          )}
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {hasFilters && (
            <button onClick={clearAll} style={{
              fontSize: '12px', fontWeight: '600', color: '#EF4444',
              background: '#FEF2F2', border: 'none', cursor: 'pointer',
              padding: '4px 10px', borderRadius: '100px',
              fontFamily: 'Outfit, sans-serif', transition: 'background 0.15s',
            }}>Clear all</button>
          )}
          {onClose && (
            <button onClick={onClose} style={{
              width: '28px', height: '28px', borderRadius: '8px',
              background: '#F9FAFB', border: 'none', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <X size={14} color="#6B7280" />
            </button>
          )}
        </div>
      </div>

      {/* Gender */}
      <FilterSection title="Gender">
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {GENDERS.map(({ value, label, icon }) => (
            <button key={value}
              onClick={() => toggle('gender', value)}
              className={`filter-pill ${filters.gender === value ? 'active' : ''}`}
            >
              {icon} {label}
            </button>
          ))}
        </div>
      </FilterSection>

      {/* Category */}
      {categories.length > 0 && (
        <FilterSection title="Category">
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {categories.map(cat => (
              <button key={cat.id} onClick={() => toggle('category', cat.id)}
                style={{
                  textAlign: 'left', padding: '8px 12px', borderRadius: '12px',
                  fontSize: '13px', fontWeight: '600', fontFamily: 'Outfit, sans-serif',
                  border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                  background: filters.category === cat.id ? '#FFFBEB' : 'transparent',
                  color: filters.category === cat.id ? '#D97706' : '#374151',
                  borderLeft: filters.category === cat.id ? '3px solid #FBBF24' : '3px solid transparent',
                }}
                onMouseEnter={e => { if (filters.category !== cat.id) { e.currentTarget.style.background = '#F9FAFB'; } }}
                onMouseLeave={e => { if (filters.category !== cat.id) { e.currentTarget.style.background = 'transparent'; } }}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </FilterSection>
      )}

      {/* Age Group */}
      <FilterSection title="Age Group">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {AGE_GROUPS.map(age => (
            <button key={age}
              onClick={() => toggle('age_group', age)}
              style={{
                padding: '5px 12px', borderRadius: '100px',
                fontSize: '12px', fontWeight: '700', fontFamily: 'Outfit, sans-serif',
                border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: filters.age_group === age ? '#FCE7F3' : '#F9FAFB',
                color: filters.age_group === age ? '#BE185D' : '#6B7280',
                boxShadow: filters.age_group === age ? '0 2px 8px rgba(190,24,93,0.2)' : 'none',
                transform: filters.age_group === age ? 'scale(1.05)' : 'scale(1)',
              }}
            >{age}</button>
          ))}
        </div>
      </FilterSection>

      {/* Size */}
      <FilterSection title="Size">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {SIZES.map(size => (
            <button key={size}
              className={`size-btn ${filters.size === size ? 'selected' : ''}`}
              onClick={() => toggle('size', size)}
            >{size}</button>
          ))}
        </div>
      </FilterSection>

      {/* Price Range */}
      <FilterSection title="Price Range">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#D97706', fontFamily: 'Outfit, sans-serif' }}>
            ₹{minPrice} – ₹{maxPrice}
          </span>
        </div>
        <input type="range" min="0" max="2000" step="50" value={maxPrice}
          onChange={e => { const v = Number(e.target.value); setMaxPrice(v); update('max_price', v); }}
          style={{ width: '100%', marginBottom: '10px' }}
        />
        <div style={{ display: 'flex', gap: '8px' }}>
          {[
            { label: 'Min', key: 'min_price', val: minPrice, setter: setMinPrice },
            { label: 'Max', key: 'max_price', val: maxPrice, setter: setMaxPrice },
          ].map(({ label, key, val, setter }) => (
            <input key={key} type="number" placeholder={label} value={val}
              onChange={e => { const v = Number(e.target.value); setter(v); update(key, v); }}
              className="input-field" style={{ width: '50%', padding: '8px 10px', fontSize: '12px', borderRadius: '10px' }}
            />
          ))}
        </div>
      </FilterSection>

      {/* In Stock Toggle */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '12px 14px', borderRadius: '16px',
        background: filters.in_stock ? '#ECFDF5' : '#F9FAFB',
        border: `1.5px solid ${filters.in_stock ? '#A7F3D0' : '#E5E7EB'}`,
        transition: 'all 0.2s',
      }}>
        <div>
          <p style={{ fontSize: '13px', fontWeight: '700', color: '#374151', fontFamily: 'Outfit, sans-serif', margin: 0 }}>In Stock Only</p>
          <p style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Outfit, sans-serif', margin: 0 }}>Show available items</p>
        </div>
        <button
          onClick={() => update('in_stock', filters.in_stock ? '' : 'true')}
          className={`toggle-track ${filters.in_stock ? 'on' : 'off'}`}
        >
          <div className="toggle-thumb" />
        </button>
      </div>
    </div>
  );
}
