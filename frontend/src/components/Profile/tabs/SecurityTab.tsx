import React, { useState } from 'react';
import { KeyRound, Eye, EyeOff } from 'lucide-react';
import { resetPassword } from '../../../utils/api';
import { useToast } from '../../../context/ToastContext';

export const SecurityTab = () => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [inlineError, setInlineError] = useState('');

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const { addToast } = useToast();

  const handleCurrentPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setCurrentPassword(e.target.value);
  const handleNewPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setNewPassword(e.target.value);
  const handleConfirmPasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value);

  const toggleCurrentPassword = () => setShowCurrentPassword(prev => !prev);
  const toggleNewPassword = () => setShowNewPassword(prev => !prev);
  const toggleConfirmPassword = () => setShowConfirmPassword(prev => !prev);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setInlineError('New passwords do not match.');
      return;
    }
    
    setIsResetting(true);
    setInlineError('');

    try {
      const res = await resetPassword(currentPassword, newPassword);
      const data = await res.json();

      if (res.ok) {
        addToast(data.message, 'success');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
      } else {
        setInlineError(data.message || 'Failed to update password.');
      }
    } catch (error) {
      setInlineError('An error occurred. Please try again.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="profile-panel fade-in">
      <h2><KeyRound size={24} color="var(--primary-color)" style={{ verticalAlign: 'middle', marginRight: '0.5rem' }} /> Reset Password</h2>
      <p className="panel-subtitle">Update your account password. A fresh session will be issued upon success.</p>

      <form className="reset-password-form" onSubmit={handleResetPassword}>
        {inlineError && (
          <div className="status-msg error">
            {inlineError}
          </div>
        )}

        <div className="form-group">
          <label>Current Password</label>
          <div className="password-input-wrapper">
            <input
              type={showCurrentPassword ? "text" : "password"}
              value={currentPassword}
              onChange={handleCurrentPasswordChange}
              placeholder="Enter current password"
            />
            <button type="button" className="eye-btn" onClick={toggleCurrentPassword}>
              {showCurrentPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={handleNewPasswordChange}
              placeholder="Enter new password"
            />
            <button type="button" className="eye-btn" onClick={toggleNewPassword}>
              {showNewPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <div className="form-group">
          <label>Confirm New Password</label>
          <div className="password-input-wrapper">
            <input
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={handleConfirmPasswordChange}
              placeholder="Re-enter new password"
            />
            <button type="button" className="eye-btn" onClick={toggleConfirmPassword}>
              {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
            </button>
          </div>
        </div>

        <button type="submit" className="borrow-btn reset-btn" disabled={isResetting}>
          {isResetting ? 'Updating...' : 'Update Password'}
        </button>
      </form>
    </div>
  );
};
