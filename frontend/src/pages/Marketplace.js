import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Marketplace = () => {
  const [availableSlots, setAvailableSlots] = useState([]);
  const [mySwappableSlots, setMySwappableSlots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [selectedMySlot, setSelectedMySlot] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchAvailableSlots();
    fetchMySwappableSlots();
  }, []);

  const fetchAvailableSlots = async () => {
    try {
      const response = await api.get('/swaps/swappable-slots');
      setAvailableSlots(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching slots:', error);
      setLoading(false);
    }
  };

  const fetchMySwappableSlots = async () => {
    try {
      const response = await api.get('/events');
      const swappable = response.data.filter(event => event.status === 'SWAPPABLE');
      setMySwappableSlots(swappable);
    } catch (error) {
      console.error('Error fetching my slots:', error);
    }
  };

  const handleRequestSwap = (slot) => {
    setSelectedSlot(slot);
    setShowModal(true);
    fetchMySwappableSlots();
  };

  const handleSubmitSwap = async () => {
    if (!selectedMySlot) {
      setMessage('Please select one of your slots to offer');
      return;
    }

    try {
      await api.post('/swaps/swap-request', {
        mySlotId: selectedMySlot,
        theirSlotId: selectedSlot._id
      });
      setMessage('Swap request sent successfully!');
      setShowModal(false);
      setSelectedSlot(null);
      setSelectedMySlot('');
      fetchAvailableSlots();
      fetchMySwappableSlots();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error sending swap request');
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

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <h1>Marketplace - Available Slots</h1>
      
      {message && (
        <div className={message.includes('Error') ? 'error' : 'success'} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {availableSlots.length === 0 ? (
        <div className="card">
          <p>No available slots at the moment. Check back later!</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '20px' }}>
          {availableSlots.map((slot) => (
            <div key={slot._id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <div style={{ flex: 1 }}>
                  <h3>{slot.title}</h3>
                  <p style={{ marginTop: '10px', color: '#666' }}>
                    <strong>Owner:</strong> {slot.userId?.name || 'Unknown'} ({slot.userId?.email || ''})
                  </p>
                  <p style={{ marginTop: '5px' }}>
                    <strong>Start:</strong> {formatDate(slot.startTime)}
                  </p>
                  <p style={{ marginTop: '5px' }}>
                    <strong>End:</strong> {formatDate(slot.endTime)}
                  </p>
                </div>
                <button
                  onClick={() => handleRequestSwap(slot)}
                  className="btn btn-primary"
                >
                  Request Swap
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {showModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.5)',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          zIndex: 1000
        }}>
          <div className="card" style={{ maxWidth: '500px', width: '90%' }}>
            <h2>Request Swap</h2>
            <p style={{ marginTop: '10px', marginBottom: '20px' }}>
              You want to swap for: <strong>{selectedSlot.title}</strong>
            </p>
            <p style={{ marginBottom: '10px' }}>
              Select one of your swappable slots to offer:
            </p>
            
            {mySwappableSlots.length === 0 ? (
              <p className="error">
                You don't have any swappable slots. Please mark some events as swappable first.
              </p>
            ) : (
              <div className="form-group">
                <select
                  value={selectedMySlot}
                  onChange={(e) => setSelectedMySlot(e.target.value)}
                  style={{ marginBottom: '20px' }}
                >
                  <option value="">Select your slot...</option>
                  {mySwappableSlots.map((slot) => (
                    <option key={slot._id} value={slot._id}>
                      {slot.title} ({formatDate(slot.startTime)})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleSubmitSwap}
                className="btn btn-primary"
                disabled={!selectedMySlot || mySwappableSlots.length === 0}
              >
                Send Request
              </button>
              <button
                onClick={() => {
                  setShowModal(false);
                  setSelectedSlot(null);
                  setSelectedMySlot('');
                  setMessage('');
                }}
                className="btn btn-secondary"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Marketplace;
