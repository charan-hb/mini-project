import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { API_URL } from '../config';
import { AuthContext } from '../context/AuthContext';

const Announcements = () => {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/notifications/announcements`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setAnnouncements(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load announcements');
      } finally {
        setLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Announcements</h1>
      {announcements.length === 0 ? (
        <p>No announcements yet.</p>
      ) : (
        <ul>
          {announcements.map(a => (
            <li key={a._id} className="mb-4 p-4 bg-blue-50 rounded shadow">
              <div>{a.message}</div>
              <div className="text-xs text-gray-500">{new Date(a.createdAt).toLocaleString()}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default Announcements; 