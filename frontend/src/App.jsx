import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductDetail from './pages/ProductDetail';
import SpecialCollection from './pages/SpecialCollection';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';



function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <Router>
            <div className="min-h-screen bg-gray-50 flex flex-col">
              <Navbar />
              <main className="flex-grow">
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/men" element={<CategoryPage />} />
                  <Route path="/women" element={<CategoryPage />} />
                  <Route path="/watches" element={<CategoryPage />} />
                  <Route path="/lenses" element={<CategoryPage />} />
                  <Route path="/accessories" element={<CategoryPage />} />
                  <Route path="/men/:category" element={<CategoryPage />} />
                  <Route path="/women/:category" element={<CategoryPage />} />
                  <Route path="/new-arrival" element={<SpecialCollection type="new-arrival" />} />
                  <Route path="/sale" element={<SpecialCollection type="sale" />} />
                  <Route path="/product/:category/:id" element={<ProductDetail />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
