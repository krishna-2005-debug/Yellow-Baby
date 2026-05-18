import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Plus, CreditCard, ChevronRight, Tag, Loader2 } from 'lucide-react';
import { getAddresses, addAddress, checkout } from '../api/api';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const PAYMENT_METHODS = [
  { id: 'cod', label: 'Cash on Delivery', icon: '💵', desc: 'Pay when you receive' },
  { id: 'upi', label: 'UPI', icon: '📱', desc: 'GPay, PhonePe, Paytm' },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { cart, cartTotal, emptyCart } = useCart();
  const { user } = useAuth();

  const [addresses, setAddresses] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState(null);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [placing, setPlacing] = useState(false);
  const [couponCode, setCouponCode] = useState('');
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddr, setNewAddr] = useState({
    name: '', phone: '', address_line: '',
    city: '', state: '', pincode: '', is_default: false,
  });
  const [fetchingPincode, setFetchingPincode] = useState(false);

  const fetchPincodeDetails = async (pincode) => {
    if (pincode.length === 6) {
      setFetchingPincode(true);
      try {
        const response = await fetch(`https://api.postalpincode.in/pincode/${pincode}`);
        const data = await response.json();
        if (data && data[0] && data[0].Status === 'Success') {
          const postOffice = data[0].PostOffice[0];
          setNewAddr(prev => ({
            ...prev,
            pincode, // keep it intact
            city: postOffice.District,
            state: postOffice.State
          }));
          toast.success(`Location auto-filled: ${postOffice.District}, ${postOffice.State}`);
        } else {
          toast.error('Invalid Pincode');
        }
      } catch (err) {
        console.error('Pincode fetch error:', err);
      } finally {
        setFetchingPincode(false);
      }
    }
  };

  const items = cart.items || [];

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    if (items.length === 0) { navigate('/cart'); return; }
    getAddresses()
      .then(({ data }) => {
        const list = data.results || data;
        setAddresses(list);
        const def = list.find((a) => a.is_default) || list[0];
        if (def) setSelectedAddress(def.id);
      })
      .catch(() => {});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleAddAddress = async (e) => {
    e.preventDefault();
    try {
      const { data } = await addAddress(newAddr);
      setAddresses((prev) => [...prev, data]);
      setSelectedAddress(data.id);
      setShowAddressForm(false);
      toast.success('Address added!');
    } catch (err) {
      toast.error(err.response?.data?.detail || 'Failed to add address');
    }
  };

  const handlePlaceOrder = async () => {
    if (!selectedAddress) { toast.error('Please select a delivery address'); return; }
    setPlacing(true);
    try {
      const { data } = await checkout({
        address_id: selectedAddress,
        payment_method: paymentMethod,
        coupon_code: couponCode || undefined,
      });
      await emptyCart();
      navigate('/order-success', { state: { order: data.order ?? data } });
    } catch (err) {
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Failed to place order';
      toast.error(msg);
    } finally {
      setPlacing(false);
    }
  };

  const total = Number(cartTotal) + (Number(cartTotal) >= 499 ? 0 : 49);

  return (
    <div className="pt-16 min-h-screen bg-gradient-to-b from-yellow-50/20 to-white">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
        <h1 className="text-2xl md:text-3xl font-extrabold text-gray-800 mb-8">Checkout</h1>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Column */}
          <div className="flex-1 space-y-6">
            {/* Delivery Address */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-yellow-100">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-bold text-gray-800 flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-yellow-500" />
                  Delivery Address
                </h2>
                <button
                  id="add-address-btn"
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-yellow-50 text-yellow-600 text-xs font-semibold hover:bg-yellow-100 transition-colors"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add New
                </button>
              </div>

              {/* Add Address Form */}
              {showAddressForm && (
                <form onSubmit={handleAddAddress} className="mb-5 p-4 rounded-2xl bg-yellow-50 border border-yellow-100 space-y-3">
                  <h3 className="text-sm font-bold text-gray-700 flex items-center gap-2">
                    New Address
                    {fetchingPincode && <Loader2 className="w-4 h-4 animate-spin text-yellow-500" />}
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { name: 'name', placeholder: 'Full Name', col: 2 },
                      { name: 'phone', placeholder: 'Mobile Number', col: 1 },
                      { name: 'pincode', placeholder: 'Pincode', col: 1 },
                      { name: 'address_line', placeholder: 'Address Line', col: 2 },
                      { name: 'city', placeholder: 'City', col: 1 },
                      { name: 'state', placeholder: 'State', col: 1 },
                    ].map(({ name, placeholder, col }) => (
                      <input
                        key={name}
                        type="text"
                        placeholder={placeholder}
                        value={newAddr[name]}
                        onChange={(e) => {
                          const val = e.target.value;
                          setNewAddr(prev => ({ ...prev, [name]: val }));
                          if (name === 'pincode' && val.length === 6) {
                            fetchPincodeDetails(val);
                          }
                        }}
                        required={true}
                        className={`px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400 bg-white ${col === 2 ? 'col-span-2' : ''}`}
                      />
                    ))}
                  </div>
                  <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newAddr.is_default}
                      onChange={(e) => setNewAddr({ ...newAddr, is_default: e.target.checked })}
                      className="accent-yellow-400"
                    />
                    Set as default address
                  </label>
                  <div className="flex gap-2">
                    <button type="submit" className="flex-1 py-2.5 rounded-xl bg-yellow-400 hover:bg-yellow-500 text-white font-semibold text-sm transition-colors">
                      Save Address
                    </button>
                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors">
                      Cancel
                    </button>
                  </div>
                </form>
              )}

              {/* Address List */}
              <div className="space-y-3">
                {addresses.length === 0 && !showAddressForm && (
                  <p className="text-sm text-gray-400 text-center py-4">No addresses found. Add one above.</p>
                )}
                {addresses.map((addr) => (
                  <label
                    key={addr.id}
                    htmlFor={`addr-${addr.id}`}
                    className={`flex gap-3 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                      selectedAddress === addr.id
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-transparent bg-gray-50 hover:bg-yellow-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      id={`addr-${addr.id}`}
                      name="address"
                      value={addr.id}
                      checked={selectedAddress === addr.id}
                      onChange={() => setSelectedAddress(addr.id)}
                      className="mt-0.5 accent-yellow-400"
                    />
                    <div className="text-sm">
                      <p className="font-semibold text-gray-800">{addr.name}</p>
                      <p className="text-gray-500">{addr.address_line}</p>
                      <p className="text-gray-500">{addr.city}, {addr.state} – {addr.pincode}</p>
                      <p className="text-gray-500">{addr.phone}</p>
                      {addr.is_default && <span className="text-xs text-yellow-600 font-semibold">⭐ Default</span>}
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Payment Method */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-yellow-100">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-5">
                <CreditCard className="w-5 h-5 text-yellow-500" />
                Payment Method
              </h2>
              <div className="space-y-3">
                {PAYMENT_METHODS.map(({ id, label, icon, desc }) => (
                  <label
                    key={id}
                    htmlFor={`pay-${id}`}
                    className={`flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                      paymentMethod === id
                        ? 'border-yellow-400 bg-yellow-50'
                        : 'border-transparent bg-gray-50 hover:bg-yellow-50/50'
                    }`}
                  >
                    <input
                      type="radio"
                      id={`pay-${id}`}
                      name="payment"
                      value={id}
                      checked={paymentMethod === id}
                      onChange={() => setPaymentMethod(id)}
                      className="accent-yellow-400"
                    />
                    <span className="text-2xl">{icon}</span>
                    <div>
                      <p className="text-sm font-semibold text-gray-800">{label}</p>
                      <p className="text-xs text-gray-400">{desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Coupon */}
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-yellow-100">
              <h2 className="font-bold text-gray-800 flex items-center gap-2 mb-4">
                <Tag className="w-5 h-5 text-yellow-500" />
                Coupon Code
              </h2>
              <div className="flex gap-2">
                <input
                  id="coupon-input"
                  type="text"
                  placeholder="Enter coupon code"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                  className="flex-1 px-4 py-2.5 rounded-2xl border border-gray-200 text-sm focus:outline-none focus:border-yellow-400"
                />
                <button className="px-5 py-2.5 rounded-2xl bg-gray-100 hover:bg-yellow-100 text-gray-700 font-semibold text-sm transition-colors">
                  Apply
                </button>
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:w-80 flex-shrink-0">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-yellow-100 sticky top-24 space-y-5">
              <h2 className="font-bold text-gray-800 text-lg">Order Summary</h2>

              <div className="space-y-3 max-h-52 overflow-y-auto">
                {items.map((item) => {
                  const name = item.product_name || 'Product';
                  const price = item.price || 0;
                  const img = item.product_image;
                  const size = item.size;
                  return (
                    <div key={item.id} className="flex gap-3 text-sm">
                      <div className="w-12 h-12 rounded-xl bg-yellow-50 overflow-hidden flex-shrink-0">
                        {img ? <img src={img} alt={name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center text-xl">👕</div>}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-700 line-clamp-1">{name}</p>
                        <p className="text-gray-400 text-xs">Size: {size} × {item.quantity}</p>
                      </div>
                      <span className="font-semibold text-gray-800 flex-shrink-0">₹{(Number(price) * item.quantity).toLocaleString('en-IN')}</span>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>₹{Number(cartTotal).toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Shipping</span>
                  <span className={Number(cartTotal) >= 499 ? 'text-green-600 font-semibold' : ''}>
                    {Number(cartTotal) >= 499 ? 'FREE' : '₹49'}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-gray-900 text-base pt-2 border-t border-gray-100">
                  <span>Total</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                id="place-order-btn"
                onClick={handlePlaceOrder}
                disabled={placing || !selectedAddress}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-yellow-200 hover:shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed transition-all"
              >
                {placing ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> Placing Order...</>
                ) : (
                  <>Place Order · ₹{total.toLocaleString('en-IN')} <ChevronRight className="w-4 h-4" /></>
                )}
              </button>

              <p className="text-[11px] text-gray-400 text-center">
                By placing this order you agree to our terms & conditions.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
