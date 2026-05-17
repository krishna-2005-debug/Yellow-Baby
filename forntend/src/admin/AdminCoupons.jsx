import { Tag, Plus, ExternalLink } from 'lucide-react';

const DEMO_COUPONS = [
  { code: 'BABY10', discount_type: 'percentage', discount_value: 10, min_order: 500, is_active: true, usage_count: 24, max_usage: 100 },
  { code: 'FLAT200', discount_type: 'fixed', discount_value: 200, min_order: 1000, is_active: true, usage_count: 8, max_usage: 50 },
  { code: 'WELCOME20', discount_type: 'percentage', discount_value: 20, min_order: 800, is_active: false, usage_count: 50, max_usage: 50 },
];

export default function AdminCoupons() {
  return (
    <div>
      <div className="adm-page-header">
        <div>
          <h1 className="adm-page-title">Coupons</h1>
          <p className="adm-page-sub">{DEMO_COUPONS.length} coupons configured</p>
        </div>
        <a href="http://localhost:8000/admin/orders/coupon/add/" target="_blank" rel="noreferrer"
          className="adm-btn adm-btn-primary">
          <Plus size={14} /> Add Coupon
        </a>
      </div>

      <div className="adm-table-wrap">
        <table className="adm-table">
          <thead>
            <tr>
              <th>Code</th><th>Type</th><th>Discount</th><th>Min. Order</th>
              <th>Usage</th><th>Status</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {DEMO_COUPONS.map(c => (
              <tr key={c.code}>
                <td>
                  <div style={{
                    display: 'inline-flex', alignItems: 'center', gap: 6,
                    background: 'rgba(16,185,129,0.12)', border: '1px dashed rgba(16,185,129,0.35)',
                    borderRadius: 7, padding: '3px 10px',
                  }}>
                    <Tag size={11} color="#34D399" />
                    <strong style={{ color: '#34D399', fontSize: 13, letterSpacing: 0.5 }}>{c.code}</strong>
                  </div>
                </td>
                <td style={{ textTransform: 'capitalize' }}>{c.discount_type}</td>
                <td style={{ fontWeight: 700, color: 'var(--adm-text)' }}>
                  {c.discount_type === 'percentage' ? `${c.discount_value}%` : `₹${c.discount_value}`}
                </td>
                <td>₹{c.min_order.toLocaleString('en-IN')}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ width: 60, height: 5, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${(c.usage_count / c.max_usage) * 100}%`, background: 'linear-gradient(90deg,#FBBF24,#F59E0B)', borderRadius: 3 }} />
                    </div>
                    <span style={{ fontSize: 11, color: 'var(--adm-text-muted)' }}>{c.usage_count}/{c.max_usage}</span>
                  </div>
                </td>
                <td>
                  <span className={`adm-badge adm-badge-${c.is_active ? 'active' : 'inactive'}`}>
                    {c.is_active ? 'Active' : 'Expired'}
                  </span>
                </td>
                <td>
                  <a href={`http://localhost:8000/admin/orders/coupon/`} target="_blank" rel="noreferrer"
                    className="adm-btn adm-btn-ghost" style={{ padding: '5px 10px', fontSize: 11 }}>
                    <ExternalLink size={12} /> Edit
                  </a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



