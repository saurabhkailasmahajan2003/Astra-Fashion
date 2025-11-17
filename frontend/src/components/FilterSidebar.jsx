import { useState } from 'react';

const FilterSidebar = ({ filters, onFilterChange, onClearFilters, brands = [], sizes = [], onCloseMobile }) => {
  const [isPriceRangeOpen, setIsPriceRangeOpen] = useState(false);
  const [isBrandOpen, setIsBrandOpen] = useState(false);
  const [isSizeOpen, setIsSizeOpen] = useState(false);

  const priceRanges = [
    { label: '₹0 - ₹500', min: 0, max: 500 },
    { label: '₹500 - ₹1,000', min: 500, max: 1000 },
    { label: '₹1,000 - ₹2,000', min: 1000, max: 2000 },
    { label: '₹2,000 - ₹3,000', min: 2000, max: 3000 },
    { label: '₹3,000 - ₹4,000', min: 3000, max: 4000 },
    { label: '₹4,000 - ₹5,000', min: 4000, max: 5000 },
    { label: '₹5,000+', min: 5000, max: Infinity },
  ];

  const handlePriceRangeChange = (range) => {
    onFilterChange({
      ...filters,
      priceRange: filters.priceRange?.min === range.min && filters.priceRange?.max === range.max 
        ? null 
        : range,
    });
  };

  const handleBrandToggle = (brand) => {
    const currentBrands = filters.brands || [];
    const newBrands = currentBrands.includes(brand)
      ? currentBrands.filter(b => b !== brand)
      : [...currentBrands, brand];
    onFilterChange({ ...filters, brands: newBrands });
  };

  const handleSizeToggle = (size) => {
    const currentSizes = filters.sizes || [];
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size];
    onFilterChange({ ...filters, sizes: newSizes });
  };

  const handleSortChange = (sortBy) => {
    onFilterChange({ ...filters, sortBy });
  };

  const handleMinPriceChange = (e) => {
    const min = parseInt(e.target.value) || 0;
    onFilterChange({
      ...filters,
      priceRange: { min, max: filters.priceRange?.max || Infinity },
    });
  };

  const handleMaxPriceChange = (e) => {
    const max = parseInt(e.target.value) || Infinity;
    onFilterChange({
      ...filters,
      priceRange: { min: filters.priceRange?.min || 0, max },
    });
  };

  const hasActiveFilters = 
    filters.priceRange || 
    (filters.brands && filters.brands.length > 0) ||
    (filters.sizes && filters.sizes.length > 0) ||
    (filters.sortBy && filters.sortBy !== 'default');

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.priceRange) count++;
    if (filters.brands?.length > 0) count += filters.brands.length;
    if (filters.sizes?.length > 0) count += filters.sizes.length;
    if (filters.sortBy && filters.sortBy !== 'default') count++;
    return count;
  };

  return (
    <div className="w-full bg-white border border-gray-200 rounded-lg shadow-sm p-4 sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <h2 className="text-base font-semibold text-gray-900">Filters</h2>
          {getActiveFilterCount() > 0 && (
            <span className="bg-blue-600 text-white text-xs font-medium px-1.5 py-0.5 rounded">
              {getActiveFilterCount()}
            </span>
          )}
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="text-xs text-blue-600 hover:text-blue-800 font-medium"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Sort By */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Sort By</h3>
          <div className="space-y-1.5">
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="sort"
                checked={filters.sortBy === 'price-low-high'}
                onChange={() => handleSortChange('price-low-high')}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900">Price: Low to High</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="sort"
                checked={filters.sortBy === 'price-high-low'}
                onChange={() => handleSortChange('price-high-low')}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900">Price: High to Low</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="sort"
                checked={filters.sortBy === 'newest'}
                onChange={() => handleSortChange('newest')}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900">Newest First</span>
            </label>
            <label className="flex items-center cursor-pointer group">
              <input
                type="radio"
                name="sort"
                checked={!filters.sortBy || filters.sortBy === 'default'}
                onChange={() => handleSortChange('default')}
                className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-sm text-gray-600 group-hover:text-gray-900">Default</span>
            </label>
          </div>
        </div>

        {/* Price Range */}
        <div className="border-t border-gray-200 pt-4">
          <button
            onClick={() => setIsPriceRangeOpen(!isPriceRangeOpen)}
            className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-2 hover:text-gray-900"
          >
            <span>Price Range</span>
            <svg
              className={`w-4 h-4 transition-transform text-gray-400 ${isPriceRangeOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          {isPriceRangeOpen && (
            <div className="space-y-1.5 mt-2">
              {priceRanges.map((range, index) => {
                const isSelected = filters.priceRange?.min === range.min && filters.priceRange?.max === range.max;
                return (
                  <label
                    key={index}
                    className={`flex items-center cursor-pointer p-1.5 rounded hover:bg-gray-50 ${
                      isSelected ? 'bg-blue-50' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      checked={isSelected}
                      onChange={() => handlePriceRangeChange(range)}
                      className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500"
                    />
                    <span className={`ml-2 text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                      {range.label}
                    </span>
                  </label>
                );
              })}
              
              {/* Custom Price Range */}
              <div className="mt-3 pt-3 border-t border-gray-200">
                <p className="text-xs font-medium text-gray-600 mb-2">Custom Range</p>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filters.priceRange?.min || ''}
                      onChange={handleMinPriceChange}
                      placeholder="Min"
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <input
                      type="number"
                      value={filters.priceRange?.max === Infinity ? '' : filters.priceRange?.max || ''}
                      onChange={handleMaxPriceChange}
                      placeholder="Max"
                      className="w-full px-2 py-1.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Brand Filter */}
        {brands.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setIsBrandOpen(!isBrandOpen)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-2 hover:text-gray-900"
            >
              <div className="flex items-center gap-2">
                <span>Brand</span>
                {filters.brands?.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded">
                    {filters.brands.length}
                  </span>
                )}
              </div>
              <svg
                className={`w-4 h-4 transition-transform text-gray-400 ${isBrandOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isBrandOpen && (
              <div className="space-y-1.5 mt-2 max-h-48 overflow-y-auto">
                {brands.map((brand, index) => {
                  const isSelected = (filters.brands || []).includes(brand);
                  return (
                    <label
                      key={index}
                      className={`flex items-center cursor-pointer p-1.5 rounded hover:bg-gray-50 ${
                        isSelected ? 'bg-blue-50' : ''
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleBrandToggle(brand)}
                        className="w-3.5 h-3.5 text-blue-600 focus:ring-blue-500 rounded border-gray-300"
                      />
                      <span className={`ml-2 text-sm ${isSelected ? 'text-blue-700 font-medium' : 'text-gray-600'}`}>
                        {brand}
                      </span>
                    </label>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Size Filter */}
        {sizes.length > 0 && (
          <div className="border-t border-gray-200 pt-4">
            <button
              onClick={() => setIsSizeOpen(!isSizeOpen)}
              className="w-full flex items-center justify-between text-sm font-semibold text-gray-700 mb-2 hover:text-gray-900"
            >
              <div className="flex items-center gap-2">
                <span>Size</span>
                {filters.sizes?.length > 0 && (
                  <span className="bg-blue-100 text-blue-700 text-xs font-medium px-1.5 py-0.5 rounded">
                    {filters.sizes.length}
                  </span>
                )}
              </div>
              <svg
                className={`w-4 h-4 transition-transform text-gray-400 ${isBrandOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {isSizeOpen && (
              <div className="flex flex-wrap gap-2 mt-2">
                {sizes.map((size, index) => {
                  const isSelected = (filters.sizes || []).includes(size);
                  return (
                    <button
                      key={index}
                      onClick={() => handleSizeToggle(size)}
                      className={`px-3 py-1.5 text-xs font-medium rounded border transition-all ${
                        isSelected
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:bg-blue-50'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default FilterSidebar;
