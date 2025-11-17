import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';
import Footer from '../components/Footer';
import { productAPI } from '../utils/api';
import { handleImageError } from '../utils/imageFallback';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [watches, setWatches] = useState([]);
  const [lenses, setLenses] = useState([]);
  const [accessories, setAccessories] = useState([]);
  const [menItems, setMenItems] = useState([]);
  const [womenItems, setWomenItems] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Carousel slides data
  const carouselSlides = [
    {
      title: 'Diwali Special Deals',
      price: 'Up to 70% OFF',
      description: 'Celebrate Diwali with Amazing Discounts on Fashion & Accessories',
      image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763314950/Red_Tan_and_Black_Modern_Fashion_Sale_Banner_Landscape_1080_x_300_mm_2_htuw5b.png',
      link: '/men',
      bgGradient: 'from-green-500 via-yellow-500 to-green-600'
    },
    {
      title: 'Watches & Accessories',
      price: '₹999',
      description: 'Premium Watches & Stylish Accessories',
      image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763310304/Red_Blue_and_White_Illustrative_Festive_Merry_Christmas_Winter_Season_Holiday_Sale_Banner_1080_x_300_mm_1_gtv3qy.png',
      link: '/watches',
      bgGradient: 'from-gray-700 via-gray-800 to-gray-900'
    },
    {
      title: 'Lenses & Spectacles',
      price: '₹1499',
      description: 'Trendy Eyewear for Every Style',
      image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763311112/Black_Simple_Watch_Promotion_Advert_Web_Banner_1080_x_300_mm_dusvtn.png',
      link: '/lenses',
      bgGradient: 'from-purple-500 via-purple-600 to-purple-700'
    },
    {
      title: 'Women\'s Collection',
      price: '₹449',
      description: 'Latest Trends in Women\'s Fashion',
      image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763312626/Beige_And_Red_Elegant_Wedding_Season_Offers_Banner_1080_x_300_mm_qxjtfv.png',
      link: '/women',
      bgGradient: 'from-pink-500 via-pink-600 to-pink-700'
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      
      // Fetch products from all categories
      const [
        watchesRes,
        lensesRes,
        accessoriesRes,
        menRes,
        womenRes,
        newArrivalRes,
        saleRes,
      ] = await Promise.all([
        productAPI.getWatches({ limit: 4 }),
        productAPI.getLenses({ limit: 4 }),
        productAPI.getAccessories({ limit: 4 }),
        productAPI.getMenItems({ limit: 4 }),
        productAPI.getWomenItems({ limit: 4 }),
        productAPI.getAllProducts({ limit: 12, isNewArrival: true, sort: 'createdAt', order: 'desc' }),
        productAPI.getAllProducts({ limit: 12, onSale: true, sort: 'discountPercent', order: 'desc' }),
      ]);

      if (watchesRes.success) {
        setWatches(watchesRes.data.products || []);
      }
      if (lensesRes.success) {
        setLenses(lensesRes.data.products || []);
      }
      if (accessoriesRes.success) {
        setAccessories(accessoriesRes.data.products || []);
      }
      if (menRes.success) {
        setMenItems(menRes.data.products || []);
      }
      if (womenRes.success) {
        setWomenItems(womenRes.data.products || []);
      }
      if (newArrivalRes.success) {
        const arrivals = (newArrivalRes.data.products || []).sort(
          (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)
        );
        setNewArrivals(arrivals.slice(0, 8));
      }
      if (saleRes.success) {
        const sale = (saleRes.data.products || []).sort(
          (a, b) => (b.discountPercent || 0) - (a.discountPercent || 0)
        );
        setSaleItems(sale.slice(0, 8));
      }

      // Create featured products mix
      const featured = [
        ...(watchesRes.success ? watchesRes.data.products.slice(0, 2) : []),
        ...(lensesRes.success ? lensesRes.data.products.slice(0, 2) : []),
        ...(accessoriesRes.success ? accessoriesRes.data.products.slice(0, 2) : []),
        ...(menRes.success ? menRes.data.products.slice(0, 2) : []),
        ...(womenRes.success ? womenRes.data.products.slice(0, 2) : []),
        ...(newArrivalRes.success ? (newArrivalRes.data.products || []).slice(0, 2) : []),
        ...(saleRes.success ? (saleRes.data.products || []).slice(0, 2) : []),
      ];
      setFeaturedProducts(featured);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Normalize product for display (add id if missing, ensure images array)
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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Carousel */}
      <div className="relative overflow-hidden w-full">
        <div className="relative h-[300px] w-full max-w-[1980px] mx-auto">
          {carouselSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-500 ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <div className="absolute inset-0">
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover"
                  onError={(e) => handleImageError(e, 1980, 300)}
                />
              </div>

              <div className="relative max-w-[1980px] mx-auto px-4 sm:px-6 lg:px-8 h-full z-10">
                <div className="flex items-center justify-between h-full">
                  <button
                    onClick={prevSlide}
                    className="hidden md:flex items-center justify-center w-12 h-12 bg-black bg-opacity-30 hover:bg-opacity-50 transition text-white z-20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  <div className="flex-1"></div>

                  <button
                    onClick={nextSlide}
                    className="hidden md:flex items-center justify-center w-12 h-12 bg-black bg-opacity-30 hover:bg-opacity-50 transition text-white z-20"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Carousel Indicators */}
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
          {carouselSlides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-3 h-3 rounded-full transition-all ${
                index === currentSlide
                  ? 'bg-white w-8'
                  : 'bg-white bg-opacity-50 hover:bg-opacity-75'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold text-gray-900">Featured Products</h2>
            <Link to="/watches" className="text-blue-600 hover:text-blue-800 font-medium">
              View All →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
            ))}
          </div>
        </div>
      )}

      {/* New Arrivals */}
      {newArrivals.length > 0 && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">New Arrivals</h2>
              <Link to="/new-arrival" className="text-blue-600 hover:text-blue-800 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Men's Fashion Collection */}
      {menItems.length > 0 && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Men's Collection</h2>
              <Link to="/men" className="text-blue-600 hover:text-blue-800 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {menItems.map((product) => (
                <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Sale Highlights */}
      {saleItems.length > 0 && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900 text-red-600">Mega Sale</h2>
              <Link to="/sale" className="text-red-600 hover:text-red-700 font-semibold">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {saleItems.map((product) => (
                <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Women's Fashion Collection */}
      {womenItems.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Women's Collection</h2>
              <Link to="/women" className="text-blue-600 hover:text-blue-800 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {womenItems.map((product) => (
                <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Watches Section */}
      {watches.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Watches</h2>
              <Link to="/watches" className="text-blue-600 hover:text-blue-800 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {watches.map((product) => (
                <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Lenses Section */}
      {lenses.length > 0 && (
        <div className="bg-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Lenses & Spectacles</h2>
              <Link to="/lenses" className="text-blue-600 hover:text-blue-800 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {lenses.map((product) => (
                <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Accessories Section */}
      {accessories.length > 0 && (
        <div className="bg-gray-50 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-3xl font-bold text-gray-900">Accessories</h2>
              <Link to="/accessories" className="text-blue-600 hover:text-blue-800 font-medium">
                View All →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {accessories.map((product) => (
                <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Categories Section */}
      <div className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500 blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500 blur-3xl"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Shop by Category
            </h2>
            <p className="text-gray-300 text-lg">Discover our curated collections</p>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            <Link
              to="/men"
              className="group relative bg-gradient-to-br from-blue-600 to-blue-800 p-8 text-center hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-blue-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">👔</div>
                <h3 className="text-2xl font-bold text-white mb-2">Men</h3>
                <p className="text-blue-100 text-sm font-medium">Explore Collection →</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            
            <Link
              to="/women"
              className="group relative bg-gradient-to-br from-pink-600 to-pink-800 p-8 text-center hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-pink-700 to-pink-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">👗</div>
                <h3 className="text-2xl font-bold text-white mb-2">Women</h3>
                <p className="text-pink-100 text-sm font-medium">Explore Collection →</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            
            <Link
              to="/watches"
              className="group relative bg-gradient-to-br from-amber-600 to-amber-800 p-8 text-center hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-amber-700 to-amber-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">⌚</div>
                <h3 className="text-2xl font-bold text-white mb-2">Watches</h3>
                <p className="text-amber-100 text-sm font-medium">Explore Collection →</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
            
            <Link
              to="/lenses"
              className="group relative bg-gradient-to-br from-purple-600 to-purple-800 p-8 text-center hover:shadow-2xl transition-all transform hover:scale-105 overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-700 to-purple-900 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative z-10">
                <div className="text-6xl mb-4 transform group-hover:scale-110 transition-transform">👓</div>
                <h3 className="text-2xl font-bold text-white mb-2">Lenses</h3>
                <p className="text-purple-100 text-sm font-medium">Explore Collection →</p>
              </div>
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default Home;
