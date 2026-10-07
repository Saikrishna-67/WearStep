import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const CATEGORIES = [
  "Men's Clothing",
  "Women's Clothing",
  'Jackets & Hoodies',
  'Jeans & Trousers',
  "Men's Shoes",
  "Women's Shoes",
  'Slippers & Sandals',
];

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { isAdmin, isLoggedIn, loading: authLoading, logout } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('dash'); // 'dash' | 'products' | 'orders' | 'customers' | 'coupons' | 'inventory'
  const [loading, setLoading] = useState(true);

  // Data states
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalRevenue: 0,
    customerCount: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [inventory, setInventory] = useState({ lowStock: [], outOfStock: [] });

  // Product Form State (Add / Edit)
  const [isProductFormOpen, setIsProductFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [prodForm, setProdForm] = useState({
    name: '',
    category: CATEGORIES[0],
    price: '',
    mrp: '',
    image: '',
    sizes: 'S, M, L, XL',
    stock: 20,
    description: '',
    gender: 'Unisex',
    featured: false,
    newArrival: false,
  });

  // Coupon Form State
  const [isCouponFormOpen, setIsCouponFormOpen] = useState(false);
  const [couponForm, setCouponForm] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    minimumOrder: '',
    maximumDiscount: '',
  });

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !isAdmin) {
      showToast('Admin login required');
      navigate('/');
      return;
    }
    loadAdminData();
  }, [isLoggedIn, isAdmin, authLoading]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [dashRes, prodRes, ordRes, custRes, coupRes, invRes] = await Promise.all([
        api.getDashboardStats(),
        api.getAdminProducts(),
        api.getAdminOrders(),
        api.getCustomers(),
        api.getCoupons(),
        api.getInventory(),
      ]);

      if (dashRes.success) {
        setStats(dashRes.stats);
        setRecentOrders(dashRes.recentOrders);
      }
      if (prodRes.success) setProducts(prodRes.products);
      if (ordRes.success) setOrders(ordRes.orders);
      if (custRes.success) setCustomers(custRes.customers);
      if (coupRes.success) setCoupons(coupRes.coupons);
      if (invRes.success) setInventory(invRes);
    } catch (err) {
      console.error('Error loading admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

  // Product actions
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      name: '',
      category: CATEGORIES[0],
      price: '',
      mrp: '',
      image: '',
      sizes: 'S, M, L, XL',
      stock: 20,
      description: '',
      gender: 'Unisex',
      featured: false,
      newArrival: false,
    });
    setIsProductFormOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setProdForm({
      name: prod.name,
      category: prod.category,
      price: prod.price,
      mrp: prod.mrp,
      image: prod.images && prod.images[0] ? prod.images[0] : '',
      sizes: prod.sizes ? prod.sizes.join(', ') : 'S, M, L, XL',
      stock: prod.stock,
      description: prod.description || '',
      gender: prod.gender || 'Unisex',
      featured: prod.featured || false,
      newArrival: prod.newArrival || false,
    });
    setIsProductFormOpen(true);
  };

  const handleSaveProduct = async (e) => {
    e.preventDefault();
    if (!prodForm.name || !prodForm.price) {
      showToast('Name and price are required');
      return;
    }

    const payload = {
      name: prodForm.name,
      category: prodForm.category,
      price: Number(prodForm.price),
      mrp: Number(prodForm.mrp) || Number(prodForm.price),
      images: [prodForm.image.trim() || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=700&q=80'],
      sizes: prodForm.sizes.split(',').map((s) => s.trim()).filter(Boolean),
      stock: Number(prodForm.stock) || 0,
      description: prodForm.description,
      gender: prodForm.gender,
      featured: prodForm.featured,
      newArrival: prodForm.newArrival,
    };

    try {
      if (editingProduct) {
        await api.updateProduct(editingProduct._id || editingProduct.id, payload);
        showToast('Product updated successfully');
      } else {
        await api.createProduct(payload);
        showToast('New product created successfully');
      }
      setIsProductFormOpen(false);
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Error saving product');
    }
  };

  const handleDeleteProduct = async (id) => {
    if (!window.confirm('Delete this product permanently?')) return;
    try {
      await api.deleteProduct(id);
      showToast('Product deleted');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Could not delete product');
    }
  };

  // Order status update
  const handleOrderStatusChange = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus);
      showToast(`Order status updated to "${newStatus}"`);
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Error updating order status');
    }
  };

  // Coupon actions
  const handleCreateCoupon = async (e) => {
    e.preventDefault();
    try {
      await api.createCoupon({
        code: couponForm.code,
        discountType: couponForm.discountType,
        discountValue: Number(couponForm.discountValue),
        minimumOrder: Number(couponForm.minimumOrder) || 0,
        maximumDiscount: Number(couponForm.maximumDiscount) || null,
      });
      showToast('Coupon created successfully');
      setIsCouponFormOpen(false);
      setCouponForm({ code: '', discountType: 'percentage', discountValue: '', minimumOrder: '', maximumDiscount: '' });
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Error creating coupon');
    }
  };

  const handleDeleteCoupon = async (id) => {
    if (!window.confirm('Delete this coupon?')) return;
    try {
      await api.deleteCoupon(id);
      showToast('Coupon deleted');
      loadAdminData();
    } catch (err) {
      showToast(err.message || 'Could not delete coupon');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <span className="mono" style={{ color: 'var(--steel)' }}>
          Loading Admin Portal...
        </span>
      </div>
    );
  }

  return (
    <div id="view-admin">
      <div className="admin-wrap">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '26px', flexWrap: 'wrap', gap: '16px' }}>
          <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', margin: 0 }}>
            Admin Portal
          </h2>
          <button
            onClick={() => {
              logout();
              showToast('Logged out from Admin');
              navigate('/');
            }}
            className="btn btn-outline"
            style={{
              borderColor: 'var(--rust)',
              color: 'var(--rust)',
              padding: '10px 18px',
              fontSize: '12px',
              fontWeight: 800,
              textTransform: 'uppercase',
              letterSpacing: '1px',
              cursor: 'pointer',
              borderRadius: '2px',
            }}
          >
            ⏻ Admin Logout
          </button>
        </div>

        {/* ADMIN TABS */}
        <div className="admin-tabs">
          <button
            className={`admin-tab ${activeTab === 'dash' ? 'active' : ''}`}
            onClick={() => setActiveTab('dash')}
          >
            Dashboard
          </button>
          <button
            className={`admin-tab ${activeTab === 'products' ? 'active' : ''}`}
            onClick={() => setActiveTab('products')}
          >
            Products ({products.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            Orders ({orders.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'customers' ? 'active' : ''}`}
            onClick={() => setActiveTab('customers')}
          >
            Customers ({customers.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'coupons' ? 'active' : ''}`}
            onClick={() => setActiveTab('coupons')}
          >
            Coupons ({coupons.length})
          </button>
          <button
            className={`admin-tab ${activeTab === 'inventory' ? 'active' : ''}`}
            onClick={() => setActiveTab('inventory')}
          >
            Inventory Alerts
          </button>
        </div>

        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dash' && (
          <div>
            <div className="stat-grid">
              <div className="stat-card">
                <span className="mono">Total Products</span>
                <div className="stat-num">{stats.totalProducts}</div>
              </div>
              <div className="stat-card">
                <span className="mono">Total Orders</span>
                <div className="stat-num">{stats.totalOrders}</div>
              </div>
              <div className="stat-card">
                <span className="mono">Revenue</span>
                <div className="stat-num">{fmt(stats.totalRevenue)}</div>
              </div>
              <div className="stat-card">
                <span className="mono">Customers</span>
                <div className="stat-num">{stats.customerCount}</div>
              </div>
            </div>

            <div className="admin-table-wrap">
              <h3 style={{ fontSize: '16px', padding: '16px', borderBottom: '1.5px solid var(--ink)' }}>
                Recent Orders
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Order ID</th>
                    <th>Customer</th>
                    <th>Items</th>
                    <th>Total</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.length > 0 ? (
                    recentOrders.map((o) => (
                      <tr key={o.orderId || o._id}>
                        <td><strong>{o.orderId}</strong></td>
                        <td>{o.customerName}</td>
                        <td>{o.items?.length || 0}</td>
                        <td>{fmt(o.total)}</td>
                        <td>
                          <span className={`status-badge status-${o.orderStatus}`}>
                            {o.orderStatus}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', color: 'var(--steel)', padding: '24px' }}>
                        No orders yet
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS */}
        {activeTab === 'products' && (
          <div>
            <div className="admin-actions-row">
              <span className="mono" style={{ color: 'var(--steel)' }}>
                {products.length} Products in Catalog
              </span>
              <button
                className="btn btn-gold btn-sm"
                onClick={handleOpenAddProduct}
              >
                + Add Product
              </button>
            </div>

            {/* PRODUCT ADD / EDIT FORM MODAL */}
            {isProductFormOpen && (
              <div className="co-card" style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '16px' }}>
                  {editingProduct ? 'Edit Product' : 'Add New Product'}
                </h3>
                <form onSubmit={handleSaveProduct}>
                  <div className="admin-form-grid">
                    <div className="field">
                      <label>Product Name</label>
                      <input
                        type="text"
                        value={prodForm.name}
                        onChange={(e) => setProdForm({ ...prodForm, name: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Category</label>
                      <select
                        value={prodForm.category}
                        onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                      >
                        {CATEGORIES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="field">
                      <label>Price (₹)</label>
                      <input
                        type="number"
                        value={prodForm.price}
                        onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>MRP (₹)</label>
                      <input
                        type="number"
                        value={prodForm.mrp}
                        onChange={(e) => setProdForm({ ...prodForm, mrp: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Image URL</label>
                      <input
                        type="url"
                        placeholder="https://images.unsplash.com/..."
                        value={prodForm.image}
                        onChange={(e) => setProdForm({ ...prodForm, image: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Stock Count</label>
                      <input
                        type="number"
                        value={prodForm.stock}
                        onChange={(e) => setProdForm({ ...prodForm, stock: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Sizes (comma separated)</label>
                      <input
                        type="text"
                        value={prodForm.sizes}
                        onChange={(e) => setProdForm({ ...prodForm, sizes: e.target.value })}
                      />
                    </div>
                    <div className="field">
                      <label>Gender</label>
                      <select
                        value={prodForm.gender}
                        onChange={(e) => setProdForm({ ...prodForm, gender: e.target.value })}
                      >
                        <option value="Unisex">Unisex</option>
                        <option value="Men">Men</option>
                        <option value="Women">Women</option>
                      </select>
                    </div>
                  </div>

                  <div className="field">
                    <label>Description</label>
                    <textarea
                      rows={2}
                      value={prodForm.description}
                      onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '20px', marginBottom: '16px' }}>
                    <label className="filter-opt">
                      <input
                        type="checkbox"
                        checked={prodForm.newArrival}
                        onChange={(e) => setProdForm({ ...prodForm, newArrival: e.target.checked })}
                      />
                      New Arrival Tag
                    </label>
                    <label className="filter-opt">
                      <input
                        type="checkbox"
                        checked={prodForm.featured}
                        onChange={(e) => setProdForm({ ...prodForm, featured: e.target.checked })}
                      />
                      Featured Collection
                    </label>
                  </div>

                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">
                      {editingProduct ? 'Update Product' : 'Save Product'}
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setIsProductFormOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* PRODUCT TABLE */}
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Name</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((p) => (
                    <tr key={p._id || p.id}>
                      <td>
                        <img
                          src={p.images && p.images[0] ? p.images[0] : ''}
                          alt={p.name}
                        />
                      </td>
                      <td>
                        <strong>{p.name}</strong>
                      </td>
                      <td>{p.category}</td>
                      <td>{fmt(p.price)}</td>
                      <td>
                        <span
                          style={{
                            color: p.stock <= 5 ? 'var(--rust)' : 'inherit',
                            fontWeight: p.stock <= 5 ? 700 : 400,
                          }}
                        >
                          {p.stock}
                        </span>
                      </td>
                      <td style={{ display: 'flex', gap: '8px' }}>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => handleOpenEditProduct(p)}
                        >
                          Edit
                        </button>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteProduct(p._id || p.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {activeTab === 'orders' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((o) => (
                  <tr key={o.orderId || o._id}>
                    <td><strong>{o.orderId}</strong></td>
                    <td>{o.customerName} ({o.customerEmail})</td>
                    <td>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td>{fmt(o.total)}</td>
                    <td><span style={{ textTransform: 'uppercase' }}>{o.paymentMethod} ({o.paymentStatus})</span></td>
                    <td>
                      <select
                        className="status-select"
                        value={o.orderStatus}
                        onChange={(e) => handleOrderStatusChange(o._id, e.target.value)}
                      >
                        <option value="Placed">Placed</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: CUSTOMERS */}
        {activeTab === 'customers' && (
          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Customer Name</th>
                  <th>Email</th>
                  <th>Total Orders</th>
                  <th>Total Spend</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name}</strong></td>
                    <td>{c.email}</td>
                    <td>{c.orderCount}</td>
                    <td>{fmt(c.totalSpend)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: COUPONS */}
        {activeTab === 'coupons' && (
          <div>
            <div className="admin-actions-row">
              <span className="mono" style={{ color: 'var(--steel)' }}>
                Active Promotional Coupons
              </span>
              <button
                className="btn btn-gold btn-sm"
                onClick={() => setIsCouponFormOpen(!isCouponFormOpen)}
              >
                + Create Coupon
              </button>
            </div>

            {isCouponFormOpen && (
              <div className="co-card" style={{ marginBottom: '22px' }}>
                <h3 style={{ fontSize: '16px', marginBottom: '14px' }}>New Coupon</h3>
                <form onSubmit={handleCreateCoupon}>
                  <div className="admin-form-grid">
                    <div className="field">
                      <label>Coupon Code (e.g. FESTIVAL500)</label>
                      <input
                        type="text"
                        value={couponForm.code}
                        onChange={(e) => setCouponForm({ ...couponForm, code: e.target.value.toUpperCase() })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Discount Type</label>
                      <select
                        value={couponForm.discountType}
                        onChange={(e) => setCouponForm({ ...couponForm, discountType: e.target.value })}
                      >
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed Amount (₹)</option>
                      </select>
                    </div>
                    <div className="field">
                      <label>Discount Value</label>
                      <input
                        type="number"
                        placeholder="e.g. 20 or 500"
                        value={couponForm.discountValue}
                        onChange={(e) => setCouponForm({ ...couponForm, discountValue: e.target.value })}
                        required
                      />
                    </div>
                    <div className="field">
                      <label>Minimum Order (₹)</label>
                      <input
                        type="number"
                        placeholder="e.g. 1500"
                        value={couponForm.minimumOrder}
                        onChange={(e) => setCouponForm({ ...couponForm, minimumOrder: e.target.value })}
                      />
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button type="submit" className="btn btn-primary">
                      Create Coupon
                    </button>
                    <button
                      type="button"
                      className="btn btn-ghost"
                      onClick={() => setIsCouponFormOpen(false)}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Code</th>
                    <th>Type</th>
                    <th>Value</th>
                    <th>Min Order</th>
                    <th>Usage</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {coupons.map((c) => (
                    <tr key={c._id}>
                      <td><strong>{c.code}</strong></td>
                      <td style={{ textTransform: 'capitalize' }}>{c.discountType}</td>
                      <td>{c.discountType === 'percentage' ? `${c.discountValue}%` : fmt(c.discountValue)}</td>
                      <td>{fmt(c.minimumOrder)}</td>
                      <td>{c.usageCount}</td>
                      <td>
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => handleDeleteCoupon(c._id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 6: INVENTORY */}
        {activeTab === 'inventory' && (
          <div>
            <div className="stat-grid" style={{ gridTemplateColumns: '1fr 1fr' }}>
              <div className="stat-card">
                <span className="mono">Low Stock Items (&le; 10)</span>
                <div className="stat-num" style={{ color: 'var(--rust)' }}>
                  {inventory.lowStock?.length || 0}
                </div>
              </div>
              <div className="stat-card">
                <span className="mono">Out of Stock Items (0)</span>
                <div className="stat-num" style={{ color: 'var(--rust)' }}>
                  {inventory.outOfStock?.length || 0}
                </div>
              </div>
            </div>

            <div className="admin-table-wrap">
              <h3 style={{ fontSize: '16px', padding: '16px', borderBottom: '1.5px solid var(--ink)' }}>
                Products Requiring Restock
              </h3>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Current Stock</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {inventory.lowStock && inventory.lowStock.length > 0 ? (
                    inventory.lowStock.map((p) => (
                      <tr key={p._id}>
                        <td><strong>{p.name}</strong></td>
                        <td>{p.category}</td>
                        <td style={{ color: 'var(--rust)', fontWeight: 700 }}>{p.stock}</td>
                        <td>
                          <button
                            className="btn btn-ghost btn-sm"
                            onClick={() => handleOpenEditProduct(p)}
                          >
                            Update Stock
                          </button>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'center', padding: '24px' }}>
                        All stock levels healthy!
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
