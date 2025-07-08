import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const Messages = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (chatId) {
      // If we have a chatId in the URL, find and select that conversation
      const conversation = conversations.find(c => c._id === chatId);
      if (conversation) {
        setSelectedConversation(conversation);
      } else {
        // If conversation not found in the list, fetch it directly
        fetchChat(chatId);
      }
    } else if (conversations.length > 0) {
      // If no chatId but we have conversations, select the first one
      setSelectedConversation(conversations[0]);
    }
  }, [chatId, conversations]);

  useEffect(() => {
    if (selectedConversation) {
      fetchMessages(selectedConversation._id);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const response = await axios.get(`${API_URL}/chats`);
      setConversations(response.data || []);
      setError(null);
    } catch (err) {
      setError('Failed to load conversations');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchChat = async (chatId) => {
    try {
      const response = await axios.get(`${API_URL}/chats/${chatId}`);
      setSelectedConversation(response.data);
      setError(null);
    } catch (err) {
      setError('Failed to load chat');
      console.error(err);
    }
  };

  const fetchMessages = async (conversationId) => {
    try {
      const response = await axios.get(`${API_URL}/chats/${conversationId}`);
      setMessages(response.data?.messages || []);
    } catch (err) {
      setError('Failed to load messages');
      console.error(err);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    try {
      const response = await axios.post(`${API_URL}/chats/${selectedConversation._id}/messages`, {
        content: newMessage
      });

      setMessages(prev => [...prev, response.data]);
      setNewMessage('');
    } catch (err) {
      setError('Failed to send message');
      console.error(err);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getOtherUser = (conversation) => {
    if (!conversation?.participants || !user?._id) return null;
    return conversation.participants.find(p => p._id.toString() !== user._id.toString());
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Messages</h1>

        {error && (
          <div className="mb-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        <div className="flex h-[600px] border rounded-lg overflow-hidden">
          {/* Conversations List */}
          <div className="w-1/3 border-r bg-gray-50">
            <div className="p-4 border-b">
              <h2 className="text-lg font-medium text-gray-900">Conversations</h2>
            </div>
            <div className="overflow-y-auto h-[calc(100%-4rem)]">
              {conversations.length === 0 ? (
                <div className="p-4 text-center text-gray-500">
                  No conversations yet
                </div>
              ) : (
                conversations.map((conversation) => {
                  const otherUser = getOtherUser(conversation);
                  if (!otherUser) return null;
                  
                  return (
                    <button
                      key={conversation._id}
                      onClick={() => {
                        setSelectedConversation(conversation);
                        navigate(`/messages/${conversation._id}`);
                      }}
                      className={`w-full p-4 text-left hover:bg-gray-100 transition-colors ${
                        selectedConversation?._id === conversation._id ? 'bg-gray-100' : ''
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                          <span className="text-primary-800 font-medium">
                            {otherUser.name?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">{otherUser.name || 'Unknown User'}</h3>
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage?.content || 'No messages yet'}
                          </p>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </div>

          {/* Chat Area */}
          <div className="flex-1 flex flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center">
                      <span className="text-primary-800 font-medium">
                        {getOtherUser(selectedConversation)?.name?.charAt(0) || '?'}
                      </span>
                    </div>
                    <h2 className="text-lg font-medium text-gray-900">
                      {getOtherUser(selectedConversation)?.name || 'Unknown User'}
                    </h2>
                  </div>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => (
                    <div
                      key={message._id}
                      className={`flex ${
                        message.sender?._id === user?._id ? 'justify-end' : 'justify-start'
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg p-3 ${
                          message.sender?._id === user?._id
                            ? 'bg-primary-600 text-white'
                            : 'bg-gray-100 text-gray-900'
                        }`}
                      >
                        <p>{message.content}</p>
                        <p className="text-xs mt-1 opacity-70">
                          {new Date(message.createdAt).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>

                <form onSubmit={handleSendMessage} className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type a message..."
                      className="input flex-1"
                    />
                    <button
                      type="submit"
                      className="btn btn-primary"
                      disabled={!newMessage.trim()}
                    >
                      Send
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start chatting
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages; 