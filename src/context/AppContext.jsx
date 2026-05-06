import { createContext, useContext, useState, useCallback } from 'react';
import {
  PRODUCTS as INIT_PRODUCTS,
  ORDERS as INIT_ORDERS,
  INGREDIENTS as INIT_INGREDIENTS,
  RECIPES as INIT_RECIPES,
  WASTE_LOGS as INIT_WASTE_LOGS,
} from '../data/dummyData';

// ── Service imports (ready for backend connection)
// import { productService }   from '../services/productService';
// import { orderService }     from '../services/orderService';
// import { ingredientService, recipeService, productionService, wasteService } from '../services/inventoryService';

const AppContext = createContext(null);

let _orderId = 242;
const genOrderId = () => `ORD-0${_orderId++}`;

const nowStr = () => new Date().toLocaleString('en-US', {
  month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
});

// Initial dummy data para sa Celebration Materials
const INIT_MATERIALS = [
  { id: 'm1', name: 'Foil Balloon (Numbers 0-9)', unit: 'pcs', stock: 50, min: 10, costPerUnit: 25 },
  { id: 'm2', name: 'Foil Balloon (Letters A-Z)', unit: 'pcs', stock: 120, min: 20, costPerUnit: 25 },
  { id: 'm3', name: 'Latex Metallic Balloons (Pack of 50)', unit: 'packs', stock: 15, min: 5, costPerUnit: 120 },
  { id: 'm4', name: 'Pastel Balloons (Pack of 100)', unit: 'packs', stock: 8, min: 3, costPerUnit: 180 },
  { id: 'm5', name: 'Tarpaulin (2x3 ft - Generic Layout)', unit: 'pcs', stock: 12, min: 5, costPerUnit: 150 },
  { id: 'm6', name: 'Tarpaulin (3x4 ft - Customized)', unit: 'pcs', stock: 5, min: 2, costPerUnit: 300 },
  { id: 'm7', name: 'Number Candle (Assorted)', unit: 'pcs', stock: 80, min: 20, costPerUnit: 15 },
  { id: 'm8', name: 'Sparkler Candles', unit: 'packs', stock: 25, min: 10, costPerUnit: 45 },
];

export function AppProvider({ children }) {

  // ── State ──────────────────────────────────────────────────────
  const [products,    setProducts]    = useState(INIT_PRODUCTS);
  const [orders,      setOrders]      = useState(INIT_ORDERS);
  const [wasteLogs,   setWasteLogs]   = useState(INIT_WASTE_LOGS);
  const [recipes,     setRecipes]     = useState(INIT_RECIPES);
  
  // BAGONG STATE: Para sa Celebration Materials
  const [materials,   setMaterials]   = useState(INIT_MATERIALS);
  
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState(null);

  // Each ingredient carries its own stockLog: [{ dt, type, qty, unit, note }]
  // type: 'initial' | 'restock' | 'deducted' | 'waste'
  const [ingredients, setIngredients] = useState(() =>
    INIT_INGREDIENTS.map(ing => ({
      ...ing,
      stockLog: [{ dt: nowStr(), type: 'initial', qty: ing.stock, unit: ing.unit, note: 'Initial stock' }],
    }))
  );

  // ── Products ───────────────────────────────────────────────────
  // TODO (backend): await productService.create(product)
  const addProduct = useCallback((product) => {
    const id = `p${Date.now()}`;
    setProducts(prev => [...prev, { ...product, id, stock: 10, active: true, dateExceptions: [] }]);
  }, []);

  // TODO (backend): await productService.update(id, updates)
  const updateProduct = useCallback((id, updates) => {
    setProducts(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  }, []);

  // TODO (backend): await productService.remove(id)
  const deleteProduct = useCallback((id) => {
    setProducts(prev => prev.filter(p => p.id !== id));
  }, []);

  // ── Orders ─────────────────────────────────────────────────────
  // TODO (backend): await orderService.create(orderData)
  const addOrder = useCallback((orderData) => {
    const newOrder = { ...orderData, id: genOrderId(), createdAt: new Date().toLocaleString() };
    setOrders(prev => [newOrder, ...prev]);
    return newOrder.id;
  }, []);

  // TODO (backend): await orderService.updateStatus(id, status)
  const updateOrderStatus = useCallback((id, status) => {
    setOrders(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  }, []);

  // ── Ingredients ────────────────────────────────────────────────
  // TODO (backend): await ingredientService.create(ing)
  const addIngredient = useCallback((ing) => {
    const id  = `i${Date.now()}`;
    const log = [{ dt: nowStr(), type: 'initial', qty: ing.stock, unit: ing.unit, note: 'Initial stock' }];
    setIngredients(prev => [...prev, { ...ing, id, stockLog: log }]);
  }, []);

  // TODO (backend): await ingredientService.update(id, updates)
  // `addedQty` is the NEW stock being added this time (for ledger).
  // `updates` should contain the already-computed new total stock.
  const updateIngredient = useCallback((id, updates, addedQty = 0, note = '') => {
    setIngredients(prev => prev.map(ing => {
      if (ing.id !== id) return ing;
      const logEntry = addedQty > 0
        ? { dt: nowStr(), type: 'restock', qty: addedQty, unit: ing.unit, note: note || 'Stock added' }
        : null;
      return {
        ...ing,
        ...updates,
        stockLog: logEntry ? [logEntry, ...(ing.stockLog || [])] : (ing.stockLog || []),
      };
    }));
  }, []);

  // TODO (backend): await ingredientService.remove(id)
  const deleteIngredient = useCallback((id) => {
    setIngredients(prev => prev.filter(i => i.id !== id));
  }, []);

  // ── Celebration Materials ──────────────────────────────────────
  
  // TODO (backend): await materialService.create(mat)
  const addMaterial = useCallback((mat) => {
    const id = `m${Date.now()}`;
    setMaterials(prev => [...prev, { ...mat, id }]);
  }, []);

  // TODO (backend): await materialService.update(id, updates)
  const updateMaterial = useCallback((id, updates, addedQty = 0, note = '') => {
    setMaterials(prev => prev.map(m => {
      if (m.id !== id) return m;
      return { ...m, ...updates };
    }));
  }, []);

  // TODO (backend): await materialService.remove(id)
  const deleteMaterial = useCallback((id) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  }, []);


  // ── Recipes ────────────────────────────────────────────────────
  // TODO (backend): await recipeService.create(recipe)
  const addRecipe = useCallback((recipe) => {
    const id = `r${Date.now()}`;
    setRecipes(prev => [...prev, { ...recipe, id }]);
  }, []);

  // TODO (backend): await recipeService.update(id, updates)
  const updateRecipe = useCallback((id, updates) => {
    setRecipes(prev => prev.map(r => r.id === id ? { ...r, ...updates } : r));
  }, []);

  // TODO (backend): await recipeService.remove(id)
  const deleteRecipe = useCallback((id) => {
    setRecipes(prev => prev.filter(r => r.id !== id));
  }, []);

  // ── Confirm Batch Production ────────────────────────────────────
  // Deducts ingredients based on recipe, adds to product stock in POS.
  // TODO (backend): await productionService.logBatch({ recipeId, produced })
  //   then refetch ingredients and products from API
  const confirmBatch = useCallback((recipeId, produced) => {
    const recipe = recipes.find(r => r.id === recipeId);
    if (!recipe) return;

    const batchesUsed = Math.ceil(produced / recipe.yield);
    const dt = nowStr();

    // Deduct from ingredients with ledger entry
    setIngredients(prev => prev.map(ing => {
      const ri = recipe.ingredients.find(r => r.name === ing.name);
      if (!ri) return ing;
      const deducted = +(ri.qty * batchesUsed).toFixed(4);
      const newStock = +(Math.max(0, ing.stock - deducted)).toFixed(4);
      const logEntry = {
        dt,
        type: 'deducted',
        qty: deducted,
        unit: ing.unit,
        note: `Ginamit sa ${produced} ${recipe.yieldUnit} ng ${recipe.product}`,
      };
      return { ...ing, stock: newStock, stockLog: [logEntry, ...(ing.stockLog || [])] };
    }));

    // Add produced units to matching POS product stock
    setProducts(prev => prev.map(p =>
      p.name.toLowerCase().includes(recipe.product.split(' ')[0].toLowerCase())
        ? { ...p, stock: p.stock + produced }
        : p
    ));
  }, [recipes]);

  // ── Waste Logs ─────────────────────────────────────────────────
  // TODO (backend): await wasteService.log(wasteData)
// ── Waste Logs ─────────────────────────────────────────────────
  const logWaste = useCallback((wasteData) => {
    const dt = nowStr();
    
    // Kung ang na-waste ay ingredient, ibabawas sa ingredients list
    if (wasteData.type === 'ingredient') {
      setIngredients(prev => prev.map(i => {
        if (i.name !== wasteData.item) return i;
        const newStock = +(Math.max(0, i.stock - wasteData.rawQty)).toFixed(4);
        const logEntry = {
          dt,
          type: 'waste',
          qty: wasteData.rawQty,
          unit: i.unit,
          note: `${wasteData.reason}${wasteData.notes ? ' — ' + wasteData.notes : ''}`,
        };
        return { ...i, stock: newStock, stockLog: [logEntry, ...(i.stockLog || [])] };
      }));
    }
    
    // BAGONG LOGIC: Kung ang na-waste ay Celebration Material, ibabawas sa materials list
    else if (wasteData.type === 'material') {
      setMaterials(prev => prev.map(m => {
        if (m.name !== wasteData.item) return m;
        const newStock = +(Math.max(0, m.stock - wasteData.rawQty)).toFixed(4);
        return { ...m, stock: newStock };
      }));
    }

    setWasteLogs(prev => [{ ...wasteData, id: `w${Date.now()}`, dt }, ...prev]);
  }, []);

  const value = {
    // ── Data
    products, orders, ingredients, materials, recipes, wasteLogs,
    // ── Status
    loading, error,
    // ── Product actions
    addProduct, updateProduct, deleteProduct,
    // ── Order actions
    addOrder, updateOrderStatus,
    // ── Ingredient actions
    addIngredient, updateIngredient, deleteIngredient,
    // ── Material actions
    addMaterial, updateMaterial, deleteMaterial,
    // ── Recipe actions
    addRecipe, updateRecipe, deleteRecipe,
    // ── Batch production
    confirmBatch,
    // ── Waste
    logWaste,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export const useApp = () => {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
};