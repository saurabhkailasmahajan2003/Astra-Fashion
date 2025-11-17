import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const categoryOptions = [
  { label: 'Men', value: 'men' },
  { label: 'Women', value: 'women' },
  { label: 'Watches', value: 'watches' },
  { label: 'Lens', value: 'lens' },
  { label: 'Accessories', value: 'accessories' },
];

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const [summary, setSummary] = useState(null);
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [productCategory, setProductCategory] = useState('men');
  const [productForm, setProductForm] = useState({
    category: 'men',
    name: '',
    brand: '',
    price: '',
    originalPrice: '',
    discountPercent: 0,
    subCategory: '',
    stock: 10,
    images: '',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  const isAdmin = user?.isAdmin;

  useEffect(() => {
    if (!isAdmin) return;
    fetchSummary();
    fetchOrders();
  }, [isAdmin]);

  useEffect(() => {
    if (!isAdmin) return;
    fetchProducts(productCategory);
  }, [isAdmin, productCategory]);

  const fetchSummary = async () => {
    try {
      const response = await adminAPI.getSummary();
      if (response.success) {
        setSummary(response.data);
      }
    } catch (error) {
      console.error('Error fetching summary:', error);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await adminAPI.getOrders();
      if (response.success) {
        setOrders(response.data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  const fetchProducts = async (category) => {
    try {
      setLoading(true);
      const response = await adminAPI.getProducts(category);
      if (response.success) {
        setProducts(response.data.products || []);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOrderStatusChange = async (orderId, status) => {
    try {
      await adminAPI.updateOrderStatus(orderId, status);
      setMessage({ type: 'success', text: 'Order status updated' });
      fetchOrders();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update order' });
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (!window.confirm('Delete this order?')) return;
    try {
      await adminAPI.deleteOrder(orderId);
      setMessage({ type: 'success', text: 'Order removed' });
      fetchOrders();
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete order' });
    }
  };

  const handleProductFormChange = (e) => {
    const { name, value } = e.target;
    setProductForm((prev) => ({ ...prev, [name]: value }));
  };

  const resetForm = () => {
    setProductForm({
      category: productCategory,
      name: '',
      brand: '',
      price: '',
      originalPrice: '',
      discountPercent: 0,
      subCategory: '',
      stock: 10,
      images: '',
    });
  };

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...productForm,
        price: Number(productForm.price),
        originalPrice: Number(productForm.originalPrice || productForm.price),
        discountPercent: Number(productForm.discountPercent || 0),
        stock: Number(productForm.stock || 0),
        images: productForm.images
          ? productForm.images.split(',').map((img) => img.trim())
          : [],
      };
      await adminAPI.createProduct(payload);
      setMessage({ type: 'success', text: 'Product created' });
      resetForm();
      fetchProducts(productCategory);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to create product' });
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product?')) return;
    try {
      await adminAPI.deleteProduct(id, productCategory);
      setMessage({ type: 'success', text: 'Product deleted' });
      fetchProducts(productCategory);
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to delete product' });
    }
  };

  const filteredOrders = useMemo(() => orders.slice(0, 10), [orders]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="bg-white border rounded-2xl shadow-sm max-w-lg w-full p-10 text-center space-y-4">
          <div className="text-4xl">🚫</div>
          <h1 className="text-2xl font-bold text-gray-900">Admin access only</h1>
          <p className="text-gray-600">You need an admin account to view this page.</p>
          <Link
            to="/profile"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Back to profile
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">Control Center</p>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          </div>
          <div className="flex gap-2">
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50"
            >
              Back to store
            </Link>
            <button
              onClick={fetchSummary}
              className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700"
            >
              Refresh
            </button>
          </div>
        </div>

        {message.text && (
          <div
            className={`rounded-lg px-4 py-3 text-sm ${
              message.type === 'error'
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-green-50 text-green-700 border border-green-200'
            }`}
          >
            {message.text}
          </div>
        )}

        <section className="grid gap-4 md:grid-cols-4">
          {summary ? (
            <>
              <div className="bg-white rounded-2xl border p-5 shadow-sm">
                <p className="text-xs uppercase text-gray-500">Revenue</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  ₹{summary.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="bg-white rounded-2xl border p-5 shadow-sm">
                <p className="text-xs uppercase text-gray-500">Orders</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{summary.totalOrders}</p>
                <p className="text-xs text-gray-500">{summary.pendingOrders} pending</p>
              </div>
              <div className="bg-white rounded-2xl border p-5 shadow-sm">
                <p className="text-xs uppercase text-gray-500">Customers</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">{summary.totalUsers}</p>
              </div>
              <div className="bg-white rounded-2xl border p-5 shadow-sm">
                <p className="text-xs uppercase text-gray-500">Inventory</p>
                <p className="text-2xl font-bold text-gray-900 mt-2">
                  {Object.values(summary.inventory).reduce((a, b) => a + b, 0)}
                </p>
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">Loading summary...</p>
          )}
        </section>

        <section className="grid gap-6 lg:grid-cols-2">
          <div className="bg-white rounded-3xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase text-gray-500">Recent orders</p>
                <h2 className="text-xl font-bold text-gray-900">Orders & Status</h2>
              </div>
              <button
                onClick={fetchOrders}
                className="text-sm text-blue-600 font-semibold hover:text-blue-700"
              >
                Refresh
              </button>
            </div>
            <div className="divide-y">
              {filteredOrders.length === 0 && (
                <p className="text-gray-500 text-sm py-4">No orders yet</p>
              )}
              {filteredOrders.map((order) => (
                <div key={order._id} className="py-4 flex flex-col gap-2">
                  <div className="flex justify-between text-sm">
                    <div>
                      <p className="font-semibold text-gray-900">
                        {order.user?.name || 'Guest'} · ₹{order.totalAmount?.toLocaleString()}
                      </p>
                      <p className="text-xs text-gray-500">
                        #{order._id.slice(-6)} · {new Date(order.orderDate).toDateString()}
                      </p>
                    </div>
                    <button
                      onClick={() => handleDeleteOrder(order._id)}
                      className="text-xs text-red-500 hover:text-red-600"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="flex items-center gap-2">
                    <select
                      value={order.status}
                      onChange={(e) => handleOrderStatusChange(order._id, e.target.value)}
                      className="text-sm border rounded-lg px-3 py-1.5"
                    >
                      {statusOptions.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>
                    <span className="text-xs text-gray-500">
                      {order.items?.length || 0} item(s)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white rounded-3xl border p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs uppercase text-gray-500">Inventory</p>
                <h2 className="text-xl font-bold text-gray-900">Manage Products</h2>
              </div>
              <select
                value={productCategory}
                onChange={(e) => {
                  setProductCategory(e.target.value);
                  setProductForm((prev) => ({ ...prev, category: e.target.value }));
                }}
                className="border rounded-lg px-3 py-1.5 text-sm"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
            <form onSubmit={handleCreateProduct} className="space-y-3 mb-6">
              <input
                name="name"
                value={productForm.name}
                onChange={handleProductFormChange}
                placeholder="Product name"
                required
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  name="brand"
                  value={productForm.brand}
                  onChange={handleProductFormChange}
                  placeholder="Brand"
                  required
                  className="border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  name="subCategory"
                  value={productForm.subCategory}
                  onChange={handleProductFormChange}
                  placeholder="Sub-category"
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <input
                  name="price"
                  type="number"
                  min="0"
                  value={productForm.price}
                  onChange={handleProductFormChange}
                  placeholder="Price"
                  required
                  className="border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  name="originalPrice"
                  type="number"
                  min="0"
                  value={productForm.originalPrice}
                  onChange={handleProductFormChange}
                  placeholder="Original price"
                  className="border rounded-lg px-3 py-2 text-sm"
                />
                <input
                  name="stock"
                  type="number"
                  min="0"
                  value={productForm.stock}
                  onChange={handleProductFormChange}
                  placeholder="Stock"
                  className="border rounded-lg px-3 py-2 text-sm"
                />
              </div>
              <textarea
                name="images"
                value={productForm.images}
                onChange={handleProductFormChange}
                placeholder="Image URLs (comma separated)"
                className="w-full border rounded-lg px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="w-full rounded-lg bg-blue-600 text-white text-sm font-semibold py-2.5 hover:bg-blue-700"
              >
                Add Product
              </button>
            </form>
            <div className="h-48 overflow-y-auto pr-1">
              {loading ? (
                <p className="text-sm text-gray-500">Loading products...</p>
              ) : products.length === 0 ? (
                <p className="text-sm text-gray-500">No products in this category yet.</p>
              ) : (
                <ul className="space-y-3 text-sm">
                  {products.slice(0, 6).map((product) => (
                    <li
                      key={product._id}
                      className="flex items-center justify-between border rounded-xl px-3 py-2"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{product.name}</p>
                        <p className="text-xs text-gray-500">
                          ₹{product.finalPrice || product.price} · Stock {product.stock}
                        </p>
                      </div>
                      <button
                        onClick={() => handleDeleteProduct(product._id)}
                        className="text-xs text-red-500 hover:text-red-600"
                      >
                        Remove
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default AdminDashboard;


