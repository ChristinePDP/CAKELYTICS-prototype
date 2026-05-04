// ============================================================
// PRODUCT MODAL — Customer side (walang pagbabago sa layout)
// ============================================================
import { useState, useEffect } from 'react';

// Packages na may Themed Cake — kailangan ng cake-specific fields
const CAKE_PACKAGES = ['p1', 'p2', 'p3', 'p4', 'p5']; // A, B, C, D, E
const hasCake = (product) => CAKE_PACKAGES.includes(product.id);

export default function ProductModal({ product, onClose, onAddToCart }) {
  const [qty, setQty] = useState(1);
  const [fileName, setFileName] = useState('');
  const [slip, setSlip] = useState({ theme: '', flavor: '', message: '', others: '' });

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  if (!product) return null;

  const isPackage  = product.category === 'Package';
  const needsCake  = isPackage && hasCake(product);
  const s = (f, v) => setSlip(prev => ({ ...prev, [f]: v }));

  const handleAdd = () => {
    if (needsCake && (!slip.theme || !slip.flavor)) {
      alert('Mangyaring ilagay ang Motif/Theme at Flavor ng cake.');
      return;
    }
    const finalNote = isPackage
      ? [
          needsCake && `MOTIF/THEME: ${slip.theme}`,
          needsCake && `FLAVOR: ${slip.flavor}`,
          needsCake && slip.message && `CELEBRANT & MESSAGE: ${slip.message}`,
          slip.others && `OTHERS: ${slip.others}`,
        ].filter(Boolean).join('\n')
      : '';
    onAddToCart({ ...product, qty, note: finalNote, file: fileName });
    onClose();
  };

  const inputCls  = "w-full px-4 py-2.5 border border-[#EAE4E0] rounded-lg bg-[#FCFAF9] outline-none text-[13px] text-[#4A3B36] focus:border-[#5A453C] transition-colors";
  const labelCls  = "text-[13px] font-bold text-[#5A453C]";

  return (
    <div
      className="fixed inset-0 bg-[rgba(90,69,60,0.5)] z-[2000] flex items-center justify-center p-4"
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-white w-full max-w-[860px] rounded-3xl overflow-hidden shadow-2xl relative flex flex-row max-h-[90vh]">

        {/* LEFT — Image */}
        <div className="w-[45%] shrink-0 relative">
          <img src={product.image} alt={product.name} className="w-full h-full object-cover"
            onError={e => { e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80'; }} />
          <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h2 className="text-[22px] font-black text-white leading-tight mb-2">{product.name}</h2>
            {product.inclusion && (
              <ul className="list-none p-0 m-0 mb-3">
                {product.inclusion.split('\n').map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5 text-[12px] text-white/80">
                    <span className="text-white/60 shrink-0">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            )}
            <div className="text-[24px] font-black text-white">₱{(product.price * qty).toLocaleString()}</div>
          </div>
        </div>

        {/* RIGHT — Form */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <button
            className="absolute top-4 right-4 bg-white/90 border-none w-8 h-8 rounded-full text-[15px] cursor-pointer z-10 flex items-center justify-center text-[#5A453C] font-black shadow-sm hover:bg-white"
            onClick={onClose}
          >✕</button>

          <div className="flex-1 overflow-y-auto px-7 py-7">
            {isPackage ? (
              <div className="flex flex-col gap-4">
                <h3 className="text-[11px] font-black text-[#9E8F88] uppercase tracking-[0.12em]">
                  {needsCake ? 'Cake Order Slip Details' : 'Package Details'}
                </h3>

                {/* Cake-specific fields — only for packages with cake */}
                {needsCake && (
                  <>
                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Motiff/Theme <span className="text-red-500">*</span></label>
                      <input type="text" className={inputCls} placeholder="e.g. Spiderman, Minimalist Pink"
                        value={slip.theme} onChange={e => s('theme', e.target.value)} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Flavor <span className="text-red-500">*</span></label>
                      <input type="text" className={inputCls} placeholder="e.g. Chocolate, Vanilla"
                        value={slip.flavor} onChange={e => s('flavor', e.target.value)} />
                    </div>

                    <div className="flex flex-col gap-1.5">
                      <label className={labelCls}>Name of Celebrant & Message</label>
                      <textarea className={`${inputCls} resize-none`} rows={2}
                        placeholder="e.g. Happy 7th Birthday, AJ!"
                        value={slip.message} onChange={e => s('message', e.target.value)} />
                    </div>

                    <div className="flex flex-col gap-1.5">
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
                )}

                {/* Others — applicable sa lahat ng package */}
                <div className="flex flex-col gap-1.5">
                  <label className={labelCls}>Others / Special Requests</label>
                  <input type="text" className={inputCls} placeholder="Additional requests..."
                    value={slip.others} onChange={e => s('others', e.target.value)} />
                </div>

                {/* Info kung walang cake fields */}
                {!needsCake && (
                  <p className="text-[12px] text-[#9E8F88] bg-[#F5EFEB] px-3 py-2.5 rounded-lg">
                    ℹ️ This package does not include a themed cake — no design details needed.
                  </p>
                )}
              </div>
            ) : (
              <p className="text-[#9E8F88] text-[13px]">Freshly baked treats for you.</p>
            )}
          </div>

          {/* Footer — qty + add */}
          <div className="shrink-0 px-7 py-5 border-t border-[#EAE4E0] bg-white flex items-center gap-3">
            <div className="flex items-center gap-1.5 border border-[#EAE4E0] rounded-full px-3 py-2 shrink-0">
              <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-7 h-7 flex items-center justify-center border-none bg-transparent text-[#5A453C] text-xl font-black cursor-pointer">−</button>
              <span className="font-black text-[15px] text-[#5A453C] w-6 text-center tabular-nums">{qty}</span>
              <button onClick={() => setQty(q => q + 1)} className="w-7 h-7 flex items-center justify-center border-none bg-transparent text-[#5A453C] text-xl font-black cursor-pointer">+</button>
            </div>
            <button
              className="flex-1 bg-[#5A453C] text-white py-3 border-none cursor-pointer text-[14px] font-bold rounded-full hover:bg-[#4A3B36]"
              onClick={handleAdd}
            >
              Add to Cart — ₱{(product.price * qty).toLocaleString()}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}