'use client';

import { useRef } from 'react';

interface FileUploaderProps {
  onFilesSelect: (files: File[]) => void;
  selectedFiles: File[];
}

export function FileUploader({ onFilesSelect, selectedFiles }: FileUploaderProps) {
  const filesInputRef = useRef<HTMLInputElement>(null);

  const handleFilesSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      const ext = file.name.split('.').pop()?.toLowerCase();
      return ext === 'pdf' || ext === 'docx' || ext === 'txt';
    });

    if (validFiles.length !== files.length) {
      alert('Some files were skipped. Only PDF, DOCX, and TXT files are supported.');
    }

    if (validFiles.length > 0) {
      onFilesSelect(validFiles);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...selectedFiles];
    newFiles.splice(index, 1);
    onFilesSelect(newFiles);
    if (filesInputRef.current) {
      filesInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* Knowledge Files Upload */}
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 transition-all hover:border-[rgb(58,37,124)] dark:hover:border-[rgb(91,69,163)]">
        <div className="text-center">
          <svg 
            className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth="2" 
              d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
            />
          </svg>
          <div className="mt-2">
            <button
              type="button"
              onClick={() => filesInputRef.current?.click()}
              className="text-sm font-medium text-[rgb(58,37,124)] dark:text-[rgb(91,69,163)] hover:text-[rgb(91,69,163)] dark:hover:text-[rgb(111,89,183)]"
            >
              Upload files
            </button>
            <input
              ref={filesInputRef}
              type="file"
              accept=".pdf,.docx,.txt"
              multiple
              onChange={handleFilesSelect}
              className="hidden"
            />
          </div>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            PDF, DOCX, TXT up to 10MB
          </p>
        </div>
      </div>

      {selectedFiles.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-700/30 rounded-lg p-4">
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Selected Files:</h4>
          <ul className="space-y-2">
            {selectedFiles.map((file, index) => (
              <li key={index} className="flex items-center justify-between text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 p-2 rounded-md shadow-sm">
                <div className="flex items-center">
                  <div className="w-8 h-8 rounded-full bg-[rgb(58,37,124)]/10 dark:bg-[rgb(91,69,163)]/20 flex items-center justify-center mr-2">
                    <svg className="w-4 h-4 text-[rgb(58,37,124)] dark:text-[rgb(91,69,163)]" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                  </div>
                  <span className="font-medium">{file.name}</span>
                </div>
                <button
                  type="button"
                  onClick={() => removeFile(index)}
                  className="text-red-500 hover:text-red-700 bg-red-100 dark:bg-red-900/30 rounded-full w-6 h-6 flex items-center justify-center"
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
