import React from 'react';
import { User } from 'lucide-react';

const Header = () => {
  return (
    <header className="header">
      <div className="header-title">
        <h2>Order & Inventory System</h2>
      </div>
      <div className="header-user">
        <div className="flex items-center gap-2">
          <User size={20} />
          <span>Admin User</span>
        </div>
      </div>
    </header>
  );
};

export default Header;
