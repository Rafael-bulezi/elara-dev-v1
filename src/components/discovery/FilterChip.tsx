import React from 'react';
import { X } from 'lucide-react';

interface FilterChipProps {
  label: string;
  onRemove: () => void;
}

const FilterChip = ({ label, onRemove }: FilterChipProps) => (
  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-purple-50 border border-purple-100 rounded-full text-xs font-bold text-purple-700">
    {label}
    <button
      onClick={onRemove}
      className="hover:bg-purple-200 rounded-full p-0.5 transition-colors"
    >
      <X size={12} />
    </button>
  </div>
);

export default FilterChip;
