import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, Heart } from 'lucide-react';
import { BASE_URL } from '../api/api';

function ProductCardSkeleton() {
  return (
    <div style={{
      background: '#fff', borderRadius: '24px',
      border: '1.5px solid #FEF3C7', overflow: 'hidden',
      display: 'flex', flexDirection: 'column',
    }}>
      <div className="skeleton" style={{ aspectRatio: '4/5', width: '100%' }} />
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div className="skeleton" style={{ height: '11px', width: '50%' }} />
        <div className="skeleton" style={{ height: '14px', width: '90%' }} />
        <div className="skeleton" style={{ height: '11px', width: '35%' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px' }}>
          <div className="skeleton" style={{ height: '18px', width: '36%' }} />
          <div className="skeleton" style={{ height: '18px', width: '28%' }} />
        </div>
      </div>
    </div>
  );
}

const GENDER_STYLES = {
  boys:   { bg: '#EFF6FF', color: '#1D4ED8', icon: '💙' },
  girls:  { bg: '#FDF2F8', color: '#BE185D', icon: '💗' },
  unisex: { bg: '#FFFBEB', color: '#B45309', icon: '💛' },
};

export default function ProductCard({ product, loading = false }) {
  const [imgError, setImgError] = useState(false);
  const [liked, setLiked] = useState(false);
  const [hovered, setHovered] = useState(false);

  if (loading) return <ProductCardSkeleton />;

  let primaryImage = !imgError
    ? (product.primary_image || product.images?.find(i => i.is_primary)?.image || product.images?.[0]?.image)
    : null;

  if (primaryImage && primaryImage.startsWith('/')) {
    primaryImage = `${BASE_URL}${primaryImage}`;
  }

  const inStock = product.total_stock > 0;
  const gc = GENDER_STYLES[product.gender] || {};

  return (
    <div className="product-card" style={{ position: 'relative' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Wishlist */}
      <button
        onClick={(e) => { e.preventDefault(); e.stopPropagation(); setLiked(!liked); }}
        style={{
          position: 'absolute', top: '12px', right: '12px', zIndex: 10,
          width: '34px', height: '34px', borderRadius: '50%',
          background: liked ? '#FEF2F2' : 'rgba(255,255,255,0.9)',
          border: liked ? '1.5px solid #FCA5A5' : '1.5px solid rgba(255,255,255,0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'all 0.2s ease',
          opacity: hovered || liked ? 1 : 0,
          transform: hovered || liked ? 'scale(1)' : 'scale(0.8)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        }}
      >
        <Heart size={15} fill={liked ? '#F87171' : 'none'} color={liked ? '#F87171' : '#9CA3AF'} />
      </button>

      <Link to={`/products/${product.id}`} id={`product-card-${product.id}`}
        style={{ display: 'flex', flexDirection: 'column', flex: 1, textDecoration: 'none', color: 'inherit' }}>

        {/* Image */}
        <div style={{
          position: 'relative',
          aspectRatio: '4/5',
          background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
          overflow: 'hidden',
        }}>
          {primaryImage ? (
            <img src={primaryImage} alt={product.name} loading="lazy"
              onError={() => setImgError(true)}
              style={{
                width: '100%', height: '100%', objectFit: 'cover',
                transform: hovered ? 'scale(1.07)' : 'scale(1)',
                transition: 'transform 0.5s ease',
              }}
            />
          ) : (
            <div style={{
              width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', gap: '8px',
              color: '#9CA3AF', background: '#F3F4F6'
            }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.5 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
              <span style={{ fontSize: '11px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.7 }}>No Image</span>
            </div>
          )}

          {/* Gender badge */}
          {gc.bg && (
            <span style={{
              position: 'absolute', top: '10px', left: '10px',
              padding: '3px 10px', borderRadius: '100px',
              background: gc.bg, color: gc.color,
              fontSize: '11px', fontWeight: '700',
              fontFamily: 'Outfit, sans-serif',
              backdropFilter: 'blur(8px)',
            }}>
              {gc.icon} {product.gender}
            </span>
          )}

          {/* Out of stock */}
          {!inStock && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(255,255,255,0.65)',
              backdropFilter: 'blur(3px)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{
                background: '#FEE2E2', color: '#DC2626',
                padding: '5px 14px', borderRadius: '100px',
                fontSize: '12px', fontWeight: '700',
                fontFamily: 'Outfit, sans-serif',
              }}>Out of Stock</span>
            </div>
          )}

          {/* Hover overlay */}
          <div style={{
            position: 'absolute', inset: '0', background: 'linear-gradient(to top, rgba(0,0,0,0.15), transparent)',
            opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
            paddingBottom: '12px',
          }}>
            <span style={{
              display: 'flex', alignItems: 'center', gap: '5px',
              background: 'rgba(255,255,255,0.95)', borderRadius: '100px',
              padding: '5px 14px', fontSize: '12px', fontWeight: '700',
              color: '#374151', fontFamily: 'Outfit, sans-serif',
              boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}>
              <ShoppingCart size={12} /> View Product
            </span>
          </div>
        </div>

        {/* Info */}
        <div style={{ padding: '14px 14px 14px', display: 'flex', flexDirection: 'column', gap: '4px', flex: 1 }}>
          {product.category?.name && (
            <span style={{
              fontSize: '10px', color: '#9CA3AF', fontWeight: '600',
              textTransform: 'uppercase', letterSpacing: '0.07em',
              fontFamily: 'Outfit, sans-serif',
            }}>
              {product.category.name}
            </span>
          )}

          <h3 style={{
            fontSize: '13px', fontWeight: '600', color: '#4E3728',
            lineHeight: '1.4', display: '-webkit-box',
            WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
            transition: 'color 0.18s', fontFamily: 'Outfit, sans-serif',
          }}>
            {product.name}
          </h3>

          {product.age_group && (
            <span style={{ fontSize: '11px', color: '#9CA3AF', fontFamily: 'Outfit, sans-serif' }}>
              👶 {product.age_group}
            </span>
          )}

          <div style={{ marginTop: 'auto', paddingTop: '10px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '16px', fontWeight: '800', color: '#111827', fontFamily: 'Outfit, sans-serif' }}>
              ₹{Number(product.price).toLocaleString('en-IN')}
            </span>
            <span style={{
              fontSize: '11px', fontWeight: '700', padding: '3px 9px', borderRadius: '100px',
              fontFamily: 'Outfit, sans-serif',
              background: inStock ? '#D1FAE5' : '#FEE2E2',
              color: inStock ? '#065F46' : '#DC2626',
            }}>
              {inStock ? '✓ In Stock' : 'Sold Out'}
            </span>
          </div>
        </div>
      </Link>
    </div>
  );
}

export { ProductCardSkeleton };
