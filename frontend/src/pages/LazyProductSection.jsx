// components/LazyProductSection.jsx
import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import ProductCard from '../components/ProductCard';

const LazyProductSection = ({ title, link, fetchFunction, bgColor = "bg-white", viewAllLink }) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        // If section is visible and hasn't loaded yet, fetch data
        if (entry.isIntersecting && !hasLoaded) {
          fetchData();
        }
      },
      { rootMargin: '200px' } // Start loading 200px before user reaches section
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => {
      if (sectionRef.current) observer.unobserve(sectionRef.current);
    };
  }, [hasLoaded]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const data = await fetchFunction();
      setProducts(data);
      setHasLoaded(true);
    } catch (error) {
      console.error(`Error loading section ${title}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <section ref={sectionRef} className={`py-16 ${bgColor} min-h-[400px]`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-10">
          <h2 className={`text-2xl md:text-3xl font-bold uppercase tracking-tight ${bgColor.includes('rose') ? 'text-rose-600' : 'text-gray-900'}`}>
            {title}
          </h2>
          {viewAllLink && (
            <Link to={viewAllLink} className="text-sm font-bold uppercase tracking-wider border-b-2 border-transparent hover:border-gray-900 transition-all">
              View All
            </Link>
          )}
        </div>

        {/* LOADING STATE (Skeleton) */}
        {isLoading && !hasLoaded && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 aspect-[4/5] rounded-xl mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        )}

        {/* DATA STATE */}
        {hasLoaded && products.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-12">
            {products.map((product) => (
              <ProductCard key={product._id || product.id} product={normalizeProduct(product)} />
            ))}
          </div>
        )}

        {/* EMPTY STATE */}
        {hasLoaded && products.length === 0 && (
           <div className="text-center py-10 text-gray-500">No products found.</div>
        )}
      </div>
    </section>
  );
};

export default LazyProductSection;