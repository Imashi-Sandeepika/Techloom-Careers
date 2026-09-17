import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, CreditCard, ClipboardList, Clock, Beaker } from 'lucide-react';

const Sidebar = () => {
  return (
    <div className="sidebar">
      <div className="sidebar-brand">
        Techloom POS
      </div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <LayoutDashboard size={20} /> Dashboard
        </NavLink>
        <NavLink to="/products" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Package size={20} /> Products
        </NavLink>
        <NavLink to="/cart" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <ShoppingCart size={20} /> Cart
        </NavLink>
        <NavLink to="/orders" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <ClipboardList size={20} /> Orders
        </NavLink>
        <NavLink to="/reservations" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Clock size={20} /> Reservations
        </NavLink>
        <NavLink to="/test-lab" className={({isActive}) => isActive ? "nav-link active" : "nav-link"}>
          <Beaker size={20} /> Test Lab
        </NavLink>
      </nav>
    </div>
  );
};

export default Sidebar;
