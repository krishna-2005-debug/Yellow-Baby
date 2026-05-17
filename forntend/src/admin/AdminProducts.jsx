import { useState, useEffect } from 'react';
import { Search, Plus, RefreshCw, Package, Edit, Trash2, Eye } from 'lucide-react';
import api from '../api/api';
import toast from 'react-hot-toast';

const DEMO_PRODUCTS = [
  { id: 1, name: 'Cozy Onesie Set', category__name: 'Clothing', price: '899.00', is_active: true, stock: 24, rating: 4.5, images: [] },
  { id: 2, name: 'Soft Muslin Blanket', category__name: 'Bedding', price: '1299.00', is_active: true, stock: 12, rating: 4.8, images: [] },
  { id: 3, name: 'Baby Romper Pack', category__name: 'Clothing', price: '749.00', is_active: true, stock: 3, rating: 4.2, images: [] },
  { id: 4, name: 'Rattle Toy Set', category__name: 'Toys', price: '599.00', is_active: false, stock: 0, rating: 3.9, images: [] },
  { id: 5, name: 'Diaper Bag Deluxe', category__name: 'Accessories', price: '2499.00', is_active: true, stock: 8, rating: 4.7, images: [] },
  { id: 6, name: 'Swaddle Wrap Pack', category__name: 'Bedding', price: '999.00', is_active: true, stock: 19, rating: 4.6, images: [] },
  { id: 7, name: 'Organic Cotton Vest', category__name: 'Clothing', price: '449.00', is_active: true, stock: 31, rating: 4.4, images: [] },
  { id: 8, name: 'Silicone Teether', category__name: 'Toys', price: '299.00', is_active: true, stock: 45, rating: 4.1, images: [] },
];

function StockBadge({ stock }) {
  if (stock === 0) return <span className="adm-badge adm-badge-cancelled">Out of Stock</span>;
  if (stock <= 5) return <span style={{ color: '#FCD34D', fontWeight: 700, fontSize: 13 }}>{stock} low</span>;
  return <span style={{ color: '#374151', fontSize: 13 }}>{stock}</span>;
}

function ProductRow({ product, onToggle, onDelete }) {
  const imgSrc = product.images?.[0]?.image || product.image;
  return (
    <tr>
      <td>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 40, height: 40, borderRadius: 8, flexShrink: 0,
            background: 'rgba(245,158,11,0.1)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden',
          }}>
            {imgSrc
              ? <img src={imgSrc} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : <Package size={18} color="var(--adm-accent)" />
            }
          </div>
          <div>
            <div style={{ fontWeight: 600, color: 'var(--adm-text)', fontSize: 13 }}>{product.name}</div>
            <div style={{ fontSize: 11, color: 'var(--adm-text-muted)' }}>ID #{product.id}</div>
          </div>
        </div>
      </td>
      <td style={{ fontSize: 12 }}>{product.category || '—'}</td>
      <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>₹{Number(product.price).toLocaleString('en-IN')}</td>
      <td><StockBadge stock={product.total_stock ?? product.stock ?? 0} /></td>
      <td>
        <span style={{ fontSize: 12, color: '#FCD34D' }}>
          {'★'.repeat(Math.floor(product.rating || 0))}
          <span style={{ color: 'var(--adm-text-muted)' }}> {product.rating || '—'}</span>
        </span>
      </td>
      <td>
        <button
          onClick={() => onToggle(product.id, !product.is_active)}
          style={{
            padding: '4px 10px', borderRadius: 100, border: 'none', cursor: 'pointer',
            fontFamily: 'var(--adm-font)', fontSize: 11, fontWeight: 700,
            background: product.is_active ? 'rgba(16,185,129,0.15)' : 'rgba(107,107,128,0.2)',
            color: product.is_active ? 'var(--adm-green)' : 'var(--adm-text-muted)',
            transition: 'all 0.15s',
          }}
        >
          {product.is_active ? 'Active' : 'Inactive'}
        </button>
      </td>
      <td>
        <div style={{ display: 'flex', gap: 6 }}>
          <a href={`/products/${product.id}`} target="_blank" rel="noreferrer"
            className="adm-btn adm-btn-ghost" style={{ padding: '5px 8px' }} title="View">
            <Eye size={13} />
          </a>
          <a href={`http://localhost:8000/admin/products/product/${product.id}/change/`}
            target="_blank" rel="noreferrer"
            className="adm-btn adm-btn-ghost" style={{ padding: '5px 8px' }} title="Edit">
            <Edit size={13} />
          </a>
          <button className="adm-btn adm-btn-danger" style={{ padding: '5px 8px' }}
            title="Delete" onClick={() => onDelete(product.id)}>
            <Trash2 size={13} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/api/products/admin/');
      setProducts(data.results || data);
    } catch {
      setProducts(DEMO_PRODUCTS);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchProducts(); }, []);

  useEffect(() => {
    let list = products;
    if (filter === 'active')   list = list.filter(p => p.is_active);
    if (filter === 'inactive') list = list.filter(p => !p.is_active);
    if (filter === 'low')      list = list.filter(p => (p.total_stock ?? p.stock ?? 0) <= 5);
    if (search.trim()) list = list.filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase())
    );
    setFiltered(list);
  }, [products, search, filter]);

  const handleToggle = async (id, active) => {
    try {
      await api.patch(`/api/products/admin/${id}/`, { is_active: active });
      setProducts(prev => prev.map(p => p.id === id ? { ...p, is_active: active } : p));
      toast.success(`Product ${active ? 'activated' : 'deactivated'}`);
    } catch {
      toast.error('Failed to update product status');
    }
  };

  const handleDelete = (id) => {
    if (!confirm('Delete this product?')) return;
    setProducts(prev => prev.filter(p => p.id !== id));
    toast.success('Product removed (demo)');
  };

  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Products</h1>
          <p className="adm-page-sub">{products.length} products in catalogue</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="adm-btn adm-btn-ghost" onClick={fetchProducts}>
            <RefreshCw size={14} /> Refresh
          </button>
          <a href="http://localhost:8000/admin/products/product/add/"
            target="_blank" rel="noreferrer" className="adm-btn adm-btn-primary">
            <Plus size={14} /> Add Product
          </a>
        </div>
      </div>

      <div className="adm-filters">
        {[
          { key: 'all',      label: `All (${products.length})` },
          { key: 'active',   label: `Active (${products.filter(p => p.is_active).length})` },
          { key: 'inactive', label: `Inactive (${products.filter(p => !p.is_active).length})` },
          { key: 'low',      label: `Low Stock (${products.filter(p => (p.stock || 0) <= 5).length})` },
        ].map(({ key, label }) => (
          <button key={key} className={`adm-filter-pill ${filter === key ? 'active' : ''}`}
            onClick={() => setFilter(key)}>{label}</button>
        ))}
        <div style={{ flex: 1 }} />
        <div style={{ position: 'relative' }}>
          <Search size={13} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--adm-text-muted)', pointerEvents: 'none' }} />
          <input className="adm-input" style={{ paddingLeft: 32, width: 220 }}
            placeholder="Search products…" value={search}
            onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="adm-spinner" /> : (
        <div className="adm-table-wrap">
          <table className="adm-table">
            <thead>
              <tr>
                <th>Product</th><th>Category</th><th>Price</th>
                <th>Stock</th><th>Rating</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <ProductRow key={p.id} product={p} onToggle={handleToggle} onDelete={handleDelete} />
              ))}
              {!filtered.length && (
                <tr><td colSpan={7}>
                  <div className="adm-empty">
                    <div className="adm-empty-icon">📦</div>
                    <div className="adm-empty-title">No products found</div>
                    <div className="adm-empty-sub">Try a different search or filter</div>
                  </div>
                </td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}



