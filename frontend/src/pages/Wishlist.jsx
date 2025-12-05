import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { handleImageError } from '../utils/imageFallback';
import { Trash2, ShoppingBag, ArrowRight, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();

  // --- HANDLERS ---

  const handleRemove = (e, product) => {
    // 1. Stop the click from opening the product page
    e.preventDefault();
    e.stopPropagation();

    // 2. Determine the correct ID (MongoDB uses _id, others use id)
    const productId = product._id || product.id;

    console.log("Attempting to remove Product ID:", productId); // Check your console

    if (!productId) {
      console.error("Error: Product has no ID", product);
      return;
    }

    // 3. Call context function
    removeFromWishlist(productId);
  };

  const handleMoveToCart = (e, product) => {
    e.preventDefault();
    e.stopPropagation();
    addToCart(product, 1);
  };

  // --- EMPTY STATE ---
  if (!wishlist || wishlist.length === 0) {
    return (
      <div className="min-h-[80vh] bg-white flex flex-col items-center justify-center px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6">
          <Heart className="w-10 h-10 text-gray-300 fill-gray-300" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
        <p className="text-gray-500 mb-8 text-center max-w-sm">
          Save items you want to see again here. Start shopping to add items.
        </p>
        <Link
          to="/"
          className="bg-black text-white px-8 py-3.5 rounded-lg font-medium hover:bg-gray-800 transition-colors flex items-center gap-2"
        >
          Start Shopping <ArrowRight size={18} />
        </Link>
      </div>
    );
  }

  // --- MAIN UI ---
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 pb-4 border-b border-gray-200">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Wishlist</h1>
            <p className="text-gray-500 mt-1">{wishlist.length} {wishlist.length === 1 ? 'item' : 'items'}</p>
          </div>
          <Link to="/" className="hidden md:flex items-center text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors mt-4 md:mt-0">
            Continue Shopping <ArrowRight size={16} className="ml-1" />
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <AnimatePresence mode='popLayout'>
            {wishlist.map((product) => {
              // Robust ID handling
              const productId = product._id || product.id;
              const price = product.finalPrice || product.price;
              const originalPrice = product.originalPrice || product.mrp;
              const image = product.images?.[0] || product.image;

              // Ensure we have a valid key
              if (!productId) return null;

              return (
                <motion.div
                  layout
                  key={productId}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 overflow-hidden group flex flex-col relative"
                >
                  
                  {/* Remove Button - Placed ABOVE the Link with high Z-Index */}
                  <button
                    onClick={(e) => handleRemove(e, product)}
                    className="absolute top-3 right-3 z-30 p-2.5 bg-white rounded-full shadow-md text-gray-400 hover:text-red-600 hover:bg-red-50 transition-all transform hover:scale-110"
                    title="Remove item"
                  >
                    <Trash2 size={18} />
                  </button>

                  {/* Image Area */}
                  <div className="relative aspect-[3/4] overflow-hidden bg-gray-100 z-10">
                    <Link to={`/product/${product.category}/${productId}`} className="block w-full h-full">
                      <img
                        src={image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                        onError={handleImageError}
                      />
                    </Link>

                    {/* "Quick Add" Overlay (Desktop) */}
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-full group-hover:translate-y-0 transition-transform duration-300 hidden lg:block z-20">
                      <button
                        onClick={(e) => handleMoveToCart(e, product)}
                        className="w-full bg-black text-white py-3 rounded-lg font-medium text-sm hover:bg-gray-800 shadow-lg flex items-center justify-center gap-2"
                      >
                        <ShoppingBag size={16} /> Move to Bag
                      </button>
                    </div>
                  </div>

                  {/* Details Area */}
                  <div className="p-4 flex flex-col flex-grow z-10">
                    <div className="mb-2">
                       <p className="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-1">
                          {product.brand || 'Brand'}
                       </p>
                       <Link 
                          to={`/product/${product.category}/${productId}`}
                          className="text-base font-medium text-gray-900 line-clamp-1 hover:text-blue-600 transition-colors block"
                        >
                          {product.name}
                       </Link>
                    </div>

                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-lg font-bold text-gray-900">₹{price?.toLocaleString()}</span>
                      {originalPrice > price && (
                        <span className="text-sm text-gray-400 line-through">₹{originalPrice.toLocaleString()}</span>
                      )}
                      {originalPrice > price && (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded">
                           {Math.round(((originalPrice - price) / originalPrice) * 100)}% OFF
                        </span>
                      )}
                    </div>

                    {/* Mobile Only "Add to Cart" Button */}
                    <div className="mt-auto lg:hidden pt-3 border-t border-gray-100">
                      <button
                        onClick={(e) => handleMoveToCart(e, product)}
                        className="w-full flex items-center justify-center gap-2 text-sm font-semibold text-blue-600 hover:bg-blue-50 py-2 rounded transition-colors"
                      >
                        <ShoppingBag size={16} /> Add to Bag
                      </button>
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default Wishlist;