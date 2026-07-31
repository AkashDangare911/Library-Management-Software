import React, { useEffect, useState } from 'react';
import { fetchAdminStats } from '../../../utils/adminApi';
import { useToast } from '../../../context/ToastContext';

export const Overview = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const loadStats = async () => {
      try {
        const res = await fetchAdminStats();
        if (res.ok) {
          setStats(await res.json());
        } else {
          addToast("Failed to load overview data", "error");
        }
      } catch (err) {
        console.error(err);
        addToast("Failed to load overview data", "error");
      } finally {
        setLoading(false);
      }
    };
    loadStats();
  }, [addToast]);

  if (loading) return <div className="loading-state">Loading data...</div>;
  if (!stats) return <div className="empty-state">No stats available.</div>;

  return (
    <div className="kpi-grid">
      <div className="kpi-card">
        <div className="kpi-title">Total Users</div>
        <div className="kpi-value">{stats.totalUsers}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Total Book Titles</div>
        <div className="kpi-value">{stats.totalTitles}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Total Book Copies</div>
        <div className="kpi-value">{stats.totalCopies}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Issued Books</div>
        <div className="kpi-value">{stats.issuedBooks}</div>
      </div>
      <div className="kpi-card">
        <div className="kpi-title">Revenue (Penalties)</div>
        <div className="kpi-value">₹{stats.totalRevenue}</div>
      </div>
    </div>
  );
};
