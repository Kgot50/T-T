import React, { useState, useRef, useEffect } from 'react';
import { Send, AlertTriangle, Users, MessageSquare } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { uselocation } from '../contexts/LocationContext';

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'incident' | 'alert';
  location?: { lat: number; lng: number };
}

interface CommunityProps {
  onNavigate: (page: string) => void;
}

const CommunityChat: React.FC<CommunityProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const { currentLocation, incidents } = uselocation();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [activeChannel, setActiveChannel] = useState<'general' | 'alerts' | 'nearby'>('general');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const channels = [
    { id: 'general', label: 'General Chat', icon: MessageSquare },
    { id: 'alerts', label: 'Safety Alerts', icon: AlertTriangle },
    { id: 'nearby', label: 'Nearby Users', icon: Users }
  ];

  useEffect(() => {
    // Load mock messages
    const mockMessages: ChatMessage[] = [
      {
        id: '1',
        userId: 'user1',
        userName: 'SafetyFirst',
        message: 'Stay safe everyone! Avoid 5th Street, unusual activity reported.',
        timestamp: new Date(Date.now() - 3600000),
        type: 'alert'
      },
      {
        id: '2',
        userId: 'user2',
        userName: 'CommunityWatch',
        message: 'Police presence increased near Central Park. All clear now.',
        timestamp: new Date(Date.now() - 1800000),
        type: 'message'
      },
      {
        id: '3',
        userId: 'user3',
        userName: 'LocalResident',
        message: 'Anyone know what happened on Main St? Heard sirens earlier.',
        timestamp: new Date(Date.now() - 900000),
        type: 'message'
      },
      {
        id: '4',
        userId: 'system',
        userName: 'System Alert',
        message: 'New incident reported: Suspicious activity on Oak Avenue',
        timestamp: new Date(Date.now() - 300000),
        type: 'incident'
      }
    ];
    setMessages(mockMessages);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    const message: ChatMessage = {
      id: Date.now().toString(),
      userId: user.id,
      userName: user.name,
      message: newMessage,
      timestamp: new Date(),
      type: 'message',
      location: currentLocation || undefined
    };

    setMessages(prev => [...prev, message]);
    setNewMessage('');

    // Simulate text-to-speech for accessibility
    if (user.accessibilitySettings.textToSpeech) {
      console.log('Text-to-speech:', message.message);
    }
  };

  const filteredMessages = messages.filter(message => {
    switch (activeChannel) {
      case 'alerts':
        return message.type === 'alert' || message.type === 'incident';
      case 'nearby':
        // In a real app, this would filter by location proximity
        return message.location;
      default:
        return true;
    }
  });

  const getMessageStyle = (message: ChatMessage) => {
    switch (message.type) {
      case 'alert':
        return 'bg-red-50 border-red-200 border-l-4 border-l-red-500';
      case 'incident':
        return 'bg-yellow-50 border-yellow-200 border-l-4 border-l-yellow-500';
      default:
        return message.userId === user?.id 
          ? 'bg-blue-50 border-blue-200' 
          : 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 h-[calc(100vh-200px)] flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Community Chat</h1>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users size={16} />
          <span>127 active users</span>
        </div>
      </div>

      {/* Channel Tabs */}
      <div className="flex gap-1 mb-4 bg-gray-100 rounded-lg p-1">
        {channels.map((channel) => {
          const Icon = channel.icon;
          return (
            <button
              key={channel.id}
              onClick={() => setActiveChannel(channel.id as any)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                activeChannel === channel.id
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <Icon size={16} />
              {channel.label}
            </button>
          );
        })}
      </div>

      {/* Messages Container */}
      <div className="flex-1 bg-white rounded-xl shadow-lg border border-gray-200 flex flex-col">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {filteredMessages.map((message) => (
            <div
              key={message.id}
              className={`p-4 rounded-lg border ${getMessageStyle(message)}`}
            >
              <div className="flex items-center gap-2 mb-2">
                <span className="font-medium text-gray-900">
                  {message.userName}
                </span>
                <span className="text-xs text-gray-500">
                  {message.timestamp.toLocaleTimeString()}
                </span>
                {message.type !== 'message' && (
                  <span className={`px-2 py-1 text-xs font-medium rounded ${
                    message.type === 'alert' 
                      ? 'bg-red-100 text-red-700'
                      : 'bg-yellow-100 text-yellow-700'
                  }`}>
                    {message.type === 'alert' ? 'ALERT' : 'INCIDENT'}
                  </span>
                )}
              </div>
              <p className="text-gray-800">{message.message}</p>
              {message.location && (
                <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                  <AlertTriangle size={12} />
                  Location: {message.location.lat.toFixed(4)}, {message.location.lng.toFixed(4)}
                </div>
              )}
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
            >
              <Send size={16} />
              Send
            </button>
          </div>
          {user?.accessibilitySettings.speechToText && (
            <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <MessageSquare size={12} />
              Speech-to-text enabled
            </div>
          )}
        </form>
      </div>

      {/* Quick Actions */}
      <div className="mt-4 bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h4 className="text-sm font-medium text-gray-900 mb-3">Quick Actions</h4>
        <div className="flex gap-2">
          <button
            onClick={() => onNavigate('map')}
            className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition-colors"
          >
            View Map
          </button>
          <button
            onClick={() => {
              // This would open a report form
              onNavigate('map');
            }}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Report Incident
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommunityChat;