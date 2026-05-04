import { useState, useMemo } from 'react';
import { Plus, Trash2, CheckCircle2, ShoppingCart, Edit2 } from 'lucide-react';
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

  // ── PAGINATION ──
  const PAGE_SIZE = 8;
  const [currentPage, setCurrentPage] = useState(1);

  // ── 1. SARILING CALCULATOR PARA SA EXPECTED ──
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

  // ── 2. CONSOLIDATED SHORTFALL — iisa lang ang stock, pinagsama-samang need ng lahat ng recipe ──
  const consolidatedShortfalls = useMemo(() => {
    // Step 1: I-total ang needed per ingredient — ONLY para sa recipes na HINDI kaya ng current stock
    const totalNeededMap = {}; // { ingredientName: { unit, totalNeeded, products[] } }

    for (const r of recipes) {
      const targetGoal = Number(quotas[r.id]);
      if (!targetGoal || targetGoal <= 0) continue;

      // ✅ SKIP ang recipe kung kaya na ng existing stock — huwag isama sa computation
      const maxUnits = calculateMaxUnits(r, ingredients);
      if (maxUnits >= targetGoal) continue;

      const neededBatches = Math.ceil(targetGoal / Number(r.yield));

      for (const req of r.ingredients) {
        const key = req.name.trim().toLowerCase();
        if (!totalNeededMap[key]) {
          totalNeededMap[key] = { name: req.name, unit: req.unit, totalNeeded: 0, products: [] };
        }
        totalNeededMap[key].totalNeeded = +(totalNeededMap[key].totalNeeded + Number(req.qty) * neededBatches).toFixed(4);
        if (!totalNeededMap[key].products.includes(r.product)) totalNeededMap[key].products.push(r.product);
      }
    }

    // Step 2: I-compare sa actual stock — isang beses lang per ingredient
    const result = [];
    for (const entry of Object.values(totalNeededMap)) {
      const stockItem = ingredients.find(i => i.name.trim().toLowerCase() === entry.name.trim().toLowerCase());
      const have = stockItem ? Number(stockItem.stock) : 0;
      if (have < entry.totalNeeded) {
        result.push({
          name: entry.name,
          unit: entry.unit,
          have,
          need: entry.totalNeeded,
          shortage: +(entry.totalNeeded - have).toFixed(4),
          products: entry.products,
        });
      }
    }
    return result;
  }, [recipes, ingredients, quotas]);

  // para sa banner trigger lang
  const perRecipeShortfalls = consolidatedShortfalls.length > 0
    ? recipes.filter(r => {
        const targetGoal = Number(quotas[r.id]);
        if (!targetGoal || targetGoal <= 0) return false;
        return calculateMaxUnits(r, ingredients) < targetGoal;
      }).map(r => ({ product: r.product, goal: Number(quotas[r.id]), yieldUnit: r.yieldUnit }))
    : [];

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

  // ── REKTA CONFIRM + INSTANT STOCK UPDATE UI ──
  const handleDirectConfirm = (recipe, goalNum) => {
    if (!goalNum || goalNum <= 0) return;

    // 1. Ibawas ang ingredients sa backend/context
    if (confirmBatch) confirmBatch(recipe.id, goalNum);

    // 2. Kunin ang kasalukuyang stock (base sa local override o galing context)
    const matchedProduct = products.find(p => p.name.trim().toLowerCase() === recipe.product.trim().toLowerCase());
    const contextStock = matchedProduct ? Number(matchedProduct.stock) : 0;
    const actualCurrentStock = localStocks[recipe.id] !== undefined ? localStocks[recipe.id] : contextStock;
    
    const addedStock = Number(goalNum);
    const newStock = actualCurrentStock + addedStock;

    // 3. I-update agad ang local UI para walang delay
    setLocalStocks(prev => ({ ...prev, [recipe.id]: newStock }));

    // 5. I-clear ang input box
    setQuotas(prev => { const n = { ...prev }; delete n[recipe.id]; return n; });
  };

  return (
    <div className="space-y-4">

      {/* ── SHOPPING LIST BANNER — lumabas ITAAS kapag may kulang na ingredients ── */}
      {consolidatedShortfalls.length > 0 && (
        <div className="border border-red-200 bg-red-50 rounded-xl overflow-hidden shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-2.5 px-4 py-3 border-b border-red-200 bg-red-100/70">
            <ShoppingCart size={16} className="text-red-700 shrink-0" />
            <p className="text-xs font-bold uppercase tracking-wider text-red-800 flex-1">
              ⚠️ Hindi Sapat ang Ingredients — Kailangan Pang Bilhin
            </p>
            <span className="text-[11px] bg-red-200 text-red-800 font-bold px-2 py-0.5 rounded-full">
              {consolidatedShortfalls.length} ingredient{consolidatedShortfalls.length > 1 ? 's' : ''} kulang
            </span>
          </div>

          <div className="p-4">
            <div className="bg-white rounded-lg border border-red-100 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-red-50/50 border-b border-red-100">
                    <th className="px-3 py-2.5 text-left text-[10px] font-bold uppercase tracking-wider text-gray-500">Ingredient</th>
                    <th className="px-3 py-2.5 text-center text-[10px] font-bold uppercase tracking-wider text-gray-500">Para sa</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">Mayroon</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-gray-500">Total Kailangan</th>
                    <th className="px-3 py-2.5 text-right text-[10px] font-bold uppercase tracking-wider text-red-600">Kulang (Bilhin)</th>
                  </tr>
                </thead>
                <tbody>
                  {consolidatedShortfalls.map(item => (
                    <tr key={item.name} className="border-b border-red-50 last:border-0">
                      <td className="px-3 py-2.5 font-semibold text-gray-800">{item.name}</td>
                      <td className="px-3 py-2.5 text-center text-[11px] text-gray-500">{item.products.join(', ')}</td>
                      <td className="px-3 py-2.5 text-right text-gray-500 text-xs">{item.have} {item.unit}</td>
                      <td className="px-3 py-2.5 text-right text-gray-600 text-xs">{item.need} {item.unit}</td>
                      <td className="px-3 py-2.5 text-right">
                        <span className="font-bold text-red-700 bg-red-50 px-2.5 py-1 rounded-md border border-red-200 text-xs shadow-sm">
                          +{item.shortage} {item.unit}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MAIN TABLE */}
      <Card>
        <div className="flex items-center justify-between p-4 border-b border-brand-100">
          <div>
            <h3 className="font-bold text-brand-800">Recipe Log</h3>
            <p className="text-xs text-brand-400 mt-0.5">
              Maglagay ng Goal. Magkukulay green ang input kapag sapat ang ingredients.
            </p>
          </div>
          <Button variant="dark" onClick={openAdd}><Plus size={14} /> Add Recipe</Button>
        </div>

        <Table columns={[
          { label: 'Product Details' },
          { label: 'Yield / Batch' },
          { label: 'Cost / Batch' },
          { label: 'Expected (Kaya)' },
          { label: 'Set Goal' },
          { label: 'Nagawa (Stock)' },
          { label: 'Actions', align: 'right' },
        ]}>
          {(() => {
            const totalPages = Math.max(1, Math.ceil(recipes.length / PAGE_SIZE));
            const safePage = Math.min(currentPage, totalPages);
            const paged = recipes.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);
            return paged.map(r => {
            const maxUnits = calculateMaxUnits(r, ingredients);
            const quota    = quotas[r.id] || '';
            const quotaNum = Number(quota);
            const hasInput = quotaNum > 0;
            const canMake  = hasInput && maxUnits >= quotaNum;

            // Kunin ang stock — flexible match para sa slight name differences (e.g. "Cupcakes" vs "Cupcake")
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

                {/* 4. Expected (Kaya) */}
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

                {/* 6. Nagawa (Stock) */}
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
          })})()}
          {!recipes.length && (
            <Tr><Td className="text-center text-brand-300 py-8" colSpan={7}>Walang recipe pa. Mag-add para magsimulang mag-plan.</Td></Tr>
          )}
        </Table>

        {/* ── PAGINATION CONTROLS ── */}
        {recipes.length > PAGE_SIZE && (() => {
          const totalPages = Math.ceil(recipes.length / PAGE_SIZE);
          const safePage = Math.min(currentPage, totalPages);
          return (
            <div className="flex items-center justify-between px-4 py-3 border-t border-brand-100">
              <p className="text-xs text-brand-400">
                Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, recipes.length)} of {recipes.length} recipes
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

      {/* MODALS */}
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
                
                // I-render lamang kung walang existing recipe o kaya'y ito mismo yung in-eedit
                if (!hasExistingRecipe || isCurrentEdit) {
                  return (
                    <option key={p.id} value={p.name}>
                      {p.name}
                    </option>
                  );
                }
                
                // Kapag may recipe na at hindi ito yung in-eedit, hindi na ipapakita sa dropdown
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