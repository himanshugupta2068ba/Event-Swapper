import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Dashboard = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    status: 'BUSY'
  });
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await api.get('/events');
      setEvents(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching events:', error);
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      await api.post('/events', formData);
      setFormData({ title: '', startTime: '', endTime: '', status: 'BUSY' });
      setShowForm(false);
      fetchEvents();
      setMessage('Event created successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error creating event');
    }
  };

  const handleStatusChange = async (eventId, newStatus) => {
    try {
      await api.put(`/events/${eventId}`, { status: newStatus });
      fetchEvents();
      setMessage('Event status updated!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error updating event');
    }
  };

  const handleDelete = async (eventId) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await api.delete(`/events/${eventId}`);
      fetchEvents();
      setMessage('Event deleted successfully!');
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error deleting event');
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'BUSY': return '#6c757d';
      case 'SWAPPABLE': return '#28a745';
      case 'SWAP_PENDING': return '#ffc107';
      default: return '#6c757d';
    }
  };

  if (loading) return <div className="container">Loading...</div>;

  return (
    <div className="container">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1>My Calendar</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn btn-primary">
          {showForm ? 'Cancel' : 'Add Event'}
        </button>
      </div>

      {message && (
        <div className={message.includes('Error') ? 'error' : 'success'} style={{ marginBottom: '20px' }}>
          {message}
        </div>
      )}

      {showForm && (
        <div className="card" style={{ marginBottom: '20px' }}>
          <h3>Create New Event</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Start Time</label>
              <input
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>End Time</label>
              <input
                type="datetime-local"
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                required
              />
            </div>
            <div className="form-group">
              <label>Initial Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="BUSY">Busy</option>
                <option value="SWAPPABLE">Swappable</option>
              </select>
            </div>
            <button type="submit" className="btn btn-primary">Create Event</button>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Your Events</h2>
        {events.length === 0 ? (
          <p>No events yet. Create your first event!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {events.map((event) => (
              <div
                key={event._id}
                style={{
                  padding: '15px',
                  border: '1px solid #ddd',
                  borderRadius: '5px',
                  backgroundColor: '#f9f9f9'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ marginBottom: '10px' }}>{event.title}</h3>
                    <p style={{ marginBottom: '5px' }}>
                      <strong>Start:</strong> {formatDate(event.startTime)}
                    </p>
                    <p style={{ marginBottom: '10px' }}>
                      <strong>End:</strong> {formatDate(event.endTime)}
                    </p>
                    <span
                      style={{
                        padding: '5px 10px',
                        borderRadius: '3px',
                        backgroundColor: getStatusColor(event.status),
                        color: 'white',
                        fontSize: '14px'
                      }}
                    >
                      {event.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    {event.status === 'BUSY' && (
                      <button
                        onClick={() => handleStatusChange(event._id, 'SWAPPABLE')}
                        className="btn btn-success"
                        style={{ fontSize: '14px', padding: '5px 10px' }}
                      >
                        Make Swappable
                      </button>
                    )}
                    {event.status === 'SWAPPABLE' && (
                      <button
                        onClick={() => handleStatusChange(event._id, 'BUSY')}
                        className="btn btn-secondary"
                        style={{ fontSize: '14px', padding: '5px 10px' }}
                      >
                        Mark as Busy
                      </button>
                    )}
                    {event.status !== 'SWAP_PENDING' && (
                      <button
                        onClick={() => handleDelete(event._id)}
                        className="btn btn-danger"
                        style={{ fontSize: '14px', padding: '5px 10px' }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
