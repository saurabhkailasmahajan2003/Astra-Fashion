import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Footer from '../components/Footer';
import LazyProductSection from './LazyProductSection'; // Import the new component
import { productAPI } from '../utils/api';
import { handleImageError } from '../utils/imageFallback';

const Home = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [footerVisible, setFooterVisible] = useState(false);

  // Stories data
  const stories = [
    { hashtag: '#xmas', emoji: '🎄', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741928/IMG_20251123_161820_skzchs.png', link: '' },
    { hashtag: '#indianfashion', emoji: '😎', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741995/image-104_iuyyuw.png' },
    { hashtag: '#street', emoji: '🤏', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742092/ZfLAMkmNsf2sHkoW_DELHI-FACES-1_fjnvcb.avif' },
    { hashtag: '#fitcheck', emoji: '✨', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742199/0d37737c8c2c7536422e411fb68eeeb3_ylhf3n.jpg' },
    { hashtag: '#tshirt', emoji: '😌', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742259/0424-TSHIRT-06_1_7c30d8ed-155d-47a6-a52f-52858221a302_fjdfpo.webp', link: '/mens' },
    { hashtag: '#jeans', emoji: '😌', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742467/GettyImages-2175843730_q21gse.jpg' },
    { hashtag: '#fashion', emoji: '😌', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742548/NECK_20SCARF_20TREND_20190625_20GettyImages-1490484490_ccdwdy.webp' }
  ];

  // Carousel slides data
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

  // Auto-play carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    // Show footer after 2 seconds to ensure page structure is ready
    setTimeout(() => setFooterVisible(true), 2000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  // --- API WRAPPERS FOR LAZY LOADING ---
  // We wrap api calls to format data specifically for the section
  const fetchNewArrivals = async () => {
    const res = await productAPI.getAllProducts({ limit: 12, isNewArrival: true, sort: 'createdAt', order: 'desc' });
    return res.success ? res.data.products : [];
  };

  const fetchSaleItems = async () => {
    const res = await productAPI.getAllProducts({ limit: 12, onSale: true, sort: 'discountPercent', order: 'desc' });
    return res.success ? res.data.products : [];
  };

  const fetchMen = async () => {
    const res = await productAPI.getMenItems({ limit: 4 });
    return res.success ? res.data.products : [];
  };

  const fetchWomen = async () => {
    const res = await productAPI.getWomenItems({ limit: 4 });
    return res.success ? res.data.products : [];
  };

  const fetchWatches = async () => {
    const res = await productAPI.getWatches({ limit: 4 });
    return res.success ? res.data.products : [];
  };
  
  const fetchAccessories = async () => {
     // Combined fetch for lenses and accessories if you want them together, or separate
     const [lenses, acc] = await Promise.all([
        productAPI.getLenses({ limit: 4 }),
        productAPI.getAccessories({ limit: 4 })
     ]);
     let combined = [];
     if (lenses.success) combined = [...combined, ...lenses.data.products];
     if (acc.success) combined = [...combined, ...acc.data.products];
     return combined.slice(0, 4);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">

      {/* --- HERO SECTION (Loads Immediately) --- */}
      <div className="relative w-full bg-gray-50 overflow-hidden group">
        {/* DESKTOP CAROUSEL */}
        <div className="hidden lg:block relative w-full">
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
                  loading={index === 0 ? "eager" : "lazy"} // Only load first image eagerly
                  onError={(e) => handleImageError(e, 1920, 600)}
                />
              </Link>
            ))}
          </div>

          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition shadow-sm opacity-0 group-hover:opacity-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-2 rounded-full bg-white/80 text-gray-800 hover:bg-white transition shadow-sm opacity-0 group-hover:opacity-100">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>

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

        {/* MOBILE BANNER */}
        <div className="block lg:hidden w-full">
          <Link to="/sale">
            <img
              src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1764765679/Gemini_Generated_Image_cspotecspotecspo_mw6a6n.png"
              alt="Mobile Banner"
              className="w-full h-auto object-contain block"
              loading="eager"
            />
          </Link>
        </div>
      </div>

      {/* --- STORIES SECTION (Loads Immediately) --- */}
      <div className="py-10 border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h3 className="text-xl sm:text-xs font-bold uppercase tracking-widest text-gray-900 mb-6">Stories By Urban Vastra</h3>
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
                      loading="lazy"
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

      {/* --- FEATURED COLLECTIONS (Static Images) --- */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mt-7 mb-10">
        <div className="text-center mb-5">
          <h2 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">The Shirt Edit</h2>
          <p className="text-gray-500">Essential styles for him and her.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
          <Link to="/women/shirt" className="block w-full">
            <img src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1763492921/Black_and_White_Modern_New_Arrivals_Blog_Banner_4_x9v1lw.png" alt="Women's Shirts" className="w-full h-auto block" loading="lazy" />
          </Link>
          <Link to="/men/shirt" className="block w-full">
            <img src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1763493394/5ad7474b-2e60-47c5-b993-cdc9c1449c08.png" alt="Men's Shirts" className="w-full h-auto block" loading="lazy" />
          </Link>
        </div>
      </div>

      {/* --- LAZY LOADED SECTIONS --- */}
      {/* These will only fetch data when you scroll near them */}
      
      <LazyProductSection 
        title="New Arrivals" 
        fetchFunction={fetchNewArrivals} 
        viewAllLink="/new-arrival"
      />

      <LazyProductSection 
        title="Sale Highlights" 
        fetchFunction={fetchSaleItems} 
        bgColor="bg-rose-50"
        viewAllLink="/sale"
      />

      <LazyProductSection 
        title="Men's Collection" 
        fetchFunction={fetchMen} 
        viewAllLink="/men"
      />

      <LazyProductSection 
        title="Women's Collection" 
        fetchFunction={fetchWomen} 
        viewAllLink="/women"
      />

      {/* Split Section - Handled slightly differently in UI, but simplified here for lazy loading */}
      <div className="bg-gray-50 border-t border-gray-100">
         <div className="max-w-7xl mx-auto grid lg:grid-cols-2">
            <LazyProductSection 
               title="Timepieces" 
               fetchFunction={fetchWatches} 
               viewAllLink="/watches" 
               bgColor="bg-gray-50"
            />
            <LazyProductSection 
               title="Essentials" 
               fetchFunction={fetchAccessories} 
               viewAllLink="/accessories" 
               bgColor="bg-gray-50"
            />
         </div>
      </div>

      {/* --- CATEGORY NAVIGATION --- */}
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

      {/* --- STORY VIEWER MODAL --- */}
      {isStoryViewerOpen && activeStoryIndex !== null && (
        <div
          className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center"
          onClick={() => setIsStoryViewerOpen(false)}
        >
          {/* ... (Keep your existing story viewer code exactly as is) ... */}
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

      {/* --- FOOTER (Conditional Rendering) --- */}
      {footerVisible && <Footer />}
    </div>
  );
};

export default Home;