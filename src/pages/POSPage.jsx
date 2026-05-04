import { useState } from 'react';
import {
  ShoppingCart, Clock, Calendar, Minus, Plus, Trash2,
  ChevronDown, ChevronUp, User, Package,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast } from '../components/ui';
import { Button, Modal, Input, Textarea, SearchBar, FilterPills } from '../components/ui';

function fmt(n) {
  return '₱' + Number(n).toLocaleString('en', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

const PLACEHOLDER = {
  Package: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
  Pastry:  'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&q=80',
};

const PRODUCT_IMAGES = {
  'Package A':  'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
  'Package B':  'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80',
  'Package C':  'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&q=80',
  'Package D':  'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80',
  'Package E':  'https://images.unsplash.com/photo-1586788680434-30d324b2d46f?w=600&q=80',
  'Package AB': 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80',
  'Package EA': 'https://images.unsplash.com/photo-1519869325930-281384150729?w=600&q=80',
};

// Packages na may Themed Cake
const CAKE_PACKAGES = ['p1', 'p2', 'p3', 'p4', 'p5'];
const hasCake = (product) => CAKE_PACKAGES.includes(product.id);

function InclusionList({ text }) {
  if (!text) return null;
  return (
    <ul className="mt-1.5 space-y-0.5">
      {text.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => (
        <li key={i} className="flex items-start gap-1.5 text-xs text-brand-500 leading-snug">
          <span className="mt-1 w-1 h-1 rounded-full bg-brand-400 shrink-0 block" />
          {line.replace(/^w\/\s*/i, '')}
        </li>
      ))}
    </ul>
  );
}

function ProductCard({ product, onClick }) {
  const isPackage  = product.category === 'Package';
  const imgSrc     = PRODUCT_IMAGES[product.name] || product.image || PLACEHOLDER[product.category] || PLACEHOLDER.Pastry;
  const outOfStock = product.stock === 0;
  return (
    <div
      onClick={() => !outOfStock && onClick(product)}
      className={`bg-white rounded-xl border overflow-hidden transition-all select-none flex flex-col
        ${outOfStock ? 'border-brand-100 opacity-60 cursor-not-allowed' : 'border-brand-200 cursor-pointer hover:border-brand-400 hover:shadow-md active:scale-[0.98]'}`}
    >
      <div className="relative">
        <img src={imgSrc} alt={product.name} className={`w-full object-cover ${isPackage ? 'h-24' : 'h-20'}`}
          onError={e => { e.target.src = PLACEHOLDER[product.category] || PLACEHOLDER.Pastry; }} />
        {!outOfStock && (
          <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full
            ${product.stock <= 5 ? 'bg-amber-600/90 text-white' : 'bg-black/40 text-white'}`}>
            {product.stock <= 5 ? `${product.stock} LEFT` : `Stock: ${product.stock}`}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-brand-900/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-wide">OUT OF STOCK</span>
          </div>
        )}
      </div>
      <div className="p-3 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[15px] font-bold text-brand-800 leading-tight">{product.name}</p>
          <p className="text-[14px] font-bold text-brand-600 mt-0.5">{fmt(product.price)}</p>
        </div>
        {product.inclusion && <InclusionList text={product.inclusion} />}
      </div>
    </div>
  );
}

// ─── Per-Package Order Slip Modal (POS) ──────────────────────
function PackageSlipModal({ product, onClose, onConfirm }) {
  const withCake = hasCake(product);
  const [slip, setSlip] = useState({ theme: '', flavor: '', message: '', others: '' });
  const [fileName, setFileName] = useState('');
  const s = (f, v) => setSlip(prev => ({ ...prev, [f]: v }));

  const handleConfirm = () => {
    if (withCake && (!slip.theme || !slip.flavor)) {
      alert('Mangyaring ilagay ang Motif/Theme at Flavor ng cake.');
      return;
    }
    onConfirm(product, slip, fileName);
    onClose();
  };

  const inputCls = "w-full px-4 py-2.5 border border-[#EAE4E0] rounded-lg bg-[#FCFAF9] outline-none text-[13px] text-[#4A3B36] focus:border-[#5A453C] transition-colors";
  const labelCls = "text-[13px] font-bold text-[#5A453C] mb-1 block";

  return (
    <div
      className="fixed inset-0 bg-[rgba(90,69,60,0.55)] z-[2000] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-[500px] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-7 pt-7 pb-4 border-b border-[#EAE4E0] flex items-start justify-between shrink-0">
          <div>
            <p className="text-[11px] font-black text-[#9E8F88] uppercase tracking-[0.12em] mb-1">
              {withCake ? 'Cake Order Slip' : 'Package Details'}
            </p>
            <h2 className="text-[20px] font-black text-[#4A3B36] leading-tight">{product.name}</h2>
            <p className="text-[13px] font-bold text-[#796860] mt-0.5">{fmt(product.price)}</p>
            {product.inclusion && (
              <ul className="mt-2 space-y-0.5">
                {product.inclusion.split('\n').map((line, i) => (
                  <li key={i} className="flex items-start gap-1.5 text-[11px] text-[#9E8F88]">
                    <span className="text-[#C4B5AE] shrink-0">•</span>
                    <span>{line.replace(/^w\/\s*/i, '')}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <button onClick={onClose}
            className="bg-[#F5EFEB] border-none w-8 h-8 rounded-full text-[15px] cursor-pointer flex items-center justify-center text-[#5A453C] font-black hover:bg-[#EAE4E0] shrink-0 ml-4">✕</button>
        </div>

        {/* Form */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-4">

          {withCake ? (
            <>
              <div>
                <label className={labelCls}>Motiff / Theme <span className="text-red-500">*</span></label>
                <input type="text" className={inputCls} placeholder="e.g. Spiderman, Minimalist Pink"
                  value={slip.theme} onChange={e => s('theme', e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Flavor <span className="text-red-500">*</span></label>
                <input type="text" className={inputCls} placeholder="e.g. Chocolate, Vanilla"
                  value={slip.flavor} onChange={e => s('flavor', e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Name of Celebrant & Message</label>
                <textarea className={`${inputCls} resize-none`} rows={2}
                  placeholder="e.g. Happy 7th Birthday, AJ!"
                  value={slip.message} onChange={e => s('message', e.target.value)} />
              </div>

              <div>
                <label className={labelCls}>Inspired Design / Reference</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-2 border border-[#C4B5AE] rounded-lg bg-white cursor-pointer hover:border-[#5A453C] hover:bg-[#F5F0ED] transition-colors shrink-0">
                    <svg className="w-3.5 h-3.5 text-[#5A453C]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5"/>
                    </svg>
                    <span className="text-[12px] font-bold text-[#5A453C]">Upload File</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => setFileName(e.target.files[0]?.name || '')} />
                  </label>
                  {fileName
                    ? <span className="text-[12px] text-[#9E8F88] truncate">📎 {fileName}</span>
                    : <span className="text-[12px] text-[#C4B5AE]">No file chosen</span>
                  }
                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#F5EFEB] px-4 py-3 rounded-xl text-[12px] text-[#796860] font-medium">
              ℹ️ This package does not include a themed cake — no design details needed.
            </div>
          )}

          {/* Others — lahat ng package */}
          <div>
            <label className={labelCls}>Others / Special Requests</label>
            <input type="text" className={inputCls} placeholder="Additional requests..."
              value={slip.others} onChange={e => s('others', e.target.value)} />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-7 py-5 border-t border-[#EAE4E0] bg-white flex gap-3">
          <button onClick={onClose}
            className="flex-1 py-3 rounded-full border border-[#D6C5BE] text-[#5A453C] font-bold text-[14px] cursor-pointer hover:bg-[#F5EFEB] transition-colors">
            Cancel
          </button>
          <button onClick={handleConfirm}
            className="flex-1 bg-[#5A453C] text-white py-3 border-none cursor-pointer text-[14px] font-bold rounded-full hover:bg-[#4A3B36]">
            Add to Cart — {fmt(product.price)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Modal ───────────────────────────────────────────
function CheckoutModal({ isOpen, onClose, cartItems, subtotal, mode, collect50, preOrderData, onFinalize }) {
  const [cash, setCash] = useState('');
  const amtDue  = mode === 'preorder' && collect50 ? subtotal * 0.5 : subtotal;
  const balance = subtotal - amtDue;
  const change  = parseFloat(cash || 0) - amtDue;

  const handleFinalize = () => {
    if (!cash || parseFloat(cash) < amtDue) return;
    onFinalize(parseFloat(cash), change);
    setCash('');
    onClose();
  };

  const formatWithCommas = (str) => {
    if (!str) return '';
    const parts = str.split('.');
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return parts.join('.');
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Review Order" size="md"
      footer={
        <div className="flex gap-3 mt-2 w-full">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl border border-brand-200 text-brand-600 font-semibold hover:bg-brand-50 transition-colors">Cancel</button>
          <button onClick={handleFinalize} disabled={!cash || parseFloat(cash) < amtDue}
            className="flex-1 py-3 rounded-xl bg-[#5c4033] text-white font-semibold hover:bg-[#4a332a] disabled:opacity-50 transition-colors shadow-sm">
            Finalize Transaction
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <span className={`px-3 py-1 rounded-full text-[11px] font-bold ${mode === 'preorder' ? 'bg-purple-50 text-purple-600 border border-purple-100' : 'bg-[#eefcf2] text-[#1b7f43] border border-[#c1ebd1]'}`}>
            {mode === 'preorder' ? 'Pre-Order' : 'Order Now'}
          </span>
          <span className="text-[11px] text-brand-400">{mode === 'preorder' && collect50 ? '50% deposit ngayon' : 'Full payment ngayon'}</span>
        </div>

        <div className="border border-brand-100 rounded-xl p-3 space-y-3">
          {cartItems.map((item) => (
            <div key={item.productId} className="border-b border-brand-50 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-start text-sm">
                <span className="text-brand-700 font-medium">{item.name} <span className="text-brand-400">× {item.qty}</span></span>
                <span className="font-semibold text-brand-800 shrink-0 ml-2">{fmt(item.price * item.qty)}</span>
              </div>
              {/* Slip summary sa review */}
              {item.slip && (hasCake({ id: item.productId }) ? (
                <div className="mt-1 text-[10px] text-brand-400 space-y-0.5 pl-1">
                  {item.slip.theme   && <p>🎨 {item.slip.theme} · {item.slip.flavor}</p>}
                  {item.slip.message && <p>✉️ {item.slip.message}</p>}
                  {item.slip.others  && <p>📝 {item.slip.others}</p>}
                  {item.fileName     && <p>📎 {item.fileName}</p>}
                </div>
              ) : item.slip.others ? (
                <p className="mt-1 text-[10px] text-brand-400 pl-1">📝 {item.slip.others}</p>
              ) : null)}
            </div>
          ))}
        </div>

        <div className="space-y-1.5 px-1">
          <div className="flex justify-between text-sm text-brand-500"><span>Order Subtotal</span><span>{fmt(subtotal)}</span></div>
          {preOrderData?.additionalCharge > 0 && (
            <div className="flex justify-between text-sm text-brand-500"><span>Additional Charge</span><span>+{fmt(preOrderData.additionalCharge)}</span></div>
          )}
          {preOrderData?.discount > 0 && (
            <div className="flex justify-between text-sm text-brand-500"><span>Discount</span><span>-{fmt(preOrderData.discount)}</span></div>
          )}
          <div className="flex justify-between font-bold text-brand-800 text-lg pt-2 border-t border-brand-100 mt-2">
            <span>{mode === 'preorder' && collect50 ? 'Amount Due Now (50%)' : 'Grand Total'}</span>
            <span className={mode === 'preorder' && collect50 ? 'text-green-700' : ''}>{fmt(amtDue)}</span>
          </div>
          {mode === 'preorder' && collect50 && (
            <div className="flex justify-between text-[11px] font-semibold text-brand-400 mt-1">
              <span>Remaining Balance (sa Pick-up)</span><span>{fmt(balance)}</span>
            </div>
          )}
        </div>

        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-medium text-brand-600">Cash Tendered</label>
            <div className="relative w-1/2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] font-bold text-brand-500">₱</span>
              <input type="text" value={formatWithCommas(cash)}
                onChange={e => { const raw = e.target.value.replace(/,/g, ''); if (/^\d*\.?\d*$/.test(raw)) setCash(raw); }}
                placeholder="0.00"
                className="w-full text-right pl-8 pr-4 py-2.5 border border-brand-200 rounded-xl text-lg font-bold text-brand-800 focus:outline-none focus:border-[#5c4033] focus:ring-1 focus:ring-[#5c4033] transition-all" />
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
            !cash ? 'bg-brand-50 border-brand-100 text-brand-600' :
            change >= 0 ? 'bg-[#eefcf2] border-[#c1ebd1] text-[#1b7f43]' : 'bg-[#fff0f0] border-[#facaca] text-[#d63838]'
          }`}>
            <span className="text-sm font-medium">Change Due</span>
            <span className="text-xl font-bold">
              {!cash ? '₱0.00' : change === 0 ? 'Exact' : change > 0 ? fmt(change) : `- ${fmt(Math.abs(change))}`}
            </span>
          </div>
        </div>
      </div>
    </Modal>
  );
}

// ─── MAIN POS PAGE ────────────────────────────────────────────
export default function POSPage() {
  const { products, addOrder } = useApp();
  const { show: showToast }    = useToast();

  const [category, setCategory]         = useState('All');
  const [search, setSearch]             = useState('');
  const [mode, setMode]                 = useState('now');
  const [cartItems, setCartItems]       = useState([]);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [slipModal, setSlipModal]       = useState(null);
  // Local stock override — nagbabawas kapag nag-add sa cart, bumabalik kapag nag-remove
  const [localStocks, setLocalStocks]   = useState({});

  const [customerName,        setCustomerName]        = useState('');
  const [customerPhone,       setCustomerPhone]       = useState('');
  const [customerFb,          setCustomerFb]          = useState('');
  const [pickupDate,          setPickupDate]          = useState('');
  const [pickupTime,          setPickupTime]          = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [additionalCharge,    setAdditionalCharge]    = useState('');
  const [discount,            setDiscount]            = useState('');
  const [showCustomer,        setShowCustomer]        = useState(true);
  const [collect50,           setCollect50]           = useState(false);

  const ALLOWED_CATS = ['Package', 'Pastry'];

  // Effective stock = local override kung mayroon, otherwise galing sa products context
  const getStock = (product) =>
    localStocks[product.id] !== undefined ? localStocks[product.id] : product.stock;

  const allFiltered = products.filter(p => {
    const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return searchOk && p.active && ALLOWED_CATS.includes(p.category);
  // Inject effective stock into each product para mag-react ang ProductCard
  }).map(p => ({ ...p, stock: getStock(p) }));
  const filtered = category === 'All' ? allFiltered : allFiltered.filter(p => p.category === category);
  const grouped  = category === 'All'
    ? ALLOWED_CATS.map(cat => ({ cat, items: allFiltered.filter(p => p.category === cat) })).filter(g => g.items.length > 0)
    : null;

  const addToCart = (product, slip = null, fileName = '') => {
    const effectiveStock = getStock(product);
    if (effectiveStock === 0) return;
    if (mode === 'now' && product.category === 'Package') {
      showToast('Kailangan ng lead time ng mga Package. Mangyaring gumamit ng Pre-Order.', 'warning');
      return;
    }
    // Package sa Pre-Order — buksan ang slip modal muna
    if (product.category === 'Package' && mode === 'preorder' && slip === null) {
      setSlipModal(product);
      return;
    }

    // Bawasan ang local stock ng 1
    setLocalStocks(prev => ({ ...prev, [product.id]: (prev[product.id] ?? product.stock) - 1 }));

    setCartItems(prev => {
      if (product.category === 'Package') {
        return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1, category: product.category, slip, fileName }];
      }
      const ex = prev.find(i => i.productId === product.id);
      if (ex) return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + 1 } : i);
      return [...prev, { productId: product.id, name: product.name, price: product.price, qty: 1, category: product.category, slip: null, fileName: '' }];
    });
  };

  const changeQty = (idx, delta) => {
    const item = cartItems[idx];
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      // Ibalik lahat ng stock ng item na ito
      setLocalStocks(prev => ({ ...prev, [item.productId]: (prev[item.productId] ?? 0) + item.qty }));
      setCartItems(prev => prev.filter((_, n) => n !== idx));
    } else {
      // delta > 0 = bawasan stock pa, delta < 0 = ibalik ng isa
      const product = products.find(p => p.id === item.productId);
      if (delta > 0 && getStock(product || { id: item.productId, stock: 0 }) <= 0) {
        showToast('Wala nang stock!', 'warning'); return;
      }
      setLocalStocks(prev => ({ ...prev, [item.productId]: (prev[item.productId] ?? (product?.stock ?? 0)) - delta }));
      setCartItems(prev => prev.map((i, n) => n === idx ? { ...i, qty: newQty } : i));
    }
  };

  const removeItem = (idx) => {
    const item = cartItems[idx];
    if (item) {
      setLocalStocks(prev => ({ ...prev, [item.productId]: (prev[item.productId] ?? 0) + item.qty }));
    }
    setCartItems(prev => prev.filter((_, n) => n !== idx));
  };

  const clearCart = () => {
    setCartItems([]);
    setLocalStocks({});
    setCustomerName(''); setCustomerPhone(''); setCustomerFb('');
    setPickupDate(''); setPickupTime(''); setSpecialInstructions('');
    setAdditionalCharge(''); setDiscount(''); setCollect50(false);
  };

  const rawTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);
  const subtotal = rawTotal + Number(additionalCharge || 0) - Number(discount || 0);

  const handleCharge = () => {
    if (!cartItems.length) { showToast('Walang laman ang cart.', 'error'); return; }
    if (mode === 'preorder' && !customerName) { showToast('Ilagay ang pangalan ng customer.', 'warning'); return; }
    if (mode === 'preorder' && !pickupDate)   { showToast('Ilagay ang pick-up date.', 'warning'); return; }
    setCheckoutOpen(true);
  };

  const handleFinalize = (cashTendered, change) => {
    const amtDue = mode === 'preorder' && collect50 ? subtotal * 0.5 : subtotal;
    addOrder({
      type:   mode === 'preorder' ? 'Pre-Order' : 'Buy Now',
      status: mode === 'preorder' ? 'Confirmed' : 'Completed',
      customer: { name: customerName || 'Walk-in', phone: customerPhone, altPhone: '', facebook: customerFb },
      items: cartItems.map(i => ({
        productId: i.productId, name: i.name, qty: i.qty, price: i.price, total: i.price * i.qty,
        orderSlip: i.slip || null, fileName: i.fileName || null,
      })),
      subtotal, additionalCharge: Number(additionalCharge || 0), discount: Number(discount || 0), grandTotal: subtotal,
      paymentType: mode === 'preorder' && collect50 ? 'deposit' : 'full',
      amountPaid: amtDue, balance: subtotal - amtDue,
      pickupDate, pickupTime, specialInstructions, customerReference: null,
    });
    showToast('Order saved!', 'success');
    clearCart();
  };

  const categoryFiltered = ['All', 'Package', 'Pastry'];

  return (
    <div className="flex gap-4 h-[calc(100vh-112px)]">

      {/* ── LEFT: Products ── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <div className="flex items-center gap-3 mb-3">
          <SearchBar value={search} onChange={setSearch} placeholder="Search product..." className="w-64" />
          <FilterPills options={categoryFiltered} value={category} onChange={setCategory} />
        </div>
        <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
          {grouped ? (
            <div className="pb-4 space-y-6">
              {grouped.map(({ cat, items }) => (
                <div key={cat}>
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-[11px] font-bold uppercase tracking-widest text-brand-500">{cat}</h3>
                    <div className="flex-1 h-px bg-brand-200" />
                    <span className="text-[10px] text-brand-400">{items.length} items</span>
                  </div>
                  <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                    {items.map(p => <ProductCard key={p.id} product={p} onClick={addToCart} />)}
                  </div>
                </div>
              ))}
              {allFiltered.length === 0 && <div className="text-center py-16 text-brand-300 text-sm">Walang produktong nahanap.</div>}
            </div>
          ) : (
            <div className="pb-4">
              <div className="grid grid-cols-3 xl:grid-cols-4 gap-3">
                {filtered.map(p => <ProductCard key={p.id} product={p} onClick={addToCart} />)}
                {!filtered.length && <div className="col-span-4 text-center py-16 text-brand-300 text-sm">Walang produktong nahanap.</div>}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ── RIGHT: Order Panel ── */}
      <div className="w-96 shrink-0 bg-white rounded-xl border border-brand-200 shadow-sm flex flex-col overflow-hidden h-full">

        {/* Mode Toggle */}
        <div className="p-3 border-b border-brand-100 shrink-0">
          <div className="flex bg-brand-100 rounded-xl p-1 gap-1">
            <button
              onClick={() => {
                const hasPackage = cartItems.some(i => i.category === 'Package');
                if (hasPackage) { showToast('May nakalagay na Package sa cart. Alisin muna ito bago mag-Order Now.', 'warning'); return; }
                setMode('now'); setCollect50(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all
                ${mode === 'now' ? 'bg-brand-700 text-white shadow-sm' : 'text-brand-500 hover:text-brand-700'}`}
            ><Clock size={13} /> Order Now</button>
            <button onClick={() => setMode('preorder')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all
                ${mode === 'preorder' ? 'bg-brand-700 text-white shadow-sm' : 'text-brand-500 hover:text-brand-700'}`}
            ><Calendar size={13} /> Pre-Order</button>
          </div>
        </div>

        {/* Customer Details */}
        {mode === 'preorder' && (
          <div className="border-b border-brand-100 shrink-0">
            <button onClick={() => setShowCustomer(v => !v)}
              className="w-full flex items-center justify-between px-4 py-2.5 text-[11px] font-bold uppercase tracking-wider text-brand-500 hover:bg-brand-50 transition-colors">
              <div className="flex items-center gap-2">
                <User size={12} />
                Customer Details
                {!customerName && <span className="text-red-400 normal-case font-semibold">· Required</span>}
              </div>
              {showCustomer ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
            </button>
            {showCustomer && (
              <div className="px-4 pb-3 space-y-2">
                <Input placeholder="Customer Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="text-xs" />
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="text-xs" />
                  <Input placeholder="Facebook Name" value={customerFb} onChange={e => setCustomerFb(e.target.value)} className="text-xs" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] font-bold uppercase text-brand-400 block mb-1">Pick-up Date <span className="text-red-400">*</span></label>
                    <input type="date" value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                      className="w-full text-xs border border-brand-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-400 text-brand-800" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold uppercase text-brand-400 block mb-1">Pick-up Time</label>
                    <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                      className="w-full text-xs border border-brand-200 rounded-lg px-2 py-1.5 outline-none focus:border-brand-400 text-brand-800" />
                  </div>
                </div>
                <Textarea placeholder="Special instructions (optional)..." value={specialInstructions} onChange={e => setSpecialInstructions(e.target.value)} rows={2} className="text-xs" />
              </div>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-4">
          <div className="flex items-center justify-between py-2.5 sticky top-0 bg-white border-b border-brand-100 z-10">
            <div>
              <p className="text-sm font-bold text-brand-800">Current Order</p>
              <p className="text-[10px] text-brand-400">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
            </div>
            {cartItems.length > 0 && (
              <button onClick={clearCart} className="flex items-center gap-1.5 px-2 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg text-[11px] font-bold transition-colors">
                <Trash2 size={16} /> Clear Cart
              </button>
            )}
          </div>

          {!cartItems.length ? (
            <div className="py-10 text-center text-brand-300 text-sm">
              <ShoppingCart size={28} className="mx-auto mb-2 opacity-40" />
              <p>Wala pang items.</p>
              <p className="text-xs mt-1">Pumili ng produkto sa kaliwa.</p>
            </div>
          ) : (
            <div className="pb-3 pt-2 space-y-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="bg-white border border-brand-100 p-3 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[14px] font-bold text-brand-900 leading-tight truncate">{item.name}</p>
                      <p className="text-[12px] font-semibold text-brand-500 mt-0.5">{fmt(item.price)}</p>
                      {/* Order slip summary */}
                      {item.slip && (
                        <div className="mt-1.5 text-[10px] text-brand-400 space-y-0.5 bg-brand-50 px-2 py-1.5 rounded-lg">
                          {item.slip.theme   && <p>🎨 <span className="font-semibold">{item.slip.theme}</span> · {item.slip.flavor}</p>}
                          {item.slip.message && <p>✉️ {item.slip.message}</p>}
                          {item.slip.others  && <p>📝 {item.slip.others}</p>}
                          {item.fileName     && <p>📎 {item.fileName}</p>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 bg-brand-50 p-1 rounded-lg shrink-0">
                      <button onClick={() => changeQty(idx, -1)} className="w-7 h-7 rounded bg-white border border-brand-200 flex items-center justify-center text-brand-600 hover:bg-brand-100 shadow-sm"><Minus size={14} /></button>
                      <span className="w-5 text-center text-[14px] font-black text-brand-900">{item.qty}</span>
                      <button onClick={() => changeQty(idx, 1)} className="w-7 h-7 rounded bg-white border border-brand-200 flex items-center justify-center text-brand-600 hover:bg-brand-100 shadow-sm"><Plus size={14} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-50">
                    <span className="text-[15px] font-black text-brand-900">{fmt(item.price * item.qty)}</span>
                    <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1.5 rounded-md hover:bg-red-50 transition-colors">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + Actions */}
        <div className="shrink-0 border-t border-brand-200">
          <div className="px-4 pt-3 space-y-1.5">
            <div className="flex justify-between items-center text-xs text-brand-500">
              <span>Subtotal</span>
              <span className="font-semibold text-brand-700">{fmt(rawTotal)}</span>
            </div>
            <div className="flex justify-between items-center text-xs text-brand-500">
              <span>Additional Charge</span>
              <input type="number" value={additionalCharge} min="0" onChange={e => setAdditionalCharge(e.target.value)} placeholder="0"
                className="w-20 text-right text-xs border border-brand-200 rounded-lg px-2 py-1 outline-none focus:border-brand-400 font-semibold text-brand-700" />
            </div>
            <div className="flex justify-between items-center text-xs text-brand-500">
              <span>Discount</span>
              <input type="number" value={discount} min="0" onChange={e => setDiscount(e.target.value)} placeholder="0"
                className="w-20 text-right text-xs border border-brand-200 rounded-lg px-2 py-1 outline-none focus:border-brand-400 font-semibold text-brand-700" />
            </div>

            {mode === 'preorder' && cartItems.length > 0 && (
              <label className="flex items-center gap-2.5 pt-1.5 pb-0.5 cursor-pointer group">
                <div onClick={() => setCollect50(v => !v)}
                  className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all shrink-0
                    ${collect50 ? 'bg-brand-700 border-brand-700' : 'border-brand-300 bg-white group-hover:border-brand-400'}`}>
                  {collect50 && <svg width="11" height="11" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                </div>
                <div>
                  <p className="text-xs font-bold text-brand-700">Collect 50% Deposit ngayon</p>
                  {collect50
                    ? <p className="text-[10px] text-brand-400">Deposit: {fmt(subtotal * 0.5)} · Balance sa pick-up: {fmt(subtotal * 0.5)}</p>
                    : <p className="text-[10px] text-brand-400">Hindi naka-check = full payment ngayon</p>
                  }
                </div>
              </label>
            )}

            <div className="flex justify-between items-center font-bold text-brand-800 text-base pt-2 border-t border-brand-200 mt-1">
              <span>GRAND TOTAL</span><span className="text-lg">{fmt(subtotal)}</span>
            </div>
            {mode === 'preorder' && collect50 && cartItems.length > 0 && (
              <div className="flex justify-between items-center text-xs text-brand-500 -mt-0.5">
                <span>Due ngayon (50%)</span>
                <span className="font-bold text-green-700">{fmt(subtotal * 0.5)}</span>
              </div>
            )}
          </div>
          <div className="px-4 pt-3 pb-3">
            <Button variant="dark" className="w-full" onClick={handleCharge} disabled={!cartItems.length}>
              {mode === 'preorder' ? 'Confirm Pre-Order' : 'Complete Order'}
            </Button>
          </div>
        </div>
      </div>

      {/* Package Slip Modal */}
      {slipModal && (
        <PackageSlipModal
          product={slipModal}
          onClose={() => setSlipModal(null)}
          onConfirm={(product, slip, fileName) => {
            setSlipModal(null);
            addToCart(product, slip, fileName);
          }}
        />
      )}

      <CheckoutModal
        isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems} subtotal={subtotal} mode={mode} collect50={collect50}
        preOrderData={{ pickupDate, pickupTime, additionalCharge: Number(additionalCharge || 0), discount: Number(discount || 0) }}
        onFinalize={handleFinalize}
      />
    </div>
  );
}