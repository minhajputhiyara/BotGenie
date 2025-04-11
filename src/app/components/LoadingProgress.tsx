'use client';

interface LoadingProgressProps {
  stage: string;
  message: string;
  progress: number;
}

export function LoadingProgress({ stage, message, progress }: LoadingProgressProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-8 max-w-md w-full mx-4 shadow-xl border border-gray-100 dark:border-gray-700">
        <div className="space-y-6">
          {/* Loading Icon */}
          <div className="flex justify-center">
            {stage === 'complete' ? (
              <div className="h-16 w-16 rounded-full bg-gradient-to-br from-[rgb(58,37,124)] to-[rgb(91,69,163)] flex items-center justify-center text-white">
                <svg
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
            ) : (
              <div className="relative h-16 w-16">
                <div className="absolute inset-0 rounded-full border-4 border-gray-200 dark:border-gray-700"></div>
                <div 
                  className="absolute inset-0 rounded-full border-4 border-t-[rgb(58,37,124)] border-r-transparent border-b-transparent border-l-transparent animate-spin"
                  style={{ animationDuration: '1.5s' }}
                ></div>
              </div>
            )}
          </div>

          {/* Progress Message */}
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              {message}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {progress.toFixed(0)}% Complete
            </p>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-[rgb(58,37,124)] to-[rgb(91,69,163)] h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Stage Indicators */}
          <div className="grid grid-cols-4 gap-2 relative">
            <div className="absolute h-0.5 bg-gray-200 dark:bg-gray-700 top-3 left-0 right-0 -z-10"></div>
            {[
              { key: 'uploading', label: 'Upload' },
              { key: 'processing', label: 'Process' },
              { key: 'building', label: 'Build' },
              { key: 'complete', label: 'Ready' },
            ].map((s, index) => {
              const isActive = stage === s.key;
              const isPast = ['uploading', 'processing', 'building', 'complete'].indexOf(stage) >= 
                            ['uploading', 'processing', 'building', 'complete'].indexOf(s.key);
              
              return (
                <div key={s.key} className="flex flex-col items-center">
                  <div className={`w-6 h-6 rounded-full mb-1 flex items-center justify-center ${
                    isActive 
                      ? 'bg-gradient-to-br from-[rgb(58,37,124)] to-[rgb(91,69,163)] text-white' 
                      : isPast 
                        ? 'bg-[rgb(91,69,163)] bg-opacity-30 text-[rgb(58,37,124)] dark:text-[rgb(91,69,163)]' 
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-400'
                  }`}>
                    {isPast && <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                    </svg>}
                    {!isPast && index + 1}
                  </div>
                  <div
                    className={`text-center text-xs ${
                      isActive
                        ? 'text-[rgb(58,37,124)] dark:text-[rgb(91,69,163)] font-medium'
                        : isPast
                        ? 'text-[rgb(58,37,124)] dark:text-[rgb(91,69,163)]'
                        : 'text-gray-400'
                    }`}
                  >
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
