import React, { useState, useCallback, useEffect } from 'react';
import { AnalyticsResult, Platform } from './types';
import FileUpload from './components/FileUpload';
import WrappedStory from './components/WrappedStory';
import FAQ from './components/FAQ';
import { useAnalytics } from './hooks/useAnalytics';
import { motion } from 'framer-motion';

const App: React.FC = () => {
  const [platform, setPlatform] = useState<Platform>('ChatGPT');
  const [sharedData, setSharedData] = useState<AnalyticsResult | null>(null);
  const { analytics, error, isLoading, processFile, setAnalytics } = useAnalytics();

  useEffect(() => {
    // Handle mouse move for background gradient
    const handleMouseMove = (e: MouseEvent) => {
      document.body.style.setProperty('--x', `${e.clientX}px`);
      document.body.style.setProperty('--y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);

    // Check for shared data in URL on initial load
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const shareData = urlParams.get('share');
      if (shareData) {
        const decodedString = atob(shareData);
        const parsedData = JSON.parse(decodedString);
        
        // Re-hydrate date objects
        const hydratedData: AnalyticsResult = {
          ...parsedData,
          firstChatDate: new Date(parsedData.firstChatDate),
          lastChatDate: new Date(parsedData.lastChatDate),
        };
        setSharedData(hydratedData);
      }
    } catch (e) {
      console.error("Failed to parse shared data from URL:", e);
      // Silently fail and show the default upload screen
    }

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  const handleFileProcess = useCallback((content: string) => {
    setSharedData(null); // Clear any shared data if a new file is uploaded
    processFile(content, platform);
  }, [platform, processFile]);

  const handleReset = () => {
    setSharedData(null);
    setAnalytics(null);
    // Clear URL query params
    window.history.pushState({}, '', window.location.pathname);
  };
  
  const Header: React.FC = () => (
    <header className="text-center p-4 md:p-6">
        <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          AI Wrapped
        </h1>
        <p className="text-gray-400 mt-2">Your year in conversation, visualized.</p>
    </header>
  );

  const currentAnalytics = sharedData || analytics;
  const isShareView = !!sharedData;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Glinting light particles - only visible on initial screen */}
      {!currentAnalytics && !isLoading && (
        <div className="fixed inset-0 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`glint-${i}`}
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: [0, 0.8, 0],
                scale: [0, 1, 0],
              }}
              transition={{
                duration: 2 + Math.random() * 1,
                delay: i * 0.3,
                repeat: Infinity,
                repeatDelay: 1,
              }}
              className="absolute w-1 h-1 bg-white rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                boxShadow: '0 0 10px rgba(255, 255, 255, 0.8)',
              }}
            />
          ))}
        </div>
      )}

      <div className="w-full max-w-4xl mx-auto relative z-10">
        <Header />
        <main className="mt-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              {!currentAnalytics && !isLoading && (
                 <FileUpload
                    platform={platform}
                    setPlatform={setPlatform}
                    onFileProcess={handleFileProcess}
                    isLoading={isLoading}
                  />
              )}
            </motion.div>
          
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

          {currentAnalytics && !isLoading && (
            <WrappedStory analytics={currentAnalytics} onReset={handleReset} isShareView={isShareView} />
          )}
        </main>
      </div>
      {!currentAnalytics && !isLoading && <FAQ />}
    </div>
  );
};

export default App;