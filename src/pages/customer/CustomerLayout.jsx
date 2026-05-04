// ============================================================
// CUSTOMER LAYOUT — Header + Steps + Footer
// Used by all customer-facing pages
// ============================================================
import { Link, useLocation, useNavigate } from 'react-router-dom';
import logoImage from '../../assets/images/427bffe9-d983-4566-9ec9-de6c2b1bdaa2-removebg-preview.png';

// ─── Progress Steps ───────────────────────────────────────────
function OrderSteps({ page }) {
  const steps = [
    { id: 1, label: 'Select Items' },
    { id: 2, label: 'Details' },
    { id: 3, label: 'Payment' },
    { id: 4, label: 'Complete', isCheck: true },
  ];

  const getState = (stepId) => {
    if (page === 'menu') {
      return stepId === 1 ? 'active' : '';
    }
    if (page === 'checkout') {
      // Step 1 check na, Step 2 at 3 active kasi nandito ka na
      return stepId === 1 ? 'completed' : (stepId <= 3 ? 'active' : '');
    }
    if (page === 'confirm') {
      return 'completed'; 
    }
    return '';
  };

  const showSteps = ['menu', 'checkout', 'confirm'].includes(page);
  if (!showSteps) return null;

  return (
    <div className="bg-white py-3 sm:py-4 overflow-hidden relative z-20">
      <div className="max-w-3xl mx-auto px-4 relative">
        <div className="absolute top-[20px] left-[15%] right-[15%] h-[2px] bg-[#EAE4E0]"></div>

        <div className="flex justify-between relative z-10">
          {steps.map((s, i) => {
            const state = getState(s.id);
            return (
              <div key={s.id} className="flex flex-col items-center gap-1.5 flex-1">
                {/* INAYOS: Tinanggal yung default bg-white sa base class para gumana yung dark bg pag completed */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-[15px] transition-all relative ${ state === 'completed' ? 'bg-[#5A453C] border-2 border-[#5A453C] text-white shadow-sm' : state === 'active' ? 'bg-white border-2 border-[#5A453C] text-[#5A453C] shadow-[0_0_0_4px_#E8E2DD]' : 'bg-white border-2 border-[#EAE4E0] text-[#9E8F88]' }`}>
                  
                  {/* INAYOS: Checkmark icon lalabas pag state ay completed */}
                  {state === 'completed' || s.isCheck
                    ? <svg width="22" height="22" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M20 6L9 17l-5-5"/></svg>
                    : s.id
                  }
                </div>
                <div className={`text-[12px] sm:text-[14px] font-bold text-center ${ state === 'completed' || state === 'active' ? 'text-[#4A3B36]' : 'text-[#9E8F88]' }`}>
                  {s.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Header ───────────────────────────────────────────────────
export function CustomerHeader({ cartCount, cartTotal, onCartClick, page }) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-[1000] shadow-sm flex flex-col">
      <div className="bg-[#3B1F0A]">
        <div className="w-full mx-auto px-20 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer no-underline" onClick={() => navigate('/customer')}>
            <div className="w-25 h-16 overflow-hidden flex items-center justify-center border-1 border-[#E8E2DD]">
                <img 
                    src={logoImage} 
                    alt="Aileen & Niculus" 
                    className="w-full h-full object-contain" 
                />
            </div>
            <div>
              <div className="font-black text-xl text-white leading-">Aileen Cake Max</div>
              <div className="text-[10px] text-[#E8E2DD] tracking-[0.1em] uppercase">Bake Shop</div>
            </div>
          </div>

          <nav className="flex gap-8 items-center">
            <span className={`text-white/80 text-sm font-semibold cursor-pointer transition-all relative no-underline ${ page === 'home' ? 'text-white' : 'hover:text-white' }`} onClick={() => navigate('/customer')}>
              Home
              {page === 'home' && <div className="absolute bottom-[-4px] left-0 w-full h-0.5 bg-[#E8E2DD]"></div>}
            </span>
            <span className={`text-white/80 text-sm font-semibold cursor-pointer transition-all relative no-underline ${ page === 'menu' ? 'text-white' : 'hover:text-white' }`} onClick={() => navigate('/customer/menu')}>
              Menu
              {page === 'menu' && <div className="absolute bottom-[-4px] left-0 w-full h-0.5 bg-[#E8E2DD]"></div>}
            </span>
          </nav>
        </div>
      </div>
      <OrderSteps page={page} />
    </header>
  );
}

export const CustomerFooter = () => {
  return (
    <footer className="w-full bg-[#3B1F0A] pt-10 pb-6 relative overflow-hidden border-t border-white/5">
  {/* ── Decorative Background Circles (Admin Style) ── */}
  <div className="absolute top-[-30px] right-[-30px] w-48 h-48 rounded-full bg-white/[0.02] pointer-events-none" />
  <div className="absolute bottom-[-20px] left-[-20px] w-32 h-32 rounded-full bg-black/[0.1] pointer-events-none" />

  <div className="max-w-[1200px] mx-auto px-6 relative z-10">
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mb-10">
      
      {/* Column 1: Branding */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <img 
            src={logoImage} 
            alt="Logo" 
            className="h-10 w-auto brightness-110" 
          />
          <div className="leading-none">
            <h1 className="text-white font-serif text-lg font-bold tracking-tight">Aileen Cake Max</h1>
            <p className="text-[#D4A87A] text-[8px] uppercase tracking-[0.2em] font-semibold">Bake Shop</p>
          </div>
        </div>
        <p className="text-white text-[12px] leading-relaxed max-w-[240px] font-light">
          Handcrafting moments of joy through artisan cakes and pastries in the heart of Calaca, Batangas.
        </p>
      </div>

      {/* Column 2: Quick Links (Added for a fuller but clean look) */}
      <div>
        <h4 className="text-[#D4A87A] text-[10px] uppercase tracking-[0.2em] font-bold mb-5">Explore</h4>
        <ul className="flex flex-col gap-2 text-[12px] text-white">
          <li className="hover:text-white transition-colors cursor-pointer">Menu</li>
          
        </ul>
      </div>

      {/* Column 3: Contact */}
      <div>
        <h4 className="text-[#D4A87A] text-[10px] uppercase tracking-[0.2em] font-bold mb-5">Contact Us</h4>
        <ul className="flex flex-col gap-3 text-[12px] text-white">
          <li className="flex items-center gap-2">
            <span className="opacity-50 text-[10px]">📞</span> 0912-345-6789
          </li>
          <li className="flex items-center gap-2">
            <span className="opacity-50 text-[10px]">✉️</span> hello@aileencakemax.com
          </li>
        </ul>
      </div>

      {/* Column 4: Schedule */}
      <div>
        <h4 className="text-[#D4A87A] text-[10px] uppercase tracking-[0.2em] font-bold mb-5">Shop Hours</h4>
        <ul className="flex flex-col gap-2 text-[11px] text-white">
          <li className="flex justify-between items-center pb-1 border-b border-white">
            <span>Mon - Fri</span>
            <span className="text-white font-medium">8:00 AM - 6:00 PM</span>
          </li>
          <li className="flex justify-between items-center pb-1 border-b border-white">
            <span>Saturday</span>
            <span className="text-white font-medium">9:00 AM - 5:00 PM</span>
          </li>
          <li className="flex justify-between items-center">
            <span>Sunday</span>
            <span className="text-red-400/70 font-medium">Closed</span>
          </li>
        </ul>
      </div>

    </div>

    {/* Bottom Bar */}
    <div className="pt-6 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
      <p className="text-[9px] uppercase tracking-[0.2em] text-white/20">
        © 2020 AILEEN CAKE MAX. ALL RIGHTS RESERVED.
      </p>
      <div className="flex gap-6 text-[9px] uppercase tracking-[0.2em] text-white/20 font-bold">
        <span className="hover:text-[#D4A87A] cursor-pointer transition-colors">Privacy Policy</span>
        <span className="hover:text-[#D4A87A] cursor-pointer transition-colors">Terms of Service</span>
      </div>
    </div>
  </div>
</footer>
  );
};