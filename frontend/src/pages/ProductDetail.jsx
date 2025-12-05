import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from '../components/LoginModal';
import { handleImageError } from '../utils/imageFallback';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const ProductDetail = () => {
  const { id, category } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showFullDescription, setShowFullDescription] = useState(false);

  useEffect(() => {
    fetchProduct();
  }, [id, category]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      // Map category to API endpoint
      const categoryMap = {
        'watches': 'watches',
        'watch': 'watches',
        'lens': 'lens',
        'lenses': 'lens',
        'accessories': 'accessories',
        'Accessories': 'accessories',
        'men': 'men',
        'mens': 'men',
        'women': 'women',
        'womens': 'women',
        'fashion': 'men',
      };

      const apiCategory = categoryMap[category] || category;

      // Determine which API endpoint to use based on category
      let endpoint = '';
      if (apiCategory === 'watches') {
        endpoint = `/products/watches/${id}`;
      } else if (apiCategory === 'lens') {
        endpoint = `/products/lens/${id}`;
      } else if (apiCategory === 'accessories') {
        endpoint = `/products/accessories/${id}`;
      } else if (apiCategory === 'men') {
        endpoint = `/products/men/${id}`;
      } else if (apiCategory === 'women') {
        endpoint = `/products/women/${id}`;
      } else {
        // Try to find product in any category
        const categories = ['watches', 'lens', 'accessories', 'men', 'women'];
        for (const cat of categories) {
          try {
            const response = await fetch(`${API_BASE_URL}/products/${cat}/${id}`);
            if (response.ok) {
              const data = await response.json();
              if (data.success) {
                setProduct(data.data.product);
                setLoading(false);
                // Set default selections
                if (data.data.product.sizes && data.data.product.sizes.length > 0) {
                  setSelectedSize(data.data.product.sizes[0]);
                }
                if (data.data.product.colors && data.data.product.colors.length > 0) {
                  setSelectedColor(data.data.product.colors[0]);
                }
                return;
              }
            }
          } catch (e) {
            continue;
          }
        }
        throw new Error('Product not found');
      }

      const response = await fetch(`${API_BASE_URL}${endpoint}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data.product);
        // Set default selections
        if (data.data.product.sizes && data.data.product.sizes.length > 0) {
          setSelectedSize(data.data.product.sizes[0]);
        }
        if (data.data.product.colors && data.data.product.colors.length > 0) {
          setSelectedColor(data.data.product.colors[0]);
        }
      } else {
        throw new Error('Product not found');
      }
    } catch (error) {
      console.error('Error fetching product:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      await addToCart(product, quantity, selectedSize, selectedColor);
      // Show success message or notification
    } catch (error) {
      if (error.message.includes('login')) {
        setShowLoginModal(true);
      }
    }
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated) {
      setShowLoginModal(true);
      return;
    }

    try {
      if (isInWishlist(product._id || product.id)) {
        await removeFromWishlist(product._id || product.id);
      } else {
        await addToWishlist(product);
      }
    } catch (error) {
      if (error.message.includes('login')) {
        setShowLoginModal(true);
      }
    }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} - ₹${product.price}`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Product Not Found</h1>
          <Link
            to="/"
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-white-700"
          >
            Go Home
          </Link>
        </div>
      </div>
    );
  }

  const productImages = product.images || [product.image || product.thumbnail];
  const finalPrice = product.finalPrice || product.price;
  const originalPrice = product.originalPrice || product.mrp || product.price;
  const discount = product.discountPercent || (originalPrice > finalPrice 
    ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) 
    : 0);

  // Build breadcrumbs
  const getCategoryPath = (cat) => {
    if (!cat) return '/';
    const categoryMap = {
      'watches': '/watches',
      'watch': '/watches',
      'lens': '/lenses',
      'lenses': '/lenses',
      'accessories': '/accessories',
      'Accessories': '/accessories',
      'men': '/men',
      'women': '/women',
      'fashion': '/men',
    };
    return categoryMap[cat] || `/${cat}`;
  };

  const breadcrumbs = [
    { name: 'Home', path: '/' },
    { 
      name: product.category 
        ? (product.category === 'lens' ? 'Lenses' : product.category.charAt(0).toUpperCase() + product.category.slice(1))
        : 'Products', 
      path: getCategoryPath(product.category) 
    },
    { name: product.name, path: '#' },
  ];

  const highlightCards = [
    
  ];

  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      <div className="min-h-screen bg-gray-50 py-6">
        <div className="max-w-5xl mx-auto px-4 sm:px-5 lg:px-6">
          {/* Breadcrumbs */}
          <nav className="mb-4">
            <ol className="flex items-center space-x-2 text-sm">
              {breadcrumbs.map((crumb, index) => (
                <li key={index} className="flex items-center">
                  {index > 0 && <span className="mx-2 text-gray-400">/</span>}
                  {index === breadcrumbs.length - 1 ? (
                    <span className="text-gray-600">{crumb.name}</span>
                  ) : (
                    <Link to={crumb.path} className="text-blue-600 hover:text-blue-800">
                      {crumb.name}
                    </Link>
                  )}
                </li>
              ))}
            </ol>
          </nav>

          {/* Product Title and Rating */}
          <div className="mb-3">
            <h1 className="text-xl md:text-2xl font-semibold text-gray-900 mb-1">{product.name}</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <div className="flex items-center">
                {[...Array(5)].map((_, i) => (
                  <svg
                    key={i}
                    className={`w-5 h-5 ${
                      i < Math.floor(product.rating || 0)
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                    viewBox="0 0 20 20"
                  >
                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                  </svg>
                ))}
                <span className="ml-2 text-gray-700 font-semibold">
                  {product.rating || 0}
                </span>
              </div>
              <span className="text-gray-500">
                ({product.reviewsCount || product.reviews || 0} reviews)
              </span>
              {product.stock && (
                <span className="text-gray-500">
                  • Sold {Math.floor(product.stock * 0.8) || 0}
                </span>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
            {/* Left Column - Image Thumbnails */}
            <div className="lg:col-span-1 flex lg:flex-col gap-2 order-2 lg:order-1">
              {productImages.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`w-16 h-16 lg:w-full border-2 transition-all ${
                    index === selectedImageIndex
                      ? 'border-blue-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${product.name} view ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => handleImageError(e, 100, 100)}
                  />
                </button>
              ))}
            </div>

            {/* Center Column - Main Content */}
            <div className="lg:col-span-5 order-1 lg:order-2">
              {/* Main Product Image */}
              <div className="bg-white rounded-lg shadow p-3 mb-3">
                <img
                  src={productImages[selectedImageIndex]}
                  alt={product.name}
                  className="w-full h-[320px] object-contain"
                  onError={(e) => handleImageError(e, 600, 600)}
                />
              </div>

              {/* Configuration Options */}
              <div className="bg-white rounded-lg shadow p-4 mb-4 space-y-4">
                {/* Model/Variant Selection */}
                {product.productDetails?.modelNumber && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Model
                    </label>
                    <div className="flex gap-2">
                      {product.productDetails.function && (
                        <button className="px-4 py-2 bg-blue-600 text-white font-medium">
                          {product.productDetails.function}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Memory/Storage Selection */}
                {(product.productDetails?.packOf || product.sizes) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {product.sizes ? 'Size' : 'Memory'}
                    </label>
                    <div className="flex gap-2 flex-wrap">
                      {product.sizes ? (
                        product.sizes.map((size) => (
                          <button
                            key={size}
                            onClick={() => setSelectedSize(size)}
                            className={`px-4 py-2 border-2 font-medium transition-all ${
                              selectedSize === size
                                ? 'border-black-600 bg-black text-white'
                                : 'border-gray-300 hover:border-gray-400'
                            }`}
                          >
                            {size}
                          </button>
                        ))
                      ) : (
                        <button className="px-4 py-2 bg-blue-600 text-white font-medium">
                          {product.productDetails.packOf || 'Standard'}
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {(product.colors || product.color || product.brandColor) && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex items-center gap-3">
                      <span className="text-gray-600">
                        {product.color || product.brandColor || product.colors?.[0]}
                      </span>
                      <div className="flex gap-2">
                        {product.colors?.map((color, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedColor(color)}
                            className={`w-8 h-8 rounded-full border-2 ${
                              selectedColor === color
                                ? 'border-blue-600 ring-2 ring-blue-200'
                                : 'border-gray-300'
                            }`}
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Product Description */}
              <div className="bg-white rounded-lg shadow p-4 mb-3">
                <h2 className="text-base font-semibold text-gray-900 mb-2">Description</h2>
                <p className="text-sm text-gray-700 leading-relaxed">
                  {showFullDescription
                    ? product.description
                    : product.description?.substring(0, 200)}
                  {product.description?.length > 200 && !showFullDescription && '...'}
                </p>
                {product.description?.length > 200 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="mt-2 text-blue-600 hover:text-blue-800 font-medium"
                  >
                    {showFullDescription ? 'Show Less' : 'See More'}
                  </button>
                )}
              </div>

              {/* Specifications */}
              <div className="bg-white rounded-lg shadow p-4">
                <h2 className="text-base font-semibold text-gray-900 mb-3">Specifications</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div className="space-y-3">
                    <div>
                      <span className="font-semibold text-gray-700">Brand:</span>{' '}
                      <span className="text-gray-600">{product.brand}</span>
                    </div>
                    {product.productDetails?.fabric && (
                      <div>
                        <span className="font-semibold text-gray-700">Fabric:</span>{' '}
                        <span className="text-gray-600">{product.productDetails.fabric}</span>
                      </div>
                    )}
                    {product.productDetails?.fit && (
                      <div>
                        <span className="font-semibold text-gray-700">Fit:</span>{' '}
                        <span className="text-gray-600">{product.productDetails.fit}</span>
                      </div>
                    )}
                    {product.frameMaterial && (
                      <div>
                        <span className="font-semibold text-gray-700">Frame Material:</span>{' '}
                        <span className="text-gray-600">{product.frameMaterial}</span>
                      </div>
                    )}
                    {product.caseMaterial && (
                      <div>
                        <span className="font-semibold text-gray-700">Case Material:</span>{' '}
                        <span className="text-gray-600">{product.caseMaterial}</span>
                      </div>
                    )}
                    {product.dimensions && (
                      <div>
                        <span className="font-semibold text-gray-700">Dimensions:</span>{' '}
                        <span className="text-gray-600">
                          {Object.values(product.dimensions).filter(Boolean).join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="space-y-3">
                    {product.warranty && (
                      <div>
                        <span className="font-semibold text-gray-700">Warranty:</span>{' '}
                        <span className="text-gray-600">{product.warranty}</span>
                      </div>
                    )}
                    {product.specifications?.warranty && (
                      <div>
                        <span className="font-semibold text-gray-700">Warranty:</span>{' '}
                        <span className="text-gray-600">{product.specifications.warranty}</span>
                      </div>
                    )}
                    {product.careInstructions && (
                      <div>
                        <span className="font-semibold text-gray-700">Care Instructions:</span>{' '}
                        <span className="text-gray-600">{product.careInstructions}</span>
                      </div>
                    )}
                    {product.productDetails?.fabricCare && (
                      <div>
                        <span className="font-semibold text-gray-700">Care:</span>{' '}
                        <span className="text-gray-600">{product.productDetails.fabricCare}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Purchase Sidebar */}
            <div className="lg:col-span-4 order-3">
              <div className="bg-white-900 text-black p-4 mb-3 space-y-3">
                {highlightCards.map((item, index) => (
                  <div key={index}>
                    <p className="text-xs uppercase tracking-wide text-black-400">{item.title}</p>
                    <p className="text-sm font-semibold">{item.text}</p>
                  </div>
                ))}
              </div>
              <div className="bg-white p-4 lg:sticky lg:top-16">
                {/* Quantity and Total */}
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity:
                  </label>
                  <div className="flex items-center gap-2 mb-3">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      className="w-8 h-8 border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center font-semibold text-sm"
                    >
                      -
                    </button>
                    <span className="text-base font-semibold w-10 text-center">{quantity}</span>
                    <button
                      onClick={() => setQuantity(quantity + 1)}
                      className="w-8 h-8 border-2 border-gray-300 hover:border-gray-400 flex items-center justify-center font-semibold text-sm"
                    >
                      +
                    </button>
                  </div>
                  <div className="text-right">
                    <span className="text-xl font-bold text-gray-900">
                      ₹{(finalPrice * quantity).toLocaleString()}
                    </span>
                    {discount > 0 && (
                      <div className="mt-1">
                        <span className="text-xs text-gray-500 line-through">
                          ₹{(originalPrice * quantity).toLocaleString()}
                        </span>
                        <span className="ml-2 text-xs text-green-600 font-semibold">
                          {discount}% off
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-2 mb-4">
                  <button
                    onClick={handleAddToCart}
                    className="w-full bg-black border-2 border-gray-300 text-white py-2.5 px-4 font-semibold text-sm hover:bg-gray-900 transition-colors
                  "
                  >
                    + Add to Cart
                  </button>
                  <button
                    onClick={() => {
                      handleAddToCart();
                      navigate('/cart');
                    }}
                    className="w-full bg-white border-2 border-gray-300 text-gray-900 py-2.5 px-4 font-semibold text-sm hover:bg-gray-50 transition-colors"
                  >
                    Pick up at Store
                  </button>
                </div>

                {/* Favorite and Share */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={handleWishlistToggle}
                    className={`flex-1 flex items-center justify-center gap-2 py-2 border-2 transition-colors ${
                      isInWishlist(product._id || product.id)
                        ? 'border-red-500 text-red-600 bg-red-50'
                        : 'border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    <svg
                      className="w-5 h-5"
                      fill={isInWishlist(product._id || product.id) ? 'currentColor' : 'none'}
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Favorite</span>
                  </button>
                  <button
                    onClick={handleShare}
                    className="flex-1 flex items-center justify-center gap-2 py-2 border-2 border-gray-300 hover:border-gray-400 transition-colors"
                  >
                    <svg
                      className="w-5 h-5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                      />
                    </svg>
                    <span className="text-sm font-medium">Share</span>
                  </button>
                </div>

                {/* Delivery Options */}
                <div className="border-t border-gray-200 pt-4">
                  <h3 className="text-xs font-semibold text-gray-700 mb-2">
                    Delivery Options
                  </h3>
                  <div className="space-y-2">
                    <div className="border border-gray-200 rounded-lg p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-xs">Regular</span>
                        <span className="text-xs text-green-600 font-semibold">Free</span>
                      </div>
                      <p className="text-xs text-gray-500">3-5 business days</p>
                    </div>
                    <div className="border border-gray-200 rounded-lg p-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-medium text-xs">Express</span>
                        <span className="text-xs text-gray-700">₹99</span>
                      </div>
                      <p className="text-xs text-gray-500">1-2 business days</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ProductDetail;
