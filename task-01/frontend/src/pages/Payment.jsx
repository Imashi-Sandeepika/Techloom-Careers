import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { orderApi, paymentApi } from '../services/api';

const Payment = () => {
  const { orderId } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();
  const idempotencyKey = useState(() => `idemp-${Math.random().toString(36).substring(7)}`)[0];

  useEffect(() => {
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    try {
      const res = await orderApi.getById(orderId);
      setOrder(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePayment = async (outcome) => {
    setProcessing(true);
    try {
      await paymentApi.process({
        order_id: orderId,
        outcome: outcome,
        idempotency_key: idempotencyKey
      });
      alert(`Payment simulated with outcome: ${outcome}`);
      navigate('/orders');
    } catch (err) {
      alert(`Payment error: ${err.response?.data?.message || err.message}`);
      fetchOrder(); // refresh status
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Loading order details...</div>;
  if (!order) return <div>Order not found.</div>;

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h1>Payment Simulation</h1>
        <div className="card mt-4">
          <h3>Order Details</h3>
          <p>Order ID: {order.id}</p>
          <p>Status: <span className={`badge badge-${order.status.toLowerCase()}`}>{order.status}</span></p>
          <h2 className="mt-4">Amount to Pay: ${order.total_amount.toFixed(2)}</h2>
          
          <div className="mt-4">
            <h4>Items:</h4>
            <ul>
              {order.items.map(item => (
                <li key={item.id}>{item.quantity}x {item.product_name} - ${item.subtotal.toFixed(2)}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
      
      <div>
        <div className="card mt-12">
          <h3>Simulate Payment Gateway</h3>
          
          {order.status === 'RESERVED' ? (
            <div className="mt-4 flex flex-col gap-4">
              <button 
                className="btn btn-primary" 
                onClick={() => handlePayment('success')}
                disabled={processing}
              >
                Simulate Payment Success
              </button>
              <button 
                className="btn btn-danger" 
                onClick={() => handlePayment('failure')}
                disabled={processing}
              >
                Simulate Payment Failure
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={() => handlePayment('timeout')}
                disabled={processing}
              >
                Simulate Payment Timeout
              </button>
            </div>
          ) : (
            <div className="mt-4">
              <p>This order is {order.status}. No further payments can be made.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Payment;
