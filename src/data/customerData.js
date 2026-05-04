// ============================================================
// CUSTOMER UI — Product & Order Data
// ============================================================

export const CUSTOMER_PRODUCTS = [
  {
    id: 'pkgA', name: 'Package A', price: 1200,
    category: 'Package',
    desc: '7x5 cake + Toppers + 10 Balloons',
    img: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=600&q=80',
    allowFileUpload: true,
  },
  {
    id: 'pkgB', name: 'Package B', price: 1400,
    category: 'Package',
    desc: '7x5 cake + 12 Cupcakes + Toppers',
    img: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80',
    allowFileUpload: true,
  },
  {
    id: 'pkgC', name: 'Package C', price: 1700,
    category: 'Package',
    desc: 'Cake + Cupcakes + Toppers + Balloons',
    img: 'https://images.unsplash.com/photo-1558636508-e0db3814bd1d?w=600&q=80',
    allowFileUpload: true,
  },
  {
    id: 'pkgD', name: 'Package D', price: 2000,
    category: 'Package',
    desc: 'Premium full set + Tarpaulin',
    img: 'https://images.unsplash.com/photo-1621303837174-89787a7d4729?w=600&q=80',
    allowFileUpload: true,
  },
  {
    id: 'cup', name: 'Cupcakes 12 pcs', price: 350,
    category: 'Pastry',
    desc: 'Assorted with toppers',
    img: 'https://images.unsplash.com/photo-1587668178277-295251f900ce?w=500&auto=format&fit=crop',
    allowFileUpload: true,
  },
  {
    id: 'bfs', name: 'Black Forest Slice', price: 85,
    category: 'Pastry',
    desc: 'Per slice',
    img: 'https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=500&auto=format&fit=crop',
    allowFileUpload: false,
  },
  {
    id: 'pie', name: 'Buko Pie', price: 120,
    category: 'Pastry',
    desc: 'Freshly baked',
    img: 'https://images.unsplash.com/photo-1621236378699-8597faa6a71e?w=500&auto=format&fit=crop',
    allowFileUpload: false,
  },
  {
    id: 'brw', name: 'Brownies Tray', price: 250,
    category: 'Pastry',
    desc: '16 pcs per tray',
    img: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=500&auto=format&fit=crop',
    allowFileUpload: false,
  },
  {
    id: 'cok', name: 'Cookies Box', price: 150,
    category: 'Pastry',
    desc: '12 pcs assorted',
    img: 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=500&auto=format&fit=crop',
    allowFileUpload: false,
  },
  {
    id: 'ens', name: 'Ensaymada (6 pcs)', price: 80,
    category: 'Pastry',
    desc: 'Soft fluffy buns',
    img: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=500&auto=format&fit=crop',
    allowFileUpload: false,
  },
];

export const CUSTOMER_CATEGORIES = [
  'Package',
  'Pastry'
];

export function generateCustomerOrderId() {
  return 'ORD-' + Math.floor(1000 + Math.random() * 9000);
}