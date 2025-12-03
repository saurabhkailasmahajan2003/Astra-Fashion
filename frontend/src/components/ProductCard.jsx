// components/ProductCard.jsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';
import LoginModal from './LoginModal';
import { handleImageError } from '../utils/imageFallback';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { isAuthenticated } = useAuth();
  
  const [isHovered, setIsHovered] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [showSizes, setShowSizes] = useState(false);
  
  // NEW: State for image blur effect
  const [imageLoaded, setImageLoaded] = useState(false);

  // Data Normalization
  const productImages = product.images?.length ? product.images : [product.image || product.thumbnail];
  const sizes = product.sizes || ['S', 'M', 'L', 'XL']; 
  const finalPrice = product.finalPrice || product.price;
  const originalPrice = product.originalPrice || product.mrp || product.price;
  const hasDiscount = originalPrice > finalPrice;

  const handleAddClick = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    if (sizes.length > 0) {
      setShowSizes(true);
    } else {
      handleAddToCart(null);
    }
  };

  const handleAddToCart = async (selectedSize) => {
    if (!isAuthenticated) return setShowLoginModal(true);
    
    setIsAdding(true);
    try {
      await addToCart({ ...product, selectedSize });
      setTimeout(() => {
        setIsAdding(false);
        setShowSizes(false);
      }, 1000);
    } catch (err) {
      setIsAdding(false);
      if (err.message.includes('login')) setShowLoginModal(true);
    }
  };

  const handleWishlist = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) return setShowLoginModal(true);
    
    const id = product._id || product.id;
    isInWishlist(id) ? await removeFromWishlist(id) : await addToWishlist(product);
  };

  return (
    <>
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
      
      <div 
        className="group relative w-full select-none animate-fadeIn" // Added animate-fadeIn
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          if (window.matchMedia('(min-width: 768px)').matches) {
            setShowSizes(false);
          }
        }}
      >
        <Link to={`/product/${product._id || product.id}`} className="block">
          
          {/* IMAGE AREA */}
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-xl bg-gray-100 shadow-sm">
            
            {/* Wishlist Button */}
            <button
              onClick={handleWishlist}
              className="absolute top-2 right-2 z-20 p-2 rounded-full bg-white/60 backdrop-blur-md hover:bg-white text-gray-800 transition-all duration-300 active:scale-90"
            >
              <svg 
                className={`w-5 h-5 ${isInWishlist(product._id || product.id) ? 'fill-red-500 text-red-500' : 'fill-none'}`}
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                strokeWidth="1.5"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
            </button>

            {/* Discount Tag */}
            {hasDiscount && (
               <span className="absolute top-3 left-3 z-20 bg-black text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wide">
                 Sale
               </span>
            )}

            {/* Main Image with Blur-Up Effect */}
            <img
              src={isHovered && productImages.length > 1 ? productImages[1] : productImages[0]}
              alt={product.name}
              onLoad={() => setImageLoaded(true)}
              className={`
                absolute inset-0 w-full h-full object-cover transition-all duration-700 md:group-hover:scale-105
                ${imageLoaded ? 'blur-0 scale-100 opacity-100' : 'blur-lg scale-110 opacity-0'}
              `}
              onError={handleImageError}
              loading="lazy"
            />

            {/* --- THE FLOATING DOCK --- */}
            <div className="absolute bottom-3 inset-x-2 sm:inset-x-4 z-20">
              <div 
                className={`
                  bg-white/95 backdrop-blur-md rounded-lg shadow-[0_4px_12px_rgba(0,0,0,0.1)] 
                  overflow-hidden transition-all duration-300 ease-[cubic-bezier(0.25,0.1,0.25,1)]
                  ${showSizes ? 'py-3' : 'h-10 sm:h-12 flex items-center justify-between pl-3 pr-1'}
                `}
                onClick={(e) => e.preventDefault()}
              >
                {!showSizes ? (
                  <>
                    <div className="flex flex-col leading-none justify-center">
                      <span className="font-bold text-gray-900 text-sm sm:text-base">₹{finalPrice.toLocaleString()}</span>
                      {hasDiscount && (
                        <span className="text-[10px] text-gray-500 line-through">₹{originalPrice.toLocaleString()}</span>
                      )}
                    </div>
                    
                    <button
                      onClick={handleAddClick}
                      className="h-8 sm:h-10 px-3 sm:px-5 bg-black text-white rounded-md text-[10px] sm:text-xs font-bold uppercase tracking-wide transition-transform active:scale-95 flex items-center gap-1.5"
                    >
                      <span className='hidden lg:block'>Add</span>
                      <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </button>
                  </>
                ) : (
                  <div className="relative px-2 text-center animate-fadeIn w-full">
                    <div className="flex items-center justify-between mb-2 px-1">
                      <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">Select Size</span>
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowSizes(false);
                        }}
                        className="p-1 -mr-1 text-gray-400 hover:text-gray-900"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>

                    <div className="grid grid-cols-4 gap-1.5">
                      {sizes.slice(0, 4).map((size) => (
                        <button
                          key={size}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            handleAddToCart(size);
                          }}
                          disabled={isAdding}
                          className={`
                            h-8 rounded text-xs font-bold border transition-colors touch-manipulation
                            ${isAdding 
                              ? 'bg-gray-100 text-gray-300 border-gray-100'
                              : 'border-gray-200 hover:border-black hover:bg-black hover:text-white text-gray-800 active:bg-black active:text-white'}
                          `}
                        >
                          {size}
                        </button>
                      ))}
                    </div>
                    {isAdding && <p className="text-[10px] text-green-600 font-medium mt-1.5">Adding to bag...</p>}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* TEXT INFO */}
          <div className="mt-3 px-1">
             <div className="flex justify-between items-start">
               <div className="flex-1 pr-2">
                  <h3 className="text-sm font-medium text-gray-900 leading-tight line-clamp-1">
                    {product.name}
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">{product.category}</p>
               </div>
               
               {product.rating && (
                 <div className="hidden sm:flex items-center gap-1 bg-gray-50 px-1.5 py-0.5 rounded text-[10px] font-bold text-gray-600">
                   <span>★</span>
                   <span>{product.rating}</span>
                 </div>
               )}
             </div>
          </div>
        </Link>
      </div>
    </>
  );
};

export default ProductCard;