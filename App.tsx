
import React, { useState, useCallback } from 'react';
import { AnalyticsResult, Platform } from './types';
import FileUpload from './components/FileUpload';
import WrappedStory from './components/WrappedStory';
import { useAnalytics } from './hooks/useAnalytics';

const App: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('ChatGPT');
  const [fileContent, setFileContent] = useState<string | null>(null);
  const { analytics, error, isLoading, processFile } = useAnalytics();

  const handleFileProcess = useCallback((content: string) => {
    setFileContent(content);
    processFile(content, platform);
  }, [platform, processFile]);

  const handleReset = () => {
    setFileContent(null);
    // analytics are reset inside the hook, but we could clear them here too if needed
  };
  
  const Header: React.FC = () => (
    <header className="text-center p-4 md:p-6">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          AI Wrapped
        </h1>
        <p className="text-gray-400 mt-2">Your year in conversation, visualized.</p>
    </header>
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto">
        <Header />
        <main className="mt-8">
          {!analytics && !isLoading && (
             <FileUpload
                platform={platform}
                setPlatform={setPlatform}
                onFileProcess={handleFileProcess}
                isLoading={isLoading}
              />
          )}
          
          {isLoading && (
            <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-lg">
                <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-400"></div>
                <p className="mt-4 text-lg font-semibold">Analyzing your conversations...</p>
                <p className="text-gray-400">This happens entirely in your browser. Your data is safe.</p>
            </div>
          )}

          {error && (
             <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg">
                <h2 className="text-2xl font-bold text-red-400">Oops! Something went wrong.</h2>
                <p className="mt-2 text-red-300">{error}</p>
                <button
                    onClick={handleReset}
                    className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
                >
                    Try Again
                </button>
            </div>
          )}

          {analytics && !isLoading && (
            <WrappedStory analytics={analytics} onReset={handleReset} />
          )}
        </main>
      </div>
    </div>
  );
};

export default App;
