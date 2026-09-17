import React, { useEffect, useState } from 'react';
import { orderApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await orderApi.getAll();
      setOrders(res.data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (orderId) => {
    if(!window.confirm("Are you sure you want to cancel this order?")) return;
    try {
      await orderApi.cancel(orderId);
      alert("Order cancelled successfully");
      fetchOrders();
    } catch (err) {
      alert(`Error cancelling order: ${err.response?.data?.detail || err.message}`);
    }
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div>
      <h1>Orders</h1>
      <div className="table-container mt-4">
        <table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Date</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id}>
                <td>{order.id.substring(0,8)}...</td>
                <td>{new Date(order.created_at).toLocaleString()}</td>
                <td>
                  <span className={`badge badge-${order.status.toLowerCase()}`}>
                    {order.status}
                  </span>
                </td>
                <td>${order.total_amount.toFixed(2)}</td>
                <td>
                  <div className="flex gap-2">
                    {order.status === 'RESERVED' && (
                      <button className="btn btn-primary" onClick={() => navigate(`/payment/${order.id}`)}>Pay</button>
                    )}
                    {(order.status === 'RESERVED' || order.status === 'PAID') && (
                      <button className="btn btn-danger" onClick={() => handleCancel(order.id)}>Cancel</button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Orders;
