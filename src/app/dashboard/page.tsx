'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { FileUploader } from './components/FileUploader';
import { ChatbotConfirmation } from './components/ChatbotConfirmation';
import { LoadingProgress } from '../components/LoadingProgress';
import { API_ENDPOINTS } from '@/config/api';
import { FaCheck } from 'react-icons/fa';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useAuth } from '@/context/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const auth = useAuth();
  const [formData, setFormData] = useState({
    businessName: '',
    businessType: '',
    chatbotName: '',
    chatbotType: '',
    iconUrl: ''
  });
  const [knowledgeFiles, setKnowledgeFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState({
    stage: '',
    message: '',
    progress: 0
  });
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [creationSuccess, setCreationSuccess] = useState(false);
  const [chatbotId, setChatbotId] = useState('');

  const chatbotTypes = [
    { value: 'customer_support', label: 'Customer Support' },
    { value: 'sales', label: 'Sales & Marketing' },
    { value: 'product_faq', label: 'Product FAQ' },
    { value: 'technical_support', label: 'Technical Support' },
    { value: 'general', label: 'General Purpose' },
  ];

  const handleConfirm = async () => {
    setLoading(true);
    let eventSource: EventSource | null = null;

    if (!auth.token) {
      alert('You are not logged in. Please log in again.');
      setLoading(false);
      auth.logout();
      return;
    }

    try {
      const formDataObj = new FormData();
      formDataObj.append('business_name', formData.businessName);
      formDataObj.append('business_type', formData.businessType);
      formDataObj.append('chatbot_name', formData.chatbotName);
      formDataObj.append('chatbot_type', formData.chatbotType);
      formDataObj.append('icon_url', formData.iconUrl);
      
      knowledgeFiles.forEach((file) => {
        formDataObj.append(`files`, file);
      });

      const response = await fetch(API_ENDPOINTS.createChatbot, {
        method: 'POST',
        body: formDataObj,
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${auth.token}`
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server error:', errorText);
        throw new Error(`Server error: ${errorText}`);
      }

      const data = await response.json();
      setChatbotId(data.id);

      // Create EventSource for progress updates
      const progressUrl = `${API_ENDPOINTS.chatbotProgress}?id=${data.id}`;
      eventSource = new EventSource(progressUrl);

      eventSource.onmessage = (event) => {
        const data = JSON.parse(event.data);
        setProgress({
          stage: data.stage,
          message: data.message,
          progress: data.progress
        });

        if (data.stage === 'complete') {
          eventSource?.close();
          setLoading(false);
          setCreationSuccess(true);
        } else if (data.stage === 'error') {
          eventSource?.close();
          setLoading(false);
          alert(`Error creating chatbot: ${data.message}`);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource failed:', error);
        eventSource?.close();
        setLoading(false);
        alert('Failed to create chatbot. Please try again.');
      };

    } catch (error) {
      console.error('Error creating chatbot:', error);
      eventSource?.close();
      setLoading(false);
      alert(`Failed to create chatbot: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRemoveFile = (index: number) => {
    setKnowledgeFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handlePreviewBot = () => {
    router.push(`/dashboard/chatbots/${chatbotId}`);
  };

  if (creationSuccess) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))] flex items-center justify-center">
        <div className="bg-gradient-to-br from-[rgb(58,37,124)] to-[rgb(91,69,163)] shadow-lg rounded-xl p-8 max-w-md w-full text-center text-white">
          <div className="flex items-center justify-center text-white text-6xl mb-6">
            <div className="bg-white/20 rounded-full p-4">
              <FaCheck />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">
            Your Bot is Ready!
          </h2>
          <p className="text-white/80 mb-8">
            Your knowledgebase has been created successfully. You can now start chatting with your bot.
          </p>
          <button
            onClick={handlePreviewBot}
            className="w-full py-3 px-4 bg-white text-[rgb(58,37,124)] rounded-lg hover:bg-white/90 transition-colors font-medium shadow-md hover:shadow-lg hover:-translate-y-0.5"
          >
            Preview Your Bot
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return <LoadingProgress {...progress} />;
  }

  if (showConfirmation) {
    return (
      <div className="min-h-screen bg-[rgb(var(--background))]">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <ChatbotConfirmation
            data={{
              ...formData,
              knowledgeFiles,
            }}
            onEdit={() => setShowConfirmation(false)}
            onConfirm={handleConfirm}
            onRemoveFile={handleRemoveFile}
          />
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-violet-900">
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
            <div className="flex items-center mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(58,37,124)] to-[rgb(91,69,163)] flex items-center justify-center text-white mr-4">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"></path>
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Create New Chatbot
              </h1>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-8">
              {/* Business Details Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-8 w-1 bg-gradient-to-b from-[rgb(58,37,124)] to-[rgb(91,69,163)] rounded-full mr-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Business Details
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Business Name
                    </label>
                    <input
                      type="text"
                      id="businessName"
                      name="businessName"
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[rgb(58,37,124)] focus:ring focus:ring-[rgb(91,69,163)] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      value={formData.businessName}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="businessType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Business Type
                    </label>
                    <input
                      type="text"
                      id="businessType"
                      name="businessType"
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[rgb(58,37,124)] focus:ring focus:ring-[rgb(91,69,163)] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      value={formData.businessType}
                      onChange={handleFormChange}
                    />
                  </div>
                </div>
              </div>

              {/* Chatbot Details Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-8 w-1 bg-gradient-to-b from-[rgb(58,37,124)] to-[rgb(91,69,163)] rounded-full mr-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Chatbot Details
                  </h2>
                </div>
                
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div>
                    <label htmlFor="chatbotName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Chatbot Name
                    </label>
                    <input
                      type="text"
                      id="chatbotName"
                      name="chatbotName"
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[rgb(58,37,124)] focus:ring focus:ring-[rgb(91,69,163)] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      value={formData.chatbotName}
                      onChange={handleFormChange}
                    />
                  </div>

                  <div>
                    <label htmlFor="chatbotType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Chatbot Type
                    </label>
                    <select
                      id="chatbotType"
                      name="chatbotType"
                      required
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[rgb(58,37,124)] focus:ring focus:ring-[rgb(91,69,163)] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      value={formData.chatbotType}
                      onChange={handleFormChange}
                    >
                      <option value="">Select a type</option>
                      {chatbotTypes.map(type => (
                        <option key={type.value} value={type.value}>
                          {type.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Bot Configuration Section */}
              <div className="space-y-4">
                <div className="flex items-center">
                  <div className="h-8 w-1 bg-gradient-to-b from-[rgb(58,37,124)] to-[rgb(91,69,163)] rounded-full mr-3"></div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Bot Configuration
                  </h2>
                </div>
                <div className="grid grid-cols-1 gap-6">
                  <div>
                    <label htmlFor="iconUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Bot Icon URL
                    </label>
                    <input
                      type="url"
                      id="iconUrl"
                      name="iconUrl"
                      placeholder="https://example.com/bot-icon.png"
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-[rgb(58,37,124)] focus:ring focus:ring-[rgb(91,69,163)] focus:ring-opacity-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white sm:text-sm"
                      value={formData.iconUrl}
                      onChange={handleFormChange}
                    />
                    {formData.iconUrl && (
                      <div className="mt-3">
                        <img
                          src={formData.iconUrl}
                          alt="Bot Icon Preview"
                          className="w-12 h-12 rounded-full object-cover border-2 border-[rgb(58,37,124)]"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=Bot';
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Knowledge Base Files
                    </label>
                    <FileUploader
                      onFilesSelect={(files) => setKnowledgeFiles(files)}
                      selectedFiles={knowledgeFiles}
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowConfirmation(true)}
                  className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[rgb(58,37,124)] to-[rgb(91,69,163)] hover:from-[rgb(68,47,134)] hover:to-[rgb(101,79,173)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(58,37,124)] transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  Continue
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
