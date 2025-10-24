
import { useState, useCallback } from 'react';
import { AnalyticsResult, Platform } from '../types';
import { analyzeData, parseData } from '../services/dataProcessor';

export const useAnalytics = () => {
  const [analytics, setAnalytics] = useState<AnalyticsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const processFile = useCallback((fileContent: string, platform: Platform) => {
    setIsLoading(true);
    setError(null);
    setAnalytics(null);

    // Use a timeout to ensure the UI updates to the loading state before the heavy processing begins
    setTimeout(() => {
        try {
            const parsedConversations = parseData(fileContent, platform);
            if (parsedConversations.length === 0) {
              throw new Error("No valid conversations found. Please check your export file and selected platform.");
            }
            const analysisResults = analyzeData(parsedConversations, platform);
            setAnalytics(analysisResults);
        } catch (e) {
            console.error(e);
            if (e instanceof Error) {
                setError(`Failed to process file: ${e.message}. Please ensure you've uploaded the correct JSON file for ${platform}.`);
            } else {
                setError('An unknown error occurred during processing.');
            }
        } finally {
            setIsLoading(false);
        }
    }, 100);

  }, []);

  return { analytics, error, isLoading, processFile };
};
