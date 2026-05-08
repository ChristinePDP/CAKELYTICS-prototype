import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerHeader, CustomerFooter } from './CustomerLayout';
import ProductModal from './ProductModal';
import { PRODUCTS } from '../../data/dummyData';

const CATEGORY_ORDER = ['Pastry', 'Package', 'Celebration Material'];

// ─── PASTRY CARD ─────────────────────────────────────────────
function PastryCard({ product, onAddToCart }) {
  const outOfStock = product.stock === 0;
  return (
    <div className={`flex flex-col ${outOfStock ? 'opacity-60' : ''}`}>
      <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-3 shadow-md border border-[#EAE4E0]">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        {outOfStock && (
          <div className="absolute inset-0 bg-[#4A3B36]/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <div className="text-[13px] font-black tracking-widest uppercase text-[#4A3B36] mb-1 leading-snug">{product.name}</div>
        {!outOfStock ? (
          <div className="flex items-center justify-between mt-auto pt-1 gap-2">
            <div className="text-[13px] text-[#5A453C] font-extrabold">₱{product.price.toLocaleString()}</div>
            <button onClick={() => onAddToCart({ ...product, qty: 1, note: '', file: '' })}
              className="bg-[#5A453C] text-white px-3 py-1 border-none rounded-md text-[11px] font-bold tracking-wide uppercase cursor-pointer hover:bg-[#4A3B36]">
              Add to Cart
            </button>
          </div>
        ) : (
          <div className="mt-auto text-center text-red-400 font-bold text-[11px] uppercase tracking-wide py-1.5 bg-red-50 rounded-md">Unavailable</div>
        )}
      </div>
    </div>
  );
}

// ─── PACKAGE CARD ─────────────────────────────────────────────
function PackageCard({ product, onOpen }) {
  const outOfStock = product.stock === 0;
  return (
    <div className={`flex flex-col ${outOfStock ? 'opacity-60' : ''}`}>
      <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-3 shadow-md border border-[#EAE4E0]">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 bg-[#5A453C]/90 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Pre-Order</span>
        {outOfStock && (
          <div className="absolute inset-0 bg-[#4A3B36]/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <div className="text-[13px] font-black tracking-widest uppercase text-[#4A3B36] mb-1 leading-snug">{product.name}</div>
        <div className="flex items-center justify-between mt-auto pt-1 gap-2">
          <div className="text-[13px] text-[#5A453C] font-bold">₱{product.price.toLocaleString()}</div>
          {!outOfStock && (
            <button onClick={() => onOpen(product)}
              className="bg-[#5A453C] text-white text-[11px] font-bold tracking-wide uppercase px-4 py-1.5 rounded-md border-none cursor-pointer hover:bg-[#4A3B36]">
              Add to Cart
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── CELEBRATION MATERIAL CARD ────────────────────────────────
function CelebrationCard({ product, onOpen }) {
  const outOfStock = product.stock === 0;
  return (
    <div className={`flex flex-col ${outOfStock ? 'opacity-60' : ''}`}>
      <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-3 shadow-md border border-[#EAE4E0]">
        <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
        <span className="absolute top-2 left-2 bg-[#5A453C]/90 text-white text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full">Pre-Order</span>
        {outOfStock && (
          <div className="absolute inset-0 bg-[#4A3B36]/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Out of Stock</span>
          </div>
        )}
      </div>
      <div className="flex flex-col flex-grow">
        <div className="text-[13px] font-black tracking-widest uppercase text-[#4A3B36] mb-1 leading-snug">{product.name}</div>
        <div className="flex items-center justify-between mt-auto pt-1 gap-2">
          <div className="text-[13px] text-[#5A453C] font-extrabold">₱{product.price.toLocaleString()}</div>
          {!outOfStock && (
            <button onClick={() => onOpen(product)}
              className="bg-[#5A453C] text-white px-3 py-1 border-none rounded-md text-[11px] font-bold tracking-wide uppercase cursor-pointer hover:bg-[#4A3B36]">
              Add to Cart
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
    let note = '';
    let filesStr = '';

    if (isTarp) {
      note = `Size: ${selectedVariant.label}${tarpNote ? ' | Instructions: ' + tarpNote : ''}`;
      if (uploadedFiles.length > 0) {
        filesStr = uploadedFiles.map(f => f.name).join(', ');
      }
    } else {
      const colorVal = colorType === 'Specific Color(s)' ? specificColors : 'Assorted Colors';
      note = `Size: ${balloonSize} | Color: ${colorVal}${printRequest ? ' | Print: ' + printRequest : ''}`;
    }

    onConfirm({ 
      ...product, 
      price: basePrice, 
      qty: isTarp ? 1 : qty, 
      note, 
      file: filesStr 
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-[rgba(90,69,60,0.55)] z-[2000] flex items-center justify-center p-4">
      <div className="bg-white w-full max-w-[420px] rounded-3xl shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        
        {/* Header */}
        <div className="px-7 pt-7 pb-4 border-b border-[#EAE4E0] flex justify-between shrink-0">
          <div>
            <p className="text-[11px] font-black text-[#9E8F88] uppercase tracking-widest">Order Slip</p>
            <h2 className="text-[20px] font-black text-[#4A3B36]">{product.name}</h2>
          </div>
          <button onClick={onClose} className="bg-[#F5EFEB] border-none w-8 h-8 rounded-full cursor-pointer text-[#5A453C] flex items-center justify-center font-black">✕</button>
        </div>

        {/* Content Form */}
        <div className="flex-1 overflow-y-auto px-7 py-5 space-y-5">
          
          {/* Kung Tarpaulin */}
          {isTarp ? (
            <>
              <div>
                <label className="text-[13px] font-bold text-[#5A453C] mb-2 block">Select Size</label>
                <select 
                  className="w-full px-4 py-2.5 border border-[#EAE4E0] rounded-lg text-[13px] bg-white outline-none focus:border-[#5A453C]"
                  value={selectedVariant?.label}
                  onChange={(e) => setSelectedVariant(product.variants.find(v => v.label === e.target.value))}
                >
                  {product.variants.map(v => <option key={v.label} value={v.label}>{v.label} — ₱{v.price}</option>)}
                </select>
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#5A453C] mb-2 block">Upload Photos for Layout</label>
                <div className="flex flex-col">
                  <div className="flex items-center gap-3 mb-2">
                    <label className="flex items-center gap-2 px-4 py-2 bg-[#F5EFEB] text-[#5A453C] border border-[#D6C5BE] rounded-lg cursor-pointer hover:bg-[#EAE4E0] transition-colors">
                      <span className="text-[12px] font-bold">Choose Files</span>
                      <input type="file" multiple accept="image/*" className="hidden" onChange={handleFileChange} />
                    </label>
                    <span className="text-[12px] text-[#9E8F88]">
                      {uploadedFiles.length === 0 ? 'No file chosen' : `${uploadedFiles.length} file(s) selected`}
                    </span>
                  </div>
                  
                  {/* Filename List Display */}
                  {uploadedFiles.length > 0 && (
                    <div className="flex flex-col gap-1.5 max-h-32 overflow-y-auto pr-1">
                      {uploadedFiles.map((f, i) => (
                        <div key={i} className="flex items-center justify-between bg-[#FCFAF9] px-3 py-2.5 rounded-lg border border-[#EAE4E0]">
                          <div className="flex items-center gap-2 truncate pr-2">
                            <span className="shrink-0 text-[#C4B5AE]">📎</span>
                            <span className="text-[12px] font-medium text-[#796860] truncate">{f.name}</span>
                          </div>
                          <button 
                            type="button"
                            onClick={() => removeFile(i)}
                            className="text-[#9E8F88] hover:text-red-500 font-bold shrink-0 text-[14px] px-1 border-none bg-transparent cursor-pointer"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[13px] font-bold text-[#5A453C] mb-2 block">Layout Instructions</label>
                <textarea className="w-full px-4 py-3 border border-[#EAE4E0] rounded-lg text-[13px] resize-none outline-none focus:border-[#5A453C]" rows={3} 
                  placeholder="e.g. Happy 1st Birthday AJ, Blue Theme" value={tarpNote} onChange={e => setTarpNote(e.target.value)} />
              </div>
            </>
          ) : (
            /* Kung Balloons */
            <>
              <div>
                <label className="text-[13px] font-bold text-[#5A453C] mb-2 block">Quantity</label>
                <div className="flex items-center gap-3">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-9 h-9 rounded-lg border border-[#EAE4E0] bg-white font-black text-[#5A453C] hover:bg-[#F5EFEB] flex items-center justify-center">−</button>
                  <span className="text-[18px] font-black text-[#4A3B36] w-8 text-center">{qty}</span>
                  <button onClick={() => setQty(q => q + 1)} className="w-9 h-9 rounded-lg border border-[#EAE4E0] bg-white font-black text-[#5A453C] hover:bg-[#F5EFEB] flex items-center justify-center">+</button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[13px] font-bold text-[#5A453C] mb-2 block">Size</label>
                  <select 
                    className="w-full px-3 py-2.5 border border-[#EAE4E0] rounded-lg text-[13px] bg-white outline-none focus:border-[#5A453C]"
                    value={balloonSize} onChange={e => setBalloonSize(e.target.value)}
                  >
                    <option value="10 inches (Standard)">10" (Standard)</option>
                    <option value="12 inches (Large)">12" (Large)</option>
                  </select>
                </div>
                <div>
                  <label className="text-[13px] font-bold text-[#5A453C] mb-2 block">Color Set</label>
                  <select 
                    className="w-full px-3 py-2.5 border border-[#EAE4E0] rounded-lg text-[13px] bg-white outline-none focus:border-[#5A453C]"
                    value={colorType} onChange={e => setColorType(e.target.value)}
                  >
                    <option value="Assorted Colors">Assorted</option>
                    <option value="Specific Color(s)">Specific Color</option>
                  </select>
                </div>
              </div>

              {colorType === 'Specific Color(s)' && (
                <div>
                  <label className="text-[13px] font-bold text-[#5A453C] mb-2 block">Specify Color(s)</label>
                  <input type="text" className="w-full px-4 py-2 border border-[#EAE4E0] rounded-lg text-[13px] outline-none focus:border-[#5A453C]"
                    placeholder="e.g. Red and White only" value={specificColors} onChange={e => setSpecificColors(e.target.value)} />
                </div>
              )}

              <div>
                <label className="text-[13px] font-bold text-[#5A453C] mb-2 block">Print Details</label>
                <input type="text" className="w-full px-4 py-2.5 border border-[#EAE4E0] rounded-lg text-[13px] bg-white outline-none focus:border-[#5A453C]"
                  placeholder="e.g. Happy Birthday, I Love You, etc." value={printRequest} onChange={e => setPrintRequest(e.target.value)} />
              </div>
            </>
          )}

        </div>

        {/* Footer */}
        <div className="px-7 py-5 border-t border-[#EAE4E0] bg-white shrink-0">
          <button onClick={handleConfirm} className="w-full bg-[#5A453C] text-white py-3.5 rounded-full font-bold text-[14px] hover:bg-[#4A3B36] transition-colors border-none cursor-pointer">
            Add to Cart — ₱{totalPrice.toLocaleString()}
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN CUSTOMER MENU ───────────────────────────────────────
export default function CustomerMenu({ cart, setCart }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('All');
  const [modal, setModal] = useState(null); 
  const [celebModal, setCelebModal] = useState(null); 

  const addToCart = (item) => {
    setCart(prev => {
      const idx = prev.findIndex(i => i.id === item.id && i.note === item.note && i.file === item.file);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], qty: next[idx].qty + item.qty };
        return next;
      }
      return [...prev, item];
    });
  };

  // ─── IBINALIK: CART CONTROLS ───
  const changeQty = (index, delta) => {
    setCart(prev => prev.map((item, i) => {
      if (i === index) {
        return { ...item, qty: item.qty + delta };
      }
      return item;
    }).filter(i => i.qty > 0)); // Automatic remove if qty hits 0
  };

  const removeItem = (index) => {
    setCart(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="bg-[#FCFAF9] min-h-screen">
      <CustomerHeader page="menu" cartCount={cart.reduce((s, i) => s + i.qty, 0)} />

      {/* ── Category Filter ── */}
      <div className="sticky top-[80px] z-50 bg-white border-b border-[#EAE4E0] py-4">
        <div className="max-w-[1400px] mx-auto px-6 flex gap-2 overflow-x-auto no-scrollbar">
          {['All', ...CATEGORY_ORDER].map(cat => (
            <button key={cat} onClick={() => setActiveTab(cat)}
              className={`px-6 py-2 rounded-full text-[12px] font-black uppercase tracking-widest whitespace-nowrap transition-all border-none cursor-pointer
                ${activeTab === cat ? 'bg-[#5A453C] text-white' : 'bg-[#F5EFEB] text-[#9E8F88] hover:bg-[#EAE4E0]'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto py-10 px-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-10">
        
        {/* ── Products List ── */}
        <div className="space-y-12">
          {CATEGORY_ORDER.map(cat => {
            if (activeTab !== 'All' && activeTab !== cat) return null;
            const items = PRODUCTS.filter(p => p.category === cat && p.active);
            if (!items.length) return null;

            return (
              <section key={cat}>
                <div className="border-b-2 border-[#EAE4E0] pb-2 mb-6">
                  <h2 className="text-[14px] font-black uppercase tracking-widest text-[#9E8F88]">{cat}</h2>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {items.map(p => {
                    if (p.category === 'Pastry') return <PastryCard key={p.id} product={p} onAddToCart={addToCart} />;
                    if (p.category === 'Package') return <PackageCard key={p.id} product={p} onOpen={setModal} />;
                    return <CelebrationCard key={p.id} product={p} onOpen={setCelebModal} />;
                  })}
                </div>
              </section>
            );
          })}
        </div>

        {/* ── Sidebar Cart ── */}
        <div className="bg-white p-8 rounded-3xl border border-[#EAE4E0] h-fit sticky top-[160px] flex flex-col max-h-[calc(100vh-180px)]">
          <h3 className="text-xl font-black text-[#4A3B36] mb-6 shrink-0">Your Cart</h3>
          
          {cart.length === 0 ? (
            <p className="text-[#9E8F88] text-[14px] mb-6">Your cart is empty. Add items from the menu.</p>
          ) : (
            <>
              {/* Ginawang scrollable ang mismong cart items list para hindi mahaba pababa */}
              <div className="space-y-3 mb-6 overflow-y-auto pr-2 custom-scrollbar flex-1">
                {cart.map((item, i) => (
                  <div key={i} className="flex justify-between items-start bg-[#FCFAF9] p-4 rounded-2xl border border-[#EAE4E0]">
                    <div className="flex-1 pr-3 min-w-0">
                      <span className="font-bold text-[#5A453C] block text-[14px] truncate">{item.name}</span>
                      <span className="text-[#9E8F88] font-bold text-[12px] block mt-0.5">₱{item.price.toLocaleString()}</span>
                      
                      {item.note && <p className="text-[11px] text-[#9E8F88] leading-snug mt-1.5 line-clamp-2">📝 {item.note}</p>}
                      {item.file && <p className="text-[11px] text-[#8C6B22] leading-snug mt-1 line-clamp-1">📎 {item.file}</p>}

                      {/* Controls Area */}
                      <div className="flex items-center gap-3 mt-3">
                        <div className="flex items-center gap-1 bg-white border border-[#EAE4E0] rounded-lg px-1.5 py-1">
                          <button onClick={() => changeQty(i, -1)} className="w-6 h-6 flex items-center justify-center text-[#5A453C] font-black hover:bg-[#F5EFEB] rounded-md transition-colors border-none cursor-pointer">−</button>
                          <span className="w-5 text-center text-[13px] font-black text-[#4A3B36]">{item.qty}</span>
                          <button onClick={() => changeQty(i, 1)} className="w-6 h-6 flex items-center justify-center text-[#5A453C] font-black hover:bg-[#F5EFEB] rounded-md transition-colors border-none cursor-pointer">+</button>
                        </div>
                        <button onClick={() => removeItem(i)} className="text-red-400 hover:text-red-600 text-[11px] uppercase tracking-wider font-black bg-transparent border-none cursor-pointer">
                          Remove
                        </button>
                      </div>
                    </div>
                    {/* Item Total Price */}
                    <span className="font-black text-[#4A3B36] text-[15px] shrink-0">₱{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              
              <div className="border-t border-[#EAE4E0] pt-5 mb-6 flex justify-between font-black text-[16px] text-[#4A3B36] shrink-0">
                <span>Total</span>
                <span className="text-[20px]">₱{cart.reduce((s, i) => s + i.price * i.qty, 0).toLocaleString()}</span>
              </div>
              
              <button onClick={() => navigate('/customer/checkout')} className="w-full bg-[#5A453C] text-white py-4 rounded-xl font-black text-[14px] uppercase tracking-wider hover:bg-[#4A3B36] transition-colors border-none cursor-pointer shrink-0 shadow-lg shadow-[#5A453C]/20">
                Checkout Now
              </button>
            </>
          )}
        </div>
      </div>

      {modal && <ProductModal product={modal} onClose={() => setModal(null)} onAddToCart={addToCart} />}
      {celebModal && <CelebrationSlipModal product={celebModal} onClose={() => setCelebModal(null)} onConfirm={addToCart} />}
      <CustomerFooter />
    </div>
  );
}