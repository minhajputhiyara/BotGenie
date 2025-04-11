'use client';

interface ChatbotConfirmationProps {
  data: {
    businessName: string;
    businessType: string;
    chatbotName: string;
    chatbotType: string;
    chatbotIcon: File | null;
    knowledgeFiles: File[];
  };
  onEdit: () => void;
  onConfirm: () => void;
  onRemoveFile: (index: number) => void;
}

export function ChatbotConfirmation({ data, onEdit, onConfirm, onRemoveFile }: ChatbotConfirmationProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-lg rounded-xl p-6 border border-gray-100 dark:border-gray-700">
      <div className="flex items-center mb-6">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[rgb(58,37,124)] to-[rgb(91,69,163)] flex items-center justify-center text-white mr-4">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Confirm Chatbot Details
        </h2>
      </div>

      <div className="space-y-6">
        {/* Business Details */}
        <div>
          <div className="flex items-center mb-4">
            <div className="h-6 w-1 bg-gradient-to-b from-[rgb(58,37,124)] to-[rgb(91,69,163)] rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Business Details
            </h3>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{data.businessName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Business Type</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{data.businessType}</dd>
            </div>
          </dl>
        </div>

        {/* Chatbot Details */}
        <div>
          <div className="flex items-center mb-4">
            <div className="h-6 w-1 bg-gradient-to-b from-[rgb(58,37,124)] to-[rgb(91,69,163)] rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Chatbot Details
            </h3>
          </div>
          <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Chatbot Name</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{data.chatbotName}</dd>
            </div>
            <div>
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Chatbot Type</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">{data.chatbotType}</dd>
            </div>
          </dl>
        </div>

        {/* Files */}
        <div>
          <div className="flex items-center mb-4">
            <div className="h-6 w-1 bg-gradient-to-b from-[rgb(58,37,124)] to-[rgb(91,69,163)] rounded-full mr-3"></div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Files
            </h3>
          </div>
          
          {/* Icon */}
          {data.chatbotIcon && (
            <div className="mb-4 bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">Icon</dt>
              <dd className="mt-1 text-sm text-gray-900 dark:text-white font-medium">
                {data.chatbotIcon.name}
              </dd>
            </div>
          )}

          {/* Knowledge Files */}
          {data.knowledgeFiles && data.knowledgeFiles.length > 0 && (
            <div className="bg-gray-50 dark:bg-gray-700/30 p-4 rounded-lg">
              <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
                Knowledge Base Files
              </dt>
              <dd className="mt-1">
                <ul className="space-y-2">
                  {data.knowledgeFiles.map((file, index) => (
                    <li key={index} className="flex items-center justify-between text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 p-2 rounded-md">
                      <span className="font-medium">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => onRemoveFile(index)}
                        className="text-red-500 hover:text-red-700 bg-red-100 dark:bg-red-900/30 rounded-full w-6 h-6 flex items-center justify-center"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              </dd>
            </div>
          )}
        </div>

        {/* Buttons */}
        <div className="flex justify-end space-x-4 pt-4">
          <button
            type="button"
            onClick={onEdit}
            className="inline-flex justify-center py-2 px-6 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(58,37,124)] transition-all duration-200"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex justify-center py-2 px-6 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-gradient-to-r from-[rgb(58,37,124)] to-[rgb(91,69,163)] hover:from-[rgb(68,47,134)] hover:to-[rgb(101,79,173)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[rgb(58,37,124)] transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Create Chatbot
          </button>
        </div>
      </div>
    </div>
  );
}
