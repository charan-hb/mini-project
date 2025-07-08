import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PostDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isInterested, setIsInterested] = useState(false);

  useEffect(() => {
    fetchPost();
  }, [id]);

  const fetchPost = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API_URL}/posts/${id}`);
      setPost(response.data);
      // Check if current user has expressed interest
      if (user && response.data.interestedUsers?.some(u => u._id === user._id)) {
        setIsInterested(true);
      } else {
        setIsInterested(false);
      }
      setError(null);
    } catch (err) {
      setError('Failed to load post details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (postId) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        await axios.delete(`${API_URL}/posts/${postId}`);
        navigate('/posts');
      } catch (err) {
        setError('Failed to delete post');
        console.error(err);
      }
    }
  };

  const handleContact = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      // This endpoint will either get an existing chat or create a new one
      const response = await axios.get(`${API_URL}/chats/with/${post.author._id}`);
      navigate(`/messages/${response.data._id}`);
    } catch (err) {
      setError('Failed to start chat');
      console.error(err);
    }
  };

  const handleInterest = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/posts/${id}/interest`, {
        interested: !isInterested
      });
      setIsInterested(!isInterested);
      setPost(response.data);
    } catch (err) {
      setError('Failed to update interest status');
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
          <button
            onClick={() => navigate('/posts')}
            className="btn btn-primary"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Post Not Found</h1>
          <button
            onClick={() => navigate('/posts')}
            className="btn btn-primary"
          >
            Back to Posts
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <button
            onClick={() => navigate('/posts')}
            className="text-primary-600 hover:text-primary-700 font-medium"
          >
            ← Back to Posts
          </button>
        </div>

        <div className="card">
          <div className="flex justify-between items-start mb-6">
            <h1 className="text-3xl font-bold text-gray-900">{post.title}</h1>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              post.type === 'looking-for-teammates'
                ? 'bg-blue-100 text-blue-800'
                : 'bg-green-100 text-green-800'
            }`}>
              {post.type === 'looking-for-teammates' ? 'Looking for Team' : 'Offering Help'}
            </span>
          </div>

          <div className="prose max-w-none mb-6">
            <p className="text-gray-600">{post.description}</p>
          </div>

          {post.projectName && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">Project Details</h2>
              <p className="text-gray-600">{post.projectName}</p>
            </div>
          )}

          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">Required Skills</h2>
            <div className="flex flex-wrap gap-2">
              {post.requiredSkills.map((skill) => (
                <span
                  key={skill}
                  className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Posted by <Link to={`/users/${post.author._id}`} className="text-primary-600 hover:text-primary-700">{post.author.name}</Link>
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(post.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex space-x-4">
                {user && user._id === post.author._id ? (
                  <>
                    <button
                      onClick={() => navigate(`/posts/${post._id}/edit`)}
                      className="btn btn-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(post._id)}
                      className="btn btn-danger"
                    >
                      Delete
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={handleInterest}
                      className={`btn ${isInterested ? 'btn-primary' : 'btn-outline-primary'}`}
                    >
                      {isInterested ? 'Interested ✓' : 'I\'m Interested'}
                    </button>
                    <button
                      onClick={handleContact}
                      className="btn btn-primary"
                    >
                      Contact Author
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PostDetails; 