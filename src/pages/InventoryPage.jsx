import { useState } from 'react';
import RawTab from './inventory/RawTab';
import RecipeTab from './inventory/RecipeTab';
import WasteTab from './inventory/WasteTab';

const SUBTABS = [
  { key: 'raw',    label: 'Raw Ingredients' },
  { key: 'recipe', label: 'Recipe Log' },
  { key: 'waste',  label: 'Waste Log' },
];

export default function InventoryPage() {
  const [activeTab, setActiveTab] = useState('raw');

  return (
    <div className="space-y-5">
      <div className="flex gap-1 bg-brand-100 rounded-xl p-1 w-fit border border-brand-200">
        {SUBTABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-white text-brand-800 shadow-sm'
                : 'text-brand-500 hover:text-brand-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'raw'    && <RawTab />}
      {activeTab === 'recipe' && <RecipeTab />}
      {activeTab === 'waste'  && <WasteTab />}
    </div>
  );
}