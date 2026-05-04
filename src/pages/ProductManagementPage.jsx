import { useState } from 'react';
import { Plus, Edit2, Trash2, Upload } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { useToast, Button, Modal, Input, Select, Textarea, SearchBar, FilterPills, ConfirmModal } from '../components/ui';
import { CATEGORIES } from '../data/dummyData';

const PRODUCT_CATEGORIES = CATEGORIES.filter(c => c !== 'All');

const BLANK_PRODUCT = {
  name: '', category: 'Package', price: '', inclusion: '',
  image: '', dailyLimit: 5,
};

// ─── Product Card ─────────────────────────────────────────────
// ─── Product Card ─────────────────────────────────────────────
function ProductCard({ product, onEdit, onDelete }) {
  return (
    <div className="bg-white rounded-xl border border-brand-200 overflow-hidden shadow-sm flex flex-col h-full">
      <div className="relative h-40 bg-brand-100 overflow-hidden shrink-0">
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover"
          onError={e => { e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80'; }}
        />
        <div className="absolute top-2 left-2">
          <span className="text-[11px] font-bold uppercase tracking-widest bg-white text-brand-800 px-2.5 py-1 rounded-full shadow-sm">
            {product.category}
          </span>
        </div>
        {product.dailyLimit > 0 && (
          <div className="absolute top-2 right-2">
            <span className="text-[11px] font-bold bg-brand-800 text-white px-2 py-1 rounded-full shadow-sm">
              Limit: {product.dailyLimit}/day
            </span>
          </div>
        )}
      </div>
      
      {/* Ginawang flex-col at flex-grow para laging pantay ang ilalim */}
      <div className="p-4 flex flex-col flex-grow">
        <p className="font-bold text-brand-900 text-[16px] mb-1 truncate">{product.name}</p>
        
        {/* INAYOS: Ginamit ang truncate at \u00A0 para laging 1-line kahit walang inclusion */}
        <p className="text-[13px] text-brand-600 mb-3 truncate leading-relaxed font-medium">
          {product.inclusion ? product.inclusion.replace(/\n/g, ' · ') : '\u00A0'}
        </p>
        
        <p className="text-[18px] font-extrabold text-brand-700 mt-auto">
          ₱{Number(product.price).toLocaleString()}.00
        </p>
      </div>
      
      <div className="flex border-t border-brand-100 shrink-0">
        <button
          onClick={() => onEdit(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <Edit2 size={15} />Edit
        </button>
        <div className="w-px bg-brand-100" />
        <button
          onClick={() => onDelete(product)}
          className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold text-red-500 hover:bg-red-50 transition-colors"
        >
          <Trash2 size={15} />Delete
        </button>
      </div>
    </div>
  );
}

// ─── Product Modal ────────────────────────────────────────────
function ProductModal({ isOpen, onClose, product, onSave }) {
  const [form, setForm] = useState(product || BLANK_PRODUCT);
  const [exceptionDate, setExceptionDate] = useState('');
  const [exceptionSlots, setExceptionSlots] = useState(0);
  const [exceptions, setExceptions] = useState(product?.dateExceptions || []);
  const isEditing = !!product?.id;

  const handleChange = (field, val) => setForm(prev => ({ ...prev, [field]: val }));

  const addException = () => {
    if (!exceptionDate) return;
    setExceptions(prev => [...prev.filter(e => e.date !== exceptionDate), { date: exceptionDate, slots: Number(exceptionSlots) }]);
    setExceptionDate(''); setExceptionSlots(0);
  };

  const removeException = (date) => setExceptions(prev => prev.filter(e => e.date !== date));

  const handleSave = () => {
    if (!form.name || !form.price) return;
    onSave({ ...form, price: Number(form.price), dailyLimit: Number(form.dailyLimit), dateExceptions: exceptions });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditing ? `#ORD-0241` : 'Add Product'}
      size="xl"
      footer={
        <div className="flex items-center justify-between mt-4">
          {isEditing ? (
            <Button variant="danger" onClick={onClose}>Delete Product</Button>
          ) : <div></div>}
          <div className="flex gap-3 ml-auto">
            <Button variant="secondary" onClick={onClose}>Close</Button>
            <Button variant="dark" onClick={handleSave}>Save Changes</Button>
          </div>
        </div>
      }
    >
      <div className="w-full md:w-[800px] max-w-full flex flex-col gap-8 p-1">
        <div className="grid grid-cols-2 gap-8">
          <div className="space-y-4">
            <Input
              label="Product Name"
              required
              value={form.name}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Product Name"
            />
            <div className="grid grid-cols-2 gap-4">
              <Select
                label="Category"
                value={form.category}
                onChange={e => handleChange('category', e.target.value)}
              >
                {PRODUCT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </Select>
              <Input
                label="Price"
                required
                type="number"
                value={form.price}
                onChange={e => handleChange('price', e.target.value)}
                placeholder="₱0"
              />
            </div>
            <Textarea
              label="Inclusion / Description"
              value={form.inclusion}
              onChange={e => handleChange('inclusion', e.target.value)}
              placeholder={`Themed Cake (7x5)\nw/ Printed Toppers\n10 pcs Balloons`}
              rows={4}
            />
          </div>

          <div className="space-y-4">
            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-brand-700 mb-2">Product Image</p>
              <div className="rounded-xl overflow-hidden border border-brand-200 bg-brand-50" style={{ height: 200 }}>
                <img
                  src={form.image || 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80'}
                  alt="product"
                  className="w-full h-full object-cover"
                  onError={e => { e.target.src = 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=400&q=80'; }}
                />
              </div>
              <Input
                className="mt-3 text-[13px] font-medium"
                placeholder="Image URL (paste from web or upload)"
                value={form.image}
                onChange={e => handleChange('image', e.target.value)}
              />
              <Button variant="secondary" size="md" className="mt-3 w-full font-bold text-[14px]">
                <Upload size={16} />Upload Image
              </Button>
            </div>
          </div>
        </div>

        <div className="border border-brand-200 bg-brand-50/50 rounded-xl p-5">
          <div className="flex items-center gap-2 mb-2">
            <input type="checkbox" id="limitToggle" className="w-5 h-5 accent-brand-700" defaultChecked={form.dailyLimit > 0} />
            <label htmlFor="limitToggle" className="text-[13px] font-bold uppercase tracking-wider text-brand-800">Pre-Order Limits</label>
          </div>
          <p className="text-[13px] text-brand-600 mb-4 leading-relaxed font-medium max-w-3xl">
            Set the maximum number of times this product can be ordered per day.
          </p>
          
          <div className="grid grid-cols-2 gap-8">
            <div>
              <Input
                label="Default Daily Capacity (Slots)"
                type="number"
                value={form.dailyLimit}
                onChange={e => handleChange('dailyLimit', e.target.value)}
                placeholder="0"
              />
            </div>

            <div>
              <p className="text-[12px] font-bold uppercase tracking-wider text-brand-700 mb-2">Date Exceptions</p>
              <div className="flex gap-2 mb-3">
                <input
                  type="datetime-local"
                  value={exceptionDate}
                  onChange={e => setExceptionDate(e.target.value)}
                  className="flex-1 text-[13px] font-medium border border-brand-300 rounded-lg px-3 py-2 outline-none focus:border-brand-500"
                />
                <input
                  type="number"
                  value={exceptionSlots}
                  onChange={e => setExceptionSlots(e.target.value)}
                  className="w-20 text-[13px] font-medium border border-brand-300 rounded-lg px-3 py-2 outline-none focus:border-brand-500"
                  placeholder="0"
                />
              </div>
              <button
                onClick={addException}
                className="w-full border-2 border-dashed border-brand-300 rounded-lg py-2 text-[13px] font-bold text-brand-600 bg-white"
              >
                + Add Specific Date Exception
              </button>
              {exceptions.length > 0 && (
                <div className="mt-3 max-h-32 overflow-y-auto">
                  {exceptions.map(ex => (
                    <div key={ex.date} className="flex items-center justify-between text-[13px] font-semibold text-brand-800 py-2 border-b border-brand-200 last:border-0">
                      <span>{ex.date}</span>
                      <span>{ex.slots} slots</span>
                      <button onClick={() => removeException(ex.date)} className="text-red-500 p-1"><Trash2 size={14} /></button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default function ProductManagementPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useApp();
  const { show: showToast } = useToast();
  const [category, setCategory] = useState('All');
  const [search, setSearch]     = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = products.filter(p => {
    const catOk    = category === 'All' || p.category === category;
    const searchOk = !search || p.name.toLowerCase().includes(search.toLowerCase());
    return catOk && searchOk;
  });

  const handleEdit = (product) => { setEditProduct(product); setModalOpen(true); };
  const handleAdd  = () => { setEditProduct(null); setModalOpen(true); };

  const handleSave = (data) => {
    if (editProduct?.id) {
      updateProduct(editProduct.id, data);
      showToast('Product updated.');
    } else {
      addProduct(data);
      showToast('Product added.');
    }
    setModalOpen(false);
  };

  const handleDelete = (product) => setDeleteTarget(product);
  const confirmDelete = () => {
    deleteProduct(deleteTarget.id);
    showToast(`${deleteTarget.name} deleted.`, 'warning');
    setDeleteTarget(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <SearchBar value={search} onChange={setSearch} placeholder="Search product..." className="w-64 text-[14px]" />
          <FilterPills options={CATEGORIES} value={category} onChange={setCategory} />
        </div>
        <Button variant="dark" onClick={handleAdd} className="font-bold text-[14px]">
          <Plus size={18} /> Add Product
        </Button>
      </div>

      <div className="grid grid-cols-4 gap-6">
        {filtered.map(p => (
          <ProductCard key={p.id} product={p} onEdit={handleEdit} onDelete={handleDelete} />
        ))}
        {!filtered.length && (
          <div className="col-span-4 text-center py-20 text-brand-500 text-[16px] font-medium">
            No products found.
          </div>
        )}
      </div>

      <ProductModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        product={editProduct}
        onSave={handleSave}
      />

      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={confirmDelete}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
      />
    </div>
  );
}