import React, { useEffect, useState } from 'react';
import { fetchAdminSettings, updateAdminSettings } from '../../../utils/adminApi';
import { useToast } from '../../../context/ToastContext';

export const Settings = () => {
  const { addToast } = useToast();
  
  const [settings, setSettings] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        const res = await fetchAdminSettings();
        if (res.ok) setSettings(await res.json());
      } catch (err) {
        addToast("Failed to load settings data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, [addToast]);

  const handleSettingsUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await updateAdminSettings(settings);
      if (res.ok) {
        addToast("Settings updated successfully", "success");
      } else {
        addToast("Failed to update settings", "error");
      }
    } catch (err) {
      addToast("Error updating settings", "error");
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
          onChange={e => setSettings({...settings, daily_penalty_amount: e.target.value})} 
        />
      </div>
      <div className="form-group">
        <label>Reservation Duration (Hours)</label>
        <input 
          type="number" 
          value={settings.reservation_duration_hours || ''} 
          onChange={e => setSettings({...settings, reservation_duration_hours: e.target.value})} 
        />
      </div>
      <div className="form-group">
        <label>Borrow Duration (Days)</label>
        <input 
          type="number" 
          value={settings.borrow_duration_days || ''} 
          onChange={e => setSettings({...settings, borrow_duration_days: e.target.value})} 
        />
      </div>
      <button type="submit" className="btn-submit">Save Settings</button>
    </form>
  );
};
