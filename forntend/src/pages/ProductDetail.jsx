import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ShoppingCart, ChevronLeft, ChevronRight, Truck, Shield, Package, Heart, Share2 } from 'lucide-react';
import { getProductDetail } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import Loader from '../components/Loader';
import SEO from '../components/SEO';
import toast from 'react-hot-toast';

const GENDER_BADGE = {
  boys:   { bg: '#EFF6FF', color: '#1D4ED8', label: '💙 Boys' },
  girls:  { bg: '#FDF2F8', color: '#BE185D', label: '💗 Girls' },
  unisex: { bg: '#FFFBEB', color: '#B45309', label: '💛 Unisex' },
};

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const { user } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeImg, setActiveImg] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [adding, setAdding] = useState(false);
  const [liked, setLiked] = useState(false);
  const font = 'Outfit, sans-serif';

  useEffect(() => {
  // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    getProductDetail(id)
      .then(({ data }) => { setProduct(data); const p = data.images?.findIndex(i => i.is_primary); setActiveImg(p >= 0 ? p : 0); })
      .catch(() => navigate('/'))
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (loading) return <div style={{ paddingTop: '64px' }}><Loader text="Loading product…" /></div>;
  if (!product) return null;

  const images = product.images || [];
  const variants = product.variants || [];
  const inStock = selectedVariant ? selectedVariant.stock > 0 : product.total_stock > 0;
  const hasDiscount = product.mrp && Number(product.mrp) > Number(product.price);
  const discountPct = hasDiscount ? Math.round((1 - product.price / product.mrp) * 100) : 0;
  const gb = GENDER_BADGE[product.gender] || {};

  const handleAddToCart = async () => {
    if (!user) { toast.error('Please login first'); navigate('/login'); return; }
    if (!selectedVariant) { toast.error('Please select a size! 📏'); return; }
    setAdding(true);
    try { await addItem(selectedVariant.id, 1, product.name); } finally { setAdding(false); }
  };

  const stockStatus = selectedVariant
    ? selectedVariant.stock === 0 ? { text: 'Out of stock', color: '#EF4444' }
      : selectedVariant.stock < 5 ? { text: `Only ${selectedVariant.stock} left!`, color: '#F97316' }
      : { text: `${selectedVariant.stock} in stock`, color: '#10B981' }
    : null;



  return (
    <div style={{ paddingTop: '64px', minHeight: '100vh', background: 'linear-gradient(180deg,#FFFBEB 0%,#FCF4EE 50%)', fontFamily: font }}>
      <SEO 
        title={product.name} 
        description={product.description || `Buy ${product.name} at Yellow Baby.`} 
        image={images[0]?.image} 
        type="product" 
      />
      <div style={{ maxWidth: '1100px', margin: '0 auto', padding: '28px 20px' }}>
        {/* Breadcrumb */}
        <nav style={{ display: 'flex', gap: '6px', fontSize: '12px', color: '#9CA3AF', marginBottom: '20px', alignItems: 'center' }}>
          <button onClick={() => navigate('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', fontFamily: font }}>Home</button>
          <span>/</span>
          {product.category?.name && <><span>{product.category.name}</span><span>/</span></>}
          <span style={{ color: '#374151', fontWeight: '600' }}>{product.name}</span>
        </nav>

        <div className="flex flex-col md:flex-row gap-10">
          {/* Gallery */}
          <div className="flex-1 flex flex-col gap-3" style={{ minWidth: 0 }}>
            <div style={{ position: 'relative', aspectRatio: '1/1', background: 'linear-gradient(135deg,#FFFBEB,#FEF3C7)', borderRadius: '28px', overflow: 'hidden', border: '1.5px solid #FEF3C7', boxShadow: '0 4px 24px rgba(251,191,36,0.12)' }}>
              {images.length > 0
                ? <img src={images[activeImg]?.image} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                : <div style={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '10px', color: '#9CA3AF', background: '#F3F4F6' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.4 }}><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
                    <span style={{ fontSize: '14px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em', opacity: 0.6 }}>No Image Uploaded</span>
                  </div>
              }
              {/* Wishlist + Share */}
              <div style={{ position: 'absolute', top: '12px', right: '12px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {[
                  { click: () => setLiked(!liked), content: <Heart size={15} fill={liked ? '#F87171' : 'none'} color={liked ? '#F87171' : '#6B7280'} />, active: liked },
                  { click: () => {}, content: <Share2 size={14} color="#6B7280" />, active: false },
                ].map((btn, i) => (
                  <button key={i} onClick={btn.click} style={{
                    width: '36px', height: '36px', borderRadius: '12px',
                    background: btn.active ? '#FEF2F2' : 'rgba(255,255,255,0.92)',
                    border: `1.5px solid ${btn.active ? '#FCA5A5' : 'rgba(255,255,255,0.7)'}`,
                    backdropFilter: 'blur(8px)', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                  }}>{btn.content}</button>
                ))}
              </div>
              {/* Discount badge */}
              {hasDiscount && <div style={{ position: 'absolute', top: '12px', left: '12px', background: 'linear-gradient(135deg,#22C55E,#16A34A)', color: '#fff', padding: '3px 10px', borderRadius: '100px', fontSize: '12px', fontWeight: '800' }}>{discountPct}% OFF</div>}
              {/* Nav arrows */}
              {images.length > 1 && ['l', 'r'].map(d => (
                <button key={d} onClick={() => setActiveImg(i => d === 'l' ? (i - 1 + images.length) % images.length : (i + 1) % images.length)}
                  style={{ position: 'absolute', [d === 'l' ? 'left' : 'right']: '10px', top: '50%', transform: 'translateY(-50%)', width: '34px', height: '34px', borderRadius: '10px', background: 'rgba(255,255,255,0.92)', border: '1px solid rgba(0,0,0,0.06)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 8px rgba(0,0,0,0.08)' }}>
                  {d === 'l' ? <ChevronLeft size={15} /> : <ChevronRight size={15} />}
                </button>
              ))}
            </div>
            {/* Thumbnails */}
            {images.length > 1 && (
              <div style={{ display: 'flex', gap: '8px', overflowX: 'auto' }}>
                {images.map((img, i) => (
                  <button key={img.id} onClick={() => setActiveImg(i)} style={{ flexShrink: 0, width: '62px', height: '62px', borderRadius: '12px', overflow: 'hidden', border: i === activeImg ? '2.5px solid #FBBF24' : '2px solid #E5E7EB', opacity: i === activeImg ? 1 : 0.6, cursor: 'pointer', transition: 'all 0.2s' }}>
                    <img src={img.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 flex flex-col gap-4" style={{ minWidth: 0 }}>
            {/* Badges */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '7px' }}>
              {gb.bg && <span style={{ padding: '3px 11px', borderRadius: '100px', background: gb.bg, color: gb.color, fontSize: '12px', fontWeight: '700' }}>{gb.label}</span>}
              {product.age_group && <span style={{ padding: '3px 11px', borderRadius: '100px', background: '#F5F3FF', color: '#7C3AED', fontSize: '12px', fontWeight: '700' }}>👶 {product.age_group}</span>}
              {product.category?.name && <span style={{ padding: '3px 11px', borderRadius: '100px', background: '#F3F4F6', color: '#374151', fontSize: '12px', fontWeight: '700' }}>{product.category.name}</span>}
            </div>

            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#111827', lineHeight: 1.25, margin: 0 }}>{product.name}</h1>

            {/* Price */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '30px', fontWeight: '900', color: '#111827' }}>₹{Number(product.price).toLocaleString('en-IN')}</span>
              {hasDiscount && <>
                <span style={{ fontSize: '16px', color: '#D1D5DB', textDecoration: 'line-through' }}>₹{Number(product.mrp).toLocaleString('en-IN')}</span>
                <span style={{ padding: '2px 9px', borderRadius: '100px', background: '#D1FAE5', color: '#065F46', fontSize: '12px', fontWeight: '800' }}>{discountPct}% off</span>
              </>}
            </div>

            <div style={{ height: '1.5px', background: 'linear-gradient(90deg,#FEF3C7,transparent)' }} />

            {/* Size */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <p style={{ fontSize: '13px', fontWeight: '800', color: '#374151', margin: 0 }}>Select Size <span style={{ color: '#EF4444' }}>*</span></p>
                {stockStatus && <span style={{ fontSize: '12px', fontWeight: '700', color: stockStatus.color }}>{stockStatus.text}</span>}
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {variants.map(v => (
                  <button key={v.id} id={`size-btn-${v.size}`}
                    onClick={() => v.stock > 0 && setSelectedVariant(v)}
                    className={`size-btn ${selectedVariant?.id === v.id ? 'selected' : ''}`}
                    disabled={v.stock === 0}
                  >
                    {v.size}
                    {v.stock === 0 && <span style={{ display: 'block', fontSize: '9px' }}>Out</span>}
                  </button>
                ))}
              </div>
              {!selectedVariant && variants.length > 0 && <p style={{ fontSize: '12px', color: '#F97316', marginTop: '6px', fontWeight: '600' }}>⬆️ Select a size to continue</p>}
            </div>

            {/* Add to Cart */}
            <button id="add-to-cart-btn" onClick={handleAddToCart}
              disabled={!selectedVariant || !inStock || adding}
              style={{
                width: '100%', padding: '15px', fontSize: '15px', borderRadius: '18px', fontWeight: '800',
                border: 'none', cursor: !selectedVariant || !inStock ? 'not-allowed' : 'pointer',
                background: !selectedVariant || !inStock ? '#E5E7EB' : 'linear-gradient(135deg,#FBBF24,#F59E0B)',
                color: !selectedVariant || !inStock ? '#9CA3AF' : '#fff',
                boxShadow: !selectedVariant || !inStock ? 'none' : '0 6px 20px rgba(251,191,36,0.4)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                fontFamily: font, transition: 'all 0.2s',
              }}>
              {adding
                ? <><span style={{ width: '17px', height: '17px', border: '2.5px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', animation: 'spin 0.7s linear infinite', display: 'inline-block' }} /> Adding…</>
                : !selectedVariant ? <><ShoppingCart size={17} /> Select a Size</>
                : !inStock ? 'Out of Stock'
                : <><ShoppingCart size={17} /> Add to Cart</>
              }
            </button>

            {/* Trust Badges */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px' }}>
              {[
                { icon: Truck, label: 'Free Shipping', sub: '₹499+', bg: '#EFF6FF', ic: '#3B82F6' },
                { icon: Shield, label: 'Safe Materials', sub: 'Certified', bg: '#ECFDF5', ic: '#10B981' },
                { icon: Package, label: 'Easy Returns', sub: '7 days', bg: '#FDF4FF', ic: '#A855F7' },
              ].map(({ icon: Icon, label, sub, bg, ic }) => (
                <div key={label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: '5px', padding: '12px 6px', borderRadius: '16px', background: bg }}>
                  <Icon size={18} color={ic} />
                  <span style={{ fontSize: '11px', fontWeight: '700', color: '#4E3728' }}>{label}</span>
                  <span style={{ fontSize: '10px', color: '#6B7280' }}>{sub}</span>
                </div>
              ))}
            </div>

            {product.description && (
              <div style={{ paddingTop: '14px', borderTop: '1.5px solid #FEF3C7' }}>
                <p style={{ fontSize: '13px', fontWeight: '800', color: '#374151', marginBottom: '6px' }}>Product Details</p>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.7, margin: 0 }}>{product.description}</p>
              </div>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
