import { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, ShoppingCart, Edit2, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast, Button, Modal, Input, Select, Table, Tr, Td, Card, ConfirmModal } from '../../components/ui';

export default function RecipeTab() {
  const { recipes, ingredients, products = [], addRecipe, updateRecipe, deleteRecipe, confirmBatch, updateProduct } = useApp();
  const { show: showToast } = useToast();

  const [modalOpen, setModalOpen]       = useState(false);
  const [editRecipe, setEditRecipe]     = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const [rows, setRows]       = useState([{ name: '', qty: '', unit: '' }]);
  const [product, setProduct] = useState('');
  const [cost, setCost]       = useState('');
  const [yld, setYld]         = useState('');
  const [yldUnit, setYldUnit] = useState('pcs');

  const [quotas, setQuotas] = useState({});
  const [localStocks, setLocalStocks] = useState({});
  const [search, setSearch] = useState('');

  // ── PAGINATION ──
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // ── CALCULATOR ──
  const calculateMaxUnits = (recipe, inventory) => {
    if (!recipe.ingredients || recipe.ingredients.length === 0) return 0;
    let maxBatches = Infinity;
    for (const req of recipe.ingredients) {
      const stockItem = inventory.find(i => i.name.trim().toLowerCase() === req.name.trim().toLowerCase());
      if (!stockItem || Number(stockItem.stock) <= 0) return 0;
      const possibleBatches = Math.floor(Number(stockItem.stock) / Number(req.qty));
      if (possibleBatches < maxBatches) maxBatches = possibleBatches;
    }
    return maxBatches === Infinity ? 0 : maxBatches * Number(recipe.yield);
  };

  // ── AUTO SHOPPING LIST: recipes na 0 ang stock capacity ──
  const zeroCapacityShortfalls = useMemo(() => {
    const totalNeededMap = {};
    for (const r of recipes) {
      const maxUnits = calculateMaxUnits(r, ingredients);
      if (maxUnits > 0) continue;
      for (const req of r.ingredients) {
        const key = req.name.trim().toLowerCase();
        if (!totalNeededMap[key]) {
          totalNeededMap[key] = { name: req.name, unit: req.unit, totalNeeded: 0 };
        }
        totalNeededMap[key].totalNeeded = +(totalNeededMap[key].totalNeeded + Number(req.qty)).toFixed(4);
      }
    }
    const result = [];
    for (const entry of Object.values(totalNeededMap)) {
      const stockItem = ingredients.find(i => i.name.trim().toLowerCase() === entry.name.trim().toLowerCase());
      const have = stockItem ? Number(stockItem.stock) : 0;
      if (have < entry.totalNeeded) {
        result.push({ name: entry.name, unit: entry.unit, have, shortage: +(entry.totalNeeded - have).toFixed(4) });
      }
    }
    return result;
  }, [recipes, ingredients]);

  // ── QUOTA-BASED SHORTFALLS ──
  const consolidatedShortfalls = useMemo(() => {
    const totalNeededMap = {};
    for (const r of recipes) {
      const targetGoal = Number(quotas[r.id]);
      if (!targetGoal || targetGoal <= 0) continue;
      const maxUnits = calculateMaxUnits(r, ingredients);
      if (maxUnits >= targetGoal) continue;
      const neededBatches = Math.ceil(targetGoal / Number(r.yield));
      for (const req of r.ingredients) {
        const key = req.name.trim().toLowerCase();
        if (!totalNeededMap[key]) {
          totalNeededMap[key] = { name: req.name, unit: req.unit, totalNeeded: 0 };
        }
        totalNeededMap[key].totalNeeded = +(totalNeededMap[key].totalNeeded + Number(req.qty) * neededBatches).toFixed(4);
      }
    }
    const result = [];
    for (const entry of Object.values(totalNeededMap)) {
      const stockItem = ingredients.find(i => i.name.trim().toLowerCase() === entry.name.trim().toLowerCase());
      const have = stockItem ? Number(stockItem.stock) : 0;
      if (have < entry.totalNeeded) {
        result.push({ name: entry.name, unit: entry.unit, have, shortage: +(entry.totalNeeded - have).toFixed(4) });
      }
    }
    return result;
  }, [recipes, ingredients, quotas]);

  // ── MERGE both lists (quota overrides zero-capacity, deduplicated) ──
  const allShortfalls = useMemo(() => {
    const map = {};
    for (const item of zeroCapacityShortfalls) map[item.name.trim().toLowerCase()] = item;
    for (const item of consolidatedShortfalls) map[item.name.trim().toLowerCase()] = item;
    return Object.values(map);
  }, [zeroCapacityShortfalls, consolidatedShortfalls]);

  // ── MODAL HANDLERS ──
  const openAdd = () => {
    setEditRecipe(null); setProduct(''); setCost(''); setYld(''); setYldUnit('pcs');
    setRows([{ name: '', qty: '', unit: '' }]); setModalOpen(true);
  };

  const openEdit = (r) => {
    setEditRecipe(r); setProduct(r.product); setCost(r.estimatedCost);
    setYld(r.yield); setYldUnit(r.yieldUnit);
    setRows(r.ingredients.map(i => ({ ...i }))); setModalOpen(true);
  };

  const handleSave = () => {
    if (!product || !yld) return;
    const ings = rows.filter(r => r.name && r.qty);
    const data = {
      product: product.trim(),
      estimatedCost: Number(cost) || 0,
      yield: Number(yld), yieldUnit: yldUnit,
      ingredients: ings.map(r => ({ name: r.name.trim(), qty: Number(r.qty), unit: r.unit || 'units' })),
    };
    if (editRecipe?.id) { updateRecipe(editRecipe.id, data); showToast('Recipe updated.'); }
    else                { addRecipe(data);                   showToast('Recipe added.'); }
    setModalOpen(false);
  };

  const handleDirectConfirm = (recipe, goalNum) => {
    if (!goalNum || goalNum <= 0) return;
    if (confirmBatch) confirmBatch(recipe.id, goalNum);
    const matchedProduct = products.find(p => p.name.trim().toLowerCase() === recipe.product.trim().toLowerCase());
    const contextStock = matchedProduct ? Number(matchedProduct.stock) : 0;
    const actualCurrentStock = localStocks[recipe.id] !== undefined ? localStocks[recipe.id] : contextStock;
    const newStock = actualCurrentStock + Number(goalNum);
    setLocalStocks(prev => ({ ...prev, [recipe.id]: newStock }));
    setQuotas(prev => { const n = { ...prev }; delete n[recipe.id]; return n; });
    showToast(`✓ ${goalNum} ${recipe.yieldUnit || 'pcs'} ng ${recipe.product} na-produce — naka-log sa Product Log.`, 'success');
  };

  return (
    <div className="space-y-4">

      {/* ── SHOPPING LIST BANNER ── */}
      {allShortfalls.length > 0 && (
        <div className="border border-red-200 bg-white rounded-xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-2 px-4 py-2.5 bg-red-50 border-b border-red-200">
            <ShoppingCart size={14} className="text-red-600 shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-700 flex-1">
              Shopping List — Kailangan Pang Bilhin
            </p>
            <span className="text-[10px] font-bold bg-red-600 text-white px-2 py-0.5 rounded-full">
              {allShortfalls.length} item{allShortfalls.length > 1 ? 's' : ''}
            </span>
          </div>

          {/* Simple list rows */}
          <ul className="divide-y divide-gray-100">
            {allShortfalls.map((item, idx) => (
              <li key={item.name} className="flex items-center gap-3 px-4 py-2.5">
                <span className="w-5 h-5 rounded-full bg-red-100 text-red-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <span className="flex-1 text-sm font-semibold text-gray-800">{item.name}</span>
                <span className="text-xs text-gray-400">
                  Mayroon: <span className="font-medium text-gray-600">{item.have} {item.unit}</span>
                </span>
                <span className="text-xs font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded-md min-w-[80px] text-right">
                  +{item.shortage} {item.unit}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── MAIN TABLE (original design preserved) ── */}
      <Card>
        <div className="flex items-center justify-between p-4 border-b border-brand-100">
          <div>
            <h3 className="font-bold text-brand-800">Product Log</h3>
            <p className="text-xs text-brand-400 mt-0.5">
              Maglagay ng Goal. Magkukulay green ang input kapas sapat ang ingredients.
            </p>
          </div>
          <Button variant="dark" onClick={openAdd}><Plus size={14} /> Add Recipe</Button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-brand-100 bg-brand-50/40">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search recipe..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-brand-200 rounded-lg outline-none focus:border-brand-400 bg-white"
            />
          </div>
        </div>

        <Table columns={[
          { label: 'Item Info' },
          { label: 'Items per Batch' },
          { label: 'Expense per Batch' },
          { label: 'Stock Capacity' },
          { label: 'Production Target' },
          { label: 'Finished Production' },
          { label: 'Actions', align: 'right' },
        ]}>
          {(() => {
            const filteredRecipes = recipes.filter(r =>
              r.product.toLowerCase().includes(search.toLowerCase())
            );
            const totalPages = Math.max(1, Math.ceil(filteredRecipes.length / PAGE_SIZE));
            const safePage = Math.min(currentPage, totalPages);
            const paged = filteredRecipes.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
            return paged.map(r => {
              const maxUnits = calculateMaxUnits(r, ingredients);
              const quota    = quotas[r.id] || '';
              const quotaNum = Number(quota);
              const hasInput = quotaNum > 0;
              const canMake  = hasInput && maxUnits >= quotaNum;

              const matchedProduct = products.find(p => {
                const pn = p.name.trim().toLowerCase();
                const rn = r.product.trim().toLowerCase();
                return pn === rn || pn.startsWith(rn) || rn.startsWith(pn);
              });
              const contextStock = matchedProduct ? Number(matchedProduct.stock) : 0;
              const currentStock = localStocks[r.id] !== undefined ? localStocks[r.id] : contextStock;

              let inputClasses = "border-brand-200 focus:border-brand-400 bg-white text-brand-900";
              if (hasInput) {
                inputClasses = canMake
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700 focus:border-emerald-600"
                  : "border-red-400 bg-red-50 text-red-700 focus:border-red-500";
              }

              return (
                <Tr key={r.id}>
                  {/* 1. Product Details */}
                  <Td>
                    <p className="font-bold text-brand-900 text-sm">{r.product}</p>
                    <p className="text-[11px] text-brand-400 mt-0.5 truncate max-w-[160px]" title={r.ingredients.map(i => i.name).join(', ')}>
                      {r.ingredients.map(i => i.name).join(', ')}
                    </p>
                  </Td>

                  {/* 2. Yield per Batch */}
                  <Td>
                    <p className="font-semibold text-brand-700 text-sm">{r.yield} {r.yieldUnit}</p>
                  </Td>

                  {/* 3. Cost per Batch */}
                  <Td>
                    <p className="font-semibold text-brand-500 text-sm">₱{r.estimatedCost?.toLocaleString()}</p>
                  </Td>

                  {/* 4. Stock Capacity */}
                  <Td>
                    <span className={`font-bold px-3 py-1.5 rounded-lg border shadow-sm whitespace-nowrap text-sm transition-all duration-300
                      ${maxUnits === 0 ? 'bg-red-50 text-red-700 border-red-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200'}`}
                    >
                      {maxUnits} {r.yieldUnit}
                    </span>
                  </Td>

                  {/* 5. Set Goal */}
                  <Td>
                    <input
                      type="number" min="1" value={quota}
                      onChange={e => setQuotas(prev => ({ ...prev, [r.id]: e.target.value }))}
                      placeholder="0"
                      className={`w-[100px] px-3 py-2 text-sm border rounded-lg outline-none text-center font-bold transition-colors ${inputClasses}`}
                    />
                  </Td>

                  {/* 6. Finished Stock */}
                  <Td>
                    <span className="font-bold text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 shadow-sm whitespace-nowrap transition-all duration-300">
                      {currentStock} {r.yieldUnit}
                    </span>
                  </Td>

                  {/* 7. Actions */}
                  <Td align="right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`${canMake ? 'visible' : 'invisible'}`}>
                        <Button
                          size="sm"
                          variant="primary"
                          className="whitespace-nowrap px-3 bg-emerald-600 hover:bg-emerald-700 border-none shadow-md"
                          onClick={() => handleDirectConfirm(r, quotaNum)}
                        >
                          <CheckCircle2 size={14} className="mr-1" /> Confirm
                        </Button>
                      </div>
                      <button onClick={() => openEdit(r)} className="p-1.5 text-brand-400 hover:text-brand-700 transition-colors bg-brand-50 hover:bg-brand-100 rounded-md">
                        <Edit2 size={15} />
                      </button>
                      <button onClick={() => setDeleteTarget(r)} className="p-1.5 text-red-400 hover:text-red-600 transition-colors bg-red-50 hover:bg-red-100 rounded-md">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </Td>
                </Tr>
              );
            });
          })()}
          {!recipes.length && (
            <Tr><Td className="text-center text-brand-300 py-8" colSpan={7}>Walang recipe pa. Mag-add para magsimulang mag-plan.</Td></Tr>
          )}
          {recipes.length > 0 && search && !recipes.filter(r => r.product.toLowerCase().includes(search.toLowerCase())).length && (
            <Tr><Td className="text-center text-brand-300 py-8" colSpan={7}>Walang nahanap na recipe.</Td></Tr>
          )}
        </Table>

        {/* ── PAGINATION ── */}
        {recipes.filter(r => r.product.toLowerCase().includes(search.toLowerCase())).length > PAGE_SIZE && (() => {
          const filteredRecipes = recipes.filter(r => r.product.toLowerCase().includes(search.toLowerCase()));
          const totalPages = Math.ceil(filteredRecipes.length / PAGE_SIZE);
          const safePage = Math.min(currentPage, totalPages);
          return (
            <div className="flex items-center justify-between px-4 py-3 border-t border-brand-100">
              <p className="text-xs text-brand-400">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filteredRecipes.length)} of {filteredRecipes.length} recipes
              </p>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-brand-200 text-brand-600 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >← Prev</button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pg => (
                  <button key={pg} onClick={() => setCurrentPage(pg)}
                    className={`w-8 h-8 text-xs font-bold rounded-lg transition-colors
                      ${pg === safePage ? 'bg-brand-800 text-white' : 'border border-brand-200 text-brand-600 hover:bg-brand-50'}`}>
                    {pg}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-brand-200 text-brand-600 hover:bg-brand-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >Next →</button>
              </div>
            </div>
          );
        })()}
      </Card>

      {/* ── MODALS ── */}
      <Modal
        isOpen={modalOpen} onClose={() => setModalOpen(false)}
        title={editRecipe ? 'Edit Recipe' : 'Add Recipe'}
        size="lg"
        footer={
          <div className="flex items-center justify-between">
            {editRecipe && (
              <Button variant="danger" size="sm" onClick={() => {
                deleteRecipe(editRecipe.id); showToast('Recipe deleted.', 'warning'); setModalOpen(false);
              }}>Delete Recipe</Button>
            )}
            <div className="flex gap-3 ml-auto">
              <Button variant="secondary" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleSave}>Save Recipe</Button>
            </div>
          </div>
        }
      >
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Select
              label="Product Name"
              required
              value={product}
              onChange={e => setProduct(e.target.value)}
            >
              <option value="" disabled>Select a product...</option>
              {products.map(p => {
                const hasExistingRecipe = recipes.some(r => r.product.toLowerCase() === p.name.toLowerCase());
                const isCurrentEdit = editRecipe && editRecipe.product.toLowerCase() === p.name.toLowerCase();
                if (!hasExistingRecipe || isCurrentEdit) {
                  return <option key={p.id} value={p.name}>{p.name}</option>;
                }
                return null;
              })}
            </Select>
            <Input label="Est. Cost per Batch (₱)" type="number" value={cost} onChange={e => setCost(e.target.value)} placeholder="0.00" />
            <Input label="Actual Yield per Batch" required type="number" value={yld} onChange={e => setYld(e.target.value)} placeholder="e.g. 12" />
            <Input label="Yield Unit" value={yldUnit} onChange={e => setYldUnit(e.target.value)} placeholder="pcs, slices..." />
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-brand-500 mb-3">
              Ingredients per Batch <span className="text-red-500">*</span>
            </p>
            {rows.map((row, i) => (
              <div key={i} className="flex gap-2 mb-2">
                <input value={row.name}
                  onChange={e => setRows(prev => prev.map((r, j) => j === i ? { ...r, name: e.target.value } : r))}
                  placeholder="Ingredient name"
                  className="flex-1 px-3 py-2 text-sm border border-brand-200 rounded-lg outline-none focus:border-brand-400" />
                <input value={row.qty} type="number"
                  onChange={e => setRows(prev => prev.map((r, j) => j === i ? { ...r, qty: e.target.value } : r))}
                  placeholder="Qty"
                  className="w-20 px-3 py-2 text-sm border border-brand-200 rounded-lg outline-none focus:border-brand-400" />
                <input value={row.unit}
                  onChange={e => setRows(prev => prev.map((r, j) => j === i ? { ...r, unit: e.target.value } : r))}
                  placeholder="unit"
                  className="w-16 px-3 py-2 text-sm border border-brand-200 rounded-lg outline-none focus:border-brand-400" />
                <button onClick={() => setRows(prev => prev.filter((_, j) => j !== i))}
                  className="w-9 h-9 rounded-lg bg-red-50 border border-red-200 flex items-center justify-center text-red-500 hover:bg-red-100 transition-colors">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
            <button onClick={() => setRows(prev => [...prev, { name: '', qty: '', unit: '' }])}
              className="w-full border border-dashed border-brand-300 rounded-lg py-2 text-xs font-semibold text-brand-500 hover:border-brand-500 transition-colors">
              + Add Ingredient Row
            </button>
          </div>
        </div>
      </Modal>

      <ConfirmModal
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)}
        onConfirm={() => { deleteRecipe(deleteTarget.id); showToast('Recipe deleted.', 'warning'); }}
        title="Delete Recipe" message={`Delete recipe for "${deleteTarget?.product}"?`}
        confirmLabel="Delete" variant="danger"
      />
    </div>
  );
}