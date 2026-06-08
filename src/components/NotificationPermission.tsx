import React from 'react';
import { useFCM } from '../hooks/useFCM';

export const NotificationPermission: React.FC = () => {
  const { permission, requestPermission, token, error } = useFCM();

  return (
    <div className="p-6 border border-gray-200 rounded-lg shadow-sm bg-white mb-6">
      <h3 className="text-xl font-bold mb-4 text-gray-800">Notification Settings</h3>
      <div className="mb-4 text-gray-700 flex items-center gap-2">
        <span>Status:</span>
        <span className={`px-2 py-1 rounded text-sm font-semibold ${permission === 'granted' ? 'bg-green-100 text-green-800' : permission === 'denied' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
          {permission}
        </span>
      </div>
      
      {permission !== 'granted' && (
        <button 
          onClick={requestPermission}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          Enable Notifications
        </button>
      )}

      {error && (
        <div className="text-red-500 mt-3 text-sm bg-red-50 p-3 rounded">{error}</div>
      )}

      {token && (
        <div className="mt-6 border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Your FCM Token:</p>
          <div className="relative">
            <pre className="bg-gray-50 p-3 rounded-md text-xs text-gray-600 overflow-x-auto border border-gray-200">
              {token}
            </pre>
            <button 
              onClick={() => navigator.clipboard.writeText(token)}
              className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 p-1"
              title="Copy to clipboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
            </button>
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Use this token to send a test message directly from the Firebase Console.
          </p>
        </div>
      )}
    </div>
  );
};
