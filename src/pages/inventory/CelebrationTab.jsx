import { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useToast, Button, Modal, Input, Select, Table, Tr, Td, Pagination, Badge, Card, LevelBar, ConfirmModal } from '../../components/ui';
import { ingStatus } from '../../utils/inventoryHelpers';

const PER_PAGE = 10;

export default function CelebrationTab() {
  const { materials = [], addMaterial, updateMaterial, deleteMaterial } = useApp();
  const { show: showToast } = useToast();
  const [page, setPage]             = useState(1);
  const [search, setSearch]         = useState('');
  const [modalOpen, setModalOpen]   = useState(false);
  const [editMat, setEditMat]       = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const filtered = materials.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase())
  );
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const handleSave = (data, addedQty = 0, note = '') => {
    if (editMat?.id) {
      updateMaterial(editMat.id, data, addedQty, note);
      showToast(`+${addedQty} ${editMat.unit} na-add sa ${editMat.name}.`);
    } else {
      addMaterial(data);
      showToast('Celebration material added.');
    }
    setModalOpen(false);
  };

  const handleDelete = () => {
    deleteMaterial(deleteTarget.id);
    showToast(`${deleteTarget.name} deleted.`, 'warning');
  };

  return (
    <div className="space-y-5">
      <Card>
        <div className="flex items-center justify-between p-4 border-b border-brand-100">
          <div>
            <h3 className=" font-bold text-brand-800">Celebration Materials</h3>
            <p className="text-xs text-brand-400 mt-0.5">Mag-manage ng Printed Balloons, Tarpaulin, at iba pang party add-ons.</p>
          </div>
          <Button variant="dark" onClick={() => { setEditMat(null); setModalOpen(true); }}>
            <Plus size={14} /> Add New Material
          </Button>
        </div>

        {/* Search */}
        <div className="px-4 py-3 border-b border-brand-100 bg-brand-50/40">
          <div className="relative max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-300" />
            <input
              type="text"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search material..."
              className="w-full pl-8 pr-3 py-1.5 text-sm border border-brand-200 rounded-lg outline-none focus:border-brand-400 bg-white"
            />
          </div>
        </div>
        <Table columns={[
          { label: 'Item Name' },
          { label: 'Current Stock' },
          { label: 'Stock Level' },
          { label: 'Status' },
          { label: 'Actions', align: 'right' },
        ]}>
          {paged.map(mat => {
            const st = ingStatus(mat.stock, mat.min);
            return (
              <Tr key={mat.id}>
                <Td><strong>{mat.name}</strong></Td>
                <Td><strong>{mat.stock}</strong> {mat.unit}</Td>
                <Td><LevelBar stock={mat.stock} min={mat.min} /></Td>
                <Td><Badge variant={st.cls}>{st.label}</Badge></Td>
                <Td align="right">
                  <div className="flex gap-2 justify-end">
                    <Button size="sm" variant="secondary" onClick={() => { setEditMat(mat); setModalOpen(true); }}>Add Stock</Button>
                    <Button size="sm" variant="danger" onClick={() => setDeleteTarget(mat)}>Delete</Button>
                  </div>
                </Td>
              </Tr>
            );
          })}
          {!paged.length && (
            <Tr><Td colSpan={5} className="text-center py-8 text-brand-400">
              {search ? 'Walang nahanap na material.' : 'Walang naka-record na celebration materials.'}
            </Td></Tr>
          )}
        </Table>
        {filtered.length > PER_PAGE && (
           <Pagination page={page} count={filtered.length} perPage={PER_PAGE} total="materials" onChange={setPage} />
        )}
      </Card>

      <MaterialModal isOpen={modalOpen} onClose={() => setModalOpen(false)} material={editMat} onSave={handleSave} />
      
      <ConfirmModal
        isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete}
        title="Delete Material" message={`I-delete ang "${deleteTarget?.name}"?`}
        confirmLabel="Delete" variant="danger"
      />
    </div>
  );
}

// ─── Celebration Material Modal ───
function MaterialModal({ isOpen, onClose, material, onSave }) {
  const [name, setName]   = useState('');
  const [unit, setUnit]   = useState('pcs');
  const [stock, setStock] = useState('');
  const [min, setMin]     = useState('');
  const [cost, setCost]   = useState('');
  
  const isEdit = !!material?.id;

  // Reset/Set states kapag bumubukas ang modal
  useState(() => {
    setName('');
    setUnit('pcs');
    setStock('');
    setMin(material?.min ?? '');
    setCost('');
  });

  const addedQty = parseFloat(stock) || 0;

  const handleSave = () => {
    if (!isEdit && (!stock || !name)) return;
    
    const newStock = isEdit ? +(material.stock + addedQty).toFixed(4) : addedQty;
    
    const dataToSave = isEdit 
      ? { stock: newStock, min: parseFloat(min), costPerUnit: cost && addedQty ? parseFloat(cost) / addedQty : material?.costPerUnit || 0 }
      : { name, unit, stock: newStock, min: parseFloat(min), costPerUnit: cost ? parseFloat(cost) / addedQty : 0, category: 'Celebration Material' };

    onSave(dataToSave, addedQty, isEdit ? 'Stock added' : 'Initial stock');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen} onClose={onClose}
      title={isEdit ? `Add Stock — ${material?.name}` : 'Add New Celebration Material'}
      subtitle={isEdit ? `Unit: ${material?.unit} · Current: ${material?.stock}` : 'I-record ang mga bagong materials kagaya ng Tarpaulin at Balloons.'}
      size="md"
      footer={
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleSave} disabled={isEdit ? addedQty <= 0 : (!stock || !name)}>
            {isEdit ? 'Add Stock' : 'Save Material'}
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        {!isEdit && (
          <div className="grid grid-cols-2 gap-4">
            <Input 
              label="Item Name" 
              required 
              value={name} 
              onChange={e => setName(e.target.value)} 
              placeholder="e.g. Tarpaulin (2x3 ft)" 
            />
            <Select label="Unit" required value={unit} onChange={e => setUnit(e.target.value)}>
              {['pcs', 'packs', 'sets', 'boxes'].map(u => <option key={u} value={u}>{u}</option>)}
            </Select>
          </div>
        )}
        {isEdit && (
          <div className="grid grid-cols-2 gap-3">
             <div className="flex flex-col gap-1">
               <span className="text-[11px] font-bold uppercase text-brand-400">Item Name</span>
               <div className="px-3 py-2 bg-brand-50 border rounded-lg text-sm font-bold text-brand-800">{material?.name}</div>
             </div>
             <div className="flex flex-col gap-1">
               <span className="text-[11px] font-bold uppercase text-brand-400">Unit</span>
               <div className="px-3 py-2 bg-brand-50 border rounded-lg text-sm font-bold text-brand-800">{material?.unit}</div>
             </div>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <Input label={isEdit ? `Quantity na Idadagdag` : 'Initial Stock Quantity'} required type="number" value={stock} onChange={e => setStock(e.target.value)} min="0" />
          <Input label="Minimum Stock Level" required type="number" value={min} onChange={e => setMin(e.target.value)} min="0" />
          <Input label="Total Cost (₱)" type="number" value={cost} onChange={e => setCost(e.target.value)} min="0" step="0.01" />
        </div>
      </div>
    </Modal>
  );
}