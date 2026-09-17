import React, { useEffect, useState } from 'react';
import { cartApi, productApi, checkoutApi } from '../services/api';
import { useNavigate } from 'react-router-dom';

const Checkout = () => {
  const [cart, setCart] = useState(null);
  const [products, setProducts] = useState({});
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const cartId = localStorage.getItem('cart_id');
    if (!cartId) {
      navigate('/cart');
      return;
    }
    try {
      const res = await cartApi.get(cartId);
      if (res.data.items.length === 0) navigate('/cart');
      setCart(res.data);
      
      const prods = {};
      await Promise.all(res.data.items.map(async item => {
        const pRes = await productApi.getById(item.product_id);
        prods[item.product_id] = pRes.data;
      }));
      setProducts(prods);
    } catch (err) {
      navigate('/cart');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckout = async () => {
    setProcessing(true);
    setError(null);
    try {
      const res = await checkoutApi.process(cart.id);
      localStorage.removeItem('cart_id');
      navigate(`/payment/${res.data.order.id}`);
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.detail?.message || "Checkout failed");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  const total = cart.items.reduce((sum, item) => sum + ((products[item.product_id]?.price || 0) * item.quantity), 0);

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h1>Checkout</h1>
        <div className="card mt-4">
          <h3>Order Summary</h3>
          <ul style={{listStyle: 'none', padding: 0, marginTop: '1rem'}}>
            {cart.items.map(item => {
              const product = products[item.product_id];
              return (
                <li key={item.id} className="flex justify-between py-2 border-b" style={{borderBottomColor: 'var(--border-color)'}}>
                  <span>{item.quantity}x {product?.name}</span>
                  <span>${((product?.price || 0) * item.quantity).toFixed(2)}</span>
                </li>
              );
            })}
          </ul>
          <div className="flex justify-between mt-4">
            <h2>Total</h2>
            <h2>${total.toFixed(2)}</h2>
          </div>
        </div>
      </div>
      
      <div>
        <div className="card mt-12">
          <h3>Confirm Reservation</h3>
          <p className="mt-4 text-muted">Clicking the button below will lock the items in your cart and reserve the stock for 5 minutes.</p>
          
          {error && (
            <div style={{backgroundColor: 'var(--status-danger)', padding: '1rem', borderRadius: '0.25rem', marginTop: '1rem'}}>
              {error}
            </div>
          )}

          <button 
            className="btn btn-primary w-full mt-4" 
            style={{padding: '1rem', fontSize: '1.1rem'}}
            onClick={handleCheckout}
            disabled={processing}
          >
            {processing ? 'Reserving Stock...' : 'Reserve Stock & Continue'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
