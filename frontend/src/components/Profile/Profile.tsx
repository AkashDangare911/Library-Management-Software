import React, { useState } from 'react';
import { User, Heart, Lock, BookOpen, Star } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

// Tabs
import { BorrowingsTab } from './tabs/BorrowingsTab';
import { FavoritesTab } from './tabs/FavoritesTab';
import { ReviewsTab } from './tabs/ReviewsTab';
import { SecurityTab } from './tabs/SecurityTab';

import './profile.css';

export const Profile = () => {
  const { user } = useAuth();
  const isStaff = user?.role === 'admin' || user?.role === 'librarian';

  const [activeTab, setActiveTab] = useState<'borrowings' | 'favorites' | 'reviews' | 'security'>(isStaff ? 'favorites' : 'borrowings');

  const handleTabChange = (tab: 'borrowings' | 'favorites' | 'reviews' | 'security') => setActiveTab(tab);

  return (
    <div className="profile-dashboard">
      {/* LHS Sidebar */}
      <aside className="profile-sidebar">
        <div className="sidebar-user">
          <div className="profile-avatar-large">
            <User size={64} color="var(--bg-color)" />
          </div>
          <h2 className="profile-title">{user?.name || 'User Profile'}</h2>
        </div>

        <nav className="sidebar-nav">
          {!isStaff && (
            <button
              className={`sidebar-btn ${activeTab === 'borrowings' ? 'active' : ''}`}
              onClick={() => handleTabChange('borrowings')}
            >
              <BookOpen size={20} /> My Borrowings
            </button>
          )}
          <button
            className={`sidebar-btn ${activeTab === 'favorites' ? 'active' : ''}`}
            onClick={() => handleTabChange('favorites')}
          >
            <Heart size={20} /> My Favorites
          </button>
          {!isStaff && (
            <button
              className={`sidebar-btn ${activeTab === 'reviews' ? 'active' : ''}`}
              onClick={() => handleTabChange('reviews')}
            >
              <Star size={20} /> My Reviews
            </button>
          )}
          <button
            className={`sidebar-btn ${activeTab === 'security' ? 'active' : ''}`}
            onClick={() => handleTabChange('security')}
          >
            <Lock size={20} /> Security & Password
          </button>
        </nav>
      </aside>

      {/* RHS Main Panel */}
      <main className="profile-main">
        {activeTab === 'borrowings' && !isStaff && <BorrowingsTab />}
        {activeTab === 'favorites' && <FavoritesTab />}
        {activeTab === 'reviews' && !isStaff && <ReviewsTab />}
        {activeTab === 'security' && <SecurityTab />}
      </main>
    </div>
  );
};
