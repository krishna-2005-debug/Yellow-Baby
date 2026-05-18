
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle, Package, MapPin, CreditCard, ArrowRight } from 'lucide-react';

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-b from-green-50/40 via-yellow-50/20 to-white flex items-center justify-center px-4">
      <div className="max-w-lg w-full">
        {/* Success Animation */}
        <div className="text-center mb-8">
          <div className="relative inline-flex">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-400 to-emerald-500 flex items-center justify-center shadow-xl shadow-green-200 animate-bounce">
              <CheckCircle className="w-12 h-12 text-white" />
            </div>
            <div className="absolute inset-0 rounded-full bg-green-400/30 animate-ping" />
          </div>
          <h1 className="mt-6 text-3xl font-extrabold text-gray-800">Order Placed! 🎉</h1>
          <p className="mt-2 text-gray-500 text-sm">
            Yay! Your little one is going to love it. We'll send a confirmation soon.
          </p>
          {order?.id && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-yellow-100 text-yellow-800 font-bold text-sm">
              <Package className="w-4 h-4" />
              Order #{order.id}
            </div>
          )}
        </div>

        {/* Order Details Card */}
        {order && (
          <div className="bg-white rounded-3xl shadow-sm border border-green-100 p-6 space-y-5 mb-6">
            <h2 className="font-bold text-gray-800 text-base border-b border-gray-100 pb-3">Order Details</h2>

            {/* Items */}
            {order.items?.length > 0 && (
              <div className="space-y-3">
                {order.items.map((item, i) => (
                  <div key={i} className="flex justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-700">{item.product_name || item.variant?.product?.name}</p>
                      <p className="text-gray-400 text-xs">Size: {item.size || item.variant?.size} × {item.quantity}</p>
                    </div>
                    <span className="font-semibold text-gray-800">
                      ₹{Number(item.total_price || item.price).toLocaleString('en-IN')}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Meta */}
            <div className="border-t border-gray-100 pt-4 space-y-3">
              {order.total_amount && (
                <div className="flex justify-between text-sm font-bold text-gray-900">
                  <span>Total Paid</span>
                  <span>₹{Number(order.total_amount).toLocaleString('en-IN')}</span>
                </div>
              )}
              {order.payment_method && (
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCard className="w-4 h-4 text-yellow-500" />
                  <span>{order.payment_method === 'cod' ? 'Cash on Delivery' : order.payment_method.toUpperCase()}</span>
                </div>
              )}
              {(order.address || order.address_snapshot) && (() => {
                const addr = order.address_snapshot || order.address;
                return (
                  <div className="flex items-start gap-2 text-sm text-gray-500">
                    <MapPin className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                    <span>
                      {addr.name || addr.full_name}, {addr.address_line || addr.address_line1}, {addr.city} – {addr.pincode}
                    </span>
                  </div>
                );
              })()}
              {order.status && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-400 animate-pulse" />
                  <span className="text-sm font-semibold text-yellow-700 capitalize">{order.status}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            to="/"
            id="continue-shopping-btn"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold text-sm shadow-lg shadow-yellow-200 hover:shadow-xl hover:scale-[1.02] transition-all"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/orders"
            id="view-orders-btn"
            className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-2xl border-2 border-yellow-200 text-yellow-700 font-bold text-sm hover:bg-yellow-50 transition-all"
          >
            <Package className="w-4 h-4" />
            View My Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
