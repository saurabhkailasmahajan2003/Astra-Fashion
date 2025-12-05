import { useState } from 'react';

// --- Polished Icons ---
const ChevronIcon = ({ isOpen }) => (
  <svg 
    className={`w-5 h-5 text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} 
    fill="none" viewBox="0 0 24 24" stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
  </svg>
);

const FilterIcon = () => (
  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
  </svg>
);

// --- Custom UI Elements ---

const FilterSection = ({ title, isOpen, onToggle, activeCount, children }) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between py-5 group focus:outline-none"
    >
      <div className="flex items-center gap-2.5">
        <h3 className={`text-sm font-bold tracking-wide transition-colors ${isOpen ? 'text-gray-900' : 'text-gray-600 group-hover:text-gray-900'}`}>
          {title}
        </h3>
        {activeCount > 0 && (
          <span className="flex items-center justify-center w-5 h-5 text-[10px] font-bold text-white bg-indigo-600 rounded-full shadow-sm shadow-indigo-200">
            {activeCount}
          </span>
        )}
      </div>
      <ChevronIcon isOpen={isOpen} />
    </button>
    
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-[500px] opacity-100 pb-5' : 'max-h-0 opacity-0'
      }`}
    >
      {children}
    </div>
  </div>
);

const CustomCheckbox = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group py-1.5 select-none">
    <div className="relative">
      <input 
        type="checkbox" 
        className="peer sr-only" 
        checked={checked} 
        onChange={onChange} 
      />
      <div className={`
        w-5 h-5 border-2 rounded-md transition-all duration-200 ease-out flex items-center justify-center
        ${checked 
          ? 'bg-indigo-600 border-indigo-600 shadow-md shadow-indigo-200' 
          : 'bg-white border-gray-300 group-hover:border-indigo-400'
        }
      `}>
        <svg className={`w-3.5 h-3.5 text-white transform transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      </div>
    </div>
    <span className={`text-sm transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
      {label}
    </span>
  </label>
);

const CustomRadio = ({ label, checked, onChange }) => (
  <label className="flex items-center gap-3 cursor-pointer group py-1.5 select-none">
    <div className="relative flex items-center">
      <input type="radio" className="sr-only" checked={checked} onChange={onChange} />
      <div className={`
        w-5 h-5 rounded-full border-2 transition-all duration-200 flex items-center justify-center
        ${checked ? 'border-indigo-600' : 'border-gray-300 group-hover:border-indigo-400'}
      `}>
        <div className={`w-2.5 h-2.5 rounded-full bg-indigo-600 transform transition-transform duration-200 ${checked ? 'scale-100' : 'scale-0'}`} />
      </div>
    </div>
    <span className={`text-sm transition-colors ${checked ? 'text-gray-900 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
      {label}
    </span>
  </label>
);

// --- Main Component ---

const FilterSidebar = ({ filters, onFilterChange, onClearFilters, brands = [], sizes = [] }) => {
  const [openSections, setOpenSections] = useState({ sort: true, price: true, brand: true, size: true });
  
  const toggle = (section) => setOpenSections(prev => ({ ...prev, [section]: !prev[section] }));
  
  // Handlers
  const update = (key, val) => onFilterChange({ ...filters, [key]: val });
  
  const handleToggleList = (key, item) => {
    const list = filters[key] || [];
    const newList = list.includes(item) ? list.filter(i => i !== item) : [...list, item];
    update(key, newList);
  };

  const getActiveCount = () => {
    let count = 0;
    if (filters.priceRange) count++;
    if (filters.brands?.length) count += filters.brands.length;
    if (filters.sizes?.length) count += filters.sizes.length;
    if (filters.sortBy && filters.sortBy !== 'default') count++;
    return count;
  };

  return (
    <div className="w-full bg-white rounded-2xl shadow-xl shadow-gray-200/60 border border-gray-100 overflow-hidden sticky top-24">
      
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between backdrop-blur-sm">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 rounded-lg">
            <FilterIcon />
          </div>
          <h2 className="text-lg font-bold text-gray-900">Filters</h2>
        </div>
        
        {getActiveCount() > 0 && (
          <button 
            onClick={onClearFilters}
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 px-3 py-1.5 rounded-full transition-all"
          >
            Reset All
          </button>
        )}
      </div>

      {/* Content */}
      <div className="px-6 py-2 overflow-y-auto max-h-[calc(100vh-10rem)] custom-scrollbar">
        
        {/* Sort Section */}
        <FilterSection 
          title="Sort By" 
          isOpen={openSections.sort} 
          onToggle={() => toggle('sort')}
          activeCount={filters.sortBy && filters.sortBy !== 'default' ? 1 : 0}
        >
          <div className="space-y-1">
            {[
              { id: 'default', label: 'Recommended' },
              { id: 'newest', label: 'Newest Arrivals' },
              { id: 'price-low-high', label: 'Price: Low to High' },
              { id: 'price-high-low', label: 'Price: High to Low' },
            ].map((opt) => (
              <CustomRadio
                key={opt.id}
                label={opt.label}
                checked={filters.sortBy === opt.id || (!filters.sortBy && opt.id === 'default')}
                onChange={() => update('sortBy', opt.id)}
              />
            ))}
          </div>
        </FilterSection>

        {/* Price Section */}
        <FilterSection 
          title="Price Range" 
          isOpen={openSections.price} 
          onToggle={() => toggle('price')}
          activeCount={filters.priceRange ? 1 : 0}
        >
          {/* Custom Range Inputs */}
          <div className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div className="flex items-center gap-3">
              <div className="relative flex-1 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium group-focus-within:text-indigo-500">₹</span>
                <input
                  type="number"
                  placeholder="0"
                  value={filters.priceRange?.min || ''}
                  onChange={(e) => update('priceRange', { ...filters.priceRange, min: Number(e.target.value) })}
                  className="w-full pl-6 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 font-medium"
                />
              </div>
              <span className="text-gray-300 font-medium">-</span>
              <div className="relative flex-1 group">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs font-medium group-focus-within:text-indigo-500">₹</span>
                <input
                  type="number"
                  placeholder="Any"
                  value={filters.priceRange?.max === Infinity ? '' : filters.priceRange?.max || ''}
                  onChange={(e) => update('priceRange', { ...filters.priceRange, max: Number(e.target.value) })}
                  className="w-full pl-6 pr-3 py-2 text-sm bg-white border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-gray-700 font-medium"
                />
              </div>
            </div>
          </div>
        </FilterSection>

        {/* Brand Section */}
        {brands.length > 0 && (
          <FilterSection 
            title="Brands" 
            isOpen={openSections.brand} 
            onToggle={() => toggle('brand')}
            activeCount={filters.brands?.length || 0}
          >
            <div className="space-y-1 max-h-48 overflow-y-auto custom-scrollbar pr-2">
              {brands.map(brand => (
                <CustomCheckbox
                  key={brand}
                  label={brand}
                  checked={(filters.brands || []).includes(brand)}
                  onChange={() => handleToggleList('brands', brand)}
                />
              ))}
            </div>
          </FilterSection>
        )}

        {/* Sizes Section */}
        {sizes.length > 0 && (
          <FilterSection 
            title="Size" 
            isOpen={openSections.size} 
            onToggle={() => toggle('size')}
            activeCount={filters.sizes?.length || 0}
          >
            <div className="flex flex-wrap gap-2">
              {sizes.map(size => {
                const isActive = (filters.sizes || []).includes(size);
                return (
                  <button
                    key={size}
                    onClick={() => handleToggleList('sizes', size)}
                    className={`
                      min-w-[40px] h-10 px-3 flex items-center justify-center text-sm font-semibold rounded-lg border transition-all duration-200
                      ${isActive 
                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-md shadow-indigo-200 transform scale-105' 
                        : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300 hover:text-indigo-600 hover:bg-indigo-50'
                      }
                    `}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </FilterSection>
        )}
      </div>

      {/* Styled Scrollbar CSS */}
      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: #d1d5db;
        }
      `}</style>
    </div>
  );
};

export default FilterSidebar;