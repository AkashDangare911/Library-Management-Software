import React, { useEffect, useState } from 'react';
import { fetchAdminSettings, updateAdminSettings } from '../../../utils/adminApi';
import { useToast } from '../../../context/ToastContext';
import type { AppSettings } from '../../../types';

export const Settings = () => {
  const { addToast } = useToast();

  const [settings, setSettings] = useState<AppSettings>({});
  const [loading, setLoading] = useState(true);

  const handlePenaltyChange = (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, daily_penalty_amount: e.target.value });
  const handleResDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, reservation_duration_hours: e.target.value });
  const handleBorrowDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => setSettings({ ...settings, borrow_duration_days: e.target.value });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const res = await fetchAdminSettings();
        setSettings(res.data);
      } catch (err: any) {
        addToast(err.response?.data?.error || "Failed to load settings data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [addToast]);

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateAdminSettings(settings);
      addToast("Settings updated successfully", "success");
    } catch (err: any) {
      addToast(err.response?.data?.error || "Error updating settings", "error");
    }
  };

  if (loading && Object.keys(settings).length === 0) return <div className="loading-state">Loading settings...</div>;

  return (
    <form className="settings-form" onSubmit={handleSettingsUpdate}>
      <div className="form-group">
        <label>Daily Penalty Amount (₹)</label>
        <input
          type="number"
          value={settings.daily_penalty_amount || ''}
          onChange={handlePenaltyChange}
        />
      </div>
      <div className="form-group">
        <label>Reservation Duration (Hours)</label>
        <input
          type="number"
          value={settings.reservation_duration_hours || ''}
          onChange={handleResDurationChange}
        />
      </div>
      <div className="form-group">
        <label>Borrow Duration (Days)</label>
        <input
          type="number"
          value={settings.borrow_duration_days || ''}
          onChange={handleBorrowDurationChange}
        />
      </div>
      <button type="submit" className="btn-submit">Save Settings</button>
    </form>
  );
};
