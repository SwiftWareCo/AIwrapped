import React, { useState, useEffect } from 'react';
import { AnalyticsResult, StoryStep } from '../types';
import StatCard from './StatCard';
import BarChartViz from './BarChartViz';
import PersonaCard from './PersonaCard';
import { generateStory } from '../services/storyService';
import { motion, AnimatePresence } from 'framer-motion';

interface WrappedStoryProps {
  analytics: AnalyticsResult;
  onReset: () => void;
}

const WrappedStory: React.FC<WrappedStoryProps> = ({ analytics, onReset }) => {
  const [step, setStep] = useState(0);
  const [storySteps, setStorySteps] = useState<StoryStep[] | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(true);
  const [storyError, setStoryError] = useState<string | null>(null);

  useEffect(() => {
    const createStory = async () => {
      try {
        setIsGeneratingStory(true);
        setStoryError(null);
        const generatedSteps = await generateStory(analytics);
        setStorySteps(generatedSteps);
      } catch (e) {
        console.error("Failed to generate story:", e);
        if (e instanceof Error) {
          setStoryError(`Could not generate your story. This can happen if the AI is unavailable or if there's an issue with your data. Error: ${e.message}`);
        } else {
          setStoryError("An unknown error occurred while crafting your story.");
        }
      } finally {
        setIsGeneratingStory(false);
      }
    };
    createStory();
  }, [analytics]);

  const totalSteps = storySteps?.length ?? 0;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' && step < totalSteps - 1) nextStep();
      if (e.key === 'ArrowLeft' && step > 0) prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, totalSteps]);

  if (isGeneratingStory) {
    return (
      <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 rounded-lg min-h-[500px]">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-pink-400"></div>
        <p className="mt-4 text-lg font-semibold">Crafting your personalized story...</p>
        <p className="text-gray-400">Our AI is adding a little flair!</p>
      </div>
    );
  }

  if (storyError) {
    return (
      <div className="text-center p-8 bg-red-900/20 border border-red-500 rounded-lg min-h-[500px]">
        <h2 className="text-2xl font-bold text-red-400">Story Generation Failed</h2>
        <p className="mt-2 text-red-300">{storyError}</p>
        <button
          onClick={onReset}
          className="mt-6 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (!storySteps || storySteps.length === 0) {
    return (
      <div className="text-center p-8">No story to tell. <button onClick={onReset} className="text-purple-400 hover:underline">Try again?</button></div>
    );
  }

  const currentStepData = storySteps[step];

  const renderStep = () => {
    if (!currentStepData) return null;
    switch (currentStepData.component) {
      case 'StatCard': {
        const { component, ...props } = currentStepData;
        return <StatCard key={step} {...props} />;
      }
      case 'BarChartViz': {
        const { component, ...props } = currentStepData;
        return <BarChartViz key={step} {...props} />;
      }
      case 'PersonaCard': {
        const { component, ...props } = currentStepData;
        return <PersonaCard key={step} {...props} />;
      }
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto p-4 md:p-8 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[500px] flex flex-col justify-between">
      <div className="flex-grow flex items-center justify-center">
        <AnimatePresence mode="wait">
          {renderStep()}
        </AnimatePresence>
      </div>
      
      <div className="mt-8">
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <motion.div
            className="bg-purple-500 h-1.5 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
          ></motion.div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-600 transition-colors"
          >
            Prev
          </button>
          <span>{step + 1} / {totalSteps}</span>
          {step < totalSteps - 1 ? (
             <button
                onClick={nextStep}
                className="px-4 py-2 bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors"
             >
                Next
             </button>
          ) : (
             <button
                onClick={onReset}
                className="px-4 py-2 bg-pink-600 rounded-lg hover:bg-pink-700 transition-colors"
            >
                Start Over
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default WrappedStory;
