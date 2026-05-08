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

const DEFAULT_PLACEHOLDER = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80';

// Packages na may Themed Cake
const CAKE_PACKAGES = ['p1', 'p2', 'p3', 'p4', 'p5'];
const hasCake = (product) => CAKE_PACKAGES.includes(product.id);

function InclusionList({ text }) {
  if (!text) return null;
  return (
    <ul className="mt-1 space-y-0.5">
      {text.split('\n').map(l => l.trim()).filter(Boolean).map((line, i) => (
        <li key={i} className="flex items-start gap-1 text-[11px] text-brand-500 leading-snug">
          <span className="mt-1 w-1 h-1 rounded-full bg-brand-300 shrink-0 block" />
          {line.replace(/^w\/\s*/i, '')}
        </li>
      ))}
    </ul>
  );
}

// ─── COMPACT PRODUCT CARD (NO HOVER EFFECTS) ───
function ProductCard({ product, onClick }) {
  const isPackage  = product.category === 'Package';
  const imgSrc     = product.image || DEFAULT_PLACEHOLDER;
  const outOfStock = product.stock === 0;

  return (
    <div
      onClick={() => !outOfStock && onClick(product)}
      className={`bg-white rounded-xl border overflow-hidden select-none flex flex-col
        ${outOfStock ? 'border-brand-100 opacity-60 cursor-not-allowed' : 'border-brand-200 cursor-pointer'}`}
    >
      <div className="relative">
        <div className={`relative w-full overflow-hidden bg-brand-50 ${isPackage ? 'aspect-[4/3]' : 'aspect-video'}`}>
           <img 
             src={imgSrc} 
             alt={product.name} 
             className="absolute top-0 left-0 w-full h-full object-cover"
             onError={e => { e.target.src = DEFAULT_PLACEHOLDER; }} 
           />
        </div>
        {!outOfStock && (
          <span className={`absolute top-2 right-2 text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm
            ${product.stock <= 5 ? 'bg-amber-600/90 text-white' : 'bg-black/50 text-white'}`}>
            {product.stock <= 5 ? `${product.stock} LEFT` : `Stock: ${product.stock}`}
          </span>
        )}
        {outOfStock && (
          <div className="absolute inset-0 bg-brand-900/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-wide">OUT OF STOCK</span>
          </div>
        )}
      </div>
      <div className="p-2.5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[13px] font-bold text-brand-800 leading-tight">{product.name}</p>
          {product.inclusion && <InclusionList text={product.inclusion} />}
        </div>
        
        {/* ADD BUTTON AREA */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-50">
          <p className="text-[13px] font-black text-brand-700">{fmt(product.price)}</p>
          {!outOfStock && (
            <button 
              onClick={(e) => { e.stopPropagation(); onClick(product); }}
              className="flex items-center gap-1 bg-brand-100 text-brand-700 hover:bg-[#5c4033] hover:text-white px-2 py-1 rounded-md text-[10px] font-bold transition-colors"
            >
              <Plus size={12} /> ADD
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CELEBRATION SLIP MODAL ───────────────────────────────────
function CelebrationSlipModal({ product, onClose, onConfirm }) {
  const isTarp = product.name.toLowerCase().includes('tarpaulin');
  const hasVariants = product.variants && product.variants.length > 0;

  const [qty, setQty] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState(hasVariants ? product.variants[0] : null);
  
  const [tarpNote, setTarpNote] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const [balloonSize, setBalloonSize] = useState('10 inches (Standard)');
  const [colorType, setColorType] = useState('Assorted Colors');
  const [specificColors, setSpecificColors] = useState('');
  const [printRequest, setPrintRequest] = useState('');

  const basePrice = selectedVariant ? selectedVariant.price : product.price;
  const totalPrice = isTarp ? basePrice : basePrice * qty;

  const handleFileChange = (e) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setUploadedFiles(prev => [...prev, ...Array.from(files)]);
    }
    e.target.value = '';
  };

  const removeFile = (indexToRemove) => {
    setUploadedFiles(prev => prev.filter((_, idx) => idx !== indexToRemove));
  };

  const handleConfirm = () => {
    let details = '';
    let filesStr = '';

    if (isTarp) {
      details = `Size: ${selectedVariant.label}${tarpNote ? ' | Instructions: ' + tarpNote : ''}`;
      if (uploadedFiles.length > 0) filesStr = uploadedFiles.map(f => f.name).join(', ');
    } else {
      const colorVal = colorType === 'Specific Color(s)' ? specificColors : 'Assorted Colors';
      details = `Size: ${balloonSize} | Color: ${colorVal}${printRequest ? ' | Print: ' + printRequest : ''}`;
    }

    onConfirm(product, { others: details }, filesStr, qty, basePrice);
    onClose();
  };

  const inputCls = "w-full px-3 py-2 border border-brand-200 rounded-lg bg-[#FCFAF9] outline-none text-[13px] text-brand-800 focus:border-[#5c4033] transition-colors";
  const labelCls = "text-[12px] font-bold text-brand-700 mb-1 block";

  return (
    <div className="fixed inset-0 bg-[rgba(90,69,60,0.55)] z-[2000] flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        <div className="px-6 pt-6 pb-3 border-b border-brand-100 flex justify-between shrink-0">
          <div>
            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest">Order Slip</p>
            <h2 className="text-[18px] font-black text-brand-800">{product.name}</h2>
          </div>
          <button onClick={onClose} className="bg-brand-50 border-none w-7 h-7 rounded-full cursor-pointer text-brand-600 flex items-center justify-center font-black hover:bg-brand-100">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {isTarp ? (
            <>
              <div>
                <label className={labelCls}>Select Size</label>
                <select className={inputCls} value={selectedVariant?.label} onChange={(e) => setSelectedVariant(product.variants.find(v => v.label === e.target.value))}>
                  {product.variants.map(v => <option key={v.label} value={v.label}>{v.label} — {fmt(v.price)}</option>)}
                </select>
              </div>

              <div>
                <label className={labelCls}>Upload Photos</label>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <label className="flex items-center gap-2 px-3 py-1.5 bg-brand-50 text-brand-700 border border-brand-200 rounded-md cursor-pointer hover:bg-brand-100 transition-colors">
                      <span className="text-[11px] font-bold">Choose Files</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <span className="text-[11px] text-brand-500">
                      {uploadedFiles.length === 0 ? 'No file chosen' : `${uploadedFiles.length} file(s) selected`}
                    </span>
                  </div>
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-col gap-1 max-h-32 overflow-y-auto pr-1">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-brand-50 px-2.5 py-1.5 rounded-md border border-brand-100">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="shrink-0 text-[10px] text-brand-400">📎</span>
                            <span className="text-[11px] font-medium text-brand-600 truncate">{f.name}</span>
                          </div>
                          <button type="button" onClick={() => removeFile(i)} className="text-brand-400 hover:text-red-500 font-bold shrink-0 text-[12px] px-1 border-none bg-transparent cursor-pointer">✕</button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className={labelCls}>Layout Instructions</label>
                <textarea className={`${inputCls} resize-none`} rows={3} placeholder="e.g. Happy 1st Birthday AJ, Blue Theme" value={tarpNote} onChange={e => setTarpNote(e.target.value)} />
              </div>
            </>
          ) : (
            <>
              <div>
                <label className={labelCls}>Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-8 h-8 rounded-md border border-brand-200 bg-white font-black text-brand-700 hover:bg-brand-50 flex items-center justify-center">−</button>
                  <span className="text-[16px] font-black text-brand-900 w-6 text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-8 h-8 rounded-md border border-brand-200 bg-white font-black text-brand-700 hover:bg-brand-50 flex items-center justify-center">+</button>
                </div>
              </div>

              {hasVariants && (
                <div>
                  <label className={labelCls}>Select Variant</label>
                  <select className={inputCls} value={selectedVariant?.label} onChange={(e) => setSelectedVariant(product.variants.find(v => v.label === e.target.value))}>
                    {product.variants.map(v => <option key={v.label} value={v.label}>{v.label} — {fmt(v.price)}</option>)}
                  </select>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className={labelCls}>Size</label>
                  <select className={inputCls} value={balloonSize} onChange={e => setBalloonSize(e.target.value)}>
                    <option value="10 inches (Standard)">10" (Standard)</option>
                    <option value="12 inches (Large)">12" (Large)</option>
                  </select>
                </div>
                <div>
                  <label className={labelCls}>Color Set</label>
                  <select className={inputCls} value={colorType} onChange={e => setColorType(e.target.value)}>
                    <option value="Assorted Colors">Assorted</option>
                    <option value="Specific Color(s)">Specific Color</option>
                  </select>
                </div>
              </div>

              {colorType === 'Specific Color(s)' && (
                <div>
                  <label className={labelCls}>Specify Color(s)</label>
                  <input type="text" className={inputCls} placeholder="e.g. Red and White only" value={specificColors} onChange={e => setSpecificColors(e.target.value)} />
                </div>
              )}

              <div>
                <label className={labelCls}>Print Details</label>
                <input type="text" className={inputCls} placeholder="e.g. Happy Birthday, I Love You, etc." value={printRequest} onChange={e => setPrintRequest(e.target.value)} />
              </div>
            </>
          )}
        </div>

        <div className="px-6 py-4 border-t border-brand-100 bg-white flex gap-3 shrink-0">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-brand-200 text-brand-700 font-bold text-[13px] cursor-pointer hover:bg-brand-50 transition-colors">Cancel</button>
          <button onClick={handleConfirm} className="flex-1 bg-[#5c4033] text-white py-2.5 border-none cursor-pointer text-[13px] font-bold rounded-full hover:bg-[#4a332a]">
            Add to Cart — {fmt(totalPrice)}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Per-Package Order Slip Modal ──────────────────────
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
    onConfirm(product, slip, fileName, 1, product.price);
    onClose();
  };

  const inputCls = "w-full px-3 py-2 border border-brand-200 rounded-lg bg-[#FCFAF9] outline-none text-[13px] text-brand-800 focus:border-[#5c4033] transition-colors";
  const labelCls = "text-[12px] font-bold text-brand-700 mb-1 block";

  return (
    <div className="fixed inset-0 bg-[rgba(90,69,60,0.55)] z-[2000] flex items-center justify-center p-4" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="bg-white w-full max-w-[450px] rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 pt-6 pb-3 border-b border-brand-100 flex items-start justify-between shrink-0">
          <div>
            <p className="text-[10px] font-black text-brand-400 uppercase tracking-widest mb-1">{withCake ? 'Cake Order Slip' : 'Package Details'}</p>
            <h2 className="text-[18px] font-black text-brand-800 leading-tight">{product.name}</h2>
            <p className="text-[12px] font-bold text-brand-500 mt-0.5">{fmt(product.price)}</p>
          </div>
          <button onClick={onClose} className="bg-brand-50 border-none w-7 h-7 rounded-full text-[14px] cursor-pointer flex items-center justify-center text-brand-600 font-black hover:bg-brand-100 shrink-0 ml-4">✕</button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4 custom-scrollbar">
          {withCake ? (
            <>
              <div><label className={labelCls}>Motiff / Theme <span className="text-red-500">*</span></label><input type="text" className={inputCls} placeholder="e.g. Spiderman, Minimalist Pink" value={slip.theme} onChange={e => s('theme', e.target.value)} /></div>
              <div><label className={labelCls}>Flavor <span className="text-red-500">*</span></label><input type="text" className={inputCls} placeholder="e.g. Chocolate, Vanilla" value={slip.flavor} onChange={e => s('flavor', e.target.value)} /></div>
              <div><label className={labelCls}>Name of Celebrant & Message</label><textarea className={`${inputCls} resize-none`} rows={2} placeholder="e.g. Happy 7th Birthday, AJ!" value={slip.message} onChange={e => s('message', e.target.value)} /></div>
              <div>
                <label className={labelCls}>Inspired Design / Reference</label>
                <div className="flex items-center gap-3">
                  <label className="flex items-center gap-1.5 px-3 py-1.5 border border-brand-300 rounded-md bg-white cursor-pointer hover:border-[#5c4033] hover:bg-brand-50 transition-colors shrink-0">
                    <span className="text-[11px] font-bold text-brand-700">Upload File</span>
                    <input type="file" className="hidden" accept="image/*" onChange={e => setFileName(e.target.files[0]?.name || '')} />
                  </label>
                  {fileName ? <span className="text-[11px] text-brand-600 truncate">📎 {fileName}</span> : <span className="text-[11px] text-brand-400">No file chosen</span>}
                </div>
              </div>
            </>
          ) : (
            <div className="bg-brand-50 px-4 py-2.5 rounded-lg text-[11px] text-brand-600 font-medium">ℹ️ This package does not include a themed cake — no design details needed.</div>
          )}
          <div><label className={labelCls}>Others / Special Requests</label><input type="text" className={inputCls} placeholder="Additional requests..." value={slip.others} onChange={e => s('others', e.target.value)} /></div>
        </div>

        <div className="shrink-0 px-6 py-4 border-t border-brand-100 bg-white flex gap-3">
          <button onClick={onClose} className="flex-1 py-2.5 rounded-full border border-brand-200 text-brand-700 font-bold text-[13px] cursor-pointer hover:bg-brand-50 transition-colors">Cancel</button>
          <button onClick={handleConfirm} className="flex-1 bg-[#5c4033] text-white py-2.5 border-none cursor-pointer text-[13px] font-bold rounded-full hover:bg-[#4a332a]">Add to Cart — {fmt(product.price)}</button>
        </div>
      </div>
    </div>
  );
}

// ─── Checkout Modal ───────────────────────────────────────────
function CheckoutModal({ isOpen, onClose, cartItems, finalTotal, mode, collect50, preOrderData, onFinalize }) {
  const [cash, setCash] = useState('');
  const amtDue  = mode === 'preorder' && collect50 ? finalTotal * 0.5 : finalTotal;
  const balance = finalTotal - amtDue;
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
          {cartItems.map((item, idx) => (
            <div key={idx} className="border-b border-brand-50 pb-3 last:border-0 last:pb-0">
              <div className="flex justify-between items-start text-sm">
                <span className="text-brand-800 font-bold">{item.name} <span className="text-brand-500 font-medium">× {item.qty}</span></span>
                <span className="font-bold text-brand-900 shrink-0 ml-2">{fmt(item.price * item.qty)}</span>
              </div>
              {item.slip && (hasCake({ id: item.productId }) ? (
                <div className="mt-1 text-[11px] text-brand-500 space-y-0.5 pl-1">
                  {item.slip.theme   && <p>🎨 {item.slip.theme} · {item.slip.flavor}</p>}
                  {item.slip.message && <p>✉️ {item.slip.message}</p>}
                  {item.slip.others  && <p>📝 {item.slip.others}</p>}
                  {item.fileName     && <p>📎 {item.fileName}</p>}
                </div>
              ) : item.slip.others ? (
                <p className="mt-1 text-[11px] text-brand-500 pl-1">📝 {item.slip.others}</p>
              ) : null)}
            </div>
          ))}
        </div>

        <div className="space-y-1.5 px-1">
          {preOrderData?.additionalCharge > 0 && (
            <div className="flex justify-between text-sm text-brand-600 font-medium"><span>Additional Charge</span><span>+{fmt(preOrderData.additionalCharge)}</span></div>
          )}
          {preOrderData?.discount > 0 && (
            <div className="flex justify-between text-sm text-brand-600 font-medium">
              <span>Discount</span>
              <span>-{fmt(preOrderData.discount)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-brand-900 text-lg pt-2 border-t border-brand-100 mt-2">
            <span>{mode === 'preorder' && collect50 ? 'Amount Due Now (50%)' : 'Grand Total'}</span>
            <span className={mode === 'preorder' && collect50 ? 'text-green-700' : ''}>{fmt(amtDue)}</span>
          </div>
          {mode === 'preorder' && collect50 && (
            <div className="flex justify-between text-[12px] font-bold text-brand-500 mt-1">
              <span>Remaining Balance (sa Pick-up)</span><span>{fmt(balance)}</span>
            </div>
          )}
        </div>

        <div className="pt-2 space-y-4">
          <div className="flex items-center justify-between gap-4">
            <label className="text-sm font-bold text-brand-700">Cash Tendered</label>
            <div className="relative w-1/2">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[17px] font-black text-brand-500">₱</span>
              <input type="text" value={formatWithCommas(cash)}
                onChange={e => { const raw = e.target.value.replace(/,/g, ''); if (/^\d*\.?\d*$/.test(raw)) setCash(raw); }}
                placeholder="0.00"
                className="w-full text-right pl-8 pr-4 py-2.5 border border-brand-200 rounded-xl text-lg font-black text-brand-900 focus:outline-none focus:border-[#5c4033] focus:ring-1 focus:ring-[#5c4033] transition-all" />
            </div>
          </div>
          <div className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${
            !cash ? 'bg-brand-50 border-brand-100 text-brand-600' :
            change >= 0 ? 'bg-[#eefcf2] border-[#c1ebd1] text-[#1b7f43]' : 'bg-[#fff0f0] border-[#facaca] text-[#d63838]'
          }`}>
            <span className="text-sm font-bold">Change Due</span>
            <span className="text-xl font-black">
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
  const [celebModal, setCelebModal]     = useState(null); 

  const [localStocks, setLocalStocks]   = useState({});

  const [customerName,        setCustomerName]        = useState('');
  const [customerPhone,       setCustomerPhone]       = useState('');
  const [customerFb,          setCustomerFb]          = useState('');
  const [pickupDate,          setPickupDate]          = useState('');
  const [pickupTime,          setPickupTime]          = useState('');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [additionalCharge,    setAdditionalCharge]    = useState('');
  const [showCustomer,        setShowCustomer]        = useState(true);
  const [collect50,           setCollect50]           = useState(false);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [discountRate, setDiscountRate] = useState(0); 

  const ALLOWED_CATS = ['Pastry', 'Package', 'Celebration Material'];

  const getStock = (product) =>
    localStocks[product.id] !== undefined ? localStocks[product.id] : product.stock;

  const allFiltered = products.filter(p => {
    const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return searchOk && p.active && ALLOWED_CATS.includes(p.category);
  }).map(p => ({ ...p, stock: getStock(p) }));
  
  const filtered = category === 'All' ? allFiltered : allFiltered.filter(p => p.category === category);
  const grouped  = category === 'All'
    ? ALLOWED_CATS.map(cat => ({ cat, items: allFiltered.filter(p => p.category === cat) })).filter(g => g.items.length > 0)
    : null;

  const getMinPreOrderDate = () => {
    const today = new Date();
    today.setDate(today.getDate() + 1); 
    const year  = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day   = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  const minDateStr = getMinPreOrderDate();

  const addToCart = (product, slip = null, fileName = '', overrideQty = 1, overridePrice = null) => {
    const effectiveStock = getStock(product);
    if (effectiveStock === 0) return;

    if (mode === 'now' && (product.category === 'Package' || product.category === 'Celebration Material')) {
      showToast('Ang Packages at Celebration Materials ay Pre-Order lamang.', 'warning');
      return;
    }

    if (product.category === 'Package' && mode === 'preorder' && slip === null) {
      setSlipModal(product);
      return;
    }
    if (product.category === 'Celebration Material' && mode === 'preorder' && slip === null) {
      setCelebModal(product);
      return;
    }

    const finalPrice = overridePrice !== null ? overridePrice : product.price;

    setLocalStocks(prev => ({ ...prev, [product.id]: (prev[product.id] ?? product.stock) - overrideQty }));

    setCartItems(prev => {
      if (product.category === 'Package' || product.category === 'Celebration Material') {
        return [...prev, { productId: product.id, name: product.name, price: finalPrice, qty: overrideQty, category: product.category, slip, fileName }];
      }
      const ex = prev.find(i => i.productId === product.id);
      if (ex) return prev.map(i => i.productId === product.id ? { ...i, qty: i.qty + overrideQty } : i);
      return [...prev, { productId: product.id, name: product.name, price: finalPrice, qty: overrideQty, category: product.category, slip: null, fileName: '' }];
    });
  };

  const changeQty = (idx, delta) => {
    const item = cartItems[idx];
    if (!item) return;
    const newQty = item.qty + delta;
    if (newQty <= 0) {
      setLocalStocks(prev => ({ ...prev, [item.productId]: (prev[item.productId] ?? 0) + item.qty }));
      setCartItems(prev => prev.filter((_, n) => n !== idx));
    } else {
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
    setAdditionalCharge(''); setDiscountRate(0); setCollect50(false);
  };

  // ─── COMPUTATIONS ───
  const rawTotal = cartItems.reduce((s, i) => s + i.price * i.qty, 0);

  // Applicable sa buong order ang discount
  const discountableAmount = rawTotal;

  const computedDiscount = discountableAmount * discountRate;
  const finalTotal = rawTotal + Number(additionalCharge || 0) - computedDiscount;

  const handleCharge = () => {
    if (!cartItems.length) { showToast('Walang laman ang cart.', 'error'); return; }
    if (mode === 'preorder' && !customerName) { showToast('Ilagay ang pangalan ng customer.', 'warning'); return; }
    if (mode === 'preorder' && !pickupDate)   { showToast('Ilagay ang pick-up date.', 'warning'); return; }
    setCheckoutOpen(true);
  };

  const handleFinalize = (cashTendered, change) => {
    const amtDue = mode === 'preorder' && collect50 ? finalTotal * 0.5 : finalTotal;
    addOrder({
      type:   mode === 'preorder' ? 'Pre-Order' : 'Buy Now',
      status: mode === 'preorder' ? 'Confirmed' : 'Completed',
      customer: { name: customerName || 'Walk-in', phone: customerPhone, altPhone: ''},
      items: cartItems.map(i => ({
        productId: i.productId, name: i.name, qty: i.qty, price: i.price, total: i.price * i.qty,
        orderSlip: i.slip || null, fileName: i.fileName || null,
      })),
      subtotal: rawTotal, 
      additionalCharge: Number(additionalCharge || 0), 
      discount: computedDiscount, 
      grandTotal: finalTotal,
      paymentType: mode === 'preorder' && collect50 ? 'deposit' : 'full',
      amountPaid: amtDue, balance: finalTotal - amtDue,
      pickupDate, pickupTime, specialInstructions, customerReference: null,
    });
    showToast('Order saved!', 'success');
    clearCart();
  };

  const categoryFiltered = ['All', 'Package', 'Pastry', 'Celebration Material'];

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

      {/* ── RIGHT: Order Panel (COMPACT & NEAT) ── */}
      <div className="w-96 shrink-0 bg-white rounded-xl border border-brand-200 shadow-sm flex flex-col overflow-hidden h-full">

        {/* Mode Toggle */}
        <div className="p-2 border-b border-brand-100 shrink-0">
          <div className="flex bg-brand-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => {
                const hasRestricted = cartItems.some(i => i.category === 'Package' || i.category === 'Celebration Material');
                if (hasRestricted) {
                  showToast('May Package o Celebration Material sa cart. Alisin muna bago mag-Order Now.', 'warning');
                  return;
                }
                setMode('now'); setCollect50(false);
              }}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-bold transition-all
                ${mode === 'now' ? 'bg-brand-700 text-white shadow-sm' : 'text-brand-500'}`}
            ><Clock size={12} /> Order Now</button>
            <button onClick={() => setMode('preorder')}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[11px] font-bold transition-all
                ${mode === 'preorder' ? 'bg-brand-700 text-white shadow-sm' : 'text-brand-500'}`}
            ><Calendar size={12} /> Pre-Order</button>
          </div>
        </div>

        {/* Customer Details */}
        {mode === 'preorder' && (
          <div className="border-b border-brand-100 shrink-0">
            <button onClick={() => setShowCustomer(v => !v)}
              className="w-full flex items-center justify-between px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-brand-500 bg-brand-50/30">
              <div className="flex items-center gap-1.5">
                <User size={12} />
                Customer Details
                {!customerName && <span className="text-red-400 normal-case font-semibold">· Required</span>}
              </div>
              {showCustomer ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
            {showCustomer && (
              <div className="px-3 pb-3 pt-1.5 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  <Input placeholder="Phone Number" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="text-[12px] py-1.5" />
                  <Input placeholder="Customer Name *" value={customerName} onChange={e => setCustomerName(e.target.value)} className="text-[12px] py-1.5" />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[9px] font-bold uppercase text-brand-400 block mb-0.5">Pick-up Date <span className="text-red-500">*</span></label>
                    <input type="date" min={minDateStr} value={pickupDate} onChange={e => setPickupDate(e.target.value)}
                      className="w-full text-[12px] border border-brand-200 rounded-md px-2 py-1.5 outline-none focus:border-brand-400 text-brand-800" />
                  </div>
                  <div>
                    <label className="text-[9px] font-bold uppercase text-brand-400 block mb-0.5">Pick-up Time</label>
                    <input type="time" value={pickupTime} onChange={e => setPickupTime(e.target.value)}
                      className="w-full text-[12px] border border-brand-200 rounded-md px-2 py-1.5 outline-none focus:border-brand-400 text-brand-800" />
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto scrollbar-hide px-3">
          <div className="flex items-center justify-between py-2 sticky top-0 bg-white border-b border-brand-100 z-10">
            <div>
              <p className="text-[13px] font-black text-brand-900 leading-none">Current Order</p>
              <p className="text-[10px] text-brand-500 font-medium mt-0.5">{cartItems.length} item{cartItems.length !== 1 ? 's' : ''}</p>
            </div>
            {cartItems.length > 0 && (
              <button onClick={clearCart} className="flex items-center gap-1 px-2 py-1 bg-red-50 text-red-600 rounded-md text-[10px] font-bold">
                <Trash2 size={12} /> Clear
              </button>
            )}
          </div>

          {!cartItems.length ? (
            <div className="py-10 text-center text-brand-400">
              <ShoppingCart size={24} className="mx-auto mb-2 opacity-30" />
              <p className="text-[12px] font-bold">Wala pang items.</p>
              <p className="text-[11px] mt-0.5">Pumili ng produkto sa kaliwa.</p>
            </div>
          ) : (
            <div className="pb-3 pt-2 space-y-2">
              {cartItems.map((item, idx) => (
                <div key={idx} className="bg-white border border-brand-200 p-2.5 rounded-xl shadow-sm">
                  <div className="flex justify-between items-start gap-2">
                    <div className="flex-1 min-w-0">
                      <p className="text-[13px] font-bold text-brand-900 leading-tight truncate">{item.name}</p>
                      <p className="text-[11px] font-semibold text-brand-500 mt-0.5">{fmt(item.price)}</p>
                      
                      {/* Order slip summary */}
                      {item.slip && (
                        <div className="mt-1.5 text-[10px] text-brand-600 space-y-0.5 bg-brand-50 px-2 py-1.5 rounded-md border border-brand-100">
                          {hasCake({ id: item.productId }) ? (
                            <>
                              {item.slip.theme   && <p>🎨 <span className="font-bold text-brand-800">{item.slip.theme}</span> · {item.slip.flavor}</p>}
                              {item.slip.message && <p>✉️ {item.slip.message}</p>}
                            </>
                          ) : null}
                          {item.slip.others  && <p>📝 {item.slip.others}</p>}
                          {item.fileName     && <p className="truncate">📎 {item.fileName}</p>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-1 bg-brand-50 p-1 rounded-md border border-brand-100 shrink-0">
                      <button onClick={() => changeQty(idx, -1)} className="w-6 h-6 rounded bg-white border border-brand-200 flex items-center justify-center text-brand-700 shadow-sm font-black"><Minus size={12} /></button>
                      <span className="w-5 text-center text-[13px] font-black text-brand-900">{item.qty}</span>
                      <button onClick={() => changeQty(idx, 1)} className="w-6 h-6 rounded bg-white border border-brand-200 flex items-center justify-center text-brand-700 shadow-sm font-black"><Plus size={12} /></button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-brand-50">
                    <span className="text-[14px] font-black text-brand-900">{fmt(item.price * item.qty)}</span>
                    <button onClick={() => removeItem(idx)} className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50 transition-colors">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Totals + Actions */}
        <div className="shrink-0 border-t border-brand-200 bg-white">
          <div className="px-4 pt-2 space-y-1">

            {/* ACCORDION TOGGLE */}
            <button
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="w-full flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-brand-500 py-1.5 mb-1 bg-brand-50 rounded px-2 border border-brand-100"
            >
              <span>Discounts & Options {(additionalCharge || discountRate > 0 || collect50) ? ' (Active)' : ''}</span>
              {showAdvanced ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>

            {/* COLLAPSIBLE CONTENT */}
            {showAdvanced && (
              <div className="space-y-2 pb-2 pt-1">
                <div className="flex justify-between items-center text-[12px] font-bold text-brand-700">
                  <span>Additional Charge</span>
                  <input type="number" value={additionalCharge} min="0" onChange={e => setAdditionalCharge(e.target.value)} placeholder="0"
                    className="w-20 text-right text-[12px] border border-brand-200 rounded-md px-2 py-1 outline-none focus:border-brand-500 text-brand-900" />
                </div>
                
                <div className="flex flex-col border-t border-brand-100 pt-2">
                  <div className="flex justify-between items-center text-[12px] font-bold text-brand-700">
                    <span>Discount</span>
                    <select 
                      value={discountRate} 
                      onChange={e => setDiscountRate(Number(e.target.value))}
                      className="w-36 text-[11px] border border-brand-200 rounded-md pl-2 pr-8 py-1.5 outline-none focus:border-brand-500 text-brand-900 bg-white cursor-pointer"
                    >
                      <option value={0}>None (0%)</option>
                      <option value={0.20}>Promo (20%)</option>
                      <option value={0.10}>SpecialDisc(10%)</option>
                    </select>
                  </div>
                </div>

                {mode === 'preorder' && cartItems.length > 0 && (
                  <label className="flex items-center gap-2 pt-2 pb-1 cursor-pointer group border-t border-brand-100 mt-2">
                    <div onClick={() => setCollect50(v => !v)}
                      className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all shrink-0
                        ${collect50 ? 'bg-brand-700 border-brand-700' : 'border-brand-300 bg-white'}`}>
                      {collect50 && <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold text-brand-800 leading-tight">Collect 50% Deposit ngayon</p>
                      {collect50 && (
                        <p className="text-[9px] text-brand-500 mt-0.5">Deposit: {fmt(finalTotal * 0.5)} · Bal: {fmt(finalTotal * 0.5)}</p>
                      )}
                    </div>
                  </label>
                )}
              </div>
            )}

            <div className="flex justify-between items-center font-black text-brand-900 pt-2 border-t border-brand-200 mt-1">
              <span className="text-[13px]">GRAND TOTAL</span><span className="text-[18px]">{fmt(finalTotal)}</span>
            </div>
            {mode === 'preorder' && collect50 && cartItems.length > 0 && (
              <div className="flex justify-between items-center text-[12px] text-brand-600 font-bold -mt-0.5 pb-1">
                <span>Due ngayon (50%)</span>
                <span className="text-green-700 text-[13px]">{fmt(finalTotal * 0.5)}</span>
              </div>
            )}
          </div>
          <div className="px-3 pt-2 pb-3">
            <Button variant="dark" className="w-full py-3 text-[13px]" onClick={handleCharge} disabled={!cartItems.length}>
              {mode === 'preorder' ? 'Confirm Pre-Order' : 'Complete Order'}
            </Button>
          </div>
        </div>
      </div>

      {/* Modals */}
      {slipModal && (
        <PackageSlipModal product={slipModal} onClose={() => setSlipModal(null)} onConfirm={(product, slip, fileName, qty, price) => {
            setSlipModal(null); addToCart(product, slip, fileName, qty, price);
        }} />
      )}
      
      {celebModal && (
        <CelebrationSlipModal product={celebModal} onClose={() => setCelebModal(null)} onConfirm={(product, slip, fileName, qty, price) => {
            setCelebModal(null); addToCart(product, slip, fileName, qty, price);
        }} />
      )}

      <CheckoutModal
        isOpen={checkoutOpen} onClose={() => setCheckoutOpen(false)}
        cartItems={cartItems} finalTotal={finalTotal} mode={mode} collect50={collect50}
        preOrderData={{ pickupDate, pickupTime, additionalCharge: Number(additionalCharge || 0), discount: computedDiscount }}
        onFinalize={handleFinalize}
      />
    </div>
  );
}