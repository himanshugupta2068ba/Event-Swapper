import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';

const Requests = () => {
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [outgoingRequests, setOutgoingRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [incoming, outgoing] = await Promise.all([
        api.get('/swaps/requests/incoming'),
        api.get('/swaps/requests/outgoing')
      ]);
      setIncomingRequests(incoming.data);
      setOutgoingRequests(outgoing.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching requests:', error);
      setLoading(false);
    }
  };

  const handleResponse = async (requestId, accepted) => {
    try {
      await api.post(`/swaps/swap-response/${requestId}`, { accepted });
      setMessage(accepted ? 'Swap accepted successfully!' : 'Swap rejected.');
      fetchRequests();
      // Redirect to dashboard to see updated calendar
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error processing request');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusBadge = (status) => {
    const colors = {
      PENDING: '#ffc107',
      ACCEPTED: '#28a745',
      REJECTED: '#dc3545'
    };
    return (
      <span
        style={{
          padding: '5px 10px',
          borderRadius: '3px',
          backgroundColor: colors[status] || '#6c757d',
          color: 'white',
          fontSize: '14px'
        }}
      >
        {status}
      </span>
    );
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Swap Requests</h1>

      {message && (
        <div className={message.includes('Error') ? 'error' : 'success'} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginTop: '20px' }}>
        {/* Incoming Requests */}
        <div className="card">
          <h2>Incoming Requests</h2>
          {incomingRequests.length === 0 ? (
            <p style={{ marginTop: '20px', color: '#666' }}>No incoming requests</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              {incomingRequests.map((request) => (
                <div
                  key={request._id}
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <div style={{ marginBottom: '10px' }}>
                    <strong>{request.requesterId?.name}</strong> wants to swap:
                  </div>
                  <div style={{ marginBottom: '10px', paddingLeft: '15px', borderLeft: '3px solid #007bff' }}>
                    <p style={{ marginBottom: '5px' }}>
                      <strong>Their slot:</strong> {request.requesterSlotId?.title}
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {formatDate(request.requesterSlotId?.startTime)} - {formatDate(request.requesterSlotId?.endTime)}
                    </p>
                  </div>
                  <div style={{ marginBottom: '15px', paddingLeft: '15px', borderLeft: '3px solid #28a745' }}>
                    <p style={{ marginBottom: '5px' }}>
                      <strong>Your slot:</strong> {request.targetSlotId?.title}
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {formatDate(request.targetSlotId?.startTime)} - {formatDate(request.targetSlotId?.endTime)}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button
                      onClick={() => handleResponse(request._id, true)}
                      className="btn btn-success"
                      style={{ flex: 1 }}
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => handleResponse(request._id, false)}
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                    >
                      Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Outgoing Requests */}
        <div className="card">
          <h2>Outgoing Requests</h2>
          {outgoingRequests.length === 0 ? (
            <p style={{ marginTop: '20px', color: '#666' }}>No outgoing requests</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '20px' }}>
              {outgoingRequests.map((request) => (
                <div
                  key={request._id}
                  style={{
                    padding: '15px',
                    border: '1px solid #ddd',
                    borderRadius: '5px',
                    backgroundColor: '#f9f9f9'
                  }}
                >
                  <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <strong>To:</strong> {request.targetUserId?.name}
                    </div>
                    {getStatusBadge(request.status)}
                  </div>
                  <div style={{ marginBottom: '10px', paddingLeft: '15px', borderLeft: '3px solid #007bff' }}>
                    <p style={{ marginBottom: '5px' }}>
                      <strong>Your slot:</strong> {request.requesterSlotId?.title}
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {formatDate(request.requesterSlotId?.startTime)} - {formatDate(request.requesterSlotId?.endTime)}
                    </p>
                  </div>
                  <div style={{ paddingLeft: '15px', borderLeft: '3px solid #28a745' }}>
                    <p style={{ marginBottom: '5px' }}>
                      <strong>Their slot:</strong> {request.targetSlotId?.title}
                    </p>
                    <p style={{ fontSize: '14px', color: '#666' }}>
                      {formatDate(request.targetSlotId?.startTime)} - {formatDate(request.targetSlotId?.endTime)}
                    </p>
                  </div>
                  {request.status === 'PENDING' && (
                    <p style={{ marginTop: '10px', color: '#ffc107', fontStyle: 'italic' }}>
                      Waiting for response...
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Requests;
