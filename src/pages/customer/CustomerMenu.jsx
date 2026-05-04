// ============================================================
// CUSTOMER MENU PAGE — Bigger fonts, styled Customize badge
// ============================================================
import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { CustomerHeader, CustomerFooter } from './CustomerLayout';
import ProductModal from './ProductModal';
import { PRODUCTS, CATEGORIES } from '../../data/dummyData';

function PastryCard({ product, onAddToCart }) {
  const outOfStock = product.stock === 0;

  return (
    <div className={`flex flex-col ${outOfStock ? 'opacity-60' : ''}`}>
      <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-3 shadow-md border border-[#EAE4E0]">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80'; }}
        />
        {outOfStock && (
          <div className="absolute inset-0 bg-[#4A3B36]/60 flex items-center justify-center">
            <span className="text-white text-xs font-bold tracking-widest uppercase">Out of Stock</span>
          </div>
        )}
      </div>

      <div className="flex flex-col flex-grow">
        <div className="text-[13px] font-black tracking-widest uppercase text-[#4A3B36] mb-1 leading-snug">{product.name}</div>

        {product.inclusion && (
          <ul className="list-none p-0 m-0 mb-2 space-y-0.5">
            {product.inclusion.split('\n').map((item, idx) => (
              <li key={idx} className="flex items-start gap-1 text-[12px] text-[#9E8F88]">
                <span className="text-[#C4B5AE] shrink-0">•</span>
                <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
        )}

        {!outOfStock ? (
          <div className="flex items-center justify-between mt-auto pt-1 gap-2">
            <div className="text-[13px] text-[#5A453C] font-extrabold">₱{product.price.toLocaleString()}</div>
            <button
              onClick={() => onAddToCart({ ...product, qty: 1, note: '', file: '' })}
              className="bg-[#5A453C] text-white px-3 py-1 border-none rounded-md text-[11px] font-bold tracking-wide uppercase cursor-pointer hover:bg-[#4A3B36] shrink-0"
            >
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

function CartSidebar({ cart, onQtyChange, onClear, onCheckout, cartRef }) {
  const totalAmount = cart.reduce((s, i) => s + i.price * i.qty, 0);
  const hasItems = cart.length > 0;
  const hasPackage = cart.some(i => i.category === 'Package'); // ← BAGO

  return (
    <aside className="bg-white border border-[#EAE4E0] rounded-2xl shadow-sm sticky top-[200px] flex flex-col h-fit max-h-[calc(100vh-220px)] z-10 overflow-hidden" ref={cartRef}>
      <div className="flex justify-between items-center border-b border-[#EAE4E0] px-6 py-5 shrink-0 bg-white">
        <h3 className="text-xl font-black text-[#5A453C]">Your Cart</h3>
        {hasItems && <button className="bg-none border-none text-[13px] text-red-500 font-bold cursor-pointer hover:opacity-70" onClick={onClear}>Clear All</button>}
      </div>

      {!hasItems ? (
        <div className="flex-grow flex flex-col items-center justify-center text-[#9E8F88] font-medium py-12 px-6">
          <svg fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24"
            style={{ width: 64, height: 64, opacity: 0.2, marginBottom: 12, color: '#5A453C' }}>
            <path d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"/>
          </svg>
          <p className="text-center">Your cart is empty.<br />Add items from the menu.</p>
        </div>
      ) : (
        <>
          <div className="flex-grow overflow-y-auto px-6 py-2 custom-scrollbar min-h-0 bg-white">
            {cart.map((item, index) => (
              <div key={index} className="flex justify-between items-center py-4 border-b border-[#EAE4E0] gap-3 last:border-b-0">
                <div className="flex-grow">
                  <div className="text-[15px] font-bold text-[#5A453C] mb-0.5">{item.name}</div>
                  <div className="text-[13px] text-[#9E8F88] font-bold">₱{(item.price * item.qty).toLocaleString()}</div>
                  {item.note && <div className="text-[11px] text-[#9E8F88] italic font-medium mt-1">📝 {item.note}</div>}
                  {item.file && <div className="text-[11px] text-[#9E8F88] italic font-medium">📎 {item.file}</div>}
                </div>
                <div className="flex items-center gap-1.5 border border-[#EAE4E0] rounded-xl px-2 py-1.5 bg-white shrink-0 shadow-sm">
                  <button onClick={() => onQtyChange(index, -1)} className="bg-none border-none cursor-pointer font-black w-6 h-6 flex items-center justify-center text-[#5A453C] text-lg hover:text-black">−</button>
                  <span className="font-bold text-[14px] text-[#5A453C] w-5 text-center">{item.qty}</span>
                  <button onClick={() => onQtyChange(index, 1)} className="bg-none border-none cursor-pointer font-black w-6 h-6 flex items-center justify-center text-[#5A453C] text-lg hover:text-black">+</button>
                </div>
              </div>
            ))}
          </div>

          <div className="shrink-0 bg-[#FCFAF9] p-6 border-t border-[#EAE4E0]">
            {/* ── BAGO: Package reminder ── */}
            {hasPackage && (
  <div className="bg-[#FFF8E7] border border-[#F3D79A] text-[#8C6B22] px-3 py-2.5 rounded-lg mb-4 text-[11px] font-semibold flex items-start gap-2 leading-relaxed">
    ⚠️ May Package sa iyong order — Pre-Order required (2 days prep). Hindi pwede ang Order Now.
  </div>
)}

            <div className="flex justify-between text-[14px] mb-2 text-[#9E8F88] font-semibold">
              <span>Subtotal</span><span>₱{totalAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-lg font-black text-[#5A453C] border-t border-[#EAE4E0] pt-3 mt-1">
              <span>Total</span><span>₱{totalAmount.toLocaleString()}</span>
            </div>
            <button className="w-full mt-5 bg-[#5A453C] text-white py-3.5 border-none cursor-pointer font-bold text-[15px] rounded-lg hover:bg-[#4A3B36] shadow-md" onClick={onCheckout}>
              Proceed to Checkout
            </button>
          </div>
        </>
      )}
    </aside>
  );
}

export default function CustomerMenu({ cart, setCart }) {
  const navigate = useNavigate();
  const cartRef  = useRef(null);
  const [modal, setModal] = useState(null);

  const totalItems  = cart.reduce((s, i) => s + i.qty, 0);
  const totalAmount = cart.reduce((s, i) => s + i.price * i.qty, 0);

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

  const changeQty = (index, delta) => {
    setCart(prev => prev.map((item, i) => i === index ? { ...item, qty: item.qty + delta } : item).filter(i => i.qty > 0));
  };

  return (
    <>
      <style>{`
        ::-webkit-scrollbar { display: none; }
        html, body { -ms-overflow-style: none; scrollbar-width: none; }
        .custom-scrollbar::-webkit-scrollbar { display: block; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: #EAE4E0; border-radius: 4px; }
      `}</style>

      <div className="font-sans bg-[#FCFAF9] text-[#4A3B36] leading-relaxed min-h-screen antialiased">
        <CustomerHeader page="menu" cartCount={totalItems} cartTotal={totalAmount} onCartClick={() => cartRef.current?.scrollIntoView({ behavior: 'smooth' })} />

        <div className="max-w-[1400px] mx-auto my-8 px-6 grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start relative">
          <div>
            <div className="mb-6">
              <h2 className="text-3xl font-black text-[#5A453C]">Our Menu</h2>
            </div>

            {CATEGORIES.filter(c => c !== 'All').map(cat => {
              const items = PRODUCTS.filter(p => p.category === cat && p.active);
              if (!items.length) return null;

              return (
                <div key={cat} className="mb-10">
                  <div className="text-xs font-black tracking-[0.1em] uppercase text-[#9E8F88] mb-4 border-b-2 border-[#EAE4E0] pb-2">{cat}</div>

                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-x-5 gap-y-8">
                    {items.map(p => {
                      const isPackage = p.category === 'Package';
                      const outOfStock = p.stock === 0;

                      if (!isPackage) {
                        return <PastryCard key={p.id} product={p} onAddToCart={addToCart} />;
                      }

                      // Package card
                      return (
                        <div
                          key={p.id}
                          className={`flex flex-col ${outOfStock ? 'opacity-60' : ''}`}
                        >
                          <div className="relative w-full aspect-square overflow-hidden rounded-lg mb-3 shadow-md border border-[#EAE4E0]">
                            <img src={p.image} alt={p.name} className="w-full h-full object-cover" loading="lazy"
                              onError={e => { e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80'; }} />
                            {outOfStock && (
                              <div className="absolute inset-0 bg-[#4A3B36]/60 flex items-center justify-center">
                                <span className="text-white text-xs font-bold tracking-widest uppercase">Out of Stock</span>
                              </div>
                            )}
                          </div>

                          <div className="flex flex-col flex-grow">
                            <div className="text-[13px] font-black tracking-widest uppercase text-[#4A3B36] mb-1 leading-snug">{p.name}</div>

                            {p.inclusion && (
                              <ul className="list-none p-0 m-0 mb-2 space-y-0.5">
                                {p.inclusion.split('\n').map((item, idx) => (
                                  <li key={idx} className="flex items-start gap-1 text-[12px] text-[#9E8F88]">
                                    <span className="text-[#C4B5AE] shrink-0">•</span>
                                    <span className="line-clamp-1">{item}</span>
                                  </li>
                                ))}
                              </ul>
                            )}

                            <div className="flex items-center justify-between mt-auto pt-1 gap-2">
                              <div className="text-[13px] text-[#5A453C] font-bold">₱{p.price.toLocaleString()}</div>
                              {!outOfStock && (
                                <button
                                  onClick={() => setModal(p)}
                                  className="bg-[#5A453C] text-white text-[11px] font-bold tracking-wide uppercase px-4 py-1.5 rounded-md shrink-0 border-none cursor-pointer hover:bg-[#4A3B36]"
                                >
                                  Add to Cart
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>

          <CartSidebar cart={cart} onQtyChange={changeQty} onClear={() => setCart([])} onCheckout={() => navigate('/customer/checkout')} cartRef={cartRef} />
        </div>

        {modal && <ProductModal product={modal} onClose={() => setModal(null)} onAddToCart={addToCart} />}
        <CustomerFooter />
      </div>
    </>
  );
}