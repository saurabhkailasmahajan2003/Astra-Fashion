import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { getCartItemsCount } = useCart();
  const { getWishlistCount } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [activeCategory, setActiveCategory] = useState('men');
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenDropdown, setShowMenDropdown] = useState(false);
  const [showWomenDropdown, setShowWomenDropdown] = useState(false);
  const [showWatchesDropdown, setShowWatchesDropdown] = useState(false);
  const [showLensesDropdown, setShowLensesDropdown] = useState(false);
  const [showAccessoriesDropdown, setShowAccessoriesDropdown] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Update active category based on current route
  useEffect(() => {
    if (location.pathname === '/') {
      setActiveCategory('home');
    } else if (location.pathname.startsWith('/women')) {
      setActiveCategory('women');
    } else if (location.pathname.startsWith('/men')) {
      setActiveCategory('men');
    } else if (location.pathname.startsWith('/watches')) {
      setActiveCategory('watches');
    } else if (location.pathname.startsWith('/lenses')) {
      setActiveCategory('lenses');
    } else if (location.pathname.startsWith('/accessories')) {
      setActiveCategory('accessories');
    }
  }, [location.pathname]);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const menCategories = [
    { name: 'Shirt', path: '/men/shirt' },
    { name: 'T-Shirt', path: '/men/tshirt' },
    { name: 'Jeans', path: '/men/jeans' },
    { name: 'Trousers', path: '/men/trousers' },
  ];

  const womenCategories = [
    { name: 'Shirt', path: '/women/shirt' },
    { name: 'T-Shirt', path: '/women/tshirt' },
    { name: 'Jeans', path: '/women/jeans' },
    { name: 'Trousers', path: '/women/trousers' },
  ];

  const genderOptions = [
    { name: 'Men', path: 'men' },
    { name: 'Women', path: 'women' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
      setSearchQuery('');
    }
  };

  return (
    <>
      {/* Main Navbar */}
      <nav className={`bg-white shadow-sm sticky top-0 z-50 transition-all duration-300 `}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-4">
            {/* Logo */}
            <Link 
              to="/" 
              className="flex items-center space-x-2 flex-shrink-0 group"
            >
              <img 
                src="https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763320126/Astra_Jewerly_Brand_Logo_160_x_90_px_200_x_90_px_250_x_90_px_p62nk4.png"
                alt="Astra Logo"
                className="h-12 w-auto object-contain"
              />
            </Link>
            {/* Search Bar - Desktop */}
            <form 
              onSubmit={handleSearch} 
              className="hidden md:flex flex-1 max-w-md mx-4"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="w-full px-3 py-1.5 pl-9 pr-9 text-sm text-gray-900 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                />
                <svg
                  className="absolute left-2.5 top-2 h-4 w-4 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
                <button
                  type="submit"
                  className="absolute right-2 top-1.5 text-blue-600 hover:text-blue-700 transition-colors"
                  title="Search"
                >
                  <svg
                    className="h-4 w-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </button>
              </div>
            </form>

            {/* Right Side Actions - Desktop */}
            <div className="hidden md:flex items-center space-x-2 flex-shrink-0">
              {/* Sign In / User Menu */}
              {!isAuthenticated ? (
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-blue-600 transition-colors"
                >
                  Sign In
                </Link>
              ) : (
                <div className="relative group">
                  <div className="flex items-center space-x-2 px-3 py-2 cursor-pointer hover:bg-gray-100 rounded-md transition-colors">
                    <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                      {user?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <span className="text-sm font-medium text-gray-700">{user?.name || 'User'}</span>
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                  <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                    <div className="px-4 py-2 border-b border-gray-200">
                      <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                      <p className="text-xs text-gray-500">{user?.email}</p>
                    </div>
                    <Link
                      to="/profile"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      My Profile
                    </Link>
                    <button
                      onClick={() => {
                        logout();
                        navigate('/');
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              )}

              {/* Wishlist */}
              <Link
                to="/wishlist"
                className="relative flex items-center justify-center p-2 text-gray-700 hover:text-blue-600 transition-colors group"
                title="Wishlist"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
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
                {getWishlistCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                    {getWishlistCount() > 9 ? '9+' : getWishlistCount()}
                  </span>
                )}
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="relative flex items-center justify-center p-2 text-gray-700 hover:text-blue-600 transition-colors group"
                title="Cart"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                {getCartItemsCount() > 0 && (
                  <span className="absolute -top-1 -right-1 bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center shadow-md">
                    {getCartItemsCount() > 9 ? '9+' : getCartItemsCount()}
                  </span>
                )}
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-700 hover:text-blue-600 transition-colors"
              aria-label="Toggle menu"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Sub-navbar with Categories - Desktop */}
      <div className="bg-gray-50 border-b border-gray-200 sticky top-16 z-40 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center space-x-1 py-2">
            {/* Home */}
            <Link
              to="/"
              onClick={() => setActiveCategory('home')}
              className={`px-4 py-2.5 text-sm font-medium transition-colors ${
                location.pathname === '/'
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>

            {/* Men with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowMenDropdown(true)}
              onMouseLeave={() => setShowMenDropdown(false)}
            >
              <Link
                to="/men"
                onClick={() => setActiveCategory('men')}
                className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeCategory === 'men'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <span>Men</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showMenDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {showMenDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 transition-all duration-200">
                  {menCategories.map((cat) => (
                    <Link
                      key={cat.path}
                      to={cat.path}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => {
                        setActiveCategory('men');
                        setShowMenDropdown(false);
                      }}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Women with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowWomenDropdown(true)}
              onMouseLeave={() => setShowWomenDropdown(false)}
            >
              <Link
                to="/women"
                onClick={() => setActiveCategory('women')}
                className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeCategory === 'women'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <span>Women</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showWomenDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {showWomenDropdown && (
                <div className="absolute top-full left-0 mt-1 w-56 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 transition-all duration-200">
                  {womenCategories.map((cat) => (
                    <Link
                      key={cat.path}
                      to={cat.path}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors"
                      onClick={() => {
                        setActiveCategory('women');
                        setShowWomenDropdown(false);
                      }}
                    >
                      {cat.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Watches with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowWatchesDropdown(true)}
              onMouseLeave={() => setShowWatchesDropdown(false)}
            >
              <Link
                to="/watches"
                onClick={() => setActiveCategory('watches')}
                className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeCategory === 'watches'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <span>Watches</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showWatchesDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {showWatchesDropdown && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 transition-all duration-200">
                  {genderOptions.map((gender) => (
                    <Link
                      key={gender.path}
                      to={`/watches?gender=${gender.path}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
                      onClick={() => {
                        setActiveCategory('watches');
                        setShowWatchesDropdown(false);
                      }}
                    >
                      {gender.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Lenses with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowLensesDropdown(true)}
              onMouseLeave={() => setShowLensesDropdown(false)}
            >
              <Link
                to="/lenses"
                onClick={() => setActiveCategory('lenses')}
                className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeCategory === 'lenses'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <span>Lenses</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showLensesDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {showLensesDropdown && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 transition-all duration-200">
                  {genderOptions.map((gender) => (
                    <Link
                      key={gender.path}
                      to={`/lenses?gender=${gender.path}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
                      onClick={() => {
                        setActiveCategory('lenses');
                        setShowLensesDropdown(false);
                      }}
                    >
                      {gender.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Accessories with Dropdown */}
            <div
              className="relative"
              onMouseEnter={() => setShowAccessoriesDropdown(true)}
              onMouseLeave={() => setShowAccessoriesDropdown(false)}
            >
              <Link
                to="/accessories"
                onClick={() => setActiveCategory('accessories')}
                className={`flex items-center gap-1 px-4 py-2.5 text-sm font-medium transition-colors ${
                  activeCategory === 'accessories'
                    ? 'text-blue-600 bg-blue-50'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-100'
                }`}
              >
                <span>Accessories</span>
                <svg 
                  className={`w-4 h-4 transition-transform ${showAccessoriesDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </Link>
              {showAccessoriesDropdown && (
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-xl py-2 z-50 transition-all duration-200">
                  {genderOptions.map((gender) => (
                    <Link
                      key={gender.path}
                      to={`/accessories?gender=${gender.path}`}
                      className="block px-4 py-2.5 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors whitespace-nowrap"
                      onClick={() => {
                        setActiveCategory('accessories');
                        setShowAccessoriesDropdown(false);
                      }}
                    >
                      {gender.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* New Arrival */}
            <Link
              to="/new-arrival"
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              New Arrival
            </Link>

            {/* Sale */}
            <Link
              to="/sale"
              className="px-4 py-2.5 text-sm font-medium text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors font-semibold"
            >
              Sale
            </Link>

            {/* Shop */}
            <Link
              to="/shop"
              className="px-4 py-2.5 text-sm font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-100 transition-colors"
            >
              Shop
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-gray-200 shadow-lg">
          {/* Mobile Search */}
          <div className="px-4 py-3 border-b border-gray-200">
            <form onSubmit={handleSearch} className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search products..."
                className="w-full px-4 py-2 pl-10 pr-10 text-gray-900 bg-gray-50 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <button
                type="submit"
                className="absolute right-2 top-2 text-blue-600 hover:text-blue-700 transition-colors"
                title="Search"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </button>
            </form>
          </div>

          {/* Mobile Navigation Links */}
          <div className="px-4 py-2 space-y-1">
            <Link
              to="/"
              onClick={() => {
                setActiveCategory('home');
                setIsMobileMenuOpen(false);
              }}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                location.pathname === '/'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Home
            </Link>
            <Link
              to="/men"
              onClick={() => {
                setActiveCategory('men');
                setIsMobileMenuOpen(false);
              }}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                activeCategory === 'men'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Men
            </Link>
            <Link
              to="/women"
              onClick={() => {
                setActiveCategory('women');
                setIsMobileMenuOpen(false);
              }}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                activeCategory === 'women'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Women
            </Link>
            <Link
              to="/watches"
              onClick={() => {
                setActiveCategory('watches');
                setIsMobileMenuOpen(false);
              }}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                activeCategory === 'watches'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Watches
            </Link>
            <Link
              to="/lenses"
              onClick={() => {
                setActiveCategory('lenses');
                setIsMobileMenuOpen(false);
              }}
              className={`block px-4 py-3 rounded-lg transition-colors ${
                activeCategory === 'lenses'
                  ? 'bg-blue-50 text-blue-600 font-medium'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              Lenses
            </Link>
            <Link
              to="/new-arrival"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              New Arrival
            </Link>
            <Link
              to="/sale"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors font-semibold"
            >
              Sale
            </Link>
            <Link
              to="/shop"
              onClick={() => setIsMobileMenuOpen(false)}
              className="block px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Shop
            </Link>
          </div>

          {/* Mobile Actions */}
          <div className="px-4 py-3 border-t border-gray-200 space-y-2">
            {!isAuthenticated ? (
              <Link
                to="/login"
                className="block px-4 py-2.5 text-center font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sign In
              </Link>
            ) : (
              <>
                <div className="px-4 py-2.5 border-b border-gray-200">
                  <p className="text-sm font-medium text-gray-900">{user?.name}</p>
                  <p className="text-xs text-gray-500">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                    navigate('/');
                  }}
                  className="w-full px-4 py-2.5 text-center font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  Sign Out
                </button>
              </>
            )}
            <div className="flex gap-2">
              <Link
                to="/wishlist"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
                <span>Wishlist</span>
                {getWishlistCount() > 0 && (
                  <span className="bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getWishlistCount() > 9 ? '9+' : getWishlistCount()}
                  </span>
                )}
              </Link>
              <Link
                to="/cart"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <span>Cart</span>
                {getCartItemsCount() > 0 && (
                  <span className="bg-blue-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                    {getCartItemsCount() > 9 ? '9+' : getCartItemsCount()}
                  </span>
                )}
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
