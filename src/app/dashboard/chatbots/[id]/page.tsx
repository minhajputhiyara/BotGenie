'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { API_ENDPOINTS } from '@/config/api';
import Image from 'next/image';
import { FaRobot, FaInfoCircle } from 'react-icons/fa';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface ChatbotDetails {
  name: string;
  type: string;
  business_name: string;
  business_type: string;
  icon_url: string;
}

export default function ChatbotPage() {
  const params = useParams();
  const chatbotId = params.id as string;
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [botDetails, setBotDetails] = useState<ChatbotDetails | null>(null);

  // Get the base URL for the widget
  const [baseUrl, setBaseUrl] = useState<string>(process.env.NEXT_PUBLIC_APP_URL || '');

  useEffect(() => {
    // Set the base URL on the client side
    setBaseUrl(window.location.origin);
    
    // Fetch chatbot details
    const fetchBotDetails = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.getChatbotDetails}/${chatbotId}`);
        if (response.ok) {
          const data = await response.json();
          setBotDetails(data);
        }
      } catch (error) {
        console.error('Error fetching bot details:', error);
      }
    };

    fetchBotDetails();
  }, [chatbotId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setLoading(true);

    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await fetch(API_ENDPOINTS.queryChatbot(chatbotId), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: userMessage }),
      });

      if (!response.ok) {
        throw new Error('Failed to get response');
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Error querying chatbot:', error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: 'Sorry, I encountered an error processing your request.' 
      }]);
    } finally {
      setLoading(false);
    }
  };

  const [copied, setCopied] = useState(false);

  const copyToClipboard = () => {
    try {
      const embedCode = `<script src="${baseUrl}/api/widget/${params.id}"></script>`;
      
      // Create a temporary textarea element to copy from
      const textarea = document.createElement('textarea');
      textarea.value = embedCode;
      textarea.style.position = 'fixed';  // Prevent scrolling to the element
      textarea.style.opacity = '0';       // Make it invisible
      document.body.appendChild(textarea);
      textarea.select();
      
      // Try to copy using the Clipboard API first
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(embedCode)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch(() => {
            // Fallback to document.execCommand
            document.execCommand('copy');
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          });
      } else {
        // Fallback for older browsers
        document.execCommand('copy');
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
      
      // Clean up
      document.body.removeChild(textarea);
    } catch (err) {
      console.error('Failed to copy:', err);
      alert('Please copy this code manually:\n\n' + 
            `<script src="${baseUrl}/api/widget/${params.id}"></script>`);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {/* Embed Instructions */}
          <div className="p-4 border-b mb-4 bg-gray-800 text-white rounded-t-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Embed Your Chatbot</h2>
            <p className="mb-4">Add this code snippet to your website to embed the chatbot:</p>
            <div className="bg-gray-900 p-4 rounded-lg border border-gray-700">
              <code className="text-sm text-green-400">
                {`<script src="${baseUrl}/api/widget/${params.id}"></script>`}
              </code>
              <button 
                onClick={copyToClipboard} 
                className="mt-2 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded text-xs flex items-center"
              >
                {copied ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                    </svg>
                    Copy to clipboard
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Bot Header */}
          <div className="p-4 border-b flex items-center justify-between bg-gray-50 rounded-t-lg">
            <div className="flex items-center space-x-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-gray-200">
                {botDetails?.icon_url ? (
                  <Image
                    src={botDetails.icon_url}
                    alt={botDetails.name || 'Bot Icon'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FaRobot className="text-2xl text-gray-400" />
                  </div>
                )}
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-800">
                  {botDetails?.name || 'AI Assistant'}
                </h2>
                <button
                  onClick={() => setShowInfo(!showInfo)}
                  className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                >
                  <FaInfoCircle className="mr-1" />
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Bot Info Modal */}
          {showInfo && (
            <div className="p-4 bg-gray-50 border-b">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <h3 className="font-semibold mb-2">Bot Information</h3>
                <dl className="grid grid-cols-2 gap-4">
                  <div>
                    <dt className="text-sm text-gray-600">Business Name</dt>
                    <dd className="font-medium">{botDetails?.business_name}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Business Type</dt>
                    <dd className="font-medium">{botDetails?.business_type}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-gray-600">Bot Type</dt>
                    <dd className="font-medium">{botDetails?.type}</dd>
                  </div>
                </dl>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="h-[500px] overflow-y-auto p-6 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg ${
                  message.role === 'user'
                    ? 'bg-blue-100 ml-auto max-w-[80%]'
                    : 'bg-gray-100 mr-auto max-w-[80%]'
                }`}
              >
                <p className="text-gray-800">{message.content}</p>
              </div>
            ))}
            {loading && (
              <div className="bg-gray-100 rounded-lg p-4 mr-auto max-w-[80%]">
                <p className="text-gray-800">Thinking...</p>
              </div>
            )}
          </div>

          {/* Input Form */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
                disabled={loading}
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
              >
                Send
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
