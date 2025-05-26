import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminKYC = () => {
  const [kycs, setKycs] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const adminAuth = localStorage.getItem('admin_auth');

  // Base API URL from env variable (remove trailing slash if any)
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

  if (error) {
    return <div className="p-4 text-red-600">{error}</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">KYC Submissions</h2>
      {kycs.length === 0 && <p>No KYC submissions found.</p>}
      {kycs.map((k) => (
        <div key={k._id} className="border p-2 rounded mb-2">
          <p><strong>Name:</strong> {k.fullName}</p>
          <p><strong>ID:</strong> {k.idNumber}</p>
          <img src={k.photoUrl} alt="User ID" className="w-32 h-32 object-cover" />
          <p>Status: <strong>{k.status}</strong></p>
          <button
            onClick={() => updateStatus(k._id, 'approved')}
            className="btn btn-success mr-2"
          >
            Approve
          </button>
          <button
            onClick={() => updateStatus(k._id, 'rejected')}
            className="btn btn-danger"
          >
            Reject
          </button>
        </div>
      ))}
    </div>
  );
};

export default AdminKYC;
