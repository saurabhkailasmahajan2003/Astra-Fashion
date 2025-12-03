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
  const [newArrivals, setNewArrivals] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);

  // Stories data (Preserved)
  const stories = [
    { hashtag: '#xmas', emoji: '🎄', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741928/IMG_20251123_161820_skzchs.png', link: '' },
    { hashtag: '#indianfashion', emoji: '😎', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741995/image-104_iuyyuw.png' },
    { hashtag: '#street', emoji: '🤏', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742092/ZfLAMkmNsf2sHkoW_DELHI-FACES-1_fjnvcb.avif' },
    { hashtag: '#fitcheck', emoji: '✨', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742199/0d37737c8c2c7536422e411fb68eeeb3_ylhf3n.jpg' },
    { hashtag: '#tshirt', emoji: '😌', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742259/0424-TSHIRT-06_1_7c30d8ed-155d-47a6-a52f-52858221a302_fjdfpo.webp', link: '/mens' },
    { hashtag: '#jeans', emoji: '😌', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742467/GettyImages-2175843730_q21gse.jpg' },
    { hashtag: '#fashion', emoji: '😌', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742548/NECK_20SCARF_20TREND_20190625_20GettyImages-1490484490_ccdwdy.webp' }
  ];

  // Carousel slides data (Preserved links/images, removed text props for display)
  const carouselSlides = [
    {
      image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763401012/Beige_Modern_Watch_Collection_Sale_LinkedIn_Post_1080_x_300_px_cwyx08.svg',
      link: '/watches',
    },
    {
      image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763314950/Red_Tan_and_Black_Modern_Fashion_Sale_Banner_Landscape_1080_x_300_mm_2_htuw5b.png',
      link: '/women',
    },
    {
      image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763312626/Beige_And_Red_Elegant_Wedding_Season_Offers_Banner_1080_x_300_mm_qxjtfv.png',
      link: '/women',
    }
  ];

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const [watchesRes, lensesRes, accessoriesRes, menRes, womenRes, newArrivalRes, saleRes] = await Promise.all([
        productAPI.getWatches({ limit: 4 }),
        productAPI.getLenses({ limit: 4 }),
        productAPI.getAccessories({ limit: 4 }),
        productAPI.getMenItems({ limit: 4 }),
        productAPI.getWomenItems({ limit: 4 }),
        productAPI.getAllProducts({ limit: 12, isNewArrival: true, sort: 'createdAt', order: 'desc' }),
        productAPI.getAllProducts({ limit: 12, onSale: true, sort: 'discountPercent', order: 'desc' }),
      ]);

      if (watchesRes.success) setWatches(watchesRes.data.products || []);
      if (lensesRes.success) setLenses(lensesRes.data.products || []);
      if (accessoriesRes.success) setAccessories(accessoriesRes.data.products || []);
      if (menRes.success) setMenItems(menRes.data.products || []);
      if (womenRes.success) setWomenItems(womenRes.data.products || []);

      if (newArrivalRes.success) {
        const arrivals = (newArrivalRes.data.products || []).sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
        setNewArrivals(arrivals.slice(0, 8));
      }
      if (saleRes.success) {
        const sale = (saleRes.data.products || []).sort((a, b) => (b.discountPercent || 0) - (a.discountPercent || 0));
        setSaleItems(sale.slice(0, 8));
      }
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

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  const normalizeProduct = (product) => ({
    ...product,
    id: product._id || product.id,
    images: product.images || [product.image || product.thumbnail],
    image: product.images?.[0] || product.image || product.thumbnail,
    price: product.finalPrice || product.price,
    originalPrice: product.originalPrice || product.mrp || product.price,
    rating: product.rating || 0,
    reviews: product.reviewsCount || product.reviews || 0,
    category: product.category,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-4 text-gray-500 text-sm uppercase tracking-widest">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* --- HERO CAROUSEL (Clean - No Overlays, Original Ratio) --- */}

      {/* --- HERO SECTION --- */}
      <div className="relative w-full bg-gray-50 overflow-hidden group">

        {/* 1. DESKTOP CAROUSEL (Visible only on Large screens) */}
        <div className="hidden lg:block relative w-full">

          {/* Aspect Ratio Container */}
          <div className="relative w-full max-w-[2000px] mx-auto aspect-[21/9] md:aspect-[3/1]">
            {carouselSlides.map((slide, index) => (
              <Link
                to={slide.link}
                key={index}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
              >
                <img
                  src={slide.image}
                  alt="Banner"
                  className="w-full h-full object-contain object-center"
                  onError={(e) => handleImageError(e, 1920, 600)}
                />
              </Link>
            ))}
          </div>

          {/* Navigation Arrows (Desktop Only) */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition shadow-sm opacity-0 group-hover:opacity-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition shadow-sm opacity-0 group-hover:opacity-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

          {/* Indicators (Desktop Only) */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-gray-800' : 'w-2 bg-gray-300 hover:bg-gray-500'}`}
              />
            ))}
          </div>
        </div>

        {/* 2. MOBILE BANNER (Visible only on Mobile/Tablet) */}
        {/* h-auto ensures the height adjusts to width, keeping original ratio */}
        <div className="block lg:hidden w-full">
          <Link to="/sale"> {/* Optional: Link to a page */}
            <img
              src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1764765679/Gemini_Generated_Image_cspotecspotecspo_mw6a6n.png"
              alt="Mobile Banner"
              className="w-full h-auto object-contain block"
            />
          </Link>
        </div>

      </div>





      {/* --- STORIES SECTION --- */}
      <div className="py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl sm:text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">Stories By Urban Vastra</h3>
          {/* Use justify-start to allow scrolling without cutoff on mobile, justify-center on desktop */}
          <div className="flex justify-start md:justify-center gap-5 md:gap-8 overflow-x-auto scrollbar-hide pb-4 px-4">
            {stories.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex flex-col items-center gap-3 cursor-pointer"
                onClick={() => { 
                  if (setActiveStoryIndex) setActiveStoryIndex(index); 
                  if (setIsStoryViewerOpen) setIsStoryViewerOpen(true); 
                }}
              >
                <div className="relative p-1 rounded-full border-2 border-rose-500">
                  <div className="p-0.5 bg-white rounded-full">
                    <img
                      src={item.image}
                      alt={item.hashtag}
                      className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover"
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/150'; }}
                    />
                  </div>
                </div>
                <span className="text-xs font-medium text-gray-600">{item.hashtag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- FEATURED COLLECTIONS (Shirts) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-5 mt-7">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">The Shirt Edit</h2>
          <p className="text-gray-500">Essential styles for him and her.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Link to="/women/shirt" className="block w-full">
            <img
              src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1763492921/Black_and_White_Modern_New_Arrivals_Blog_Banner_4_x9v1lw.png"
              alt="Women's Shirts"
              className="w-full h-auto block"
            />
          </Link>

          <Link to="/men/shirt" className="block w-full">
            <img
              src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1763493394/5ad7474b-2e60-47c5-b993-cdc9c1449c08.png"
              alt="Men's Shirts"
              className="w-full h-auto block"
            />
          </Link>
        </div>
      </div>

      {/* --- NEW ARRIVALS --- */}
      {newArrivals.length > 0 && (
        <section className="bg-white py-16 border-t border-gray-100">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-12">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 uppercase tracking-tight center">New Arrivals</h2>
              <Link to="/new-arrival" className="text-sm font-bold uppercase tracking-wider border-b-2 border-transparent hover:border-gray-900 transition-all">View All</Link>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {newArrivals.map((product) => (
                <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* --- SALE SECTION --- */}
      {saleItems.length > 0 && (
        <section className="bg-rose-50 py-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-black text-rose-600 uppercase tracking-tight">Sale Highlights</h2>
              <p className="text-rose-900/70 mt-2 font-medium">Don't miss out on limited-time offers.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
              {saleItems.map((product) => (
                <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
              ))}
            </div>
            <div className="text-center mt-12">
              <Link to="/sale" className="inline-block bg-rose-600 text-white px-8 py-3 text-sm font-bold uppercase tracking-widest hover:bg-rose-700 transition shadow-md">
                Shop All Sale
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* --- MEN & WOMEN GRIDS --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-20">
          {/* Men */}
          {menItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Men's Collection</h2>
                <Link to="/men" className="text-sm font-bold uppercase tracking-wider border-b-2 border-transparent hover:border-gray-900 transition-all">View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                {menItems.map((product) => (
                  <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
                ))}
              </div>
            </div>
          )}

          {/* Women */}
          {womenItems.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">Women's Collection</h2>
                <Link to="/women" className="text-sm font-bold uppercase tracking-wider border-b-2 border-transparent hover:border-gray-900 transition-all">View All</Link>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
                {womenItems.map((product) => (
                  <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* --- ACCESSORIES & WATCHES SPLIT --- */}
      <div className="py-20 bg-gray-50 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-16">
          {/* Watches */}
          {watches.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Timepieces</h2>
                <Link to="/watches" className="text-xs font-bold uppercase text-gray-600 hover:text-black">Shop All</Link>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {watches.slice(0, 4).map((product) => (
                  <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
                ))}
              </div>
            </div>
          )}

          {/* Lenses/Accessories Mixed */}
          {(lenses.length > 0 || accessories.length > 0) && (
            <div>
              <div className="flex items-center justify-between mb-8 border-b border-gray-200 pb-4">
                <h2 className="text-xl font-bold text-gray-900 uppercase tracking-wide">Essentials & Eyewear</h2>
                <Link to="/accessories" className="text-xs font-bold uppercase text-gray-600 hover:text-black">Shop All</Link>
              </div>
              <div className="grid grid-cols-2 gap-6">
                {[...lenses, ...accessories].slice(0, 4).map((product) => (
                  <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* --- CATEGORY NAVIGATION (Cleaner Style) --- */}
      <section className="bg-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 uppercase tracking-tight mb-12">Browse by Category</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-8">
            {['men', 'women', 'watches', 'lenses'].map((cat) => (
              <Link key={cat} to={`/${cat}`} className="group relative h-40 bg-gray-50 rounded-lg overflow-hidden flex items-center justify-center hover:bg-gray-100 transition-all">
                <div className="text-center z-10">
                  <span className="block text-2xl mb-2 grayscale group-hover:grayscale-0 transition-all">
                    {cat === 'men' && '👔'}
                    {cat === 'women' && '👗'}
                    {cat === 'watches' && '⌚'}
                    {cat === 'lenses' && '👓'}
                  </span>
                  <h3 className="text-lg font-bold uppercase tracking-wider">{cat}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- STORY VIEWER MODAL (Preserved) --- */}
      {isStoryViewerOpen && activeStoryIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setIsStoryViewerOpen(false)}
        >
          <button onClick={(e) => { e.stopPropagation(); setIsStoryViewerOpen(false); }} className="absolute top-6 right-6 z-20 text-white/70 hover:text-white transition">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>

          {activeStoryIndex > 0 && (
            <button onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(activeStoryIndex - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:opacity-70">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </button>
          )}
          {activeStoryIndex < stories.length - 1 && (
            <button onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(activeStoryIndex + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:opacity-70">
              <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>
          )}

          <div className="relative w-full h-full max-w-md mx-auto flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
              {stories.map((_, index) => (
                <div key={index} className={`h-1 rounded-full flex-1 transition-all duration-300 ${index <= activeStoryIndex ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
            <img src={stories[activeStoryIndex].image} alt={stories[activeStoryIndex].hashtag} className="w-full h-full object-contain max-h-[85vh]" />
            <div className="absolute bottom-20 text-center">
              <span className="text-2xl font-bold text-white drop-shadow-md">{stories[activeStoryIndex].hashtag} {stories[activeStoryIndex].emoji}</span>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Home;