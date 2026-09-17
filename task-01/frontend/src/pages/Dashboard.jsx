import React, { useEffect, useState } from 'react';
import { productApi, orderApi, reservationApi } from '../services/api';
import { Package, ClipboardList, Clock, CheckCircle, XCircle } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState({
    products: 0,
    stock: 0,
    activeReservations: 0,
    ordersPending: 0,
    ordersPaid: 0,
    ordersFailed: 0,
  });
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [productsRes, ordersRes, reservationsRes] = await Promise.all([
          productApi.getAll(),
          orderApi.getAll(),
          reservationApi.getAll()
        ]);

        const products = productsRes.data;
        const orders = ordersRes.data;
        const reservations = reservationsRes.data;

        setStats({
          products: products.length,
          stock: products.reduce((acc, p) => acc + p.stock_quantity, 0),
          activeReservations: reservations.filter(r => r.status === 'ACTIVE').length,
          ordersPending: orders.filter(o => o.status === 'PENDING' || o.status === 'RESERVED').length,
          ordersPaid: orders.filter(o => o.status === 'PAID').length,
          ordersFailed: orders.filter(o => o.status === 'FAILED' || o.status === 'EXPIRED').length,
        });
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  return (
    <div>
      <h1>Dashboard</h1>
      <div className="grid grid-cols-3 gap-4 mt-4">
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: '0.5rem' }}>
            <Package size={32} color="var(--accent-primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.products}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: '0.5rem' }}>
            <Package size={32} color="var(--status-warning)" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.stock}</h3>
            <p>Total Available Stock</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: '0.5rem' }}>
            <Clock size={32} color="var(--status-info)" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.activeReservations}</h3>
            <p>Active Reservations</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: '0.5rem' }}>
            <ClipboardList size={32} color="var(--text-primary)" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.ordersPending}</h3>
            <p>Pending/Reserved Orders</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: '0.5rem' }}>
            <CheckCircle size={32} color="var(--status-success)" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.ordersPaid}</h3>
            <p>Paid Orders</p>
          </div>
        </div>
        <div className="card flex items-center gap-4">
          <div style={{ padding: '1rem', backgroundColor: 'var(--bg-hover)', borderRadius: '0.5rem' }}>
            <XCircle size={32} color="var(--status-danger)" />
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{stats.ordersFailed}</h3>
            <p>Failed/Expired Orders</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
