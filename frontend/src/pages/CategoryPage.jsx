import { useState, useEffect, useMemo } from 'react';
import { useParams, useLocation, Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import FilterSidebar from '../components/FilterSidebar';
import { productAPI } from '../utils/api';

const CategoryPage = () => {
  const { gender, category } = useParams();
  const location = useLocation();
  const pathname = location.pathname;
  const [products, setProducts] = useState([]);
  const [allProducts, setAllProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pageTitle, setPageTitle] = useState('');
  const [filters, setFilters] = useState({
    priceRange: null,
    brands: [],
    sizes: [],
    sortBy: null,
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const pathSegments = pathname.split('/').filter(Boolean);
  const genderFromPath = pathSegments[0] === 'men' ? 'men' : pathSegments[0] === 'women' ? 'women' : null;
  const derivedGender = (gender ? gender.toLowerCase() : null) || genderFromPath;
  const derivedCategory = category || pathSegments[1] || null;

  useEffect(() => {
    fetchProducts();
    // Reset filters when category changes
    setFilters({
      priceRange: null,
      brands: [],
      sizes: [],
      sortBy: null,
    });
  }, [pathname, gender, category, location.search]);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      let response = null;

      // Get gender from query params if available
      const urlParams = new URLSearchParams(location.search);
      const genderParam = urlParams.get('gender');

      const activeGender =
        (gender ? gender.toLowerCase() : null) ||
        (genderParam ? genderParam.toLowerCase() : null) ||
        genderFromPath;

      const normalizedCategory = category || pathSegments[1] || null;

      // Determine which API to call based on route
      if (pathname === '/watches') {
        const params = genderParam ? { gender: genderParam } : {};
        response = await productAPI.getWatches(params);
        setPageTitle(genderParam ? `${genderParam.charAt(0).toUpperCase() + genderParam.slice(1)}'s Watches` : 'Watches');
      } else if (pathname === '/lenses') {
        const params = genderParam ? { gender: genderParam } : {};
        response = await productAPI.getLenses(params);
        setPageTitle(genderParam ? `${genderParam.charAt(0).toUpperCase() + genderParam.slice(1)}'s Lenses` : 'Lenses & Spectacles');
      } else if (pathname === '/accessories') {
        const params = genderParam ? { gender: genderParam } : {};
        response = await productAPI.getAccessories(params);
        setPageTitle(genderParam ? `${genderParam.charAt(0).toUpperCase() + genderParam.slice(1)}'s Accessories` : 'Accessories');
      } else if (pathname === '/men') {
        response = await productAPI.getMenItems();
        setPageTitle("Men's Collection");
      } else if (pathname === '/women') {
        response = await productAPI.getWomenItems();
        setPageTitle("Women's Collection");
      } else if (activeGender && normalizedCategory) {
        // Handle subcategories like /men/shirt, /women/tshirt
        const categoryMap = {
          'shirt': { subCategory: 'shirt', displayName: 'Shirt' },
          'tshirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
          't-shirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
          'jeans': { subCategory: 'jeans', displayName: 'Jeans' },
          'trousers': { subCategory: 'trousers', displayName: 'Trousers' },
          'accessories': { subCategory: 'accessories', displayName: 'Accessories' },
        };

        const categoryInfo = categoryMap[normalizedCategory.toLowerCase()];
        
        if (categoryInfo) {
          const fetcher = activeGender === 'women' ? productAPI.getWomenItems : productAPI.getMenItems;
          response = await fetcher({ subCategory: categoryInfo.subCategory });
          
          if (response && response.success && response.data.products) {
            const filteredProducts = response.data.products.filter(product => {
              const productSubCategory = (product.subCategory || '').toLowerCase().trim().replace(/-/g, '');
              const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
              return productSubCategory === expectedSubCategory;
            });
            response.data.products = filteredProducts;
          }
          
          const genderDisplay = activeGender.charAt(0).toUpperCase() + activeGender.slice(1);
          setPageTitle(`${genderDisplay}'s ${categoryInfo.displayName}`);
        } else {
          // Invalid subcategory
          setPageTitle('Category Not Found');
          setProducts([]);
          setIsLoading(false);
          return;
        }
      } else {
        // Default: try to get all products
        response = await productAPI.getAllProducts();
        setPageTitle('All Products');
      }

      if (response && response.success) {
        const fetchedProducts = response.data.products || [];
        setAllProducts(fetchedProducts);
        setProducts(fetchedProducts);
      } else {
        setAllProducts([]);
        setProducts([]);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Normalize product for display
  const normalizeProduct = (product) => {
    return {
      ...product,
      id: product._id || product.id,
      images: product.images || [product.image || product.thumbnail],
      image: product.images?.[0] || product.image || product.thumbnail,
      price: product.finalPrice || product.price,
      originalPrice: product.originalPrice || product.mrp || product.price,
      rating: product.rating || 0,
      reviews: product.reviewsCount || product.reviews || 0,
      category: product.category,
    };
  };

  // Extract unique brands and sizes from products
  const brands = useMemo(() => {
    const brandSet = new Set();
    allProducts.forEach(product => {
      if (product.brand) brandSet.add(product.brand);
    });
    return Array.from(brandSet).sort();
  }, [allProducts]);

  const sizes = useMemo(() => {
    const sizeSet = new Set();
    allProducts.forEach(product => {
      if (product.sizes && Array.isArray(product.sizes)) {
        product.sizes.forEach(size => sizeSet.add(size));
      }
    });
    return Array.from(sizeSet).sort();
  }, [allProducts]);

  // Apply filters
  useEffect(() => {
    let filtered = [...allProducts];

    // IMPORTANT: Maintain subcategory filtering if we're on a subcategory page
    // This ensures products are properly sorted/filtered by subCategory
    if (derivedGender && derivedCategory) {
      const categoryMap = {
        'shirt': { subCategory: 'shirt', displayName: 'Shirt' },
        'tshirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        't-shirt': { subCategory: 'tshirt', displayName: 'T-Shirt' },
        'jeans': { subCategory: 'jeans', displayName: 'Jeans' },
        'trousers': { subCategory: 'trousers', displayName: 'Trousers' },
        'accessories': { subCategory: 'accessories', displayName: 'Accessories' },
      };
      const categoryInfo = categoryMap[derivedCategory.toLowerCase()];
      
      if (categoryInfo) {
        // Filter by subCategory first to ensure only matching subcategory products
        filtered = filtered.filter(product => {
          const productSubCategory = (product.subCategory || '').toLowerCase().trim().replace(/-/g, '');
          const expectedSubCategory = categoryInfo.subCategory.toLowerCase().trim().replace(/-/g, '');
          return productSubCategory === expectedSubCategory;
        });
      }
    }

    // Filter by price range
    if (filters.priceRange) {
      filtered = filtered.filter(product => {
        const price = product.finalPrice || product.price;
        const { min, max } = filters.priceRange;
        return price >= min && (max === Infinity || price <= max);
      });
    }

    // Filter by brands
    if (filters.brands && filters.brands.length > 0) {
      filtered = filtered.filter(product => 
        filters.brands.includes(product.brand)
      );
    }

    // Filter by sizes
    if (filters.sizes && filters.sizes.length > 0) {
      filtered = filtered.filter(product => {
        if (!product.sizes || !Array.isArray(product.sizes)) return false;
        return filters.sizes.some(size => product.sizes.includes(size));
      });
    }

    // Sort products
    if (filters.sortBy && filters.sortBy !== 'default') {
      filtered.sort((a, b) => {
        const priceA = a.finalPrice || a.price;
        const priceB = b.finalPrice || b.price;

        switch (filters.sortBy) {
          case 'price-low-high':
            return priceA - priceB;
          case 'price-high-low':
            return priceB - priceA;
          case 'newest':
            return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
          default:
            return 0;
        }
      });
    }

    setProducts(filtered);
  }, [allProducts, filters, derivedGender, derivedCategory]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleClearFilters = () => {
    setFilters({
      priceRange: null,
      brands: [],
      sizes: [],
      sortBy: null,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb Navigation */}
        {(derivedGender || pathname === '/men' || pathname === '/women') && (
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link to="/" className="text-blue-600 hover:text-blue-800">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              {derivedGender && (
                <>
                  <li>
                    <Link 
                      to={`/${derivedGender}`} 
                      className="text-blue-600 hover:text-blue-800 capitalize"
                    >
                      {derivedGender}
                    </Link>
                  </li>
                  {category && (
                    <>
                      <li className="text-gray-400">/</li>
                      <li className="text-gray-600 capitalize">
                        {category === 'tshirt' ? 'T-Shirt' : category}
                      </li>
                    </>
                  )}
                </>
              )}
              {!derivedGender && (pathname === '/men' || pathname === '/women') && (
                <li className="text-gray-600 capitalize">
                  {pathname.replace('/', '')}
                </li>
              )}
            </ol>
          </nav>
        )}

        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{pageTitle}</h1>
          {/* Mobile Filter Button */}
          <button
            onClick={() => setShowMobileFilters(!showMobileFilters)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            Filters
          </button>
        </div>
        
        <div className="flex gap-6">
          {/* Filter Sidebar - 25% width on desktop, full width on mobile when open */}
          <div className={`${showMobileFilters ? 'block' : 'hidden'} lg:block w-full lg:w-1/4 flex-shrink-0 ${showMobileFilters ? 'fixed inset-0 z-50 bg-white p-4 overflow-y-auto lg:relative lg:z-auto lg:bg-transparent lg:p-0' : ''}`}>
            {showMobileFilters && (
              <div className="lg:hidden flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold">Filters</h2>
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="text-gray-600 hover:text-gray-800"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
            <FilterSidebar
              filters={filters}
              onFilterChange={(newFilters) => {
                handleFilterChange(newFilters);
                // Close mobile filters on desktop (mobile stays open for better UX)
                if (window.innerWidth >= 1024) {
                  setShowMobileFilters(false);
                }
              }}
              onClearFilters={() => {
                handleClearFilters();
                if (window.innerWidth >= 1024) {
                  setShowMobileFilters(false);
                }
              }}
              onCloseMobile={() => setShowMobileFilters(false)}
              brands={brands}
              sizes={sizes}
            />
          </div>

          {/* Products Grid - 75% width */}
          <div className="flex-1 w-full lg:w-auto">
            {products.length > 0 ? (
              <>
                <div className="mb-4 text-gray-600">
                  Showing {products.length} {products.length === 1 ? 'product' : 'products'}
                  {allProducts.length !== products.length && (
                    <span className="ml-2 text-sm">
                      (filtered from {allProducts.length})
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {products.map((product) => (
                    <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
                  ))}
                </div>
              </>
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-600 text-lg mb-4">No products found matching your filters.</p>
                {(filters.priceRange || filters.brands?.length > 0 || filters.sizes?.length > 0) && (
                  <button
                    onClick={handleClearFilters}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Clear filters to see all products
                  </button>
                )}
                {!(filters.priceRange || filters.brands?.length > 0 || filters.sizes?.length > 0) && (
                  (derivedGender || pathname === '/men' || pathname === '/women') && (
                    <Link
                      to={`/${derivedGender || pathname.replace('/', '')}`}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      ← Back to {derivedGender ? `${derivedGender.charAt(0).toUpperCase() + derivedGender.slice(1)}'s Collection` : 'Collection'}
                    </Link>
                  )
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CategoryPage;
