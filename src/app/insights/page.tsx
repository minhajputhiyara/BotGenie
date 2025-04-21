'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext'; // Assuming path is correct
import ProtectedRoute from '@/components/ProtectedRoute'; // Assuming path is correct
import { API_ENDPOINTS } from '@/config/api'; // Import API endpoints

// Define the expanded list of emotions
type Emotion = "admiration" | "amusement" | "anger" | "annoyance" | "approval" | "caring" | 
    "confusion" | "curiosity" | "desire" | "disappointment" | "disapproval" | 
    "disgust" | "embarrassment" | "excitement" | "fear" | "gratitude" | "grief" | 
    "joy" | "love" | "nervousness" | "optimism" | "pride" | "realization" | 
    "relief" | "remorse" | "sadness" | "surprise" | "neutral";

// Define status options for the dropdown
type StatusOption = "Solved" | "Processing" | "Not Solved";

// Define the structure for each insight entry with the new emotion type
interface InsightEntry {
  id: number;
  name: string | null;
  email: string | null;
  problem_summary: string | null;
  bot_solved: boolean | null;
  human_needed: boolean | null;
  emotion: Emotion | null; 
  session_id: string;
  created_at: string;
  status?: StatusOption; // Optional status field
}

// Type for sort configuration
type SortConfig = {
  key: keyof InsightEntry | 'priority';
  direction: 'ascending' | 'descending';
};

// Helper function to get priority level string and row background class
const getPriorityDetails = (botSolved: boolean | null, humanNeeded: boolean | null): { level: 'Low' | 'Medium' | 'High', rowClass: string } => {
  if (botSolved === false) {
    if (humanNeeded === true) {
      // High priority: Bot failed, human explicitly needed
      return { level: 'High', rowClass: 'bg-red-100 dark:bg-red-900/20 hover:bg-red-200 dark:hover:bg-red-900/30' };
    } else {
      // Medium priority: Bot failed, but no explicit human request (needs review)
      return { level: 'Medium', rowClass: 'bg-yellow-100 dark:bg-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-600' };
    }
  } else if (botSolved === true) {
    // Low priority: Bot solved the issue
    return { level: 'Low', rowClass: 'bg-green-100 dark:bg-green-900/20 hover:bg-green-200 dark:hover:bg-green-900/30' };
  } else {
    // Default case when values are null
    return { level: 'Medium', rowClass: 'bg-yellow-100 dark:bg-yellow-700 hover:bg-yellow-200 dark:hover:bg-yellow-600' };
  }
};

const InsightsPage = () => {
  const [insightsData, setInsightsData] = useState<InsightEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { token } = useAuth();
  const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'id', direction: 'ascending' });

  useEffect(() => {
    const fetchInsights = async () => {
      if (!token) {
        console.log("No authentication token available");
        setLoading(false);
        setError("You must be logged in to view insights");
        return;
      }
      
      try {
        console.log("Fetching insights with token:", token.substring(0, 10) + "...");
        setLoading(true);
        const response = await fetch(API_ENDPOINTS.insights, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) {
          console.error("Failed to fetch insights:", response.status, response.statusText);
          throw new Error(`Failed to fetch insights: ${response.status}`);
        }
        
        const data = await response.json();
        console.log("Received insights data:", data);
        setInsightsData(data);
      } catch (err) {
        console.error('Error fetching insights:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch insights');
      } finally {
        setLoading(false);
      }
    };
    
    fetchInsights();
  }, [token]);

  // Helper function to update status for a specific insight
  const updateStatus = (id: number, newStatus: StatusOption) => {
    setInsightsData(prevData => 
      prevData.map(item => 
        item.id === id ? { ...item, status: newStatus } : item
      )
    );
    // Note: This is frontend-only for now as requested
    // In the future, you might want to add an API call here to persist the status
  };

  // Function to handle sorting
  const requestSort = (key: keyof InsightEntry | 'priority') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    
    // If already sorting by this key, toggle direction
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    
    setSortConfig({ key, direction });
  };

  // Get sorted data
  const getSortedData = () => {
    const sortableData = [...insightsData];
    
    sortableData.sort((a, b) => {
      // Special case for priority which is calculated, not stored
      if (sortConfig.key === 'priority') {
        const priorityA = getPriorityDetails(a.bot_solved, a.human_needed).level;
        const priorityB = getPriorityDetails(b.bot_solved, b.human_needed).level;
        
        // Convert priority levels to numeric values for comparison
        const priorityValues = { 'Low': 1, 'Medium': 2, 'High': 3 };
        const valueA = priorityValues[priorityA as keyof typeof priorityValues];
        const valueB = priorityValues[priorityB as keyof typeof priorityValues];
        
        if (sortConfig.direction === 'ascending') {
          return valueA - valueB;
        } else {
          return valueB - valueA;
        }
      }
      
      // Special case for status which might be undefined
      if (sortConfig.key === 'status') {
        const valueA = a.status || 'Not Solved';
        const valueB = b.status || 'Not Solved';
        
        if (sortConfig.direction === 'ascending') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }
      
      // Handle other fields
      const valueA = a[sortConfig.key];
      const valueB = b[sortConfig.key];
      
      if (valueA === null || valueA === undefined) return 1;
      if (valueB === null || valueB === undefined) return -1;
      
      if (typeof valueA === 'string' && typeof valueB === 'string') {
        if (sortConfig.direction === 'ascending') {
          return valueA.localeCompare(valueB);
        } else {
          return valueB.localeCompare(valueA);
        }
      }
      
      // For boolean values
      if (typeof valueA === 'boolean' && typeof valueB === 'boolean') {
        const numA = valueA ? 1 : 0;
        const numB = valueB ? 1 : 0;
        
        if (sortConfig.direction === 'ascending') {
          return numA - numB;
        } else {
          return numB - numA;
        }
      }
      
      return 0;
    });
    
    return sortableData;
  };

  // Get sorted data
  const sortedData = getSortedData();

  // Helper function to get sort indicator
  const getSortIndicator = (key: keyof InsightEntry | 'priority') => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'ascending' ? ' ↑' : ' ↓';
    }
    return '';
  };

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Customer Interaction Insights</h1>
        
        {loading ? (
          <div className="flex justify-center items-center py-10">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline"> {error}</span>
          </div>
        ) : insightsData.length === 0 ? (
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg text-center">
            <p className="text-gray-700 dark:text-gray-300">No insights data available yet. Insights will be generated automatically after chat sessions timeout.</p>
          </div>
        ) : (
          <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
            <div className="p-4 bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
              <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Sort by:</div>
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => requestSort('name')}
                  className={`px-3 py-1 text-xs rounded-full ${sortConfig.key === 'name' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  Name{getSortIndicator('name')}
                </button>
                <button 
                  onClick={() => requestSort('priority')}
                  className={`px-3 py-1 text-xs rounded-full ${sortConfig.key === 'priority' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  Priority{getSortIndicator('priority')}
                </button>
                <button 
                  onClick={() => requestSort('status')}
                  className={`px-3 py-1 text-xs rounded-full ${sortConfig.key === 'status' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  Status{getSortIndicator('status')}
                </button>
                <button 
                  onClick={() => requestSort('emotion')}
                  className={`px-3 py-1 text-xs rounded-full ${sortConfig.key === 'emotion' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  Emotion{getSortIndicator('emotion')}
                </button>
                <button 
                  onClick={() => requestSort('created_at')}
                  className={`px-3 py-1 text-xs rounded-full ${sortConfig.key === 'created_at' ? 'bg-blue-500 text-white' : 'bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300'}`}
                >
                  Date{getSortIndicator('created_at')}
                </button>
              </div>
            </div>
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-100 dark:bg-gray-700">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">Name</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">Email</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">Problem Summary</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">Bot Solved?</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">Human Needed?</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">Emotion</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">Priority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-bold text-gray-800 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {sortedData.map((entry) => {
                  const { level: priorityLevel, rowClass } = getPriorityDetails(entry.bot_solved, entry.human_needed);
                  return (
                    <tr key={entry.id} className={`${rowClass} transition-colors duration-150`}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{entry.name || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.email || 'Unknown'}</td>
                      <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-normal">{entry.problem_summary || 'No summary available'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.bot_solved === null ? 'Unknown' : entry.bot_solved ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.human_needed === null ? 'Unknown' : entry.human_needed ? 'Yes' : 'No'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.emotion || 'Unknown'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        {/* Display the priority level text */}
                        {priorityLevel}
                      </td>
                      <td className="px-1 py-4 whitespace-nowrap text-sm">
                        <select 
                          className="block w-auto rounded-md bg-violet-200 border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-sm"
                          value={entry.status || 'Not Solved'}
                          onChange={(e) => updateStatus(entry.id, e.target.value as StatusOption)}
                        >
                          <option value="Solved">Resolved</option>
                          <option value="Processing">WIP</option>
                          <option value="Not Solved">Non-Attended</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
};

export default InsightsPage;
