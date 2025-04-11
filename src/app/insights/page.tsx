'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext'; // Assuming path is correct
import ProtectedRoute from '@/components/ProtectedRoute'; // Assuming path is correct

// Define the expanded list of emotions
type Emotion = "admiration" | "amusement" | "anger" | "annoyance" | "approval" | "caring" | 
    "confusion" | "curiosity" | "desire" | "disappointment" | "disapproval" | 
    "disgust" | "embarrassment" | "excitement" | "fear" | "gratitude" | "grief" | 
    "joy" | "love" | "nervousness" | "optimism" | "pride" | "realization" | 
    "relief" | "remorse" | "sadness" | "surprise" | "neutral";

// Define the structure for each insight entry with the new emotion type
interface InsightEntry {
  id: number;
  name: string;
  email: string;
  problemSummary: string;
  botSolved: boolean;
  humanNeeded: boolean;
  emotion: Emotion; 
}

// Expanded static mock data for the table
const mockInsights: InsightEntry[] = [
  {
    id: 1, name: 'Alice Smith', email: 'alice.s@example.com',
    problemSummary: 'Issue with login password reset link not arriving.',
    botSolved: false, humanNeeded: true, emotion: 'annoyance',
  },
  {
    id: 2, name: 'Bob Johnson', email: 'b.johnson@example.com',
    problemSummary: 'Asked for product specifications for Model X.',
    botSolved: true, humanNeeded: false, emotion: 'curiosity',
  },
  {
    id: 3, name: 'Charlie Brown', email: 'charlie@example.com',
    problemSummary: 'Complaint about slow response time and incorrect billing.',
    botSolved: false, humanNeeded: true, emotion: 'anger',
  },
  {
    id: 4, name: 'Diana Prince', email: 'diana.p@example.com',
    problemSummary: 'Inquiry about return policy for a gift.',
    botSolved: true, humanNeeded: false, emotion: 'neutral',
  },
  {
    id: 5, name: 'Ethan Hunt', email: 'ethan.h@example.com',
    problemSummary: 'Expressed gratitude for the quick resolution provided by the bot.',
    botSolved: true, humanNeeded: false, emotion: 'gratitude',
  },
  {
    id: 6, name: 'Fiona Glenanne', email: 'fiona.g@example.com',
    problemSummary: 'User was confused about how to navigate the settings page.',
    botSolved: false, humanNeeded: false, emotion: 'confusion', // Bot couldn't solve, but no explicit human request
  },
  {
    id: 7, name: 'George Costanza', email: 'george.c@example.com',
    problemSummary: 'Disappointment over a feature being removed in the latest update.',
    botSolved: false, humanNeeded: true, emotion: 'disappointment',
  },
  {
    id: 8, name: 'Harper Lee', email: 'harper.l@example.com',
    problemSummary: 'Needs help integrating the API with a third-party service.',
    botSolved: false, humanNeeded: true, emotion: 'nervousness',
  },
  {
    id: 9, name: 'Isaac Newton', email: 'isaac.n@example.com',
    problemSummary: 'Found a bug in the calculation module.',
    botSolved: false, humanNeeded: false, emotion: 'realization', // Needs investigation, medium priority
  },
  {
    id: 10, name: 'Julia Child', email: 'julia.c@example.com',
    problemSummary: 'Simple question about operating hours.',
    botSolved: true, humanNeeded: false, emotion: 'neutral',
  },
];

// Helper function to get priority level string and row background class
const getPriorityDetails = (botSolved: boolean, humanNeeded: boolean): { level: 'Low' | 'Medium' | 'High', rowClass: string } => {
  if (!botSolved) {
    if (humanNeeded) {
      // High priority: Bot failed, human explicitly needed
      return { level: 'High', rowClass: 'bg-red-100 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30' };
    } else {
      // Medium priority: Bot failed, but no explicit human request (needs review)
      return { level: 'Medium', rowClass: 'bg-yellow-100 dark:bg-yellow-900/20 hover:bg-yellow-100 dark:hover:bg-yellow-900/30' };
    }
  } else {
    // Low priority: Bot solved the issue
    return { level: 'Low', rowClass: 'bg-green-100 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30' };
  }
};

const InsightsPage = () => {
  const [insightsData, setInsightsData] = useState<InsightEntry[]>(mockInsights);
  // In the future, you would fetch real data here using useEffect and auth.token

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">Customer Interaction Insights</h1>
        
        <div className="overflow-x-auto bg-white dark:bg-gray-800 shadow-md rounded-lg">
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
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {insightsData.map((entry) => {
                const { level: priorityLevel, rowClass } = getPriorityDetails(entry.botSolved, entry.humanNeeded);
                return (
                  <tr key={entry.id} className={`${rowClass} transition-colors duration-150`}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-gray-100">{entry.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.email}</td>
                    <td className="px-6 py-4 text-sm text-gray-500 dark:text-gray-300 whitespace-normal">{entry.problemSummary}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.botSolved ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.humanNeeded ? 'Yes' : 'No'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-300">{entry.emotion}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {/* Display the priority level text */}
                      {priorityLevel}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedRoute>
  );
};

export default InsightsPage;
