import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
// import Footer from '../components/Footer'; 
import ProductCard from '../components/ProductCard';
import { productAPI } from '../utils/api';
import { handleImageError } from '../utils/imageFallback';
import ScrollToTop from '../components/ScrollToTop';

// --- ICONS (Embedded directly so no install needed) ---
const IconChevronLeft = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>;
const IconChevronRight = () => <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>;
const IconClose = () => <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;

// --- API FETCH FUNCTIONS (Kept from previous version) ---
const fetchNewArrivals = async () => {
  const res = await productAPI.getAllProducts({ limit: 4, isNewArrival: true, sort: 'createdAt', order: 'desc' });
  return res.success ? res.data.products : [];
};

const fetchSaleItems = async () => {
  const res = await productAPI.getAllProducts({ limit: 4, onSale: true, sort: 'discountPercent', order: 'desc' });
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
  try {
    const [lenses, acc] = await Promise.all([
      productAPI.getLenses({ limit: 2 }),
      productAPI.getAccessories({ limit: 2 })
    ]);
    let combined = [];
    if (lenses.success) combined = [...combined, ...lenses.data.products];
    if (acc.success) combined = [...combined, ...acc.data.products];
    return combined.slice(0, 4);
  } catch (error) {
    console.error("Error fetching accessories:", error);
    return [];
  }
};

// --- NEWS TICKER COMPONENT (New) ---
const NewsTicker = () => {
    const marqueeContent = "⚡ FREE SHIPPING ON ALL ORDERS OVER ₹999 ⚡ | ✨ NEW SEASON STYLES ADDED DAILY ✨ | 🎁 LIMITED TIME DISCOUNTS ON WATCHES 🎁 | 🛍️ JOIN OUR LOYALTY PROGRAM 🛍️";
    
    // NOTE: For the 'continuous' marquee animation, this CSS needs to be applied.
    // In a real project, place this CSS in your global stylesheet (e.g., index.css).
    // For a self-contained solution, we use the <style> tag here.

    return (
        <>
        <style>
            {`
            @keyframes marquee {
                0% { transform: translateX(0); }
                100% { transform: translateX(-50%); }
            }
            .animate-marquee {
                animation: marquee 30s linear infinite;
            }
            `}
        </style>
        <div className="overflow-hidden bg-gray-900 text-white py-3 border-b border-gray-700">
            <div className="whitespace-nowrap w-[200%] flex animate-marquee">
                {/* Duplicate content to ensure seamless loop */}
                <span className="text-sm font-medium tracking-wider mx-8">{marqueeContent}</span>
                <span className="text-sm font-medium tracking-wider mx-8" aria-hidden="true">{marqueeContent}</span>
            </div>
        </div>
        </>
    );
};


const Home = () => {
  // --- UI STATE ---
  const [currentSlide, setCurrentSlide] = useState(0);
  const [activeStoryIndex, setActiveStoryIndex] = useState(null);
  const [isStoryViewerOpen, setIsStoryViewerOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // --- DATA STATE & FETCHING (Unchanged) ---
  const [newArrivals, setNewArrivals] = useState([]);
  const [saleItems, setSaleItems] = useState([]);
  const [menItems, setMenItems] = useState([]);
  const [womenItems, setWomenItems] = useState([]);
  const [watches, setWatches] = useState([]);
  const [accessories, setAccessories] = useState([]);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        const [newArrivalsData, saleData, menData, womenData, watchesData, accessoriesData] = await Promise.all([
          fetchNewArrivals(), fetchSaleItems(), fetchMen(), fetchWomen(), fetchWatches(), fetchAccessories()
        ]);
        setNewArrivals(newArrivalsData);
        setSaleItems(saleData);
        setMenItems(menData);
        setWomenItems(womenData);
        setWatches(watchesData);
        setAccessories(accessoriesData);
      } catch (error) {
        console.error("Error loading home page data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    loadAllData();
  }, []);

  const stories = [
    { hashtag: 'Xmas', emoji: '🎄', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741928/IMG_20251123_161820_skzchs.png' },
    { hashtag: 'Desi', emoji: '😎', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764741995/image-104_iuyyuw.png' },
    { hashtag: 'Street', emoji: '🔥', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742092/ZfLAMkmNsf2sHkoW_DELHI-FACES-1_fjnvcb.avif' },
    { hashtag: 'FitCheck', emoji: '✨', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742199/0d37737c8c2c7536422e411fb68eeeb3_ylhf3n.jpg' },
    { hashtag: 'Tees', emoji: '👕', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742259/0424-TSHIRT-06_1_7c30d8ed-155d-47a6-a52f-52858221a302_fjdfpo.webp', link: '/mens' },
    { hashtag: 'Denim', emoji: '👖', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742467/GettyImages-2175843730_q21gse.jpg' },
    { hashtag: 'Scarf', emoji: '🧣', image: 'https://res.cloudinary.com/de1bg8ivx/image/upload/v1764742548/NECK_20SCARF_20TREND_20190625_20GettyImages-1490484490_ccdwdy.webp' }
  ];

  const carouselSlides = [
    { image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763401012/Beige_Modern_Watch_Collection_Sale_LinkedIn_Post_1080_x_300_px_cwyx08.svg', link: '/watches' },
    { image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763314950/Red_Tan_and_Black_Modern_Fashion_Sale_Banner_Landscape_1080_x_300_mm_2_htuw5b.png', link: '/women' },
    { image: 'https://res.cloudinary.com/dbt2bu4tg/image/upload/v1763312626/Beige_And_Red_Elegant_Wedding_Season_Offers_Banner_1080_x_300_mm_qxjtfv.png', link: '/women' }
  ];

  // --- CAROUSEL LOGIC ---
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [carouselSlides.length]);

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  const goToSlide = (index) => setCurrentSlide(index);

  return (
    <div className="min-h-screen bg-white font-sans text-gray-800 pt-0">
      
      {/* --- HERO SECTION (Restored & Top Margin Removed) --- */}
      <div className="relative w-full bg-gray-50 overflow-hidden group">
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
                  loading={index === 0 ? "eager" : "lazy"}
                  onError={(e) => handleImageError(e, 1920, 600)}
                />
              </Link>
            ))}
          </div>
          {/* Controls */}
          <button onClick={prevSlide} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow-lg transition opacity-0 group-hover:opacity-100 transform hover:scale-110">
             <IconChevronLeft />
          </button>
          <button onClick={nextSlide} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 p-3 rounded-full bg-white/90 text-gray-800 hover:bg-white shadow-lg transition opacity-0 group-hover:opacity-100 transform hover:scale-110">
             <IconChevronRight />
          </button>
          {/* Indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-20">
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`h-1.5 rounded-full transition-all duration-300 shadow-sm ${index === currentSlide ? 'w-8 bg-gray-800' : 'w-2 bg-gray-400 hover:bg-gray-600'}`}
              />
            ))}
          </div>
        </div>
        {/* Mobile Banner */}
        <div className="block lg:hidden w-full">
          <Link to="/sale">
            <img src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1765137539/Black_Elegant_Watch_Special_Offer_Instagram_Post_1_xjcbva.svg" alt="Mobile Banner" className="w-full h-auto object-contain block" loading="eager" />
          </Link>
        </div>
      </div>
      
      {/* --- NEWS TICKER SECTION (New Continuous Marquee) --- */}
      <NewsTicker />

      {/* --- STORIES SECTION (Attractive Gradient Rings) --- */}
      <div className="py-8 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-sm font-bold uppercase tracking-widest text-rose-600 mb-6">Explore the Trends</h3>
          <div className="flex justify-start md:justify-center gap-6 overflow-x-auto scrollbar-hide pb-2 px-2">
            {stories.map((item, index) => (
              <div
                key={index}
                className="flex-shrink-0 flex flex-col items-center gap-2 cursor-pointer group"
                onClick={() => { setActiveStoryIndex(index); setIsStoryViewerOpen(true); }}
              >
                <div className="relative p-[0px] rounded-full bg-gradient-to-tr bg-black transition-transform duration-300">
                  <div className="p-0.5 bg-black rounded-full">
                    <img src={item.image} alt={item.hashtag} className="w-16 h-16 sm:w-20 sm:h-20 rounded-full object-cover border-2 border-white" />
                  </div>
                </div>
                <span className="text-xs font-semibold text-gray-700">#{item.hashtag}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* --- CATEGORY BANNERS (Attractive 3D Hover Effect) --- */}
      <div className="max-w-7xl mx-auto px-4 mt-12 mb-8">
        <div className="text-center mb-8">
           <h2 className="text-3xl font-extrabold text-gray-900">Featured Collections</h2>
           <p className="text-gray-500">Essential styles for him and her.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <Link to="/women/shirt" className="block w-full overflow-hidden rounded-xl duration-300 group">
            <img src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1763492921/Black_and_White_Modern_New_Arrivals_Blog_Banner_4_x9v1lw.png" alt="Women" className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </Link>
          <Link to="/men/shirt" className="block w-full overflow-hidden duration-300 group">
            <img src="https://res.cloudinary.com/de1bg8ivx/image/upload/v1763493394/5ad7474b-2e60-47c5-b993-cdc9c1449c08.png" alt="Men" className="w-full h-auto block transform group-hover:scale-105 transition-transform duration-500" loading="lazy" />
          </Link>
        </div>
      </div>

      {/* --- PRODUCT SECTIONS (Improved Headers and Buttons) --- */}
      
      <ProductSection 
        title="Fresh Drops" 
        subtitle="Be the first to wear the trend"
        products={newArrivals} 
        viewAllLink="/new-arrival" 
        isLoading={isLoading} 
      />
      
      <ProductSection 
        title="Steal Deals" 
        subtitle="Premium styles at unbeatable prices"
        products={saleItems} 
        viewAllLink="/sale" 
        bgColor="bg-gradient-to-br from-rose-50 to-white" 
        isLoading={isLoading} 
      />
      
      {/* 3. Men & Women - Grid Layout */}
      <div className="max-w-7xl mx-auto px-4 py-12">
         <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">For Him</h2>
                <Link to="/men" className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition">View All</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {isLoading ? [1,2].map(i => <SkeletonCard key={i}/>) : menItems.map(p => <ProductCard key={p._id} product={p}/>)}
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-extrabold text-gray-900">For Her</h2>
                <Link to="/women" className="text-sm font-semibold text-rose-600 hover:text-rose-700 transition">View All</Link>
              </div>
              <div className="grid grid-cols-2 gap-4">
                 {isLoading ? [1,2].map(i => <SkeletonCard key={i}/>) : womenItems.map(p => <ProductCard key={p._id} product={p}/>)}
              </div>
            </div>
         </div>
      </div>

      {/* 4. Accessories - Darker Section for contrast */}
      <div className="bg-gray-100 py-16 border-t border-gray-200">
         <div className="max-w-7xl mx-auto px-4">
            <h2 className="text-3xl font-extrabold text-center mb-10 text-gray-900">Complete The Look</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
               {isLoading ? [1,2,3,4].map(i => <SkeletonCard key={i}/>) : (
                 <>
                   {watches.slice(0,2).map(p => <ProductCard key={p._id} product={p} />)}
                   {accessories.slice(0,2).map(p => <ProductCard key={p._id} product={p} />)}
                 </>
               )}
            </div>
            <div className="text-center mt-10">
               <Link to="/accessories" className="inline-block bg-rose-600 text-white px-8 py-3 rounded-full font-semibold hover:bg-rose-700 transition shadow-xl transform hover:-translate-y-1">
                 View All Accessories
               </Link>
            </div>
         </div>
      </div>

      {/* --- BROWSE BY CATEGORY (Attractive Grid) --- */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Shop by Category</h2>
          <p className="text-gray-500 mb-12">Find exactly what you are looking for</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[
              { id: 'men', emoji: '👔', bg: 'bg-blue-50 text-blue-600' }, 
              { id: 'women', emoji: '👗', bg: 'bg-pink-50 text-pink-600' }, 
              { id: 'watches', emoji: '⌚', bg: 'bg-amber-50 text-amber-600' }, 
              { id: 'lenses', emoji: '👓', bg: 'bg-teal-50 text-teal-600' }
            ].map((cat) => (
              <Link key={cat.id} to={`/${cat.id}`} className={`group relative h-48 rounded-2xl flex flex-col items-center justify-center transition-all duration-300 shadow-md hover:shadow-xl transform hover:-translate-y-1 ${cat.bg}`}>
                <span className="text-4xl mb-3 transform group-hover:scale-110 transition-transform">{cat.emoji}</span>
                <h3 className="text-xl font-bold uppercase tracking-wider">{cat.id}</h3>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* --- STORY VIEWER MODAL (Unchanged) --- */}
      {isStoryViewerOpen && activeStoryIndex !== null && (
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center" onClick={() => setIsStoryViewerOpen(false)}>
          <button onClick={(e) => { e.stopPropagation(); setIsStoryViewerOpen(false); }} className="absolute top-6 right-6 z-20 text-white/70 hover:text-white transition bg-white/10 rounded-full p-2"><IconClose /></button>
          
          {activeStoryIndex > 0 && <button onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(activeStoryIndex - 1); }} className="absolute left-4 top-1/2 -translate-y-1/2 z-20 text-white hover:opacity-70 bg-white/10 rounded-full p-2"><IconChevronLeft /></button>}
          {activeStoryIndex < stories.length - 1 && <button onClick={(e) => { e.stopPropagation(); setActiveStoryIndex(activeStoryIndex + 1); }} className="absolute right-4 top-1/2 -translate-y-1/2 z-20 text-white hover:opacity-70 bg-white/10 rounded-full p-2"><IconChevronRight /></button>}

          <div className="relative w-full h-full max-w-md mx-auto flex flex-col items-center justify-center" onClick={(e) => e.stopPropagation()}>
            <div className="absolute top-4 left-4 right-4 flex gap-1 z-20">
              {stories.map((_, index) => (
                <div key={index} className={`h-1 rounded-full flex-1 transition-all duration-300 ${index <= activeStoryIndex ? 'bg-white' : 'bg-white/30'}`} />
              ))}
            </div>
            <img src={stories[activeStoryIndex].image} alt={stories[activeStoryIndex].hashtag} className="w-full h-full object-contain max-h-[85vh] rounded-lg" />
            <div className="absolute bottom-20 text-center bg-black/50 px-6 py-2 rounded-full backdrop-blur-sm">
              <span className="text-xl font-bold text-white">{stories[activeStoryIndex].hashtag} {stories[activeStoryIndex].emoji}</span>
            </div>
          </div>
        </div>
      )}
      
      <ScrollToTop />
    </div>
  );
};

// --- REUSABLE SUB-COMPONENTS ---

const SkeletonCard = () => <div className="h-64 bg-gray-200 animate-pulse rounded-xl"></div>;

const ProductSection = ({ title, subtitle, products, viewAllLink, bgColor = 'bg-white', isLoading }) => {
  return (
    <section className={`py-16 ${bgColor}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-end mb-8 border-b pb-4 border-gray-200">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900">{title}</h2>
            {subtitle && <p className="text-gray-500 mt-1">{subtitle}</p>}
          </div>
          {viewAllLink && (
            <Link 
              to={viewAllLink} 
              className="hidden sm:inline-block px-6 py-2 rounded-full border border-gray-300 font-semibold text-gray-700 bg-white hover:bg-gray-900 hover:text-white hover:border-transparent transition-all shadow-md transform hover:scale-[1.02]"
            >
              View All
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
             {[1,2,3,4].map(i => <SkeletonCard key={i}/>)}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {products && products.length > 0 ? (
              products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <p className="col-span-4 text-center text-gray-500 py-10">No products found.</p>
            )}
          </div>
        )}
        
        {/* Mobile View All Button (Visible only on small screens) */}
        {viewAllLink && (
           <div className="mt-8 text-center sm:hidden">
              <Link to={viewAllLink} className="inline-block px-8 py-3 rounded-full bg-gray-900 text-white font-semibold shadow-lg">View All</Link>
           </div>
        )}
      </div>
    </section>
  );
};

export default Home;