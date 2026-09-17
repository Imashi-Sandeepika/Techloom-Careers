import React, { useEffect, useState } from 'react';
import { reservationApi } from '../services/api';

const Reservations = () => {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReservations();
    const interval = setInterval(fetchReservations, 5000); // Auto-refresh for demo
    return () => clearInterval(interval);
  }, []);

  const fetchReservations = async () => {
    try {
      const res = await reservationApi.getAll();
      setReservations(res.data.sort((a,b) => new Date(b.created_at) - new Date(a.created_at)));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleExpire = async (id) => {
    try {
      await reservationApi.expire(id);
      fetchReservations();
    } catch (err) {
      alert("Error expiring reservation");
    }
  };

  if (loading) return <div>Loading reservations...</div>;

  return (
    <div>
      <h1>Stock Reservations</h1>
      <div className="table-container mt-4">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Order ID</th>
              <th>Product ID</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Expires At</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map(res => (
              <tr key={res.id}>
                <td>{res.id.substring(0,8)}...</td>
                <td>{res.order_id ? res.order_id.substring(0,8) + '...' : '-'}</td>
                <td>{res.product_id}</td>
                <td>{res.quantity}</td>
                <td>
                  <span className={`badge badge-${res.status.toLowerCase()}`}>
                    {res.status}
                  </span>
                </td>
                <td>{new Date(res.expires_at).toLocaleTimeString()}</td>
                <td>
                  {res.status === 'ACTIVE' && (
                    <button className="btn btn-secondary" onClick={() => handleExpire(res.id)}>Expire Now (Test)</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reservations;
