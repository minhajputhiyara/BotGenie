export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';

export const API_ENDPOINTS = {
    createChatbot: `${API_BASE_URL}/api/chatbots/create`,
    chatbotProgress: `${API_BASE_URL}/api/chatbots/progress`,
    listChatbots: `${API_BASE_URL}/api/chatbots`,
    queryChatbot: (collectionName: string) => `${API_BASE_URL}/api/chatbots/${collectionName}/query`,
    deleteChatbot: (collectionName: string) => `${API_BASE_URL}/api/chatbots/${collectionName}`,
    getChatbotDetails: `${API_BASE_URL}/api/chatbots/details`,
};
