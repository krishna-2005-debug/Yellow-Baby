import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Package, MapPin, CreditCard, ChevronLeft, Loader2, FileDown, XCircle } from 'lucide-react';
import { getOrderDetail, cancelOrder } from '../api/api';
import toast from 'react-hot-toast';

const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered'];

const STATUS_COLORS = {
  pending:   { bg: 'bg-yellow-100', text: 'text-yellow-700', dot: 'bg-yellow-400' },
  confirmed: { bg: 'bg-blue-100',   text: 'text-blue-700',   dot: 'bg-blue-400' },
  packed:    { bg: 'bg-purple-100', text: 'text-purple-700', dot: 'bg-purple-400' },
  shipped:   { bg: 'bg-indigo-100', text: 'text-indigo-700', dot: 'bg-indigo-400' },
  delivered: { bg: 'bg-green-100',  text: 'text-green-700',  dot: 'bg-green-500' },
  cancelled: { bg: 'bg-red-100',    text: 'text-red-600',    dot: 'bg-red-400' },
};

export default function OrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getOrderDetail(id)
      .then(({ data }) => setOrder(data))
      .catch(() => { toast.error('Order not found'); navigate('/orders'); })
      .finally(() => setLoading(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel this order?')) return;
    setCancelling(true);
    try {
      await cancelOrder(id);
      setOrder((o) => ({ ...o, status: 'cancelled' }));
      toast.success('Order cancelled successfully');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Could not cancel order');
    } finally {
      setCancelling(false);
    }
  };

  if (loading) return (
    <div className="pt-16 min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 text-yellow-400 animate-spin" />
    </div>
  );

  if (!order) return null;

  const statusColor = STATUS_COLORS[order.status] || STATUS_COLORS.pending;
  const currentStep = STATUS_STEPS.indexOf(order.status);
  const isCancelled = order.status === 'cancelled';
  const canCancel = ['pending', 'confirmed'].includes(order.status);

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-b from-yellow-50/20 to-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
        {/* Back */}
        <button onClick={() => navigate('/orders')}
          className="flex items-center gap-2 text-sm text-gray-500 hover:text-yellow-600 transition-colors mb-6">
          <ChevronLeft className="w-4 h-4" />
          Back to Orders
        </button>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800 flex items-center gap-2">
              <Package className="w-6 h-6 text-yellow-500" />
              Order #{order.id}
            </h1>
            <p className="text-sm text-gray-400 mt-1">
              Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold capitalize ${statusColor.bg} ${statusColor.text}`}>
              <span className={`w-2 h-2 rounded-full ${statusColor.dot} ${!isCancelled ? 'animate-pulse' : ''}`} />
              {order.status}
            </span>
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling}
                className="flex items-center gap-1.5 px-4 py-2 rounded-2xl border-2 border-red-200 text-red-500 text-sm font-semibold hover:bg-red-50 disabled:opacity-60 transition-all">
                {cancelling ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <XCircle className="w-3.5 h-3.5" />}
                Cancel
              </button>
            )}
          </div>
        </div>

        {/* Progress Tracker */}
        {!isCancelled && (
          <div className="bg-white rounded-3xl p-6 shadow-sm border border-yellow-100 mb-5">
            <h2 className="text-sm font-bold text-gray-700 mb-5">Order Progress</h2>
            <div className="flex items-center">
              {STATUS_STEPS.map((step, i) => {
                const done = i <= currentStep;
                const active = i === currentStep;
                return (
                  <React.Fragment key={step}>
                    <div className="flex flex-col items-center gap-1.5 flex-shrink-0">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        done ? 'bg-gradient-to-br from-yellow-400 to-amber-500 text-white shadow-md shadow-yellow-200' : 'bg-gray-100 text-gray-400'
                      } ${active ? 'ring-4 ring-yellow-200 scale-110' : ''}`}>
                        {done ? '✓' : i + 1}
                      </div>
                      <span className={`text-[10px] font-semibold capitalize whitespace-nowrap ${done ? 'text-yellow-600' : 'text-gray-400'}`}>
                        {step}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-1 mx-1 rounded-full transition-all ${i < currentStep ? 'bg-gradient-to-r from-yellow-400 to-amber-400' : 'bg-gray-100'}`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        )}

        {/* Items */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-yellow-100 mb-5">
          <h2 className="text-sm font-bold text-gray-700 mb-4">Items Ordered</h2>
          <div className="space-y-4">
            {(order.items || []).map((item, i) => {
              const name = item.product_name || 'Product';
              const price = item.price || item.total_price;
              const img = item.product_image;
              const size = item.size;
              return (
                <div key={i} className="flex gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-yellow-50 overflow-hidden flex-shrink-0 border border-yellow-100">
                    {img ? <img src={img} alt={name} className="w-full h-full object-cover" />
                         : <div className="w-full h-full flex items-center justify-center text-2xl">👕</div>}
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800 text-sm">{name}</p>
                    {size && <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-600 text-xs font-bold">Size: {size}</span>}
                    <p className="text-xs text-gray-400 mt-0.5">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900 text-sm">₹{Number(item.total_price || price).toLocaleString('en-IN')}</p>
                    <p className="text-xs text-gray-400">₹{Number(price).toLocaleString('en-IN')} × {item.quantity}</p>
                  </div>
                </div>
              );
            })}
          </div>
          <div className="border-t border-gray-100 mt-5 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal</span>
              <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>Shipping</span>
              <span className="text-green-600 font-medium">Free</span>
            </div>
            <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2">
              <span>Total Paid</span>
              <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* Delivery + Payment */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
          {order.address && (
            <div className="bg-white rounded-3xl p-5 shadow-sm border border-yellow-100">
              <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
                <MapPin className="w-4 h-4 text-yellow-500" /> Delivery Address
              </h2>
              <p className="text-sm font-semibold text-gray-800">{order.address.full_name}</p>
              <p className="text-sm text-gray-500 leading-relaxed mt-1">
                {order.address.address_line1}{order.address.address_line2 ? `, ${order.address.address_line2}` : ''}<br />
                {order.address.city}, {order.address.state} – {order.address.pincode}<br />
                {order.address.mobile}
              </p>
            </div>
          )}
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-yellow-100">
            <h2 className="text-sm font-bold text-gray-700 flex items-center gap-2 mb-3">
              <CreditCard className="w-4 h-4 text-yellow-500" /> Payment
            </h2>
            <p className="text-sm font-semibold text-gray-800 capitalize">
              {order.payment_method === 'cod' ? '💵 Cash on Delivery' : `📱 ${order.payment_method?.toUpperCase()}`}
            </p>
            <p className="text-sm text-gray-500 mt-1">
              Status: <span className={`font-semibold ${order.payment_status === 'paid' ? 'text-green-600' : 'text-yellow-600'}`}>
                {order.payment_status || 'Pending'}
              </span>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link to="/"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold text-sm shadow-md hover:shadow-lg hover:scale-[1.02] transition-all">
            Continue Shopping
          </Link>
          <a
            href={`http://localhost:8000/api/orders/${id}/invoice/`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-yellow-200 text-yellow-700 font-bold text-sm hover:bg-yellow-50 transition-all">
            <FileDown className="w-4 h-4" />
            Download Invoice
          </a>
        </div>
      </div>
    </div>
  );
}
