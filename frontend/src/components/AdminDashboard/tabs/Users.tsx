import React, { useEffect, useState } from 'react';
import { fetchAllUsers, updateUserRole, deleteUser } from '../../../utils/adminApi';
import { useToast } from '../../../context/ToastContext';
import { useAuth } from '../../../context/AuthContext';

export const Users = () => {
  const { user } = useAuth();
  const { addToast } = useToast();
  const [usersList, setUsersList] = useState<any[]>([]);
  const [userRoleFilter, setUserRoleFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

  // Modals
  const [deletingUser, setDeletingUser] = useState<{ id: number, name: string } | null>(null);
  const [roleChangeAction, setRoleChangeAction] = useState<{ id: number, name: string, newRole: string } | null>(null);

  const loadData = async () => {
    setLoading(true);
    try {
      const res = await fetchAllUsers();
      if (res.ok) setUsersList(await res.json());
    } catch (err) {
      addToast("Failed to load users data", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleRoleChange = async (userId: number, role: string) => {
    try {
      const res = await updateUserRole(userId, role);
      if (res.ok) {
        addToast("Role updated successfully", "success");
        loadData();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to update role", "error");
      }
    } catch (err) {
      addToast("Error updating role", "error");
    } finally {
      setRoleChangeAction(null);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUser) return;
    try {
      const res = await deleteUser(deletingUser.id);
      if (res.ok) {
        addToast("User deleted successfully", "success");
        setDeletingUser(null);
        loadData();
      } else {
        const data = await res.json();
        addToast(data.error || "Failed to delete user", "error");
      }
    } catch (err) {
      addToast("Error deleting user", "error");
    }
  };

  if (loading) return <div className="loading-state">Loading users...</div>;

  return (
    <>
      <div className="admin-table-container">
        <div className="flex-between">
          <h2>Manage Users</h2>
          <select 
            value={userRoleFilter} 
            onChange={(e) => setUserRoleFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: '4px', background: 'var(--bg-start)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
          >
            <option value="ALL">All Roles</option>
            <option value="member">Members</option>
            <option value="librarian">Librarians</option>
            <option value="admin">Admins</option>
          </select>
        </div>
        {usersList.filter(u => userRoleFilter === 'ALL' || u.role === userRoleFilter).length === 0 ? (
          <div className="empty-state">No users found for this filter.</div>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Joined</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {usersList.filter(u => userRoleFilter === 'ALL' || u.role === userRoleFilter).map((u) => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select 
                      value={u.role} 
                      onChange={(e) => setRoleChangeAction({ id: u.id, name: u.name, newRole: e.target.value })}
                      disabled={u.id === user?.id}
                    >
                      <option value="member">Member</option>
                      <option value="librarian">Librarian</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td>{new Date(u.created_at).toLocaleDateString()}</td>
                  <td>
                    {u.id !== user?.id && (
                      <button className="btn-sm btn-danger" onClick={() => setDeletingUser({ id: u.id, name: u.name })}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {deletingUser && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Delete User</h3>
            <p>Are you sure you want to delete <strong>{deletingUser.name}</strong> from the system? This will also remove their borrowing history and favorites.</p>
            <div className="modal-actions">
              <button className="btn-sm" onClick={() => setDeletingUser(null)}>Cancel</button>
              <button className="btn-sm btn-danger" onClick={confirmDeleteUser}>Delete User</button>
            </div>
          </div>
        </div>
      )}

      {roleChangeAction && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirm Role Change</h3>
            <p>Are you sure you want to change <strong>{roleChangeAction.name}</strong>'s role to <strong>{roleChangeAction.newRole}</strong>?</p>
            <div className="modal-actions">
              <button className="btn-sm" onClick={() => setRoleChangeAction(null)}>Cancel</button>
              <button className="btn-sm btn-primary" onClick={() => handleRoleChange(roleChangeAction.id, roleChangeAction.newRole)}>Confirm Change</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
