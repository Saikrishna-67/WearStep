import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { api } from '../services/api';

const TRACK_STAGES = ['Placed', 'Shipped', 'Delivered'];

export const MyOrders = ({ onOpenAuth }) => {
  const navigate = useNavigate();
  const { isLoggedIn, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn) {
      showToast('Please login to view your orders');
      onOpenAuth();
      return;
    }
    fetchOrders();
  }, [isLoggedIn, authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await api.getMyOrders();
      if (res.success && res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelOrder = async (orderId) => {
    if (!window.confirm('Are you sure you want to cancel this order?')) return;

    try {
      const res = await api.cancelOrder(orderId);
      if (res.success) {
        showToast('Order cancelled successfully. Stock restored.');
        fetchOrders();
      }
    } catch (err) {
      showToast(err.message || 'Could not cancel order');
    }
  };

  const fmt = (n) => '₹' + Number(n).toLocaleString('en-IN');

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <span className="mono" style={{ color: 'var(--steel)' }}>
          Loading your orders...
        </span>
      </div>
    );
  }

  return (
    <div id="view-orders">
      <div className="orders-wrap">
        <h2 style={{ fontSize: 'clamp(28px, 4vw, 42px)', marginBottom: '28px' }}>
          My Orders ({orders.length})
        </h2>

        {orders.length === 0 ? (
          <div className="empty-state">
            <div className="emoji">📦</div>
            <p>You have not placed any orders yet.</p>
            <button className="btn btn-primary" onClick={() => navigate('/shop')}>
              Start Shopping
            </button>
          </div>
        ) : (
          <div id="ordersContent">
            {orders.map((o) => {
              const stageIdx =
                o.orderStatus === 'Cancelled' ? -1 : TRACK_STAGES.indexOf(o.orderStatus);

              const formattedDate = new Date(o.createdAt).toLocaleDateString('en-IN', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              });

              return (
                <div className="order-card" key={o.orderId || o._id}>
                  {/* CARD HEADER */}
                  <div className="order-card-head">
                    <div>
                      <span className="order-id-txt">{o.orderId}</span>
                      <span
                        className="mono"
                        style={{ color: 'var(--steel)', marginLeft: '12px' }}
                      >
                        {formattedDate}
                      </span>
                    </div>
                    <span className={`status-badge status-${o.orderStatus}`}>
                      {o.orderStatus}
                    </span>
                  </div>

                  {/* ITEMS THUMBNAILS */}
                  <div className="order-items-row">
                    {o.items.map((item, idx) => (
                      <img
                        key={idx}
                        src={item.image}
                        alt={item.name}
                        title={`${item.name} (${item.size}, ${item.color}) × ${item.quantity}`}
                      />
                    ))}
                  </div>

                  {/* TRACKING PROGRESS BAR */}
                  {o.orderStatus !== 'Cancelled' && (
                    <div className="track-steps">
                      {TRACK_STAGES.map((s, i) => (
                        <div
                          key={s}
                          className={`track-step ${i <= stageIdx ? 'done' : ''}`}
                        >
                          <div className="track-line"></div>
                          <div className="tdot"></div>
                          <span>{s}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CARD FOOTER */}
                  <div className="order-card-foot">
                    <span className="mono" style={{ color: 'var(--steel)' }}>
                      {o.items.length} item(s) · Total: {fmt(o.total)}
                    </span>

                    {o.orderStatus === 'Placed' && (
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleCancelOrder(o.orderId)}
                      >
                        Cancel Order
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
