import React, { useEffect, useState } from 'react';
import { productApi, cartApi } from '../services/api';
import { ShoppingCart } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await productApi.getAll();
      setProducts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async (product) => {
    setAddingToCart(true);
    try {
      let cartId = localStorage.getItem('cart_id');
      if (!cartId) {
        const cartRes = await cartApi.create();
        cartId = cartRes.data.id;
        localStorage.setItem('cart_id', cartId);
      }
      await cartApi.addItem(cartId, { product_id: product.id, quantity: 1 });
      alert(`Added ${product.name} to cart!`);
    } catch (err) {
      alert("Failed to add to cart");
    } finally {
      setAddingToCart(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Products</h1>
        <button className="btn btn-primary">Add Product</button>
      </div>
      
      <div className="grid grid-cols-4 gap-4">
        {products.map(p => (
          <div key={p.id} className="card flex flex-col justify-between">
            <div>
              <h3>{p.name}</h3>
              <p>{p.description}</p>
              <h2 className="mt-4">${p.price.toFixed(2)}</h2>
              <p className="mb-4">Available: {p.stock_quantity}</p>
            </div>
            <button 
              className="btn btn-primary w-full"
              disabled={p.stock_quantity <= 0 || addingToCart}
              onClick={() => handleAddToCart(p)}
            >
              <ShoppingCart size={16} style={{marginRight: '8px'}}/> 
              {p.stock_quantity <= 0 ? 'Out of Stock' : 'Add to Cart'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Products;
