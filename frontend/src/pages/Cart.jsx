import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { handleImageError } from '../utils/imageFallback';

// --- Premium Icons ---
const IconTrash = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const IconMinus = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20 12H4" />
  </svg>
);
const IconPlus = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 4v16m8-8H4" />
  </svg>
);
const IconLock = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);
const IconCheck = (props) => (
  <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);
const IconArrowLeft = (props) => (
    <svg {...props} fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
    </svg>
);

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal } = useCart();
  const navigate = useNavigate();
  
  // Simulated Free Shipping Threshold logic
  const cartTotal = getCartTotal();
  const freeShippingThreshold = 15000; 
  const progress = Math.min((cartTotal / freeShippingThreshold) * 100, 100);
  const remainingForFreeShip = freeShippingThreshold - cartTotal;

  // --- Empty State ---
  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-20 px-4">
        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-6 animate-pulse">
            <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight mb-3">Your bag is empty</h1>
        <p className="text-gray-500 mb-8 text-center max-w-md">
          The reality is that you haven't added any items to your cart yet. Let's change that.
        </p>
        <Link
          to="/"
          className="group relative inline-flex items-center justify-center px-8 py-3 bg-zinc-900 text-white font-medium rounded-full overflow-hidden transition-all hover:bg-zinc-800 hover:shadow-lg hover:-translate-y-0.5"
        >
          <span className="relative z-10">Start Shopping</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans text-gray-900 pb-20">
      
      {/* 1. Progress Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <Link to="/" className="flex items-center text-sm font-medium text-gray-500 hover:text-black transition-colors">
                <IconArrowLeft className="w-4 h-4 mr-2" />
                Continue Shopping
            </Link>
            
            <div className="hidden md:flex items-center space-x-2 text-sm">
                <span className="font-bold text-black">Bag</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-400">Checkout</span>
                <span className="text-gray-300">/</span>
                <span className="text-gray-400">Payment</span>
            </div>

            <div className="flex items-center text-xs font-medium text-gray-500">
                <IconLock className="w-3 h-3 mr-1" />
                Secure
            </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Bag</h1>

        <div className="lg:grid lg:grid-cols-12 lg:gap-10 items-start">
          
          {/* --- LEFT COLUMN: Cart Items --- */}
          <div className="lg:col-span-8">
            
            {/* Free Shipping Progress Bar */}
            <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm mb-6">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                        {remainingForFreeShip > 0 
                            ? `Spend ₹${remainingForFreeShip.toLocaleString()} more for free shipping` 
                            : "You've unlocked Free Shipping!"}
                    </span>
                    <span className="text-xs font-bold text-gray-900">{Math.round(progress)}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2 overflow-hidden">
                    <div 
                        className="bg-black h-2 rounded-full transition-all duration-1000 ease-out" 
                        style={{ width: `${progress}%` }}
                    ></div>
                </div>
            </div>

            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Desktop Header */}
              <div className="hidden sm:grid grid-cols-12 gap-4 px-8 py-4 bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                <div className="col-span-6">Product</div>
                <div className="col-span-3 text-center">Quantity</div>
                <div className="col-span-3 text-right">Total</div>
              </div>

              <div className="divide-y divide-gray-100">
                {cart.map((item) => {
                  const product = item.product || item;
                  const itemId = item._id || item.id;
                  
                  // Normalize image - handle both images array and single image
                  const productImage = product.images?.length 
                    ? product.images[0] 
                    : product.image || product.thumbnail || '';
                  
                  // Normalize price
                  const productPrice = product.finalPrice || product.price || 0;
                  
                  return (
                    <div key={itemId} className="p-6 sm:p-8 hover:bg-gray-50/50 transition-colors duration-200">
                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-center">
                        
                        {/* Product Info (Col 6) */}
                        <div className="sm:col-span-6 flex gap-6">
                          <div className="relative w-24 h-24 sm:w-28 sm:h-28 flex-shrink-0 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 group">
                            <img
                              src={productImage}
                              alt={product.name || 'Product'}
                              className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => handleImageError(e, 200, 200)}
                            />
                          </div>
                          <div className="flex flex-col justify-center">
                            <h3 className="text-base font-semibold text-gray-900">
                                <Link to={`/product/${product.category || 'shop'}/${itemId}`} className="hover:text-gray-600 transition-colors">
                                    {product.name || 'Product'}
                                </Link>
                            </h3>
                            <p className="mt-1 text-sm text-gray-500">{product.brand || 'Premium Brand'}</p>
                            <p className="mt-1 text-sm font-medium text-gray-900">₹{productPrice.toLocaleString()}</p>
                            {/* Mobile Only Remove */}
                            <button 
                                onClick={() => removeFromCart(itemId)}
                                className="sm:hidden mt-3 text-xs text-red-600 font-medium flex items-center"
                            >
                                <IconTrash className="w-3 h-3 mr-1" /> Remove
                            </button>
                          </div>
                        </div>

                        {/* Quantity (Col 3) */}
                        <div className="sm:col-span-3 flex justify-start sm:justify-center">
                            <div className="flex items-center border border-gray-300 rounded-full h-10 w-32 shadow-sm">
                                <button 
                                    onClick={() => updateQuantity(itemId, item.quantity - 1)}
                                    disabled={item.quantity <= 1}
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-l-full disabled:opacity-30 transition-colors"
                                >
                                    <IconMinus className="w-3 h-3" />
                                </button>
                                <span className="flex-1 text-center text-sm font-semibold text-gray-900">{item.quantity}</span>
                                <button 
                                    onClick={() => updateQuantity(itemId, item.quantity + 1)}
                                    className="w-10 h-full flex items-center justify-center text-gray-500 hover:text-black hover:bg-gray-100 rounded-r-full transition-colors"
                                >
                                    <IconPlus className="w-3 h-3" />
                                </button>
                            </div>
                        </div>

                        {/* Price & Remove (Col 3) */}
                        <div className="sm:col-span-3 flex flex-row sm:flex-col justify-between sm:justify-center items-center sm:items-end">
                            <span className="text-sm sm:hidden font-medium text-gray-500">Total:</span>
                            <div className="text-right">
                                <p className="text-lg font-bold text-gray-900">₹{(productPrice * item.quantity).toLocaleString()}</p>
                                <button 
                                    onClick={() => removeFromCart(itemId)}
                                    className="hidden sm:flex items-center justify-end mt-2 text-xs text-gray-400 hover:text-red-600 transition-colors"
                                >
                                    <IconTrash className="w-3 h-3 mr-1" /> Remove
                                </button>
                            </div>
                        </div>

                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* --- RIGHT COLUMN: Summary --- */}
          <div className="lg:col-span-4 mt-8 lg:mt-0">
            <div className="bg-white rounded-xl border border-gray-200 shadow-lg p-6 sm:p-8 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

              <dl className="space-y-4 text-sm">
                <div className="flex justify-between text-gray-500">
                  <dt>Subtotal</dt>
                  <dd className="font-medium text-gray-900">₹{getCartTotal().toLocaleString()}</dd>
                </div>
                <div className="flex justify-between items-center text-gray-500">
                  <dt className="flex items-center">
                      Shipping
                      {remainingForFreeShip <= 0 && <IconCheck className="w-4 h-4 text-green-500 ml-1" />}
                  </dt>
                  <dd className="font-medium text-green-600">
                      {remainingForFreeShip <= 0 ? 'Free' : 'Calculated at checkout'}
                  </dd>
                </div>
                <div className="flex justify-between text-gray-500 pb-4 border-b border-gray-100">
                  <dt>Tax Estimate</dt>
                  <dd className="font-medium text-gray-900">₹0.00</dd>
                </div>

                <div className="flex justify-between items-center pt-2">
                  <dt className="text-base font-bold text-gray-900">Total</dt>
                  <dd className="text-2xl font-bold text-gray-900">₹{getCartTotal().toLocaleString()}</dd>
                </div>
                <p className="text-xs text-gray-400 mt-1">Including GST</p>
              </dl>

              {/* Promo Code Accordion Style */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                   <details className="group">
                        <summary className="flex cursor-pointer items-center justify-between text-sm font-medium text-gray-900 hover:text-gray-600 list-none">
                            <span>Do you have a promo code?</span>
                            <span className="transition group-open:rotate-180">
                                <svg fill="none" height="24" shapeRendering="geometricPrecision" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" viewBox="0 0 24 24" width="24"><path d="M6 9l6 6 6-6"></path></svg>
                            </span>
                        </summary>
                        <div className="mt-4 flex gap-2">
                            <input 
                                type="text" 
                                placeholder="Enter code"
                                className="flex-1 block w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                            />
                            <button className="px-4 py-2 bg-gray-100 text-gray-900 text-xs font-bold uppercase rounded-lg hover:bg-gray-200 transition-colors">
                                Apply
                            </button>
                        </div>
                   </details>
              </div>

              <div className="mt-8">
                <button
                  onClick={() => navigate('/checkout')}
                  className="w-full flex items-center justify-center px-6 py-4 bg-black text-white text-base font-bold rounded-lg hover:bg-gray-800 transition-all duration-200 shadow-md hover:shadow-xl transform hover:-translate-y-0.5"
                >
                  Checkout
                </button>
                <p className="mt-4 text-center text-xs text-gray-500">
                    Free shipping on orders over ₹15,000
                </p>
              </div>

              {/* Professional Payment Icons (SVG) */}
              <div className="mt-8 border-t border-gray-100 pt-6">
                 <div className="flex justify-center gap-3 grayscale opacity-60">
                    {/* Visa */}
                    <svg className="h-6" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="4" fill="#F3F4F6"/><path d="M14.07 15.631H16.485L18 8.42H15.657C15.12 8.42 14.628 8.736 14.436 9.197L12.333 14.238L10.153 9.197C9.972 8.71 9.564 8.42 8.949 8.42H5.733L5.617 8.974C6.828 9.243 7.824 9.612 8.718 10.536C9.564 11.433 9.513 11.248 9.87 13.069L8.475 19.82H11.025L14.07 15.631ZM25.047 15.631H27.423L29.562 8.42H27.051L25.047 15.631ZM30.048 15.631H32.412L34.347 8.42H32.001L30.048 15.631ZM23.355 8.42L21.498 17.544C21.396 17.925 21.6 18.2 21.996 18.2H24.288L26.31 8.42H23.355Z" fill="#1A1F71"/></svg>
                    {/* Mastercard */}
                    <svg className="h-6" viewBox="0 0 38 24" fill="none" xmlns="http://www.w3.org/2000/svg"><rect width="38" height="24" rx="4" fill="#F3F4F6"/><path d="M13.6 12C13.6 14.333 14.65 16.433 16.3 17.9C15.033 18.8 13.516 19.333 11.85 19.333C7.8 19.333 4.51667 16.05 4.51667 12C4.51667 7.95 7.8 4.66667 11.85 4.66667C13.516 4.66667 15.033 5.2 16.3 6.1C14.65 7.56667 13.6 9.66667 13.6 12Z" fill="#EB001B"/><path d="M26.2667 12C26.2667 16.05 22.9833 19.333 18.9333 19.333C17.2667 19.333 15.75 18.8 14.4833 17.9C16.1333 16.433 17.1833 14.333 17.1833 12C17.1833 9.66667 16.1333 7.56667 14.4833 6.1C15.75 5.2 17.2667 4.66667 18.9333 4.66667C22.9833 4.66667 26.2667 7.95 26.2667 12Z" fill="#F79E1B"/></svg>
                 </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;