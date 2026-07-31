import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import './AdminDashboard.css';

import { Overview } from './tabs/Overview';
import { Users } from './tabs/Users';
import { AllBooks } from './tabs/AllBooks';
import { AddBook } from './tabs/AddBook';
import { Borrowings } from './tabs/Borrowings';
import { Settings } from './tabs/Settings';

export const AdminDashboard = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'USERS' | 'ALL BOOKS' | 'ADD BOOK' | 'BORROWINGS' | 'SETTINGS'>('OVERVIEW');

  useEffect(() => {
    if (!isLoading && (!user || (user.role !== 'admin' && user.role !== 'librarian'))) {
      navigate('/');
    } else if (user && user.role === 'librarian' && activeTab !== 'ALL BOOKS' && activeTab !== 'ADD BOOK') {
      setActiveTab('ALL BOOKS');
    }
  }, [user, isLoading, navigate, activeTab]);

  if (isLoading || !user) return <div className="loading-state">Loading...</div>;

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>{user.role === 'admin' ? 'Admin Dashboard' : 'Library Management'}</h1>
        <p>{user.role === 'admin' ? 'System Overview & Management' : 'Manage Library Books'}</p>
      </div>

      <div className="admin-tabs">
        {['OVERVIEW', 'USERS', 'ALL BOOKS', 'ADD BOOK', 'BORROWINGS', 'SETTINGS']
          .filter(tab => user.role === 'admin' || tab === 'ALL BOOKS' || tab === 'ADD BOOK')
          .map((tab) => (
          <button 
            key={tab}
            className={`admin-tab-btn ${activeTab === tab ? 'active' : ''}`}
            onClick={() => setActiveTab(tab as any)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === 'OVERVIEW' && <Overview />}
        {activeTab === 'USERS' && <Users />}
        {activeTab === 'ALL BOOKS' && <AllBooks />}
        {activeTab === 'ADD BOOK' && <AddBook onSuccess={() => setActiveTab('ALL BOOKS')} />}
        {activeTab === 'BORROWINGS' && <Borrowings />}
        {activeTab === 'SETTINGS' && <Settings />}
      </div>
    </div>
  );
};
