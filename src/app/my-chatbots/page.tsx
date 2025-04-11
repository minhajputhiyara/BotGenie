// frontend/pages/my-chatbots.tsx
'use client'; // Add this directive for client components in App Router

import React, { useState, useEffect } from 'react'; 
import { useRouter } from 'next/navigation'; // Use next/navigation in App Router
import { useAuth } from '../../context/AuthContext'; // Import useAuth hook
import Link from 'next/link';
import styles from '../../../styles/MyChatbots.module.css'; // Keep existing styles reference for now

interface Chatbot {
  id: string;
  name: string;
  created_at: string; // API likely returns string, format on display
  user_id: number;
  icon_url?: string; // Add optional icon_url based on backend response
}

const MyChatbotsPage = () => {
    // Use the custom hook
    const { token, isLoading: authLoading } = useAuth();
    const [chatbots, setChatbots] = useState<Chatbot[]>([]); // Type the state
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>(''); // Type the error state
    const router = useRouter();

    useEffect(() => {
        // Redirect if auth is done loading and there's no token
        if (!authLoading && !token) {
            router.push('/login');
            return;
        }

        // Fetch chatbots only if token is available (implies logged in)
        if (token) {
            const fetchChatbots = async () => {
                setLoading(true);
                setError('');
                try {
                    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/chatbots`;
                    console.log('Attempting to fetch from:', apiUrl);
                    const response = await fetch(apiUrl, {
                        headers: {
                            'Authorization': `Bearer ${token}`,
                        },
                    });

                    if (!response.ok) {
                        let errorMsg = `HTTP error! status: ${response.status}`;
                        try {
                            const errorData = await response.json();
                            errorMsg = errorData.detail || errorMsg;
                        } catch (jsonError) {
                            // Ignore if response is not JSON
                        }
                        throw new Error(errorMsg);
                    }

                    const data: Chatbot[] = await response.json(); // Type the fetched data
                    setChatbots(data);
                } catch (err) {
                    console.error("Failed to fetch chatbots:", err);
                    // Type assertion for error message
                    if (err instanceof Error) {
                         setError(err.message);
                    } else {
                         setError('An unknown error occurred.');
                    }
                } finally {
                    setLoading(false);
                }
            };

            fetchChatbots();
        }
    }, [token, authLoading, router]);

    if (authLoading || loading) {
        return <div className={styles.container}><p>Loading...</p></div>;
    }

    // If loading is done and there's still no token, don't render (redirect is happening)
    if (!token) {
        return null;
    }

    // Handle error state
    if (error) {
        return <div className={styles.container}><p className={styles.error}>Error: {error}</p></div>;
    }

    return (
        <div className="container mx-auto px-4 py-8"> 
            <h1 className="text-2xl font-bold mb-6 text-gray-800 dark:text-gray-200">My Chatbots</h1>
            {error && <p className="text-red-500">Error: {error}</p>}
            {chatbots.length > 0 ? (
                 <ul className="space-y-4">
                     {chatbots.map((bot) => (
                         <li key={bot.id} className="bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
                             <Link href={`/dashboard/chatbots/${bot.id}`} legacyBehavior={false}> 
                                 <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 cursor-pointer">
                                     <img 
                                         src={bot.icon_url || 'https://via.placeholder.com/40?text=Bot'} 
                                         alt={`${bot.name} icon`} 
                                         className="w-12 h-12 rounded-full object-cover border border-gray-300 dark:border-gray-600 flex-shrink-0"
                                         onError={(e) => {
                                             (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=Bot';
                                         }} 
                                     />
                                     <div className="flex-grow">
                                         <p className="font-semibold text-lg text-gray-900 dark:text-gray-100 truncate">{bot.name}</p>
                                         <p className="text-sm text-gray-500 dark:text-gray-400">
                                             Created: {new Date(bot.created_at).toLocaleDateString()}
                                         </p>
                                     </div>
                                     {/* Optional: Add an indicator like an arrow */}
                                     <svg className="w-5 h-5 text-gray-400 dark:text-gray-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path></svg>
                                 </div>
                             </Link>
                         </li>
                     ))}
                 </ul>
            ) : (
                 <p className="text-gray-600 dark:text-gray-400">You haven't created any chatbots yet.</p>
            )}
        </div>
    );
};

export default MyChatbotsPage;
