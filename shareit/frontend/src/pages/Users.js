import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('token');
        const response = await axios.get(`${API_URL}/users/search`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUsers(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load users');
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  if (loading) return <div className="flex justify-center items-center min-h-screen">Loading...</div>;
  if (error) return <div className="text-center text-red-500">{error}</div>;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">People</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {users.map(u => (
          <Link
            to={`/users/${u._id}`}
            key={u._id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition p-6 flex items-center space-x-4"
          >
            <div className="h-12 w-12 rounded-full bg-primary-100 flex items-center justify-center">
              <span className="text-primary-800 font-bold text-lg">
                {u.name?.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <div className="text-lg font-semibold text-gray-900">{u.name}</div>
              <div className="text-sm text-gray-500">{u.department} • Year {u.year}</div>
              <div className="flex flex-wrap gap-1 mt-1">
                {u.skills?.slice(0, 3).map(skill => (
                  <span key={skill} className="bg-gray-100 text-gray-800 rounded-full px-2 py-0.5 text-xs">{skill}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default Users; 