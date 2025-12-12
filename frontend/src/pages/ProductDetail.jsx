import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import ProductCard from '../components/ProductCard';
import { handleImageError } from '../utils/imageFallback';
import { productAPI, reviewAPI } from '../utils/api';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { isAuthenticated } = useAuth();
  
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [recommendedProducts, setRecommendedProducts] = useState([]); // For "You may also like"
  const [trendingProducts, setTrendingProducts] = useState([]); // For "Trending Now"
  const [saleProducts, setSaleProducts] = useState([]); // For "Sale" section
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [loadingTrending, setLoadingTrending] = useState(false);
  const [loadingSale, setLoadingSale] = useState(false);
  
  // Review states
  const [reviews, setReviews] = useState([]);
  const [reviewStats, setReviewStats] = useState(null);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [reviewSort, setReviewSort] = useState('newest');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewForm, setReviewForm] = useState({
    rating: 0,
    title: '',
    comment: '',
  });

  useEffect(() => {
    fetchProduct();
  }, [id, category]);

  useEffect(() => {
    if (product) {
      fetchReviews(product);
    }
  }, [reviewSort, product]);

  const fetchProduct = async () => {
    setLoading(true);
    try {
      const validCategories = ['men', 'women', 'watches', 'lens', 'accessories'];
      const categoryMap = {
        'watches': 'watches', 'watch': 'watches',
        'lens': 'lens', 'lenses': 'lens',
        'accessories': 'accessories',
        'men': 'men', 'mens': 'men',
        'women': 'women', 'womens': 'women',
        'fashion': 'men',
      };

      let foundData = null;

      if (category && category !== 'undefined') {
        const apiCategory = categoryMap[category] || category;
        try {
          const res = await fetch(`${API_BASE_URL}/products/${apiCategory}/${id}`);
          if (res.ok) {
            const data = await res.json();
            if (data.success) foundData = data;
          }
        } catch (err) {
          console.warn("Direct category fetch failed, trying fallback...");
        }
      }

      if (!foundData) {
        for (const cat of validCategories) {
          try {
            const res = await fetch(`${API_BASE_URL}/products/${cat}/${id}`);
            if (res.ok) {
              const data = await res.json();
              if (data.success) {
                foundData = data;
                break; 
              }
            }
          } catch (e) {
            // continue
          }
        }
      }

      if (foundData) {
        setProduct(foundData.data.product);
        if (foundData.data.product.sizes?.length > 0) setSelectedSize(foundData.data.product.sizes[0]);
        if (foundData.data.product.colors?.length > 0) setSelectedColor(foundData.data.product.colors[0]);
        // Fetch recommended products after product is loaded
        fetchRecommendedProducts(foundData.data.product);
        fetchTrendingProducts(foundData.data.product);
        fetchSaleProducts(foundData.data.product);
        fetchReviews(foundData.data.product);
      } else {
        throw new Error('Product not found in any category');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
      setProduct(null); 
    } finally {
      setLoading(false);
    }
  };

  // Fetch related products (same category/subcategory/brand) for "You may also like"
  const fetchRecommendedProducts = async (currentProduct) => {
    if (!currentProduct) return;
    
    setLoadingRecommendations(true);
    try {
      const currentProductId = currentProduct._id || currentProduct.id;
      const categoryMap = {
        'watches': 'watches',
        'lens': 'lens',
        'lenses': 'lens',
        'accessories': 'accessories',
        'men': 'men',
        'women': 'women',
      };

      const productCategory = currentProduct.category?.toLowerCase() || category?.toLowerCase();
      const apiCategory = categoryMap[productCategory] || productCategory;

      let relatedProducts = [];

      // Fetch products from the SAME category/subcategory for related recommendations
      if (apiCategory === 'men') {
        const response = await productAPI.getMenItems({ 
          limit: 30, 
          subCategory: currentProduct.subCategory 
        });
        if (response.success) relatedProducts = response.data.products || [];
      } else if (apiCategory === 'women') {
        const response = await productAPI.getWomenItems({ 
          limit: 30, 
          subCategory: currentProduct.subCategory 
        });
        if (response.success) relatedProducts = response.data.products || [];
      } else if (apiCategory === 'watches') {
        const response = await productAPI.getWatches({ limit: 30 });
        if (response.success) relatedProducts = response.data.products || [];
      } else if (apiCategory === 'lens') {
        const response = await productAPI.getLenses({ limit: 30 });
        if (response.success) relatedProducts = response.data.products || [];
      } else if (apiCategory === 'accessories') {
        const response = await productAPI.getAccessories({ limit: 30 });
        if (response.success) relatedProducts = response.data.products || [];
      }

      // Filter out current product and prioritize by brand if available
      let filtered = relatedProducts.filter(p => (p._id || p.id) !== currentProductId);
      
      // If product has a brand, prioritize same brand products
      if (currentProduct.brand) {
        const sameBrand = filtered.filter(p => p.brand === currentProduct.brand);
        const differentBrand = filtered.filter(p => p.brand !== currentProduct.brand);
        filtered = [...sameBrand, ...differentBrand];
      }

      // Shuffle array to randomize
      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const shuffled = shuffleArray(filtered);
      const selectedProducts = shuffled.slice(0, 10);

      // Normalize products
      const normalized = selectedProducts.map(p => ({
        ...p,
        id: p._id || p.id,
        images: p.images || [p.image || p.thumbnail],
        image: p.images?.[0] || p.image || p.thumbnail,
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice || p.mrp || p.price,
      }));

      setRecommendedProducts(normalized);
    } catch (error) {
      console.error('Error fetching recommended products:', error);
      setRecommendedProducts([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  // Fetch completely random products from ALL categories for "Trending Now"
  const fetchTrendingProducts = async (currentProduct) => {
    if (!currentProduct) return;
    
    setLoadingTrending(true);
    try {
      const currentProductId = currentProduct._id || currentProduct.id;
      const productsByCategory = {
        men: [],
        women: [],
        watches: [],
        lenses: [],
        accessories: []
      };

      // Fetch products from ALL categories
      const fetchPromises = [
        productAPI.getMenItems({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.men = res.data.products;
          }
        }).catch(err => console.warn('Error fetching men items:', err)),
        
        productAPI.getWomenItems({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.women = res.data.products;
          }
        }).catch(err => console.warn('Error fetching women items:', err)),
        
        productAPI.getWatches({ limit: 30 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.watches = res.data.products;
          }
        }).catch(err => console.warn('Error fetching watches:', err)),
        
        productAPI.getLenses({ limit: 30 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.lenses = res.data.products;
          }
        }).catch(err => console.warn('Error fetching lenses:', err)),
        
        productAPI.getAccessories({ limit: 30 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.accessories = res.data.products;
          }
        }).catch(err => console.warn('Error fetching accessories:', err)),
      ];

      await Promise.allSettled(fetchPromises);

      // Combine all products from all categories
      const allProducts = [
        ...productsByCategory.men,
        ...productsByCategory.women,
        ...productsByCategory.watches,
        ...productsByCategory.lenses,
        ...productsByCategory.accessories
      ].filter(p => (p._id || p.id) !== currentProductId);

      // Shuffle array to randomize (Fisher-Yates shuffle)
      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      // Get completely random mix from all categories
      const shuffled = shuffleArray(allProducts);
      const randomProducts = shuffled.slice(0, 12);

      // Normalize products
      const normalized = randomProducts.map(p => ({
        ...p,
        id: p._id || p.id,
        images: p.images || [p.image || p.thumbnail],
        image: p.images?.[0] || p.image || p.thumbnail,
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice || p.mrp || p.price,
      }));

      setTrendingProducts(normalized);
    } catch (error) {
      console.error('Error fetching trending products:', error);
      setTrendingProducts([]);
    } finally {
      setLoadingTrending(false);
    }
  };

  // Fetch reviews for the product
  const fetchReviews = async (currentProduct) => {
    if (!currentProduct) return;
    
    setLoadingReviews(true);
    try {
      const productId = String(currentProduct._id || currentProduct.id);
      const response = await reviewAPI.getReviews(productId, reviewSort, 50);
      
      if (response.success) {
        setReviews(response.data.reviews || []);
        setReviewStats(response.data.statistics || null);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
      setReviews([]);
      setReviewStats(null);
    } finally {
      setLoadingReviews(false);
    }
  };

  // Handle review sort change
  const handleReviewSortChange = (newSort) => {
    setReviewSort(newSort);
    if (product) {
      const productId = String(product._id || product.id);
      reviewAPI.getReviews(productId, newSort, 50)
        .then(response => {
          if (response.success) {
            setReviews(response.data.reviews || []);
          }
        })
        .catch(error => console.error('Error fetching sorted reviews:', error));
    }
  };

  // Handle review form submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    if (!reviewForm.rating || !reviewForm.title.trim() || !reviewForm.comment.trim()) {
      alert('Please fill in all fields and select a rating');
      return;
    }

    setSubmittingReview(true);
    try {
      const productId = String(product._id || product.id);
      const productCategory = product.category || category || 'general';
      
      const response = await reviewAPI.createReview({
        productId,
        productCategory,
        rating: reviewForm.rating,
        title: reviewForm.title.trim(),
        comment: reviewForm.comment.trim(),
      });

      if (response.success) {
        // Reset form
        setReviewForm({ rating: 0, title: '', comment: '' });
        setShowReviewForm(false);
        // Refresh reviews
        await fetchReviews(product);
        alert('Review submitted successfully!');
      }
    } catch (error) {
      console.error('Error submitting review:', error);
      alert(error.message || 'Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  };

  // Mark review as helpful
  const handleMarkHelpful = async (reviewId) => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      const response = await reviewAPI.markHelpful(reviewId);
      if (response.success) {
        // Update the review in the list
        setReviews(prevReviews =>
          prevReviews.map(review =>
            review._id === reviewId
              ? { ...review, helpful: response.data.helpful, isHelpful: response.data.isHelpful }
              : review
          )
        );
      }
    } catch (error) {
      console.error('Error marking review as helpful:', error);
    }
  };

  // Fetch products on sale for "Sale" section
  const fetchSaleProducts = async (currentProduct) => {
    if (!currentProduct) return;
    
    setLoadingSale(true);
    try {
      const currentProductId = currentProduct._id || currentProduct.id;
      const productsByCategory = {
        men: [],
        women: [],
        watches: [],
        lenses: [],
        accessories: []
      };

      // Fetch products from ALL categories
      const fetchPromises = [
        productAPI.getMenItems({ limit: 50 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.men = res.data.products;
          }
        }).catch(err => console.warn('Error fetching men items:', err)),
        
        productAPI.getWomenItems({ limit: 50 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.women = res.data.products;
          }
        }).catch(err => console.warn('Error fetching women items:', err)),
        
        productAPI.getWatches({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.watches = res.data.products;
          }
        }).catch(err => console.warn('Error fetching watches:', err)),
        
        productAPI.getLenses({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.lenses = res.data.products;
          }
        }).catch(err => console.warn('Error fetching lenses:', err)),
        
        productAPI.getAccessories({ limit: 40 }).then(res => {
          if (res.success && res.data?.products) {
            productsByCategory.accessories = res.data.products;
          }
        }).catch(err => console.warn('Error fetching accessories:', err)),
      ];

      await Promise.allSettled(fetchPromises);

      // Combine all products and filter for sale items
      const allProducts = [
        ...productsByCategory.men,
        ...productsByCategory.women,
        ...productsByCategory.watches,
        ...productsByCategory.lenses,
        ...productsByCategory.accessories
      ];

      // Filter products that are on sale (have discount or onSale flag)
      const saleItems = allProducts.filter(p => {
        const productId = p._id || p.id;
        if (productId === currentProductId) return false;
        
        const finalPrice = p.finalPrice || p.price;
        const originalPrice = p.originalPrice || p.mrp || p.price;
        const hasDiscount = originalPrice > finalPrice;
        const discountPercent = p.discountPercent || (hasDiscount ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0);
        
        return p.onSale === true || hasDiscount || discountPercent > 0;
      });

      // Shuffle array to randomize
      const shuffleArray = (array) => {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
      };

      const shuffled = shuffleArray(saleItems);
      const selectedSaleProducts = shuffled.slice(0, 12);

      // Normalize products
      const normalized = selectedSaleProducts.map(p => ({
        ...p,
        id: p._id || p.id,
        images: p.images || [p.image || p.thumbnail],
        image: p.images?.[0] || p.image || p.thumbnail,
        price: p.finalPrice || p.price,
        originalPrice: p.originalPrice || p.mrp || p.price,
      }));

      setSaleProducts(normalized);
    } catch (error) {
      console.error('Error fetching sale products:', error);
      setSaleProducts([]);
    } finally {
      setLoadingSale(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) return setShowLoginModal(true);
    try {
      await addToCart(product, 1, selectedSize, selectedColor);
    } catch (error) {
      if (error.message.includes('login')) setShowLoginModal(true);
    }
  };

  const handleBuyNow = async () => {
    if (!isAuthenticated) return setShowLoginModal(true);
    try {
      await addToCart(product, 1, selectedSize, selectedColor);
      navigate('/checkout');
    } catch (error) {
      if (error.message.includes('login')) setShowLoginModal(true);
    }
  };

  const handlePrevImage = () => {
    const productImages = product.images || [product.image || product.thumbnail];
    setSelectedImageIndex((prev) => (prev === 0 ? productImages.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    const productImages = product.images || [product.image || product.thumbnail];
    setSelectedImageIndex((prev) => (prev === productImages.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <LoadingState />;
  if (!product) return <NotFoundState />;

  const productImages = product.images || [product.image || product.thumbnail];
  const finalPrice = product.finalPrice || product.price;
  const originalPrice = product.originalPrice || product.mrp || product.price;
  
  // Split product name for highlighting
  const nameWords = product.name.split(' ');
  const highlightWords = ['black', 'strap', 'steel', 'pro', 'sport'];

  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
          
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-6 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            back
          </button>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-8 lg:gap-12 xl:gap-16">
            
            {/* LEFT COLUMN: Product Visualization */}
            <div className="relative lg:sticky lg:top-8 h-fit order-first lg:order-first">
              
              {/* Main Product Image */}
              <div className="relative aspect-square bg-gray-100 rounded-xl sm:rounded-2xl overflow-hidden mb-4 sm:mb-6 shadow-lg max-w-md mx-auto lg:max-w-full">
                {/* Best Seller Badge */}
                <div className="absolute top-3 left-3 z-10 bg-white/90 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] font-semibold text-gray-900 shadow-sm">
                  best seller
                </div>

                {/* Navigation Arrows */}
                {productImages.length > 1 && (
                  <div className="absolute bottom-3 right-3 z-10 flex gap-1.5">
                    <button 
                      onClick={handlePrevImage}
                      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
                      aria-label="Previous image"
                    >
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    <button
                      onClick={handleNextImage}
                      className="w-8 h-8 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white transition-all shadow-sm"
                      aria-label="Next image"
                    >
                      <svg className="w-4 h-4 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                )}

                <img 
                  src={productImages[selectedImageIndex]} 
                  alt={product.name} 
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, 800, 800)}
                />
                
                {/* Interactive Labels */}
                {product.color && (
                  <div className="absolute top-1/4 right-4 sm:right-8">
                    <div className="relative">
                      <div className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-500 rounded-full z-10"></div>
                      <div className="bg-gray-800/90 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        {product.color}
                  </div>
                  </div>
                    </div>
                  )}
                {product.brand && (
                  <div className="absolute bottom-1/3 left-4 sm:left-8">
                    <div className="relative">
                      <div className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-gray-500 rounded-full z-10"></div>
                      <div className="bg-gray-800/90 backdrop-blur-sm text-white text-[10px] font-medium px-2 py-1 rounded-full whitespace-nowrap">
                        {product.brand}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Size Selection */}
              {product.sizes && product.sizes.length > 0 && (
                <div className="mb-4">
                  <label className="block text-xs font-medium text-gray-900 mb-2">Select Size</label>
                  <div className="flex flex-wrap gap-2">
                    {product.sizes.map((size) => {
                      const isSelected = selectedSize === size;
                      return (
                  <button
                          key={size}
                          onClick={() => setSelectedSize(size)}
                          className={`px-3 py-2 rounded-lg border-2 transition-all flex items-center gap-1.5 ${
                            isSelected
                              ? 'border-gray-900 bg-gray-50'
                              : 'border-gray-200 hover:border-gray-300'
                          }`}
                        >
                          <span className="text-xs font-medium text-gray-900">{size}</span>
                          {isSelected && (
                            <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                          )}
                  </button>
                      );
                    })}
              </div>
              </div>
              )}

              {/* Color Swatches */}
              {(product.colors?.length > 0 || product.color) && (
                <div>
                  <label className="block text-xs font-medium text-gray-900 mb-2">Select Color</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {(product.colors || [product.color || '#000000']).slice(0, 6).map((color, idx) => {
                      const isSelected = selectedColor === color || (!selectedColor && idx === 0);
                      return (
                    <button
                          key={idx}
                          onClick={() => setSelectedColor(color)}
                          className={`relative w-10 h-10 rounded-full border-2 transition-all ${
                            isSelected ? 'border-gray-900 scale-110 shadow-md' : 'border-gray-300 hover:border-gray-500'
                          }`}
                          style={{ backgroundColor: color }}
                          aria-label={`Select color ${color}`}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <svg className="w-5 h-5 text-white drop-shadow-lg" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                      </div>
                          )}
                    </button>
                      );
                    })}
                 </div>
                 </div>
                )}
            </div>

            {/* RIGHT COLUMN: Product Information */}
            <div className="flex flex-col space-y-6 order-last lg:order-last">
              
              {/* Product Title with Highlighted Words */}
                  <div>
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
                      {nameWords.map((word, idx) => {
                        const shouldHighlight = highlightWords.some(hw => word.toLowerCase().includes(hw.toLowerCase()));
                        return (
                          <span key={idx} className="inline-block mr-2">
                            {shouldHighlight ? (
                              <span className="relative inline-block">
                                <span className="relative z-10">
                                  {word}
                  </span>
                                <span className="absolute inset-0 bg-gray-200/40 rounded-lg blur-sm transform -rotate-1 -z-0"></span>
                  </span>
                            ) : (
                              <span>{word}</span>
                )}
                          </span>
                        );
                      })}
                    </h1>
                  </div>

              </div>
            </div>

              {/* Price and Action Buttons */}
              <div className="flex flex-col gap-3 sm:gap-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-gray-900">₹{finalPrice.toLocaleString()}</span>
                  {originalPrice > finalPrice && (
                    <span className="text-base text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row gap-3">
                  <button 
                    onClick={handleAddToCart}
                    className="flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap text-sm"
                  >
                    <span>add to cart</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-900 font-semibold px-5 py-2.5 rounded-lg transition-all shadow-md hover:shadow-lg active:scale-95 whitespace-nowrap text-sm border-2 border-gray-900"
                  >
                    <span>buy now</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </button>
                </div>
                </div>

              {/* Product Reviews */}
              

              

              {/* Product Information Sections - Always Visible */}
              <div className="border-t border-gray-200 pt-4 mt-auto space-y-6">
                {/* Details Section */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">details</h3>
                  <div className="text-sm text-gray-600 leading-relaxed">
                    <p className="mb-3">{product.description || product.productDetails?.description || 'Product details coming soon...'}</p>
                    <div className="space-y-2">
                      {product.productDetails?.fabric && (
                        <p><span className="font-medium text-gray-900">Fabric:</span> {product.productDetails.fabric}</p>
                      )}
                      {product.brand && (
                        <p><span className="font-medium text-gray-900 text-xl">Brand:</span> {product.brand}</p>
                      )}
                  </div>
                  </div>
                </div>

                {/* Reviews Section */}
                <div>
                  <h3 className="text-2xl font-semibold text-gray-900 mb-3">reviews</h3>
                  <div className="text-sm text-gray-600 ml-10">
                    {loadingReviews ? (
                      <div className="space-y-2">
                        <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                        <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      </div>
                    ) : reviews.length > 0 ? (
                      <div className="space-y-4">
                        {/* Rating Distribution Bars */}
                        {reviewStats && reviewStats.ratingDistribution && (
                          <div className="space-y-2 mb-4 pb-4 border-b border-gray-200">
                            {[5, 4, 3, 2, 1].map((rating) => {
                              const count = reviewStats.ratingDistribution[rating] || 0;
                              const percentage = reviewStats.totalReviews > 0
                                ? (count / reviewStats.totalReviews) * 100
                                : 0;
                              return (
                                <div key={rating} className="flex items-center gap-3">
                                  <div className="text-xs font-medium text-gray-700 w-8 flex-shrink-0">
                                    {rating} ★
                                  </div>
                                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden min-w-0">
                                    <div
                                      className="h-full bg-yellow-400 transition-all duration-300"
                                      style={{ width: `${percentage}%` }}
                                    />
                                  </div>
                                  <div className="text-xs text-gray-500 w-6 text-right flex-shrink-0">
                                    {count}
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        )}
                        
                        {/* Reviews List */}
                        <div className="space-y-3">
                          {reviews.slice(0, 3).map((review) => (
                            <div key={review._id} className="border-b border-gray-100 pb-3 last:border-0">
                              <div className="flex items-center gap-2 mb-1.5">
                                <div className="font-medium text-gray-900 text-sm">
                                  {review.userName || 'Anonymous'}
                                </div>
                                <div className="flex items-center gap-0.5">
                                  {[1, 2, 3, 4, 5].map((star) => (
                                    <svg
                                      key={star}
                                      className={`w-4 h-4 ${
                                        star <= review.rating
                                          ? 'text-yellow-400 fill-current'
                                          : 'text-gray-300'
                                      }`}
                                      fill="currentColor"
                                      viewBox="0 0 20 20"
                                    >
                                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                  ))}
                                </div>
                              </div>
                              <p className="font-medium text-gray-900 mb-1 text-sm">{review.title}</p>
                              <p className="text-gray-600 line-clamp-2 text-sm">{review.comment}</p>
                            </div>
                          ))}
                          {reviews.length > 3 && (
                            <p className="text-gray-500 text-xs">+ {reviews.length - 3} more reviews</p>
                          )}
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No reviews yet.</p>
                    )}
                </div>
              </div>

                {/* Delivery Section */}
                  <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">delivery</h3>
                  <div className="text-sm text-gray-600 space-y-2.5">
                    <div className="flex items-start gap-2.5">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <p>Free delivery on orders over ₹499</p>
                    </div>
                    <div className="flex items-start gap-2.5">
                      <svg className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      <p>30 Days Easy Returns</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trending Now Section - All Product Recommendations */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200 mb-12 sm:mb-20">
            <div className="mb-6 sm:mb-8">
              <h2 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-1">Trending Now</h2>
              <p className="text-xs sm:text-sm text-gray-600">Popular picks across all categories</p>
            </div>

            {/* You may also like - Related products */}
            {(recommendedProducts.length > 0 || loadingRecommendations) && (
              <div className="mb-8 sm:mb-12">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">You may also like</h3>
                {loadingRecommendations ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-48 animate-pulse">
                        <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
            </div>
                    ))}
          </div>
                ) : (
                  <div className="relative">
                    <div 
                      className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" 
                      style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none'
                      }}
                    >
                      <div className="flex gap-4 min-w-max">
                        {recommendedProducts.map((recommendedProduct) => (
                          <div key={recommendedProduct.id} className="flex-shrink-0 w-48">
                            <ProductCard product={recommendedProduct} />
                          </div>
                        ))}
                      </div>
                    </div>
                        </div>
                      )}
                    </div>
            )}

            {/* On Sale Section */}
            {(saleProducts.length > 0 || loadingSale) && (
              <div className="mb-8 sm:mb-12">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">On Sale</h3>
                {loadingSale ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-48 animate-pulse">
                        <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div 
                      className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" 
                      style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none'
                      }}
                    >
                      <div className="flex gap-4 min-w-max">
                        {saleProducts.map((saleProduct) => (
                          <div key={saleProduct.id} className="flex-shrink-0 w-48">
                            <ProductCard product={saleProduct} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                  </div>
                )}

            {/* More from [Brand] Section */}
            {product?.brand && (recommendedProducts.length > 0 || loadingRecommendations) && (
              <div className="mb-8 sm:mb-12">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">More from {product.brand}</h3>
                {loadingRecommendations ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-48 animate-pulse">
                        <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div 
                      className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" 
                      style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none'
                      }}
                    >
                      <div className="flex gap-4 min-w-max">
                        {recommendedProducts
                          .filter(p => p.brand === product.brand)
                          .slice(0, 8)
                          .map((recommendedProduct) => (
                            <div key={recommendedProduct.id} className="flex-shrink-0 w-48">
                              <ProductCard product={recommendedProduct} />
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Trending Now - Random Mix from ALL Categories */}
            {(trendingProducts.length > 0 || loadingTrending) && (
                  <div>
                
                {loadingTrending ? (
                  <div className="flex gap-4 overflow-x-auto pb-4">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="flex-shrink-0 w-48 animate-pulse">
                        <div className="aspect-[4/5] bg-gray-200 rounded-lg mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded mb-2"></div>
                        <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    </div>
                    ))}
                  </div>
                ) : (
                  <div className="relative">
                    <div 
                      className="overflow-x-auto pb-4 -mx-4 px-4 scrollbar-hide" 
                      style={{ 
                        scrollbarWidth: 'none', 
                        msOverflowStyle: 'none'
                      }}
                    >
                      <div className="flex gap-4 min-w-max">
                        {trendingProducts.map((trendingProduct) => (
                          <div key={trendingProduct.id} className="flex-shrink-0 w-48">
                            <ProductCard product={trendingProduct} />
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                  </div>
                )}
              </div>

          {/* Reviews Section */}
          <div className="mt-12 sm:mt-16 pt-8 sm:pt-12 border-t border-gray-200 mb-12 sm:mb-20">
            {/* Header with Title and Actions */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 border-b border-gray-200 pb-4 sm:pb-5 mb-6">
              <div className="flex items-center gap-4 flex-wrap">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                  Customer Reviews {reviews.length > 0 && `(${reviews.length})`}
                </h3>
                {isAuthenticated && !showReviewForm && (
                <button
                    onClick={() => setShowReviewForm(true)}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    Write a Review
                </button>
                )}
                {!isAuthenticated && (
                <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg active:scale-95"
                >
                    Login to Write a Review
                </button>
                )}
              </div>
              {reviews.length > 0 && (
                <select
                  value={reviewSort}
                  onChange={(e) => handleReviewSortChange(e.target.value)}
                  className="w-full sm:w-auto text-sm border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-gray-900 focus:border-transparent bg-white"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="highest">Highest Rating</option>
                  <option value="lowest">Lowest Rating</option>
                  <option value="helpful">Most Helpful</option>
                </select>
                  )}
                </div>

            {/* Review Form */}
            {showReviewForm && (
              <div className="border border-gray-200 rounded-lg p-4 sm:p-6 lg:p-8 bg-gray-50 mb-6">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-4 sm:mb-6">Write a Review</h3>
                <form onSubmit={handleReviewSubmit} className="space-y-4 sm:space-y-5">
                  {/* Star Rating */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Rating *
                    </label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                  <button 
                          key={star}
                          type="button"
                          onClick={() => setReviewForm({ ...reviewForm, rating: star })}
                          className={`w-8 h-8 ${
                            star <= reviewForm.rating
                              ? 'text-yellow-400'
                              : 'text-gray-300'
                          } hover:text-yellow-400 transition-colors`}
                        >
                          <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                  </button>
                      ))}
                    </div>
                </div>
                
                  {/* Review Title */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Review Title *
                    </label>
                    <input
                      type="text"
                      value={reviewForm.title}
                      onChange={(e) => setReviewForm({ ...reviewForm, title: e.target.value })}
                      placeholder="Give your review a title"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm"
                      maxLength={200}
                      required
                    />
                  </div>

                  {/* Review Comment */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Review *
                    </label>
                    <textarea
                      value={reviewForm.comment}
                      onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })}
                      placeholder="Share your experience with this product"
                      rows={5}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-900 focus:border-transparent text-sm resize-none"
                      maxLength={2000}
                      required
                    />
                    <div className="text-xs text-gray-500 mt-1 text-right">
                      {reviewForm.comment.length}/2000
                  </div>
                </div>

                  {/* Form Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      type="submit"
                      disabled={submittingReview}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-gray-900 text-white text-sm sm:text-base font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
                    >
                      {submittingReview ? 'Submitting...' : 'Submit Review'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowReviewForm(false);
                        setReviewForm({ rating: 0, title: '', comment: '' });
                      }}
                      className="w-full sm:w-auto px-6 sm:px-8 py-2.5 sm:py-3 bg-white text-gray-700 text-sm sm:text-base font-semibold rounded-lg border border-gray-300 hover:bg-gray-50 transition-all active:scale-95"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
                </div>
            )}

            {/* Reviews List */}
            {loadingReviews ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                    <div className="h-20 bg-gray-200 rounded"></div>
                  </div>
                ))}
              </div>
            ) : reviews.length > 0 ? (
              <div className="space-y-6 sm:space-y-8">
                {reviews.map((review) => (
                  <div key={review._id} className="border-b border-gray-200 pb-6 sm:pb-8 last:border-0">
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-4 mb-3">
                      <div className="flex-1 w-full">
                        <div className="flex flex-wrap items-center gap-2 mb-2">
                          <div className="font-semibold text-sm sm:text-base text-gray-900">
                            {review.userName || 'Anonymous'}
                          </div>
                          {review.verifiedPurchase && (
                            <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded font-medium">
                              Verified Purchase
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-3">
                          <div className="flex items-center gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <svg
                                key={star}
                                className={`w-4 h-4 sm:w-5 sm:h-5 ${
                                  star <= review.rating
                                    ? 'text-yellow-400 fill-current'
                                    : 'text-gray-300'
                                }`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          <span className="text-xs sm:text-sm text-gray-500">
                            {new Date(review.createdAt).toLocaleDateString('en-US', {
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>
              </div>

                    <h4 className="font-semibold text-sm sm:text-base text-gray-900 mb-2 sm:mb-3">
                      {review.title}
                    </h4>
                    
                    <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4 sm:mb-5 whitespace-pre-wrap">
                      {review.comment}
                    </p>

                    {/* Helpful Button */}
                    <button
                      onClick={() => handleMarkHelpful(review._id)}
                      className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-600 hover:text-gray-900 transition-colors py-1"
                    >
                      <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                      <span className="font-medium">Helpful ({review.helpful || 0})</span>
                    </button>
            </div>
                ))}
          </div>
            ) : !loadingReviews ? (
              <div className="text-center py-8 sm:py-12">
                <p className="text-sm sm:text-base text-gray-500 mb-4 sm:mb-6">No reviews yet. Be the first to review this product!</p>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </>
  );
};

const LoadingState = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="flex flex-col items-center gap-4">
      <div className="w-12 h-12 border-4 border-gray-200 border-t-gray-900 rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Loading details...</p>
    </div>
  </div>
);

const NotFoundState = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 text-center">
    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
    <p className="text-gray-500 mb-6">The product you are looking for doesn't exist or has been removed.</p>
    <Link to="/" className="bg-gray-900 text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition-colors">
      Back to Home
    </Link>
  </div>
);

export default ProductDetail;
