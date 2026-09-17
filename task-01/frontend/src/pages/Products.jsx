import React, { useEffect, useState } from 'react';
import { productApi, cartApi } from '../services/api';
import { ShoppingCart, X } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [newProduct, setNewProduct] = useState({ name: '', description: '', price: '', stock_quantity: '' });
  const [submitting, setSubmitting] = useState(false);

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

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productApi.create({
        ...newProduct,
        price: parseFloat(newProduct.price),
        stock_quantity: parseInt(newProduct.stock_quantity, 10)
      });
      setShowModal(false);
      setNewProduct({ name: '', description: '', price: '', stock_quantity: '' });
      fetchProducts(); // Refresh list
    } catch (err) {
      console.error(err);
      alert("Failed to add product");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-4">
        <h1>Products</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>Add Product</button>
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

      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Add New Product</h2>
              <button onClick={() => setShowModal(false)} className="close-btn">
                <X size={24} />
              </button>
            </div>
            <form onSubmit={handleAddProduct}>
              <div className="form-group">
                <label className="form-label">Name</label>
                <input 
                  type="text" 
                  required
                  className="form-control" 
                  value={newProduct.name}
                  onChange={e => setNewProduct({...newProduct, name: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea 
                  className="form-control" 
                  value={newProduct.description}
                  onChange={e => setNewProduct({...newProduct, description: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Price ($)</label>
                <input 
                  type="number" 
                  step="0.01" 
                  required
                  className="form-control" 
                  value={newProduct.price}
                  onChange={e => setNewProduct({...newProduct, price: e.target.value})}
                />
              </div>
              <div className="form-group">
                <label className="form-label">Stock Quantity</label>
                <input 
                  type="number" 
                  required
                  className="form-control" 
                  value={newProduct.stock_quantity}
                  onChange={e => setNewProduct({...newProduct, stock_quantity: e.target.value})}
                />
              </div>
              <button type="submit" className="btn btn-primary w-full" disabled={submitting}>
                {submitting ? 'Adding...' : 'Save Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
