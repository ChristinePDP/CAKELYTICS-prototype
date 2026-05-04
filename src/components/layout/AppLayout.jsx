import { useState, useEffect, useRef } from 'react';
import { X, Bell } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { NavLink, useLocation } from 'react-router-dom';
import {
  LineChart, Monitor, ClipboardCheck,
  ShoppingCart, List, LogOut
} from 'lucide-react';
import brandLogo from '../../assets/images/427bffe9-d983-4566-9ec9-de6c2b1bdaa2-removebg-preview.png';

// ─── NAV CONFIGURATION ────────────────────────────────────────
const NAV = [
  {
    section: 'OVERVIEW',
    items: [{ label: 'Analytics', icon: LineChart, to: '/' }],
  },
  {
    section: 'OPERATIONS',
    items: [
      { label: 'Point Of Sale', icon: Monitor, to: '/pos' },
      { label: 'All Orders', icon: ClipboardCheck, to: '/orders' },
    ],
  },
  {
    section: 'CATALOG',
    items: [
      { label: 'Product Management', icon: ShoppingCart, to: '/products' },
      { label: 'Inventory', icon: List, to: '/inventory' },
    ],
  },

];

export function Sidebar({ onLogoutClick }) {
  return (
    // Reduced width to 220px - using inline style to set CSS variable
    <aside className="bg-[#3B1F0A] flex flex-col fixed top-0 left-0 bottom-0 z-40 shadow-xl overflow-hidden" style={{ width: 'var(--sidebar-width, 220px)' }}>

      <div className="absolute top-[-70px] right-[-70px] w-[240px] h-[240px] rounded-full bg-white/[0.04] pointer-events-none" />
      <div className="absolute bottom-[80px] left-[-80px] w-[300px] h-[300px] rounded-full bg-white/[0.02] pointer-events-none" />
      <div className="absolute top-[40%] right-[-100px] w-[200px] h-[200px] rounded-full bg-black/[0.15] pointer-events-none" />
      {/* Logo Section */}
      <div className="flex flex-col items-center pt-8 pb-5 border-b border-white/10">
        <img
          src={brandLogo}
          alt="Logo"
          className="w-[110px] h-[100px] " // Slightly reduced logo size to fit narrower sidebar
        />
        <h2 className="font-serif text-[20px] font-bold text-white tracking-wide text-center leading-tight">
          Aileen Cake Max
        </h2>
        <p className="text-[10px] text-white/80 uppercase tracking-[0.2em] mt-1 font-medium">Bake Shop</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 overflow-y-auto"> {/* Reduced horizontal padding slightly */}
        {NAV.map((group, idx) => (
          <div key={group.section} className={idx !== 0 ? "mt-6" : ""}>
            <p className="text-[10px] font-bold text-white/50 tracking-wider mb-2 px-2">
              {group.section}
            </p>
            <div className="flex flex-col gap-1">
              {group.items.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.to === '/'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3 py-2.5 rounded-lg text-[13px] font-semibold transition-all duration-200 ` +
                    (isActive
                      ? 'bg-white/20 text-white shadow-sm'
                      : 'text-white/70 hover:bg-white/10 hover:text-white')
                  }
                >
                  <item.icon size={16} strokeWidth={2.2} /> {/* Slightly reduced icon size */}
                  {item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>
      {/* Footer - Logout */}
      <div className="mt-auto px-4 pb-6 pt-2">
        <div className="border-t border-white/10 pt-4">
          {/* Pinalaki ng konti ang text sa logout */}
          <button onClick={onLogoutClick} className="flex items-center justify-center gap-2 w-full text-white/90 hover:text-white transition-colors font-bold text-[15px]">
            Logout
            <LogOut size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}

// ─── TOPBAR ───────────────────────────────────────────────────
export function TopBar({ title }) {
  const { orders } = useApp();
  const [timeStr, setTimeStr] = useState('');
  const [dateStr, setDateStr] = useState('');
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // BINAGO: 'Pending' at 'Confirmed' na lang ang isasama sa notification
  const preOrders = orders.filter(o => o.type === 'Pre-Order' && ['Pending', 'Confirmed'].includes(o.status));

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const timeStr = now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit', hour12: true });
      const dateStr = now.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      setTimeStr(timeStr);
      setDateStr(dateStr);  
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  // Close notif panel on outside click
  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Idinagdag ang 'Pending' sa statusColor para may styling din
  const statusColor = { Pending: 'bg-amber-100 text-amber-700', Confirmed: 'bg-blue-100 text-blue-700', Ready: 'bg-green-100 text-green-700' };

  return (
    <header className="bg-white border-b border-brand-200 px-6 h-14 flex items-center justify-between sticky top-0 z-30">
      <h1 className="text-[20px] font-bold text-brand-800 tracking-wide">{title}</h1>
      
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-4 text-[14px] font-bold text-brand-700 tabular-nums">
        {dateStr} • {timeStr}
      </div>

        {/* Notification Bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(v => !v)}
            className="relative w-10 h-10 rounded-xl border border-brand-200 flex items-center justify-center text-brand-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
          >
            <Bell size={16} strokeWidth={2} />
            {preOrders.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center leading-none">
                {preOrders.length > 9 ? '9+' : preOrders.length}
              </span>
            )}
          </button>

          {/* Dropdown panel */}
          {notifOpen && (
            <div className="absolute right-0 top-11 w-80 bg-white border border-brand-200 rounded-2xl shadow-xl overflow-hidden z-50">
              <div className="flex items-center justify-between px-4 py-3 border-b border-brand-100">
                <div>
                  <p className="text-sm font-bold text-brand-800">New Orders</p>
                  <p className="text-[11px] text-brand-400 mt-0.5">{preOrders.length} pending order{preOrders.length !== 1 ? 's' : ''}</p>
                </div>
                <button onClick={() => setNotifOpen(false)} className="text-brand-400 hover:text-brand-700 transition-colors">
                  <X size={14} />
                </button>
              </div>
              <div className="max-h-80 overflow-y-auto">
                {preOrders.length === 0 ? (
                  <div className="py-8 text-center text-brand-300 text-sm">
                    <Bell size={22} className="mx-auto mb-2 opacity-40" />
                    Walang bagong online orders.
                  </div>
                ) : (
                  preOrders.map(order => (
                    <div key={order.id} className="px-4 py-3 border-b border-brand-100 last:border-0 hover:bg-brand-50 transition-colors">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1 min-w-0">
                          <p className="text-[14px] font-bold text-brand-800 truncate">{order.customer.name}</p>
                          <p className="text-[13px] text-brand-500 mt-1.5">{order.id}</p>
                          <p className="text-[12px] text-brand-500 mt-0.5 truncate">
                            {order.items.map(i => `${i.name}${i.qty > 1 ? ` ×${i.qty}` : ''}`).join(', ')}
                          </p>
                          {order.pickupDate && (
                            <p className="text-[13px] text-brand-800 mt-1 flex items-center gap-1">
                              <span>📅</span> Pick-up: {order.pickupDate}{order.pickupTime ? ' · ' + order.pickupTime : ''}
                            </p>
                          )}
                        </div>
                        <div className="flex flex-col items-end gap-1 shrink-0">
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusColor[order.status] || 'bg-gray-100 text-gray-600'}`}>
                            {order.status}
                          </span>
                          <span className="text-[15px] font-bold text-brand-700">
                            ₱{order.grandTotal?.toLocaleString('en-PH') || order.subtotal?.toLocaleString('en-PH')}
                          </span>
                        </div>
                      </div>
                      
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>
        
        <div className="w-[1px] h-6 bg-brand-200" />
        
        <div className="flex items-center gap-2.5">
          <span className="text-[15px] font-semibold text-brand-400">Evangeline V.</span>
          <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center text-white text-sm font-bold">E</div>
        </div>
      </div>
    </header>
  );
}

// ─── APPLAYOUT ────────────────────────────────────────────────
const PAGE_TITLES = {
  '/':         'Analytics',
  '/pos':      'Point of Sale',
  '/orders':   'All Orders',
  '/products': 'Product Management',
  '/inventory':'Inventory',
};

export function AppLayout({ children, onLogout }) {
  const { pathname } = useLocation();
  const title = PAGE_TITLES[pathname] || 'Dashboard';
  const [logoutOpen, setLogoutOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-brand-50" style={{ '--sidebar-width': '220px' }}>
      <Sidebar onLogoutClick={() => setLogoutOpen(true)} />
      <div className="flex-1 flex flex-col min-h-screen" style={{ marginLeft: 'var(--sidebar-width, 220px)' }}>
        <TopBar title={title} />
        <main className="flex-1 p-5 overflow-auto">{children}</main>
      </div>

      {/* ── Logout Confirmation Modal ── */}
      {logoutOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-sm"
          onClick={e => e.target === e.currentTarget && setLogoutOpen(false)}
        >
          <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl animate-modalIn">
            <div className="flex items-start justify-between p-5 border-b border-brand-100">
              <div>
                <h2 className="font-serif text-lg font-bold text-brand-800">Sign out</h2>
                <p className="text-xs text-brand-400 mt-0.5">Are you sure you want to log out?</p>
              </div>
              <button
                onClick={() => setLogoutOpen(false)}
                className="w-8 h-8 rounded-lg border border-brand-200 flex items-center justify-center text-brand-400 hover:bg-red-50 hover:text-red-500 hover:border-red-200 transition-all ml-4"
              >
                <X size={15} />
              </button>
            </div>
            <div className="p-5 flex gap-3 justify-end">
              <button
                onClick={() => setLogoutOpen(false)}
                className="px-4 py-2 text-sm font-semibold rounded-lg border border-brand-300 text-brand-700 hover:bg-brand-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setLogoutOpen(false); onLogout(); }}
                className="px-4 py-2 text-sm font-semibold rounded-lg bg-brand-700 text-white hover:bg-brand-800 transition-colors flex items-center gap-2"
              >
                <LogOut size={14} /> Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}