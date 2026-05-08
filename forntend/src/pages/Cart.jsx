
import { Link } from 'react-router-dom';
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight, Tag } from 'lucide-react';
import { useCart } from '../context/CartContext';
import Loader from '../components/Loader';

export default function Cart() {
  const { cart, loading, updateItem, removeItem, cartTotal } = useCart();
  const items = cart.items || [];
  const total = Number(cartTotal) || 0;
  const shipping = total >= 499 ? 0 : 49;
  const grandTotal = total + shipping;
  const freeShippingLeft = Math.max(0, 499 - total);
  const progress = Math.min(100, (total / 499) * 100);

  const font = 'Outfit, sans-serif';

  if (loading) return <div style={{ paddingTop: '64px' }}><Loader text="Loading cart…" /></div>;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #FFFBEB 0%, #FCF4EE 60%)',
      paddingTop: '64px', fontFamily: font,
    }}>
      <div style={{ maxWidth: '1024px', margin: '0 auto', padding: '40px 20px' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <div style={{
            width: '44px', height: '44px', borderRadius: '14px',
            background: 'linear-gradient(135deg, #FBBF24, #F59E0B)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 4px 14px rgba(251,191,36,0.35)',
          }}>
            <ShoppingBag size={22} color="#fff" />
          </div>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: '800', color: '#4E3728', margin: 0 }}>My Cart</h1>
            <p style={{ fontSize: '13px', color: '#9CA3AF', margin: 0 }}>
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          </div>
        </div>

        {items.length === 0 ? (
          /* Empty Cart */
          <div style={{
            background: '#fff', borderRadius: '32px',
            border: '1.5px solid #FEF3C7', padding: '64px 32px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(251,191,36,0.08)',
          }}>
            <div style={{ fontSize: '72px', marginBottom: '16px' }}>🛒</div>
            <h2 style={{ fontSize: '20px', fontWeight: '700', color: '#4E3728', marginBottom: '8px' }}>Your cart is empty</h2>
            <p style={{ fontSize: '14px', color: '#9CA3AF', marginBottom: '24px' }}>Looks like you haven't added anything yet. Browse our collection!</p>
            <Link to="/" className="btn-primary" style={{ display: 'inline-flex', padding: '12px 28px' }}>
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col gap-3">

              {/* Free Shipping Progress */}
              {freeShippingLeft > 0 && (
                <div style={{
                  background: '#FFFBEB', borderRadius: '20px',
                  border: '1.5px solid #FDE68A', padding: '14px 18px',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#92400E' }}>
                      🚚 Add <strong>₹{freeShippingLeft.toLocaleString('en-IN')}</strong> more for free shipping!
                    </span>
                    <span style={{ fontSize: '12px', color: '#B45309' }}>{Math.round(progress)}%</span>
                  </div>
                  <div style={{ background: '#FEF3C7', borderRadius: '100px', height: '6px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${progress}%`, height: '100%', borderRadius: '100px',
                      background: 'linear-gradient(90deg, #FBBF24, #F59E0B)',
                      transition: 'width 0.5s ease',
                    }} />
                  </div>
                </div>
              )}
              {freeShippingLeft === 0 && (
                <div style={{
                  background: '#ECFDF5', borderRadius: '20px',
                  border: '1.5px solid #A7F3D0', padding: '12px 18px',
                  fontSize: '13px', fontWeight: '700', color: '#065F46',
                }}>
                  🎉 You've unlocked free shipping!
                </div>
              )}

              {/* Items */}
              {items.map(item => {
                const img = item.primary_image || item.variant?.product?.images?.[0]?.image;
                const name = item.product_name || item.variant?.product?.name || 'Product';
                const size = item.size || item.variant?.size;
                const price = Number(item.price || item.variant?.product?.price || 0);

                return (
                  <div key={item.id} id={`cart-item-${item.id}`} style={{
                    background: '#fff', borderRadius: '24px',
                    border: '1.5px solid #FEF3C7', padding: '16px',
                    display: 'flex', gap: '16px', alignItems: 'center',
                    boxShadow: '0 2px 8px rgba(251,191,36,0.06)',
                    transition: 'border-color 0.2s, box-shadow 0.2s',
                  }}>
                    {/* Image */}
                    <div style={{
                      width: '88px', height: '88px', borderRadius: '16px',
                      background: 'linear-gradient(135deg, #FFFBEB, #FEF3C7)',
                      overflow: 'hidden', flexShrink: 0,
                    }}>
                      {img ? (
                        <img src={img} alt={name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      ) : (
                        <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px' }}>👕</div>
                      )}
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '700', color: '#4E3728', margin: '0 0 4px', lineHeight: 1.35 }}>
                        {name}
                      </h3>
                      {size && (
                        <span style={{
                          display: 'inline-block', padding: '2px 9px', borderRadius: '100px',
                          background: '#EFF6FF', color: '#1D4ED8', fontSize: '11px', fontWeight: '700',
                          marginBottom: '6px',
                        }}>Size: {size}</span>
                      )}
                      <p style={{ fontSize: '16px', fontWeight: '800', color: '#4E3728', margin: 0 }}>
                        ₹{(price * item.quantity).toLocaleString('en-IN')}
                      </p>
                      <p style={{ fontSize: '11px', color: '#9CA3AF', margin: '2px 0 0' }}>
                        ₹{price.toLocaleString('en-IN')} × {item.quantity}
                      </p>
                    </div>

                    {/* Controls */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '10px' }}>
                      <button id={`remove-item-${item.id}`} onClick={() => removeItem(item.id)}
                        style={{
                          width: '30px', height: '30px', borderRadius: '10px',
                          background: '#FEF2F2', border: '1px solid #FCA5A5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', transition: 'all 0.15s', color: '#EF4444',
                        }}
                        onMouseEnter={e => e.currentTarget.style.background = '#FEE2E2'}
                        onMouseLeave={e => e.currentTarget.style.background = '#FEF2F2'}
                      >
                        <Trash2 size={13} />
                      </button>

                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '6px',
                        background: '#F9FAFB', borderRadius: '14px', padding: '4px',
                      }}>
                        <button id={`decrease-qty-${item.id}`}
                          onClick={() => item.quantity > 1 ? updateItem(item.id, item.quantity - 1) : removeItem(item.id)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '10px',
                            background: '#fff', border: '1px solid #E5E7EB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s', color: '#374151',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#FBBF24'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ width: '24px', textAlign: 'center', fontSize: '14px', fontWeight: '800', color: '#4E3728' }}>
                          {item.quantity}
                        </span>
                        <button id={`increase-qty-${item.id}`}
                          onClick={() => updateItem(item.id, item.quantity + 1)}
                          style={{
                            width: '28px', height: '28px', borderRadius: '10px',
                            background: '#fff', border: '1px solid #E5E7EB',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.15s', color: '#374151',
                          }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#FBBF24'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#E5E7EB'}
                        >
                          <Plus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary */}
            <div className="w-full lg:w-80 flex-shrink-0">
              <div style={{
                background: '#fff', borderRadius: '28px',
                border: '1.5px solid #FEF3C7', padding: '24px',
                boxShadow: '0 4px 24px rgba(251,191,36,0.1)',
                position: 'sticky', top: '88px',
              }}>
                <h2 style={{ fontSize: '17px', fontWeight: '800', color: '#4E3728', marginBottom: '20px' }}>Order Summary</h2>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
                  {[
                    { label: `Subtotal (${items.length} items)`, value: `₹${total.toLocaleString('en-IN')}` },
                    { label: 'Shipping', value: shipping === 0 ? '🆓 FREE' : `₹${shipping}`, highlight: shipping === 0 },
                  ].map(({ label, value, highlight }) => (
                    <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ color: '#6B7280', fontWeight: '500' }}>{label}</span>
                      <span style={{ fontWeight: '700', color: highlight ? '#059669' : '#4E3728' }}>{value}</span>
                    </div>
                  ))}

                  <div style={{
                    borderTop: '1.5px dashed #FEF3C7', paddingTop: '12px', marginTop: '4px',
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  }}>
                    <span style={{ fontSize: '15px', fontWeight: '800', color: '#4E3728' }}>Total</span>
                    <span style={{ fontSize: '20px', fontWeight: '900', color: '#D97706' }}>
                      ₹{grandTotal.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {/* Savings badge */}
                {shipping === 0 && (
                  <div style={{
                    margin: '14px 0', padding: '8px 14px', borderRadius: '12px',
                    background: '#ECFDF5', border: '1px solid #A7F3D0',
                    fontSize: '12px', fontWeight: '700', color: '#065F46',
                    display: 'flex', alignItems: 'center', gap: '6px',
                  }}>
                    <Tag size={13} /> You save ₹49 on shipping!
                  </div>
                )}

                <Link to="/checkout" id="proceed-to-checkout-btn"
                  className="btn-primary"
                  style={{ width: '100%', marginTop: '16px', padding: '14px', fontSize: '15px', borderRadius: '18px' }}
                >
                  Checkout <ArrowRight size={16} />
                </Link>

                <Link to="/" style={{
                  display: 'block', textAlign: 'center', marginTop: '12px',
                  fontSize: '12px', color: '#9CA3AF', textDecoration: 'none', fontWeight: '600',
                  transition: 'color 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.color = '#D97706'}
                  onMouseLeave={e => e.currentTarget.style.color = '#9CA3AF'}
                >
                  ← Continue Shopping
                </Link>

                {/* Trust badges */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '16px', justifyContent: 'center' }}>
                  {['🔒 Secure', '📦 Packed', '🚚 Fast'].map(t => (
                    <span key={t} style={{
                      padding: '4px 10px', borderRadius: '100px',
                      background: '#F9FAFB', border: '1px solid #E5E7EB',
                      fontSize: '11px', fontWeight: '600', color: '#6B7280',
                    }}>{t}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
