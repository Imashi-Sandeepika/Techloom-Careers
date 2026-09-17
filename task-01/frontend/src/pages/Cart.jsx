import React, { useEffect, useState } from 'react';
import { cartApi, productApi } from '../services/api';
import { useNavigate } from 'react-router-dom';
import { Trash2 } from 'lucide-react';

const Cart = () => {
  const [cart, setCart] = useState(null);
  const [loading, setLoading] = useState(true);
  const [products, setProducts] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    fetchCart();
  }, []);

  const fetchCart = async () => {
    const cartId = localStorage.getItem('cart_id');
    if (!cartId) {
      setLoading(false);
      return;
    }

    try {
      const res = await cartApi.get(cartId);
      setCart(res.data);
      
      // Fetch product details for names/prices
      const prods = {};
      await Promise.all(res.data.items.map(async item => {
        const pRes = await productApi.getById(item.product_id);
        prods[item.product_id] = pRes.data;
      }));
      setProducts(prods);

    } catch (err) {
      console.error(err);
      if (err.response?.status === 404) {
        localStorage.removeItem('cart_id');
      }
    } finally {
      setLoading(false);
    }
  };

  const removeItem = async (itemId) => {
    try {
      await cartApi.removeItem(cart.id, itemId);
      fetchCart();
    } catch (err) {
      alert("Failed to remove item");
    }
  };

  if (loading) return <div>Loading cart...</div>;
  if (!cart || cart.items.length === 0) return <div><h2>Your Cart is Empty</h2></div>;

  const total = cart.items.reduce((sum, item) => {
    const price = products[item.product_id]?.price || 0;
    return sum + (price * item.quantity);
  }, 0);

  return (
    <div>
      <h1>Shopping Cart</h1>
      <div className="card mt-4">
        <table className="w-full">
          <thead>
            <tr>
              <th>Product</th>
              <th>Price</th>
              <th>Quantity</th>
              <th>Subtotal</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {cart.items.map(item => {
              const product = products[item.product_id];
              return (
                <tr key={item.id}>
                  <td>{product?.name || 'Loading...'}</td>
                  <td>${product?.price.toFixed(2)}</td>
                  <td>{item.quantity}</td>
                  <td>${((product?.price || 0) * item.quantity).toFixed(2)}</td>
                  <td>
                    <button className="btn btn-danger" onClick={() => removeItem(item.id)}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        
        <div className="flex justify-between items-center mt-4 pt-4" style={{borderTop: '1px solid var(--border-color)'}}>
          <div>
            <p className="text-muted">Note: Stock is reserved when checkout begins.</p>
          </div>
          <div className="flex items-center gap-4">
            <h2>Total: ${total.toFixed(2)}</h2>
            <button className="btn btn-primary" onClick={() => navigate('/checkout')}>Proceed to Checkout</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cart;
