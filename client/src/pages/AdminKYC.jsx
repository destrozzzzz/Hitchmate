import React, { useEffect, useState } from 'react';

const AdminKYC = () => {
  const [kycs, setKycs] = useState([]);

  useEffect(() => {
    fetch('/api/kyc/all', {
      headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
    })
      .then(res => res.json())
      .then(data => setKycs(data));
  }, []);

  const updateStatus = async (id, status) => {
    await fetch(`/api/kyc/update/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('token')}` },
      body: JSON.stringify({ status }),
    });
    setKycs((prev) => prev.map(k => (k._id === id ? { ...k, status } : k)));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">KYC Submissions</h2>
      {kycs.map(k => (
        <div key={k._id} className="border p-2 rounded mb-2">
          <p><strong>Name:</strong> {k.fullName}</p>
          <p><strong>ID:</strong> {k.idNumber}</p>
          <img src={k.photoUrl} alt="User ID" className="w-32 h-32 object-cover" />
          <p>Status: <strong>{k.status}</strong></p>
          <button onClick={() => updateStatus(k._id, 'approved')} className="btn btn-success mr-2">Approve</button>
          <button onClick={() => updateStatus(k._id, 'rejected')} className="btn btn-danger">Reject</button>
        </div>
      ))}
    </div>
  );
};

export default AdminKYC;
