import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { profileAPI } from '../utils/api';
import { useAuth } from '../context/AuthContext';

const navSections = [
  { id: 'overview', label: 'Account Overview', description: 'Profile and contact details' },
  { id: 'orders', label: 'Orders & Returns', description: 'Track orders and initiate returns' },
  { id: 'addresses', label: 'Addresses', description: 'Manage delivery addresses' },
  { id: 'payments', label: 'Payment Methods', description: 'Cards, UPI and wallets' },
  { id: 'notifications', label: 'Notifications', description: 'Control alerts and promos' },
  { id: 'security', label: 'Security', description: 'Password & sessions' },
];

const Profile = () => {
  const { user: authUser, isAuthenticated, logout, isLoading: authLoading } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('overview');
  const [formData, setFormData] = useState({
    name: '',
    username: '',
    email: '',
    phone: '',
    location: '',
  });
  const [notificationPrefs, setNotificationPrefs] = useState({
    email: true,
    sms: false,
    push: true,
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const quickStats = useMemo(() => {
    const orders = profileData?.orders || [];
    const wishlist = profileData?.wishlist?.products || [];
    const cart = profileData?.cart?.items || [];

    return [
      { label: 'Orders', value: orders.length },
      { label: 'Wishlist', value: wishlist.length },
      { label: 'Cart', value: cart.length },
    ];
  }, [profileData]);

  useEffect(() => {
    if (authLoading) {
      return;
    }

    if (!isAuthenticated) {
      setProfileData(null);
      setIsLoading(false);
      return;
    }
    loadProfile();
  }, [authLoading, isAuthenticated]);

  const loadProfile = async () => {
    try {
      setIsLoading(true);
      const response = await profileAPI.getProfile();
      if (response.success) {
        setProfileData(response.data);
        const user = response.data.user;
        setFormData({
          name: user.name || '',
          username: user.username || user.email?.split('@')[0] || '',
          email: user.email || '',
          phone: user.phone || '',
          location: user.address?.city
            ? `${user.address.city}, ${user.address.country || 'India'}`
            : '',
        });
      }
    } catch (err) {
      console.error('Error loading profile:', err);
      setError('Failed to load profile data.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!profileData) return;

    try {
      const updateData = {
        name: formData.name,
        phone: formData.phone,
        address: {
          ...profileData.user.address,
          city: formData.location.split(',')[0]?.trim() || '',
          country: formData.location.split(',')[1]?.trim() || 'India',
        },
      };
      const response = await profileAPI.updateProfile(updateData);
      if (response.success) {
        setSuccess('Account details updated');
        await loadProfile();
      }
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleNotification = (channel) => {
    setNotificationPrefs((prev) => ({ ...prev, [channel]: !prev[channel] }));
  };

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl border shadow-sm max-w-md w-full p-8 text-center space-y-4">
          <div className="mx-auto w-14 h-14 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-2xl">
            🔐
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Sign in to view your profile</h2>
          <p className="text-gray-600">
            Your account, orders, wishlist and saved addresses are available once you’re logged in.
          </p>
          <div className="flex gap-3 justify-center">
            <Link
              to="/login"
              className="px-5 py-2.5 rounded-lg bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition"
            >
              Create account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!profileData) {
    return (
      <div className="min-h-screen bg-slate-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Unable to fetch profile. Try again later.</p>
        </div>
      </div>
    );
  }

  const { user, cart, wishlist, orders } = profileData;
  const displayName = user.name || 'Guest';
  const username = user.username || user.email?.split('@')[0] || 'member';

  const renderOverview = () => (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <label className="text-xs uppercase tracking-wide text-gray-500">Full Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-gray-500">Username</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChange}
            className="w-full mt-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-gray-500">Email</label>
          <input
            type="email"
            value={formData.email}
            disabled
            className="w-full mt-1 px-4 py-2.5 border rounded-lg bg-slate-100 text-gray-500 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="text-xs uppercase tracking-wide text-gray-500">Phone</label>
          <input
            type="tel"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder="+91 98765 43210"
            className="w-full mt-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
        <div className="md:col-span-2">
          <label className="text-xs uppercase tracking-wide text-gray-500">Location</label>
          <input
            type="text"
            name="location"
            value={formData.location}
            onChange={handleChange}
            placeholder="Mumbai, India"
            className="w-full mt-1 px-4 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
        </div>
      </div>
      <div className="flex flex-wrap gap-4">
        <button
          type="submit"
          className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition"
        >
          Save Changes
        </button>
        <button
          type="button"
          onClick={loadProfile}
          className="px-6 py-2.5 border border-gray-300 rounded-lg font-semibold text-gray-600 hover:bg-gray-50"
        >
          Reset
        </button>
      </div>
    </form>
  );

  const renderOrders = () => {
    const orderPreview = (orders || []).slice(0, 4);
    if (orderPreview.length === 0) {
      return (
        <div className="text-center py-12 bg-white rounded-xl border">
          <p className="text-gray-600 mb-3">No orders yet</p>
          <Link to="/men" className="text-blue-600 font-semibold">
            Start shopping →
          </Link>
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {orderPreview.map((order) => (
          <div key={order._id} className="bg-white rounded-xl border p-4 flex justify-between items-center">
            <div>
              <p className="text-sm text-gray-500">Order #{order.orderNumber || order._id.slice(-6)}</p>
              <p className="font-semibold text-gray-900">{order.items?.length || 0} items</p>
              <p className="text-xs text-gray-500">{new Date(order.createdAt).toDateString()}</p>
            </div>
            <div className="text-right">
              <p className="font-semibold text-gray-900">
                ₹{order.totalAmount?.toLocaleString() || order.total || '0'}
              </p>
              <p className="text-xs uppercase tracking-wide text-green-600">
                {order.status || 'Processing'}
              </p>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderAddresses = () => (
    <div className="bg-white rounded-xl border p-5 space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">Default Shipping Address</p>
          <p className="text-lg font-semibold text-gray-900 mt-1">{displayName}</p>
        </div>
        <button className="text-sm font-semibold text-blue-600">Edit</button>
      </div>
      <p className="text-gray-700 leading-relaxed">
        {user.address?.address || 'No street address saved'}
        <br />
        {user.address?.city || 'City'} {user.address?.zipCode || ''}
        <br />
        {user.address?.state || 'State'}, {user.address?.country || 'India'}
      </p>
      <p className="text-sm text-gray-500">Phone: {formData.phone || 'Not provided'}</p>
    </div>
  );

  const renderPayments = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-5 flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">Primary Card</p>
          <p className="text-lg font-semibold text-gray-900">•••• 1824</p>
          <p className="text-sm text-gray-500">Expires 09 / 28</p>
        </div>
        <button className="text-sm font-semibold text-blue-600">Manage</button>
      </div>
      <div className="bg-white rounded-xl border p-5">
        <p className="text-sm text-gray-500 uppercase tracking-wide mb-3">UPI & Wallets</p>
        <div className="flex flex-wrap gap-3">
          {['Paytm', 'PhonePe', 'Google Pay'].map((brand) => (
            <span key={brand} className="px-3 py-1 rounded-full border text-sm text-gray-600">
              {brand}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="bg-white rounded-xl border divide-y">
      {[
        { id: 'email', label: 'Email alerts', description: 'Order updates & exclusive offers' },
        { id: 'sms', label: 'SMS', description: 'Delivery updates & payment confirmations' },
        { id: 'push', label: 'Push notifications', description: 'Price drops & wishlist alerts' },
      ].map((item) => (
        <div key={item.id} className="flex items-center justify-between p-5">
          <div>
            <p className="font-semibold text-gray-900">{item.label}</p>
            <p className="text-sm text-gray-500">{item.description}</p>
          </div>
          <button
            onClick={() => toggleNotification(item.id)}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition ${
              notificationPrefs[item.id] ? 'bg-blue-600' : 'bg-gray-200'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                notificationPrefs[item.id] ? 'translate-x-6' : 'translate-x-1'
              }`}
            ></span>
          </button>
        </div>
      ))}
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-4">
      <div className="bg-white rounded-xl border p-5">
        <p className="text-sm text-gray-500 uppercase tracking-wide">Login Email</p>
        <p className="text-lg font-semibold text-gray-900 mt-1">{user.email}</p>
      </div>
      <div className="bg-white rounded-xl border p-5 flex flex-wrap gap-4 justify-between">
        <div>
          <p className="text-sm text-gray-500 uppercase tracking-wide">Last Login</p>
          <p className="text-lg font-semibold text-gray-900">Today, 09:42 IST</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-semibold text-gray-600">
            Change Password
          </button>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );

  const sectionRenderer = {
    overview: renderOverview,
    orders: renderOrders,
    addresses: renderAddresses,
    payments: renderPayments,
    notifications: renderNotifications,
    security: renderSecurity,
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-6">
            <div className="bg-white rounded-2xl border p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 text-white flex items-center justify-center text-2xl font-semibold">
                  {displayName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Premium Member</p>
                  <p className="text-xl font-bold text-gray-900">{displayName}</p>
                  <p className="text-sm text-gray-500">@{username}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-3 gap-4 text-center text-sm">
                {quickStats.map((stat) => (
                  <div key={stat.label}>
                    <p className="text-xs uppercase text-gray-500">{stat.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <Link
                  to="/orders"
                  className="flex-1 text-center py-2 rounded-lg border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50"
                >
                  Orders
                </Link>
                <Link
                  to="/wishlist"
                  className="flex-1 text-center py-2 rounded-lg text-sm font-semibold bg-blue-50 text-blue-600 hover:bg-blue-100"
                >
                  Wishlist
                </Link>
              </div>
              {authUser?.isAdmin && (
                <Link
                  to="/admin"
                  className="mt-3 block text-center py-2 rounded-lg text-sm font-semibold bg-gray-900 text-white hover:bg-gray-800"
                >
                  Go to Admin Panel
                </Link>
              )}
            </div>

            <nav className="bg-white rounded-2xl border shadow-sm divide-y">
              {navSections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full text-left px-5 py-4 transition ${
                    activeSection === section.id ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                  }`}
                >
                  <p className="font-semibold text-gray-900">{section.label}</p>
                  <p className="text-sm text-gray-500">{section.description}</p>
                </button>
              ))}
            </nav>
          </aside>

          <section className="space-y-6">
            <div className="bg-white rounded-3xl border p-6 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-gray-500">Account Control Center</p>
                  <h1 className="text-2xl font-bold text-gray-900 mt-1">
                    {navSections.find((s) => s.id === activeSection)?.label}
                  </h1>
                </div>
                <div className="flex gap-2">
                  <button className="px-4 py-2 rounded-lg border text-sm font-semibold text-gray-600 hover:bg-gray-50">
                    Download Data
                  </button>
                  <button className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700">
                    Need Help?
                  </button>
                </div>
              </div>
              {(error || success) && (
                <div className="mt-4 space-y-3">
                  {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                      {error}
                    </div>
                  )}
                  {success && (
                    <div className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
                      {success}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="bg-transparent">
              {sectionRenderer[activeSection]?.() || renderOverview()}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default Profile;


