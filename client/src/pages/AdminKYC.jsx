import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminKYC = () => {
  const [kycs, setKycs] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const adminAuth = localStorage.getItem('admin_auth');
  const API_BASE = import.meta.env.VITE_REACT_API_URI.replace(/\/$/, '');

  useEffect(() => {
    if (!adminAuth) {
      navigate('/admin-login');
      return;
    }

    fetch(`${API_BASE}/kyc?auth=${adminAuth}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Unauthorized or server error');
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Expected JSON but got: ${text.slice(0, 100)}`);
        }
        return res.json();
      })
      .then((data) => setKycs(data))
      .catch((err) => {
        console.error('Fetch error:', err);
        setError('Failed to load KYC submissions. Please login again.');
        localStorage.removeItem('admin_auth');
        navigate('/admin-login');
      });
  }, [navigate, adminAuth, API_BASE]);

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`${API_BASE}/kyc/${id}/status?auth=${adminAuth}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) throw new Error('Failed to update status');

      setKycs((prev) =>
        prev.map((k) => (k._id === id ? { ...k, status } : k))
      );
    } catch (err) {
      console.error(err);
      alert('Failed to update KYC status');
    }
  };

  const deleteKyc = async (id) => {
    if (!window.confirm('Are you sure you want to delete this KYC submission?')) return;

    try {
      const res = await fetch(`${API_BASE}/kyc/${id}?auth=${adminAuth}`, {
        method: 'DELETE',
      });

      if (!res.ok) throw new Error('Failed to delete KYC');
      setKycs((prev) => prev.filter((k) => k._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete KYC');
    }
  };

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">KYC Submissions</h2>
      {kycs.length === 0 && <p>No KYC submissions found.</p>}
      {kycs.map((k) => (
        <div key={k._id} className="border p-4 rounded mb-4 shadow">
          <p><strong>Name:</strong> {k.fullName}</p>
          <p><strong>ID Number:</strong> {k.idNumber}</p>
          <p><strong>Photo:</strong>{' '}
            <a href={k.photoUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">
              View ID
            </a>
          </p>
          <p>
            <strong>Status:</strong> {k.status}
            {k.status === 'approved' && (
              <span className="ml-2 px-2 py-1 text-xs bg-green-100 text-green-700 rounded">
                KYC Verified
              </span>
            )}
          </p>
          <div className="mt-2 space-x-2">
            <button onClick={() => updateStatus(k._id, 'approved')} className="btn btn-success">
              Approve
            </button>
            <button onClick={() => updateStatus(k._id, 'rejected')} className="btn btn-danger">
              Reject
            </button>
            <button onClick={() => deleteKyc(k._id)} className="btn btn-outline-danger">
              Delete
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default AdminKYC;
