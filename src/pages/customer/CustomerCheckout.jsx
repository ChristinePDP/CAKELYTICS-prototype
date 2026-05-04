// ============================================================
// CUSTOMER CHECKOUT PAGE — Compact & Mobile Responsive
// ============================================================
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerHeader, CustomerFooter } from './CustomerLayout';
import { generateCustomerOrderId } from '../../data/customerData';

export default function CustomerCheckout({ cart, setCart, setConfirmedOrderId }) {
  const navigate = useNavigate();

  const hasPackage = cart.some(item => item.category === 'Package');
  const [pickupType, setPickupType] = useState(hasPackage ? 'later' : 'now');
  const [payType, setPayType]       = useState('half');

  const [form, setForm] = useState({
    name: '', phone: '', altPhone: '', fb: '', date: '', time: '10:00',
  });

  const getMinPreOrderDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 2);
    const year  = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day   = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const minDateStr    = getMinPreOrderDate();
  const totalAmount   = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const depositAmt    = Math.ceil(totalAmount / 2);
  const totalItems    = cart.reduce((s, i) => s + i.qty, 0);
  const set = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const handlePlaceOrder = () => {
    if (!form.name || !form.phone || !form.fb) {
      alert('Please enter your Full Name, Contact Number, and Facebook/Messenger Full Name.');
      return;
    }
    if (pickupType === 'later') {
      if (!form.date) { alert('Please select a pre-order date.'); return; }
      if (form.date < minDateStr) {
        alert(`Pre-orders require 2 days preparation. Please select ${minDateStr} or later.`);
        return;
      }
    }
    const orderId = generateCustomerOrderId();
    setConfirmedOrderId(orderId);
    setCart([]);
    navigate('/customer/confirm');
  };

  const inputCls = "w-full px-3 py-2.5 border border-[#D6C5BE] rounded-lg font-sans text-[13px] bg-white outline-none text-[#4A3B36] font-medium focus:border-[#5A453C] transition-all";
  const labelCls = "text-[12px] font-black text-[#5A453C] uppercase tracking-wide";

  return (
    <div className="font-sans bg-[#FCFAF9] text-[#4A3B36] leading-relaxed min-h-screen antialiased">
      <CustomerHeader page="checkout" cartCount={totalItems} cartTotal={totalAmount} />

      <div className="max-w-[680px] mx-auto my-6 px-4 pb-12">
        <div className="bg-white px-5 py-6 sm:px-8 sm:py-8 rounded-2xl shadow-sm border border-[#EAE4E0]">

          {/* ── Section 1: Pickup & Customer Details ── */}
          <SectionTitle num="1" title="Pick-up & Customer Details" />

          {/* Order type toggle */}
          <div className="flex bg-[#F5EFEB] p-1 rounded-lg mb-4 border border-[#D6C5BE] gap-1">
            <button
              onClick={() => !hasPackage && setPickupType('now')}
              title={hasPackage ? 'Hindi available ang Order Now para sa mga Package item.' : ''}
              className={`flex-1 py-2 text-[13px] font-bold rounded-md transition-all border-none ${hasPackage ? 'opacity-40 cursor-not-allowed text-[#796860]' : 'cursor-pointer'} ${pickupType === 'now' ? 'bg-[#5A453C] text-white shadow-sm' : 'bg-transparent text-[#796860] hover:bg-[#EAE4E0]/50'}`}
            >
              Order Now
            </button>
            <button
              onClick={() => setPickupType('later')}
              className={`flex-1 py-2 text-[13px] font-bold rounded-md transition-all border-none cursor-pointer ${pickupType === 'later' ? 'bg-[#5A453C] text-white shadow-sm' : 'bg-transparent text-[#796860] hover:bg-[#EAE4E0]/50'}`}
            >
              Pre-Order
            </button>
          </div>

          {/* Warning — show always if has package so customer knows why Order Now is locked */}
          {hasPackage && (
            <div className="bg-[#FFF8E7] border border-[#F3D79A] text-[#8C6B22] px-3 py-2.5 rounded-lg mb-4 text-[12px] font-semibold flex items-center gap-2">
              ⚠️ Ang iyong order ay may kasamang Package — kailangan ng Pre-Order (2 days preparation).
            </div>
          )}

          {/* Date/time */}
          {pickupType === 'later' && (
            <div className="grid grid-cols-2 gap-3 mb-4">
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Pre-Order Date <span className="text-red-500">*</span></label>
                <input type="date" min={minDateStr} className={inputCls} value={form.date} onChange={e => set('date', e.target.value)} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className={labelCls}>Time <span className="text-red-500">*</span></label>
                <input type="time" className={inputCls} value={form.time} onChange={e => set('time', e.target.value)} />
              </div>
            </div>
          )}

          {/* Customer info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Full Name <span className="text-red-500">*</span></label>
              <input type="text" className={inputCls} placeholder="e.g. Juan Dela Cruz" value={form.name} onChange={e => set('name', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Contact Number <span className="text-red-500">*</span></label>
              <input type="tel" className={inputCls} placeholder="09xxxxxxxxx" value={form.phone} onChange={e => set('phone', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Alternative Number</label>
              <input type="tel" className={inputCls} placeholder="Optional" value={form.altPhone} onChange={e => set('altPhone', e.target.value)} />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className={labelCls}>Facebook / Messenger Name <span className="text-red-500">*</span></label>
              <input type="text" className={inputCls} placeholder="Para mabilis ka naming ma-contact" value={form.fb} onChange={e => set('fb', e.target.value)} />
            </div>
          </div>

          {/* ── Section 2: Order Summary ── */}
          <SectionTitle num="2" title="Order Summary" className="mt-8" />

          <div className="bg-[#FBF8F6] px-4 py-4 rounded-xl mb-2 border border-[#D6C5BE]">
            <div className="flex flex-col gap-3">
              {cart.map((item, i) => (
                <div key={i}>
                  <div className="flex justify-between font-bold text-[#5A453C] text-[13px]">
                    <span>{item.qty}× {item.name}</span>
                    <span>₱{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                  {item.note && <div className="text-[11px] text-[#796860] mt-0.5 font-medium whitespace-pre-line">📝 {item.note}</div>}
                  {item.file && <div className="text-[11px] text-[#796860] font-medium">📎 {item.file}</div>}
                </div>
              ))}
            </div>
            <div className="text-right font-black text-[15px] text-[#5A453C] mt-4 pt-3 border-t border-[#D6C5BE]">
              Grand Total: ₱{totalAmount.toLocaleString()}
            </div>
          </div>

          {/* ── Section 3: Payment ── */}
          <SectionTitle num="3" title="Payment" className="mt-8" />

          <p className="text-[12px] text-[#796860] font-medium mb-3">We require at least a 50% deposit to process your order.</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
            <PayCard
              active={payType === 'half'}
              onClick={() => setPayType('half')}
              title="50% Deposit"
              desc="Pay half now, balance upon pick-up."
              amount={`₱${depositAmt.toLocaleString()}`}
            />
            <PayCard
              active={payType === 'full'}
              onClick={() => setPayType('full')}
              title="Full Payment"
              desc="Pay in full for hassle-free pick-up."
              amount={`₱${totalAmount.toLocaleString()}`}
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3 pt-5 border-t border-[#D6C5BE]">
            <button
              className="bg-none border-none text-[#5A453C] font-bold text-[13px] cursor-pointer hover:opacity-70 py-2 w-full sm:w-auto text-center sm:text-left"
              onClick={() => navigate('/customer/menu')}
            >
              ← Back to Menu
            </button>
            <button
              className="bg-[#5A453C] text-white px-8 py-3 border-none cursor-pointer font-bold text-[14px] rounded-lg hover:bg-[#4A3B36] w-full sm:w-auto shadow-sm"
              onClick={handlePlaceOrder}
            >
              Place Order
            </button>
          </div>

        </div>
      </div>

      <CustomerFooter />
    </div>
  );
}

function SectionTitle({ num, title, className = '' }) {
  return (
    <h2 className={`text-[15px] font-black mb-4 pb-3 border-b border-[#D6C5BE] flex items-center gap-2.5 text-[#5A453C] ${className}`}>
      <span className="bg-[#5A453C] text-white w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-black shrink-0">{num}</span>
      {title}
    </h2>
  );
}

function PayCard({ active, onClick, title, desc, amount }) {
  return (
    <div
      onClick={onClick}
      className={`border-2 rounded-xl px-4 py-4 cursor-pointer transition-all ${active ? 'border-[#5A453C] bg-[#F5EFEB] shadow-sm' : 'border-[#D6C5BE] bg-white hover:border-[#796860]'}`}
    >
      <div className="flex items-start gap-2 mb-1">
        <div className={`mt-0.5 w-4 h-4 rounded-full border-2 shrink-0 flex items-center justify-center ${active ? 'border-[#5A453C]' : 'border-[#C4B5AE]'}`}>
          {active && <div className="w-2 h-2 rounded-full bg-[#5A453C]" />}
        </div>
        <div>
          <div className="text-[13px] font-black text-[#5A453C]">{title}</div>
          <div className="text-[11px] text-[#796860] font-medium leading-relaxed">{desc}</div>
        </div>
      </div>
      <div className="text-[18px] font-black text-[#5A453C] mt-2 pl-6">{amount}</div>
    </div>
  );
}