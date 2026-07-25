import React from 'react';
import { User } from 'lucide-react';
import './profile.css';

export const Profile = () => {
  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-avatar-large">
          <User size={64} color="var(--bg-color)" />
        </div>
        <h1 className="profile-title">User Profile</h1>
        <p className="profile-subtitle">Manage your account and library history.</p>
      </div>
      
      <div className="profile-content">
        <div className="profile-placeholder">
          <p>Your reading journey and profile details will be displayed here soon.</p>
          <p>Stay tuned for future updates!</p>
        </div>
      </div>
    </div>
  );
};
