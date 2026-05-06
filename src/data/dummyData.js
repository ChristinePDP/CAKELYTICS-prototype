// ============================================================
// AILEEN & NICULUS BAKE SHOP — DUMMY DATA
// ============================================================

// ─── LOCAL IMAGE IMPORTS (TUGMA SA NASA ASSETS MO) ───────────
import packageAImg from '../assets/images/product/packageA.png';
import packageBImg from '../assets/images/product/packageB.png';
import packageCImg from '../assets/images/product/packageC.png';
import packageDImg from '../assets/images/product/packageD.png';
import packageABImg from '../assets/images/product/packageAB.png';
import cake from '../assets/images/product/cake.png';
import bananaCakeImg from '../assets/images/product/bananacake.png';
import bukoPieImg from '../assets/images/product/bukopie.png';
import cheeseImg from '../assets/images/product/cheese.png';
import chocRollImg from '../assets/images/product/choc-roll.png';
import coconutMacaroonImg from '../assets/images/product/coconutmacaroon.png';
import crinklesImg from '../assets/images/product/crinkles.png';
import eggPieImg from '../assets/images/product/eggpie.png';
import empanadaImg from '../assets/images/product/empanada.png';
import ensaymadaImg from '../assets/images/product/ensaymada.png';
import hopiaImg from '../assets/images/product/hopia.png';
import lecheFlanImg from '../assets/images/product/lecheflan.png';
import mamonImg from '../assets/images/product/mamon.png';
import pandesalImg from '../assets/images/product/pandesal.png';
import pianonoImg from '../assets/images/product/pianono.png';
import polvoronImg from '../assets/images/product/polvoron.png';
import sansRivalImg from '../assets/images/product/sansrival.png';
import ubeCakeImg from '../assets/images/product/ubecake.png';
import yemaCakeImg from '../assets/images/product/yemacake.png';

export const CATEGORIES = ['All', 'Package', 'Pastry'];

export const PRODUCTS = [
  // ── PACKAGES ────────────────────────────────────────────────
  {
    id: 'p1', name: 'Package A', category: 'Package', price: 1200,
    inclusion: 'Themed Cake (7x5)\nw/ Printed Toppers\nw/ Balloons',
    image: packageAImg,
    dailyLimit: 5, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p2', name: 'Package B', category: 'Package', price: 1400,
    inclusion: 'Themed Cake (7x5)\nw/ Printed Toppers\nw/ 12pcs Cupcakes',
    image: packageBImg,
    dailyLimit: 5, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p3', name: 'Package C', category: 'Package', price: 1700,
    inclusion: 'Themed Cake (7x5)\nw/ Printed Toppers\nw/ 12pcs Cupcakes\nw/ Balloons',
    image: packageCImg,
    dailyLimit: 5, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p4', name: 'Package D', category: 'Package', price: 1200,
    inclusion: 'Themed Cake (7x5)\nw/ Printed Toppers\nw/ Balloons\nw/ Tarpaulin 7x5',
    image: packageDImg,
    dailyLimit: 5, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p5', name: 'Package E', category: 'Package', price: 2200,
    inclusion: 'Themed Cake (9x7)\nw/ Printed Toppers',
    image: cake,
    dailyLimit: 5, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p6', name: 'Package AB', category: 'Package', price: 3200,
    inclusion: ' 12pcs Cupcakes\nw/ Balloons Bundle',
    image: packageABImg,
    dailyLimit: 5, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p7', name: 'Package EA', category: 'Package', price: 2000,
    inclusion: '12 pcs Cupcakes',
    image: 'https://images.unsplash.com/photo-1519869325930-281384150729?w=400&q=80',
    dailyLimit: 5, stock: 10, active: true, dateExceptions: [],
  },

  // ── PASTRY ───────────────────────────────────────────────────
  {
    id: 'p8', name: 'Chocolate Rolls', category: 'Pastry', price: 299,
    inclusion: '', image: chocRollImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p9', name: 'Crinkles', category: 'Pastry', price: 15,
    inclusion: '', image: crinklesImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p10', name: 'Cupcake', category: 'Pastry', price: 25,
    inclusion: '', image: 'https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=400&q=80',
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p11', name: 'Brownies', category: 'Pastry', price: 15,
    inclusion: '', image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=400&q=80',
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p12', name: 'Buko Pie', category: 'Pastry', price: 30,
    inclusion: '', image: bukoPieImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p13', name: 'Egg Pie', category: 'Pastry', price: 30,
    inclusion: '', image: eggPieImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p14', name: 'Mamon', category: 'Pastry', price: 18,
    inclusion: '', image: mamonImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p15', name: 'Pianono', category: 'Pastry', price: 20,
    inclusion: '', image: pianonoImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p16', name: 'Yema Cake', category: 'Pastry', price: 35,
    inclusion: '', image: yemaCakeImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p17', name: 'Banana Cake', category: 'Pastry', price: 30,
    inclusion: '', image: bananaCakeImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p18', name: 'Empanada', category: 'Pastry', price: 28,
    inclusion: '', image: empanadaImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p19', name: 'Sans Rival', category: 'Pastry', price: 45,
    inclusion: '', image: sansRivalImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p20', name: 'Coconut Macaroons', category: 'Pastry', price: 12,
    inclusion: '', image: coconutMacaroonImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p21', name: 'Hopia', category: 'Pastry', price: 15,
    inclusion: '', image: hopiaImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p22', name: 'Polvoron', category: 'Pastry', price: 12,
    inclusion: '', image: polvoronImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p23', name: 'Leche Flan', category: 'Pastry', price: 55,
    inclusion: '', image: lecheFlanImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p24', name: 'Cheese Bread', category: 'Pastry', price: 22,
    inclusion: '', image: cheeseImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p25', name: 'Ube Cake', category: 'Pastry', price: 40,
    inclusion: '', image: ubeCakeImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p26', name: 'Ensaymada', category: 'Pastry', price: 7,
    inclusion: '', image: ensaymadaImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
  {
    id: 'p27', name: 'Pandesal', category: 'Pastry', price: 8,
    inclusion: '', image: pandesalImg,
    dailyLimit: 0, stock: 10, active: true, dateExceptions: [],
  },
];

// ─── ORDERS ──────────────────────────────────────────────────
export const ORDER_STATUSES = ['All', 'Confirmed', 'Ready', 'Completed', 'Cancelled'];

let _orderId = 242;
export const generateOrderId = () => `ORD-0${_orderId++}`;

export const ORDERS = [
  {
    id: 'ORD-0241', type: 'Pre-Order', status: 'Confirmed',
    customer: { name: 'Maria Santos', phone: '0917 123 4567', altPhone: '0998 765 4321', facebook: 'Maria Santos Calaca' },
    items: [
      { productId: 'p1', name: 'Package A', qty: 1, price: 1200, total: 1200 },
      { productId: 'p11', name: 'Cupcakes', qty: 12, price: 25, total: 300 },
    ],
    subtotal: 2700, additionalCharge: 0, discount: 0, grandTotal: 1500,
    paymentType: 'deposit', amountPaid: 1500, balance: 1500,
    pickupDate: 'Mar 25, 2026', pickupTime: '3:00 PM',
    specialInstructions: 'Dark Chocolate po sana tapos yung dedication po "Happy 28th Birthday, Kuya!" Fondant na lang din po sana yung gamit kasi allergic sya sa icing e. Thankyou po',
    customerReference: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=500&q=80',
    createdAt: 'Mar 20, 2026 · 10:30 AM',
  },
  {
    id: 'ORD-0240', type: 'Pre-Order', status: 'Ready',
    customer: { name: 'Juan Reyes', phone: '0912 345 6789', altPhone: '', facebook: '' },
    items: [{ productId: 'p2', name: 'Package B', qty: 1, price: 1400, total: 1400 }],
    subtotal: 1400, additionalCharge: 0, discount: 0, grandTotal: 1400,
    paymentType: 'full', amountPaid: 1400, balance: 0,
    pickupDate: 'Mar 20, 2026', pickupTime: '11:00 AM',
    specialInstructions: '',
    customerReference: null,
    createdAt: 'Mar 15, 2026 · 2:00 PM',
  },
  {
    id: 'ORD-0239', type: 'Pre-Order', status: 'Completed',
    customer: { name: 'Ana Dela Cruz', phone: '0905 678 9012', altPhone: '', facebook: '' },
    items: [{ productId: 'p3', name: 'Package C', qty: 1, price: 580, total: 580 }],
    subtotal: 580, additionalCharge: 0, discount: 0, grandTotal: 580,
    paymentType: 'full', amountPaid: 580, balance: 0,
    pickupDate: 'Mar 25, 2026', pickupTime: '3:00 PM',
    specialInstructions: 'Blue and gold theme please',
    customerReference: null,
    createdAt: 'Mar 14, 2026 · 9:00 AM',
  },
  {
    id: 'ORD-0238', type: 'Pre-Order', status: 'Cancelled',
    customer: { name: 'Kristine Abad', phone: '0921 234 5678', altPhone: '', facebook: '' },
    items: [{ productId: 'p4', name: 'Package D', qty: 1, price: 2000, total: 2000 }],
    subtotal: 2000, additionalCharge: 0, discount: 0, grandTotal: 2000,
    paymentType: 'deposit', amountPaid: 1000, balance: 1000,
    pickupDate: 'Mar 25, 2026', pickupTime: '3:00 PM',
    specialInstructions: '',
    customerReference: null,
    createdAt: 'Mar 12, 2026 · 3:30 PM',
  },
  {
    id: 'ORD-0237', type: 'Buy Now', status: 'Completed',
    customer: { name: 'Liza Bautista', phone: '0917 123 4567', altPhone: '', facebook: '' },
    items: [{ productId: 'p5', name: 'Package E', qty: 1, price: 2000, total: 2000 }],
    subtotal: 2000, additionalCharge: 0, discount: 0, grandTotal: 2000,
    paymentType: 'full', amountPaid: 2000, balance: 0,
    pickupDate: 'Mar 25, 2026', pickupTime: '3:00 PM',
    specialInstructions: '',
    customerReference: null,
    createdAt: 'Mar 11, 2026 · 11:00 AM',
  },
  {
    id: 'ORD-0236', type: 'Pre-Order', status: 'Completed',
    customer: { name: 'Roberto Cruz', phone: '0933 456 7890', altPhone: '', facebook: '' },
    items: [{ productId: 'p1', name: 'Package A', qty: 1, price: 2000, total: 2000 }],
    subtotal: 2000, additionalCharge: 0, discount: 0, grandTotal: 2000,
    paymentType: 'full', amountPaid: 1000, balance: 0,
    pickupDate: 'Mar 25, 2026', pickupTime: '3:00 PM',
    specialInstructions: '',
    customerReference: null,
    createdAt: 'Mar 10, 2026 · 8:00 AM',
  },
  {
    id: 'ORD-0235', type: 'Buy Now', status: 'Completed',
    customer: { name: 'Gloria Mendez', phone: '0955 678 9012', altPhone: '', facebook: '' },
    items: [{ productId: 'p6', name: 'Package AB', qty: 1, price: 2000, total: 2000 }],
    subtotal: 2000, additionalCharge: 0, discount: 0, grandTotal: 2000,
    paymentType: 'full', amountPaid: 1000, balance: 0,
    pickupDate: 'Mar 25, 2026', pickupTime: '3:00 PM',
    specialInstructions: '',
    customerReference: null,
    createdAt: 'Mar 9, 2026 · 4:00 PM',
  },
  {
    id: 'ORD-0234', type: 'Pre-Order', status: 'Ready',
    customer: { name: 'Maria Santos', phone: '0917 123 4567', altPhone: '', facebook: '' },
    items: [{ productId: 'p7', name: 'Package EA', qty: 1, price: 2000, total: 2000 }],
    subtotal: 2000, additionalCharge: 0, discount: 0, grandTotal: 2000,
    paymentType: 'deposit', amountPaid: 1000, balance: 1000,
    pickupDate: 'Mar 25, 2026', pickupTime: '3:00 PM',
    specialInstructions: '',
    customerReference: null,
    createdAt: 'Mar 8, 2026 · 1:00 PM',
  },
  {
    id: 'ORD-0233', type: 'Pre-Order', status: 'Ready',
    customer: { name: 'Maria Santos', phone: '0917 123 4567', altPhone: '', facebook: '' },
    items: [{ productId: 'p2', name: 'Package B', qty: 1, price: 2000, total: 2000 }],
    subtotal: 2000, additionalCharge: 0, discount: 0, grandTotal: 2000,
    paymentType: 'deposit', amountPaid: 1000, balance: 1000,
    pickupDate: 'Mar 25, 2026', pickupTime: '3:00 PM',
    specialInstructions: '',
    customerReference: null,
    createdAt: 'Mar 7, 2026 · 6:00 PM',
  },
];

// ─── INVENTORY ───────────────────────────────────────────────
export const INGREDIENTS = [
  { id: 'i1',  name: 'Butter (Unsalted)',  stock: 0.5,  unit: 'kg',  min: 2,    costPerUnit: 280  },
  { id: 'i2',  name: 'Eggs',               stock: 45,   unit: 'pcs', min: 60,   costPerUnit: 8    },
  { id: 'i3',  name: 'All-Purpose Flour',  stock: 15,   unit: 'kg',  min: 10,   costPerUnit: 55   },
  { id: 'i4',  name: 'Cake Flour',         stock: 8,    unit: 'kg',  min: 12,   costPerUnit: 70   },
  { id: 'i5',  name: 'White Sugar',        stock: 10,   unit: 'kg',  min: 5,    costPerUnit: 60   },
  { id: 'i6',  name: 'Baking Powder',      stock: 1,    unit: 'kg',  min: 0.5,  costPerUnit: 120  },
  { id: 'i7',  name: 'Vanilla Extract',    stock: 1,    unit: 'L',   min: 0.5,  costPerUnit: 350  },
  { id: 'i8',  name: 'Cocoa Powder',       stock: 1500, unit: 'g',   min: 500,  costPerUnit: 0.35 },
  { id: 'i9',  name: 'Fresh Milk',         stock: 5,    unit: 'L',   min: 3,    costPerUnit: 80   },
  { id: 'i10', name: 'Cream Cheese',       stock: 250,  unit: 'g',   min: 500,  costPerUnit: 1.2  },
  { id: 'i11', name: 'Vegetable Oil',      stock: 2,    unit: 'L',   min: 1,    costPerUnit: 75   },
  { id: 'i12', name: 'Salt',               stock: 0.8,  unit: 'kg',  min: 0.5,  costPerUnit: 30   },
  { id: 'i13', name: 'Brown Sugar',        stock: 3,    unit: 'kg',  min: 2,    costPerUnit: 65   },
  { id: 'i14', name: 'Strawberry Jam',     stock: 400,  unit: 'g',   min: 800,  costPerUnit: 0.8  },
  { id: 'i15', name: 'Latex Balloons (Pack of 50)',    unit: 'packs', stock: 15,  min: 5, costPerUnit: 120 },
  { id: 'i16', name: 'Foil Balloon (Numbers/Letters)',  unit: 'pcs',   stock: 80,  min: 20, costPerUnit: 25 },
  { id: 'i17', name: 'Tarpaulin (2x3 ft)',              unit: 'pcs',   stock: 12,  min: 5, costPerUnit: 150 },
  { id: 'i18', name: 'Tarpaulin (3x4 ft - Customized)', unit: 'pcs',   stock: 5,   min: 2, costPerUnit: 300 },
];

export const RECIPES = [
  // ── PACKAGES (base cake + extras) ───────────────────────────
  {
    id: 'r1', product: 'Package A', yield: 1, yieldUnit: 'set', estimatedCost: 750,
    ingredients: [
      { name: 'Cake Flour', qty: 0.5, unit: 'kg' }, { name: 'White Sugar', qty: 0.4, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.3, unit: 'kg' }, { name: 'Eggs', qty: 8, unit: 'pcs' },
      { name: 'Baking Powder', qty: 0.015, unit: 'kg' }, { name: 'Vanilla Extract', qty: 0.01, unit: 'L' },
      { name: 'Fresh Milk', qty: 0.2, unit: 'L' }, { name: 'Latex Balloons (Pack of 50)', qty: 0.1, unit: 'packs' },
    ],
  },
  {
    id: 'r2', product: 'Package B', yield: 1, yieldUnit: 'set', estimatedCost: 900,
    ingredients: [
      { name: 'Cake Flour', qty: 0.5, unit: 'kg' }, { name: 'White Sugar', qty: 0.55, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.4, unit: 'kg' }, { name: 'Eggs', qty: 11, unit: 'pcs' },
      { name: 'Baking Powder', qty: 0.02, unit: 'kg' }, { name: 'Vanilla Extract', qty: 0.01, unit: 'L' },
      { name: 'Fresh Milk', qty: 0.3, unit: 'L' }, { name: 'All-Purpose Flour', qty: 0.12, unit: 'kg' },
    ],
  },
  {
    id: 'r3', product: 'Package C', yield: 1, yieldUnit: 'set', estimatedCost: 1100,
    ingredients: [
      { name: 'Cake Flour', qty: 0.5, unit: 'kg' }, { name: 'White Sugar', qty: 0.55, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.4, unit: 'kg' }, { name: 'Eggs', qty: 11, unit: 'pcs' },
      { name: 'Baking Powder', qty: 0.02, unit: 'kg' }, { name: 'Vanilla Extract', qty: 0.015, unit: 'L' },
      { name: 'Fresh Milk', qty: 0.3, unit: 'L' }, { name: 'All-Purpose Flour', qty: 0.12, unit: 'kg' },
      { name: 'Latex Balloons (Pack of 50)', qty: 0.1, unit: 'packs' },
    ],
  },
  {
    id: 'r4', product: 'Package D', yield: 1, yieldUnit: 'set', estimatedCost: 800,
    ingredients: [
      { name: 'Cake Flour', qty: 0.5, unit: 'kg' }, { name: 'White Sugar', qty: 0.4, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.3, unit: 'kg' }, { name: 'Eggs', qty: 8, unit: 'pcs' },
      { name: 'Baking Powder', qty: 0.015, unit: 'kg' }, { name: 'Vanilla Extract', qty: 0.01, unit: 'L' },
      { name: 'Fresh Milk', qty: 0.2, unit: 'L' }, { name: 'Latex Balloons (Pack of 50)', qty: 0.1, unit: 'packs' },
      { name: 'Tarpaulin (3x4 ft - Customized)', qty: 1, unit: 'pcs' },
    ],
  },
  {
    id: 'r5', product: 'Package E', yield: 1, yieldUnit: 'set', estimatedCost: 1300,
    ingredients: [
      { name: 'Cake Flour', qty: 0.7, unit: 'kg' }, { name: 'White Sugar', qty: 0.6, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.5, unit: 'kg' }, { name: 'Eggs', qty: 12, unit: 'pcs' },
      { name: 'Baking Powder', qty: 0.025, unit: 'kg' }, { name: 'Vanilla Extract', qty: 0.015, unit: 'L' },
      { name: 'Fresh Milk', qty: 0.35, unit: 'L' },
    ],
  },
  {
    id: 'r6', product: 'Package AB', yield: 1, yieldUnit: 'set', estimatedCost: 1800,
    ingredients: [
      { name: 'Cake Flour', qty: 0.5, unit: 'kg' }, { name: 'White Sugar', qty: 0.7, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.5, unit: 'kg' }, { name: 'Eggs', qty: 14, unit: 'pcs' },
      { name: 'Baking Powder', qty: 0.025, unit: 'kg' }, { name: 'Vanilla Extract', qty: 0.015, unit: 'L' },
      { name: 'Fresh Milk', qty: 0.4, unit: 'L' }, { name: 'All-Purpose Flour', qty: 0.24, unit: 'kg' },
      { name: 'Latex Balloons (Pack of 50)', qty: 0.2, unit: 'packs' },
    ],
  },
  {
    id: 'r7', product: 'Package EA', yield: 1, yieldUnit: 'set', estimatedCost: 1200,
    ingredients: [
      { name: 'Cake Flour', qty: 0.7, unit: 'kg' }, { name: 'White Sugar', qty: 0.7, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.5, unit: 'kg' }, { name: 'Eggs', qty: 15, unit: 'pcs' },
      { name: 'Baking Powder', qty: 0.025, unit: 'kg' }, { name: 'Vanilla Extract', qty: 0.015, unit: 'L' },
      { name: 'Fresh Milk', qty: 0.4, unit: 'L' }, { name: 'All-Purpose Flour', qty: 0.12, unit: 'kg' },
    ],
  },

  // ── PASTRY ───────────────────────────────────────────────────
  {
    id: 'r8', product: 'Chocolate Rolls', yield: 10, yieldUnit: 'pcs', estimatedCost: 220,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.3, unit: 'kg' }, { name: 'White Sugar', qty: 0.1, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.1, unit: 'kg' }, { name: 'Eggs', qty: 3, unit: 'pcs' },
      { name: 'Cocoa Powder', qty: 80, unit: 'g' }, { name: 'Fresh Milk', qty: 0.15, unit: 'L' },
    ],
  },
  {
    id: 'r9', product: 'Crinkles', yield: 24, yieldUnit: 'pcs', estimatedCost: 180,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.25, unit: 'kg' }, { name: 'Cocoa Powder', qty: 100, unit: 'g' },
      { name: 'White Sugar', qty: 0.2, unit: 'kg' }, { name: 'Eggs', qty: 2, unit: 'pcs' },
      { name: 'Vegetable Oil', qty: 0.1, unit: 'L' }, { name: 'Baking Powder', qty: 0.01, unit: 'kg' },
    ],
  },
  {
    id: 'r10', product: 'Cupcake', yield: 12, yieldUnit: 'pcs', estimatedCost: 320,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.12, unit: 'kg' }, { name: 'White Sugar', qty: 0.15, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.1, unit: 'kg' }, { name: 'Eggs', qty: 3, unit: 'pcs' },
      { name: 'Baking Powder', qty: 0.01, unit: 'kg' }, { name: 'Fresh Milk', qty: 0.1, unit: 'L' },
    ],
  },
  {
    id: 'r11', product: 'Brownies', yield: 16, yieldUnit: 'pcs', estimatedCost: 480,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.3, unit: 'kg' }, { name: 'White Sugar', qty: 0.15, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.2, unit: 'kg' }, { name: 'Eggs', qty: 4, unit: 'pcs' },
      { name: 'Cocoa Powder', qty: 200, unit: 'g' },
    ],
  },
  {
    id: 'r12', product: 'Buko Pie', yield: 8, yieldUnit: 'slices', estimatedCost: 190,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.25, unit: 'kg' }, { name: 'Butter (Unsalted)', qty: 0.12, unit: 'kg' },
      { name: 'White Sugar', qty: 0.1, unit: 'kg' }, { name: 'Fresh Milk', qty: 0.2, unit: 'L' },
      { name: 'Eggs', qty: 2, unit: 'pcs' },
    ],
  },
  {
    id: 'r13', product: 'Egg Pie', yield: 8, yieldUnit: 'slices', estimatedCost: 160,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.2, unit: 'kg' }, { name: 'Butter (Unsalted)', qty: 0.1, unit: 'kg' },
      { name: 'Eggs', qty: 4, unit: 'pcs' }, { name: 'Fresh Milk', qty: 0.2, unit: 'L' },
      { name: 'White Sugar', qty: 0.15, unit: 'kg' },
    ],
  },
  {
    id: 'r14', product: 'Mamon', yield: 12, yieldUnit: 'pcs', estimatedCost: 150,
    ingredients: [
      { name: 'Cake Flour', qty: 0.15, unit: 'kg' }, { name: 'White Sugar', qty: 0.1, unit: 'kg' },
      { name: 'Eggs', qty: 4, unit: 'pcs' }, { name: 'Butter (Unsalted)', qty: 0.05, unit: 'kg' },
    ],
  },
  {
    id: 'r15', product: 'Pianono', yield: 8, yieldUnit: 'pcs', estimatedCost: 130,
    ingredients: [
      { name: 'Cake Flour', qty: 0.1, unit: 'kg' }, { name: 'White Sugar', qty: 0.12, unit: 'kg' },
      { name: 'Eggs', qty: 4, unit: 'pcs' }, { name: 'Vanilla Extract', qty: 0.005, unit: 'L' },
    ],
  },
  {
    id: 'r16', product: 'Yema Cake', yield: 10, yieldUnit: 'slices', estimatedCost: 280,
    ingredients: [
      { name: 'Cake Flour', qty: 0.2, unit: 'kg' }, { name: 'White Sugar', qty: 0.25, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.1, unit: 'kg' }, { name: 'Eggs', qty: 6, unit: 'pcs' },
      { name: 'Fresh Milk', qty: 0.2, unit: 'L' }, { name: 'Vanilla Extract', qty: 0.005, unit: 'L' },
    ],
  },
  {
    id: 'r17', product: 'Banana Cake', yield: 10, yieldUnit: 'slices', estimatedCost: 200,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.25, unit: 'kg' }, { name: 'White Sugar', qty: 0.15, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.1, unit: 'kg' }, { name: 'Eggs', qty: 3, unit: 'pcs' },
      { name: 'Baking Powder', qty: 0.01, unit: 'kg' }, { name: 'Vanilla Extract', qty: 0.005, unit: 'L' },
    ],
  },
  {
    id: 'r18', product: 'Empanada', yield: 12, yieldUnit: 'pcs', estimatedCost: 220,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.3, unit: 'kg' }, { name: 'Butter (Unsalted)', qty: 0.08, unit: 'kg' },
      { name: 'Eggs', qty: 2, unit: 'pcs' }, { name: 'Salt', qty: 0.005, unit: 'kg' },
    ],
  },
  {
    id: 'r19', product: 'Sans Rival', yield: 12, yieldUnit: 'slices', estimatedCost: 380,
    ingredients: [
      { name: 'Eggs', qty: 6, unit: 'pcs' }, { name: 'White Sugar', qty: 0.3, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.25, unit: 'kg' }, { name: 'Vanilla Extract', qty: 0.005, unit: 'L' },
    ],
  },
  {
    id: 'r20', product: 'Coconut Macaroons', yield: 24, yieldUnit: 'pcs', estimatedCost: 140,
    ingredients: [
      { name: 'Eggs', qty: 2, unit: 'pcs' }, { name: 'White Sugar', qty: 0.15, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.05, unit: 'kg' }, { name: 'Fresh Milk', qty: 0.05, unit: 'L' },
    ],
  },
  {
    id: 'r21', product: 'Hopia', yield: 20, yieldUnit: 'pcs', estimatedCost: 170,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.3, unit: 'kg' }, { name: 'Vegetable Oil', qty: 0.08, unit: 'L' },
      { name: 'White Sugar', qty: 0.12, unit: 'kg' }, { name: 'Salt', qty: 0.003, unit: 'kg' },
    ],
  },
  {
    id: 'r22', product: 'Polvoron', yield: 30, yieldUnit: 'pcs', estimatedCost: 120,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.5, unit: 'kg' }, { name: 'Butter (Unsalted)', qty: 0.2, unit: 'kg' },
      { name: 'White Sugar', qty: 0.15, unit: 'kg' }, { name: 'Fresh Milk', qty: 0.05, unit: 'L' },
    ],
  },
  {
    id: 'r23', product: 'Leche Flan', yield: 4, yieldUnit: 'pcs', estimatedCost: 200,
    ingredients: [
      { name: 'Eggs', qty: 10, unit: 'pcs' }, { name: 'White Sugar', qty: 0.2, unit: 'kg' },
      { name: 'Fresh Milk', qty: 0.3, unit: 'L' }, { name: 'Vanilla Extract', qty: 0.005, unit: 'L' },
    ],
  },
  {
    id: 'r24', product: 'Cheese Bread', yield: 15, yieldUnit: 'pcs', estimatedCost: 200,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.3, unit: 'kg' }, { name: 'Butter (Unsalted)', qty: 0.08, unit: 'kg' },
      { name: 'Eggs', qty: 2, unit: 'pcs' }, { name: 'Fresh Milk', qty: 0.12, unit: 'L' },
      { name: 'White Sugar', qty: 0.05, unit: 'kg' }, { name: 'Cream Cheese', qty: 100, unit: 'g' },
    ],
  },
  {
    id: 'r25', product: 'Ube Cake', yield: 10, yieldUnit: 'slices', estimatedCost: 320,
    ingredients: [
      { name: 'Cake Flour', qty: 0.25, unit: 'kg' }, { name: 'White Sugar', qty: 0.3, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.15, unit: 'kg' }, { name: 'Eggs', qty: 5, unit: 'pcs' },
      { name: 'Fresh Milk', qty: 0.2, unit: 'L' }, { name: 'Vanilla Extract', qty: 0.005, unit: 'L' },
    ],
  },
  {
    id: 'r26', product: 'Ensaymada', yield: 6, yieldUnit: 'pcs', estimatedCost: 75,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.2, unit: 'kg' }, { name: 'White Sugar', qty: 0.05, unit: 'kg' },
      { name: 'Butter (Unsalted)', qty: 0.08, unit: 'kg' }, { name: 'Eggs', qty: 2, unit: 'pcs' },
      { name: 'Fresh Milk', qty: 0.08, unit: 'L' },
    ],
  },
  {
    id: 'r27', product: 'Pandesal', yield: 20, yieldUnit: 'pcs', estimatedCost: 90,
    ingredients: [
      { name: 'All-Purpose Flour', qty: 0.4, unit: 'kg' }, { name: 'White Sugar', qty: 0.04, unit: 'kg' },
      { name: 'Salt', qty: 0.008, unit: 'kg' }, { name: 'Eggs', qty: 1, unit: 'pcs' },
      { name: 'Fresh Milk', qty: 0.1, unit: 'L' },
    ],
  },
];

export const PRODUCTION_LOGS = [
  {
    id: 'pl1', dt: 'Mar 14, 2026 · 6:00 AM',
    product: 'Custom Cake Base 7×5', batches: 2, produced: 20, yieldUnit: 'servings',
    deducted: '1kg Cake Flour, 0.8kg White Sugar, 0.6kg Butter, 16 Eggs, 0.03kg Baking Powder',
    notes: '',
  },
  {
    id: 'pl2', dt: 'Mar 14, 2026 · 6:30 AM',
    product: 'Cupcakes', batches: 3, produced: 36, yieldUnit: 'pcs',
    deducted: '0.36kg All-Purpose Flour, 0.45kg White Sugar, 0.3kg Butter, 9 Eggs',
    notes: '',
  },
  {
    id: 'pl3', dt: 'Mar 14, 2026 · 7:00 AM',
    product: 'Brownies Tray', batches: 2, produced: 32, yieldUnit: 'pcs',
    deducted: '0.6kg All-Purpose Flour, 0.3kg White Sugar, 0.4kg Butter, 8 Eggs, 400g Cocoa Powder',
    notes: '',
  },
  {
    id: 'pl4', dt: 'Mar 15, 2026 · 6:00 AM',
    product: 'Cupcakes', batches: 2, produced: 24, yieldUnit: 'pcs',
    deducted: '0.24kg All-Purpose Flour, 0.3kg White Sugar, 0.2kg Butter, 6 Eggs',
    notes: 'Extra batch for walk-in demand',
  },
];

export const WASTE_LOGS = [
  { id: 'w1', dt: 'Mar 13, 2026 · 9:15 AM',  type: 'ingredient', item: 'Butter (Unsalted)', qty: '0.5 kg', reason: 'Spoiled',  notes: 'Left unrefrigerated overnight' },
  { id: 'w2', dt: 'Mar 14, 2026 · 11:00 AM', type: 'ingredient', item: 'Eggs',              qty: '5 pcs',  reason: 'Broken',   notes: 'Dropped tray' },
  { id: 'w3', dt: 'Mar 14, 2026 · 5:30 PM',  type: 'product',    item: 'Ensaymada',         qty: '3 pcs',  reason: 'Unsold',   notes: 'End of day unsold' },
  { id: 'w4', dt: 'Mar 15, 2026 · 8:00 AM',  type: 'ingredient', item: 'Cream Cheese',      qty: '100 g',  reason: 'Expired',  notes: 'Best before passed' },
  { id: 'w5', dt: 'Mar 15, 2026 · 5:00 PM',  type: 'product',    item: 'Cupcakes',          qty: '4 pcs',  reason: 'Unsold',   notes: 'Leftover from display' },
];

// ─── ANALYTICS ───────────────────────────────────────────────
export const ANALYTICS = {

  // TODO (backend): GET /analytics/kpi?view=day|week|month|year
  kpi: {
    day:   { sales: 40000,   expenses: 28540,  profit: 11460,  margin: 28.7, sDelta: -4.3, eDelta: 3.8,  pDelta: 1.8,  mDelta: -2.1 },
    week:  { sales: 158000,  expenses: 88500,  profit: 69500,  margin: 44.0, sDelta: 6.2,  eDelta: 2.1,  pDelta: 11.4, mDelta: 3.3  },
    month: { sales: 584000,  expenses: 340000, profit: 244000, margin: 41.8, sDelta: 8.4,  eDelta: 4.2,  pDelta: 14.2, mDelta: 2.5  },
    year:  { sales: 6200000, expenses: 3500000,profit: 2700000,margin: 43.5, sDelta: 22.1, eDelta: 15.3, pDelta: 31.4, mDelta: 4.8  },
  },

  // TODO (backend): GET /analytics/trend?view=day|week|month|year
  trend: {
    // Day total: sales=40000, expenses=28540 → spread across 8 time slots
    day:   { labels: ['6am','8am','10am','12pm','2pm','4pm','6pm','8pm'], sales: [3800,4200,5100,6200,5800,6500,5400,3000], expenses: [2700,3000,3600,4400,4100,4600,3840,2300] },
    // Week total: sales=158000, expenses=88500
    week:  { labels: ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],         sales: [18000,21000,14000,23000,28000,35000,19000], expenses: [10000,12000,8000,13500,15500,19000,10500] },
    // Month total: sales=584000, expenses=340000 — spread across 12 months
    month: { labels: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'], sales: [37400,35600,41200,46800,44900,52400,48700,54300,58000,50500,54300,59900], expenses: [21700,20800,23600,27400,26400,31200,28300,32100,34000,29300,32100,33100] },
    // Year total: sales=6200000, expenses=3500000
    year:  { labels: ['2021','2022','2023','2024','2025','2026'], sales: [2800000,3400000,3800000,4200000,4800000,6200000], expenses: [1600000,1950000,2100000,2300000,2600000,3500000] },
  },

  // TODO (backend): GET /analytics/top-products?view=day|week|month|year
  topProducts: {
    day:   [{ name: 'Package B',  sold: 14   }, { name: 'Ensaymada', sold: 12  }, { name: 'Cupcake',   sold: 10  }, { name: 'Package A',    sold: 8   }, { name: 'Spanish Bread', sold: 6   }],
    week:  [{ name: 'Package B',  sold: 68   }, { name: 'Package A', sold: 51  }, { name: 'Ensaymada', sold: 45  }, { name: 'Cupcake',      sold: 38  }, { name: 'Brownies',      sold: 32  }],
    month: [{ name: 'Package B',  sold: 98   }, { name: 'Package A', sold: 71  }, { name: 'Ensaymada', sold: 53  }, { name: 'Cupcake',      sold: 43  }, { name: 'Brownies',      sold: 32  }],
    year:  [{ name: 'Package B',  sold: 1124 }, { name: 'Package A', sold: 892 }, { name: 'Ensaymada', sold: 745 }, { name: 'Cupcake',      sold: 618 }, { name: 'Brownies',      sold: 512 }],
  },

  // TODO (backend): GET /analytics/actual-vs-forecast?view=week|month|year|allTime
  actualVsForecast: {
    day: [
      { label: '6am',  actualSales: 3200, actualExpenses: 1800, forecastSales: null, forecastExpenses: null  },
      { label: '8am',  actualSales: 2800, actualExpenses: 1600, forecastSales: null, forecastExpenses: null  },
      { label: '10am', actualSales: 3600, actualExpenses: 2000, forecastSales: null, forecastExpenses: null  },
      { label: '12pm', actualSales: 4100, actualExpenses: 2200, forecastSales: null, forecastExpenses: null  },
      { label: '2pm',  actualSales: 3900, actualExpenses: 2100, forecastSales: 3900, forecastExpenses: 2100 },
      { label: '4pm',  actualSales: null, actualExpenses: null, forecastSales: 4500, forecastExpenses: 2400 },
      { label: '6pm',  actualSales: null, actualExpenses: null, forecastSales: 4200, forecastExpenses: 2300 },
      { label: '8pm',  actualSales: null, actualExpenses: null, forecastSales: 3800, forecastExpenses: 2100 },
    ],
    week: [
      { label: 'Mon', actualSales: 18000, actualExpenses: 10000, forecastSales: null,  forecastExpenses: null  },
      { label: 'Tue', actualSales: 21000, actualExpenses: 12000, forecastSales: null,  forecastExpenses: null  },
      { label: 'Wed', actualSales: 14000, actualExpenses: 8000,  forecastSales: null,  forecastExpenses: null  },
      { label: 'Thu', actualSales: 23000, actualExpenses: 13500, forecastSales: null,  forecastExpenses: null  },
      { label: 'Fri', actualSales: 28000, actualExpenses: 15500, forecastSales: 28000, forecastExpenses: 15500 },
      { label: 'Sat', actualSales: null,  actualExpenses: null,  forecastSales: 35000, forecastExpenses: 20000 },
      { label: 'Sun', actualSales: null,  actualExpenses: null,  forecastSales: 20000, forecastExpenses: 11000 },
    ],
    month: [
      { label: 'Jan', actualSales: 58000,  actualExpenses: 32000, forecastSales: null,  forecastExpenses: null  },
      { label: 'Feb', actualSales: 54000,  actualExpenses: 30000, forecastSales: null,  forecastExpenses: null  },
      { label: 'Mar', actualSales: 62000,  actualExpenses: 34000, forecastSales: null,  forecastExpenses: null  },
      { label: 'Apr', actualSales: 71000,  actualExpenses: 39000, forecastSales: null,  forecastExpenses: null  },
      { label: 'May', actualSales: 68000,  actualExpenses: 37000, forecastSales: null,  forecastExpenses: null  },
      { label: 'Jun', actualSales: 80000,  actualExpenses: 43000, forecastSales: null,  forecastExpenses: null  },
      { label: 'Jul', actualSales: 75000,  actualExpenses: 41000, forecastSales: null,  forecastExpenses: null  },
      { label: 'Aug', actualSales: 83000,  actualExpenses: 45000, forecastSales: 83000, forecastExpenses: 45000 },
      { label: 'Sep', actualSales: null,   actualExpenses: null,  forecastSales: 90000, forecastExpenses: 48000 },
      { label: 'Oct', actualSales: null,   actualExpenses: null,  forecastSales: 78000, forecastExpenses: 42000 },
      { label: 'Nov', actualSales: null,   actualExpenses: null,  forecastSales: 84000, forecastExpenses: 45000 },
      { label: 'Dec', actualSales: null,   actualExpenses: null,  forecastSales: 95000, forecastExpenses: 51000 },
    ],
    year: [
      { label: 'Jan', actualSales: 350000, actualExpenses: 180000, forecastSales: null,   forecastExpenses: null   },
      { label: 'Feb', actualSales: 380000, actualExpenses: 190000, forecastSales: null,   forecastExpenses: null   },
      { label: 'Mar', actualSales: 310000, actualExpenses: 160000, forecastSales: null,   forecastExpenses: null   },
      { label: 'Apr', actualSales: 410000, actualExpenses: 210000, forecastSales: null,   forecastExpenses: null   },
      { label: 'May', actualSales: 390000, actualExpenses: 200000, forecastSales: 390000, forecastExpenses: 200000 },
      { label: 'Jun', actualSales: null,   actualExpenses: null,   forecastSales: 420000, forecastExpenses: 215000 },
      { label: 'Jul', actualSales: null,   actualExpenses: null,   forecastSales: 430000, forecastExpenses: 220000 },
      { label: 'Aug', actualSales: null,   actualExpenses: null,   forecastSales: 410000, forecastExpenses: 205000 },
      { label: 'Sep', actualSales: null,   actualExpenses: null,   forecastSales: 450000, forecastExpenses: 225000 },
      { label: 'Oct', actualSales: null,   actualExpenses: null,   forecastSales: 470000, forecastExpenses: 235000 },
      { label: 'Nov', actualSales: null,   actualExpenses: null,   forecastSales: 520000, forecastExpenses: 260000 },
      { label: 'Dec', actualSales: null,   actualExpenses: null,   forecastSales: 600000, forecastExpenses: 300000 },
    ],
    allTime: [
      { label: '2023', actualSales: 3800000, actualExpenses: 1900000, forecastSales: null,    forecastExpenses: null    },
      { label: '2024', actualSales: 4200000, actualExpenses: 2100000, forecastSales: null,    forecastExpenses: null    },
      { label: '2025', actualSales: 4800000, actualExpenses: 2400000, forecastSales: 4800000, forecastExpenses: 2400000 },
      { label: '2026', actualSales: null,    actualExpenses: null,    forecastSales: 5500000, forecastExpenses: 2700000 },
      { label: '2027', actualSales: null,    actualExpenses: null,    forecastSales: 6200000, forecastExpenses: 3000000 },
    ],
  },

  // TODO (backend): GET /analytics/predictive?view=day|week|month|year
  predictive: {
    growthLeaders: {
      day:   [{ name: 'Ensaymada',          forecast: 36,  pct: 20 }, { name: 'Puto Cheese',         forecast: 21,  pct: 18 }, { name: 'Strawberry Cupcake', forecast: 25,  pct: 15 }],
      week:  [{ name: 'Ensaymada',          forecast: 198, pct: 28 }, { name: 'Puto Cheese',         forecast: 102, pct: 24 }, { name: 'Package B',          forecast: 112, pct: 22 }],
      month: [{ name: 'Ensaymada',          forecast: 298, pct: 42 }, { name: 'Package B',           forecast: 166, pct: 38 }, { name: 'Strawberry Cupcake', forecast: 190, pct: 31 }],
      year:  [{ name: 'Ensaymada',          forecast: 4028,pct: 52 }, { name: 'Package B',           forecast: 2059,pct: 45 }, { name: 'Strawberry Cupcake', forecast: 2512,pct: 38 }],
    },
    atRisk: {
      day:   [{ name: 'Polvoron',           forecast: 2,   pct: -16 }, { name: 'Eggpie',             forecast: 5,   pct: -12 }, { name: 'Red Velvet Cupcake', forecast: 10,  pct: -9  }],
      week:  [{ name: 'Polvoron',           forecast: 12,  pct: -20 }, { name: 'Eggpie',             forecast: 36,  pct: -14 }, { name: 'Mamon',              forecast: 18,  pct: -14 }],
      month: [{ name: 'Polvoron',           forecast: 15,  pct: -25 }, { name: 'Eggpie',             forecast: 46,  pct: -21 }, { name: 'Mamon',              forecast: 23,  pct: -21 }],
      year:  [{ name: 'Polvoron',           forecast: 184, pct: -25 }, { name: 'Eggpie',             forecast: 576, pct: -20 }, { name: 'Mamon',              forecast: 272, pct: -20 }],
    },
  },
};