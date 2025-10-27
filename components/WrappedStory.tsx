import React, { useState, useEffect } from 'react';
import { AnalyticsResult, StoryStep, ThemeConfig, BackgroundEffect } from '../types';
import StatCard from './StatCard';
import BarChartViz from './BarChartViz';
import PersonaCard from './PersonaCard';
import TriviaQuestionCard from './TriviaQuestionCard';
import { generateStory } from '../services/storyService';
import { motion, AnimatePresence } from 'framer-motion';
import { Share2, Check } from 'lucide-react';

// Component to render background effects
const BackgroundEffects: React.FC<{ effect?: BackgroundEffect }> = ({ effect }) => {
  if (!effect) return null;

  const colorMap: Record<string, string> = {
    pink: 'rgba(236, 72, 153, 0.3)',
    blue: 'rgba(59, 130, 246, 0.3)',
    orange: 'rgba(249, 115, 22, 0.3)',
    teal: 'rgba(20, 184, 166, 0.3)',
    amber: 'rgba(217, 119, 6, 0.3)',
    indigo: 'rgba(99, 102, 241, 0.3)',
    violet: 'rgba(139, 92, 246, 0.3)',
    emerald: 'rgba(5, 150, 105, 0.3)',
    purple: 'rgba(168, 85, 247, 0.3)',
  };

  const color = colorMap[effect.color] || colorMap.purple;
  const intensity = { low: 0.1, medium: 0.5, high: 1 }[effect.intensity];
  const duration = effect.duration || 4;

  switch (effect.type) {
    case 'particles':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(15)].map((_, i) => {
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full blur-2xl"
                style={{
                  width: `${Math.random() * 80 + 40}px`,
                  height: `${Math.random() * 80 + 40}px`,
                  backgroundColor: color,
                  left: `${startX}%`,
                  top: `${startY}%`,
                }}
                animate={{
                  x: [`-${Math.random() * 20}%`, `${Math.random() * 20}%`],
                  y: [`-${Math.random() * 20}%`, `${Math.random() * 20}%`],
                  opacity: [0, intensity, 0],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay: i * 0.1,
                }}
              />
            );
          })}
        </div>
      );
    case 'lines':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-px"
              style={{
                width: '200%',
                backgroundColor: color,
                top: `${(i / 8) * 100}%`,
              }}
              animate={{
                x: ['-100%', '100%'],
                opacity: [0, intensity, 0],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay: i * 0.15,
              }}
            />
          ))}
        </div>
      );
    case 'shapes':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(6)].map((_, i) => {
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            return (
              <motion.div
                key={i}
                className="absolute rounded-3xl blur-xl"
                style={{
                  width: `${Math.random() * 100 + 50}px`,
                  height: `${Math.random() * 100 + 50}px`,
                  backgroundColor: color,
                  left: `${startX}%`,
                  top: `${startY}%`,
                }}
                animate={{
                  rotate: [0, 360],
                  x: [`-${Math.random() * 10}%`, `${Math.random() * 10}%`],
                  y: [`-${Math.random() * 10}%`, `${Math.random() * 10}%`],
                  opacity: [0.1, intensity, 0.1],
                }}
                transition={{
                  duration: duration + 2,
                  repeat: Infinity,
                  delay: i * 0.2,
                }}
              />
            );
          })}
        </div>
      );
    case 'wave':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(5)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute h-1"
              style={{
                width: '150%',
                backgroundColor: color,
                top: `${(i / 5) * 100}%`,
              }}
              animate={{
                x: [-100, 100],
                opacity: [0, intensity, 0],
                scaleY: [1, 2, 1],
              }}
              transition={{
                duration,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      );
    case 'grid':
      return (
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
            backgroundSize: '40px 40px',
          }}
        >
          <motion.div
            className="absolute inset-0"
            animate={{
              backgroundPosition: ['0px 0px', '40px 40px'],
              opacity: [intensity * 0.3, intensity],
            }}
            transition={{
              duration,
              repeat: Infinity,
            }}
            style={{
              backgroundImage: `linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)`,
              backgroundSize: '40px 40px',
            }}
          />
        </div>
      );
    case 'sparkles':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(20)].map((_, i) => {
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            return (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full"
                style={{
                  backgroundColor: color,
                  left: `${startX}%`,
                  top: `${startY}%`,
                }}
                animate={{
                  scale: [0, 1, 0],
                  x: [`-${Math.random() * 10}%`, `${Math.random() * 10}%`],
                  y: [`-${Math.random() * 10}%`, `${Math.random() * 10}%`],
                  opacity: [0, intensity, 0],
                }}
                transition={{
                  duration: duration * 0.7,
                  repeat: Infinity,
                  delay: i * 0.05,
                }}
              />
            );
          })}
        </div>
      );
    case 'fallingWords':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(12)].map((_, i) => {
            const words = ['code', 'debug', 'create', 'learn', 'think', 'build', 'solve', 'design', 'explore', 'innovate'];
            const randomWord = words[Math.floor(Math.random() * words.length)];
            const startX = Math.random() * 100;
            const delay = i * 0.8;
            const duration = 8 + Math.random() * 4;

            return (
              <motion.div
                key={i}
                className="absolute text-xs md:text-sm font-mono font-bold bg-gray-700/80 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-600/50 shadow-lg"
                style={{
                  color: '#E5E7EB',
                  left: `${startX}%`,
                  top: '-10%',
                }}
                animate={{
                  y: ['0vh', '110vh'],
                  rotate: [0, 360],
                  opacity: [0, intensity * 0.9, intensity * 0.9, 0],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay,
                  ease: 'linear',
                }}
              >
                {randomWord}
              </motion.div>
            );
          })}
        </div>
      );
    case 'orbs':
      return (
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          {[...Array(4)].map((_, i) => {
            const startX = Math.random() * 100;
            const startY = Math.random() * 100;
            return (
              <motion.div
                key={i}
                className="absolute rounded-full blur-3xl"
                style={{
                  width: `${Math.random() * 200 + 100}px`,
                  height: `${Math.random() * 200 + 100}px`,
                  backgroundColor: color,
                  left: `${startX}%`,
                  top: `${startY}%`,
                }}
                animate={{
                  scale: [0.8, 1.2, 0.8],
                  x: [`-${Math.random() * 15}%`, `${Math.random() * 15}%`],
                  y: [`-${Math.random() * 15}%`, `${Math.random() * 15}%`],
                  opacity: [intensity * 0.2, intensity, intensity * 0.2],
                }}
                transition={{
                  duration,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            );
          })}
        </div>
      );
    default:
      return null;
  }
};

// CSS Animations for different moods
const getThemeStyles = (theme?: ThemeConfig) => {
  if (!theme) return {};

  const animationClasses = {
    'glow': 'animate-glow',
    'shimmer': 'animate-shimmer',
    'float': 'animate-float',
    'none': '',
  };

  // Text styling based on animation to ensure readability
  const textStyleClasses = {
    'glow': 'drop-shadow-xl', // Glow can benefit from stronger shadow
    'shimmer': 'drop-shadow-2xl', // Shimmer is very distracting, needs strongest shadow
    'float': 'drop-shadow-lg', // Float is subtle, normal shadow works
    'none': 'drop-shadow-md', // Default shadow
  };

  const bgGradient = `bg-gradient-to-br ${theme.bgFrom} ${theme.bgTo}`;
  const animation = animationClasses[theme.animation] || '';
  const textClass = textStyleClasses[theme.animation] || 'drop-shadow-md';

  return {
    bgGradient,
    animation,
    textClass,
    customClass: theme.customClass || '',
  };
};

interface WrappedStoryProps {
  analytics: AnalyticsResult;
  onReset: () => void;
  isShareView: boolean;
}

const WrappedStory: React.FC<WrappedStoryProps> = ({ analytics, onReset, isShareView }) => {
  const [step, setStep] = useState(0);
  const [storySteps, setStorySteps] = useState<StoryStep[] | null>(null);
  const [isGeneratingStory, setIsGeneratingStory] = useState(true);
  const [storyError, setStoryError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    const createStory = async () => {
      try {
        setIsGeneratingStory(true);
        setStoryError(null);
        // If it's a share view, we don't need to re-run the most expensive AI parts.
        // For simplicity in this update, we'll re-run it, but this could be optimized
        // by storing the AI-generated text in the shareable data.
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

  const handleShare = () => {
    const dataToShare = { ...analytics };
    // Remove potentially large and sensitive userMessages array before sharing
    // @ts-ignore
    delete dataToShare.userMessages;

    const jsonString = JSON.stringify(dataToShare);
    const base64String = btoa(jsonString);
    const url = `${window.location.origin}${window.location.pathname}?share=${base64String}`;
    
    navigator.clipboard.writeText(url).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000); // Reset after 2 seconds
    });
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === 'ArrowRight' || e.key === ' ' || e.key === 'Enter') && step < totalSteps - 1) {
        e.preventDefault();
        nextStep();
      }
      if (e.key === 'ArrowLeft' && step > 0) {
        e.preventDefault();
        prevStep();
      }
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
    const themeStyles = getThemeStyles(currentStepData.theme);

    switch (currentStepData.component) {
      case 'StatCard': {
        const { component, theme, ...props } = currentStepData;
        return <StatCard key={step} {...props} themeStyles={themeStyles} textClass={themeStyles.textClass} />;
      }
      case 'BarChartViz': {
        const { component, theme, ...props } = currentStepData;
        return <BarChartViz key={step} {...props} themeStyles={themeStyles} textClass={themeStyles.textClass} />;
      }
      case 'PersonaCard': {
        const { component, theme, ...props } = currentStepData;
        return <PersonaCard key={step} {...props} themeStyles={themeStyles} textClass={themeStyles.textClass} />;
      }
      case 'TriviaCard': {
        const { component, theme, title, ...props } = currentStepData;
        return (
          <TriviaQuestionCard
            key={step}
            {...props}
            onAnswer={() => {}} // Will auto-advance in storyService callback if needed
            themeStyles={themeStyles}
            textClass={themeStyles.textClass}
          />
        );
      }
      default:
        return null;
    }
  };

  const themeStyles = getThemeStyles(currentStepData?.theme);
  const bgClass = themeStyles.bgGradient || 'bg-gradient-to-br from-gray-700 to-gray-900';
  const animationClass = themeStyles.animation || '';
  const customClass = themeStyles.customClass || '';
  const progressBarColor = currentStepData?.theme?.progressBarColor || 'bg-purple-500';

  return (
    <>
      {/* Fixed Progress Bar at Top */}
      <div className="fixed top-0 left-0 right-0 w-full bg-gray-800/80 h-1 z-50 backdrop-blur-sm">
        <motion.div
          className={`h-full ${progressBarColor} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        />
      </div>

      {/* Full Background Effects (behind the card) */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <BackgroundEffects effect={currentStepData?.theme?.backgroundEffect} />
      </div>

      <div className="relative w-full max-w-4xl mx-auto flex items-center gap-4">
        {/* Left Click Zone */}
        {step > 0 && (
          <motion.button
            whileHover={{ scale: 1.1, x: -5 }}
            whileTap={{ scale: 0.9 }}
            onClick={prevStep}
            className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-700/80 hover:bg-gray-600 border border-gray-500 transition-all z-20 group"
            aria-label="Previous"
          >
            <svg className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </motion.button>
        )}

        <motion.div
          key={`step-${step}`}
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
          className={`relative w-full max-w-2xl mx-auto p-4 md:p-8 ${bgClass} rounded-2xl border border-gray-600 backdrop-blur-sm min-h-[500px] flex flex-col justify-between transition-all duration-1000 ${animationClass} ${customClass} overflow-hidden z-10`}
        >

        {/* Decorative background shapes */}
        <motion.div
          key={`shapes-${step}`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8 }}
          className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl"
        >
          {/* Top-left circle */}
          <motion.div
            initial={{ scale: 0, x: -50, y: -50 }}
            animate={{ scale: 1, x: 0, y: 0 }}
            transition={{ duration: 1.5, delay: 0.2 }}
            className="absolute -top-24 -left-24 w-40 h-40 rounded-full bg-white/10 blur-3xl"
          />
          {/* Bottom-right circle */}
          <motion.div
            initial={{ scale: 0, x: 50, y: 50 }}
            animate={{ scale: 1, x: 0, y: 0 }}
            transition={{ duration: 1.5, delay: 0.3 }}
            className="absolute -bottom-20 -right-20 w-52 h-52 rounded-full bg-white/10 blur-3xl"
          />
          {/* Center accent shape */}
          <motion.div
            initial={{ scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ duration: 1.5, delay: 0.4 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 rounded-3xl bg-white/5 blur-2xl transform"
          />
        </motion.div>

        <div className="flex-grow flex items-center justify-center relative z-10">
          <AnimatePresence mode="wait">
            {renderStep()}
          </AnimatePresence>
        </div>

        <div className="mt-8 relative z-20">
          {/* Progress dots */}
          <div className="flex justify-center gap-1.5 mb-4">
            {[...Array(totalSteps)].map((_, i) => (
              <motion.button
                key={i}
                onClick={() => setStep(i)}
                whileHover={{ scale: 1.3 }}
                whileTap={{ scale: 0.9 }}
                className={`h-2 rounded-full transition-all ${
                  i === step
                    ? 'w-8 bg-purple-500'
                    : i < step
                    ? 'w-2 bg-purple-400/50'
                    : 'w-2 bg-gray-600'
                }`}
                aria-label={`Go to step ${i + 1}`}
              />
            ))}
          </div>

          <div className="flex justify-between items-center">
            <motion.button
              onClick={prevStep}
              disabled={step === 0}
              whileHover={{ scale: 1.05, x: -3 }}
              whileTap={{ scale: 0.95 }}
              className="px-5 py-2.5 bg-gray-700 rounded-xl disabled:opacity-30 disabled:cursor-not-allowed hover:bg-gray-600 transition-all font-semibold flex items-center gap-2 shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back
            </motion.button>
            {step < totalSteps - 1 ? (
               <motion.button
                  onClick={nextStep}
                  whileHover={{ scale: 1.05, x: 3 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-5 py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all font-semibold flex items-center gap-2 shadow-lg shadow-purple-500/50"
               >
                  Continue
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
               </motion.button>
            ) : (
               <div className="flex items-center gap-2">
                  {!isShareView && (
                    <motion.button
                      onClick={handleShare}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 bg-teal-600 rounded-xl hover:bg-teal-700 transition-all font-semibold flex items-center gap-2 shadow-lg"
                    >
                      {isCopied ? <><Check size={18}/> Copied!</> : <><Share2 size={18}/> Share</>}
                    </motion.button>
                  )}
                  <motion.button
                      onClick={onReset}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="px-5 py-2.5 bg-gradient-to-r from-pink-600 to-rose-600 rounded-xl hover:from-pink-700 hover:to-rose-700 transition-all font-semibold shadow-lg shadow-pink-500/50"
                  >
                      {isShareView ? 'Create Your Own' : 'Start Over'}
                  </motion.button>
               </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Right Click Zone */}
      {step < totalSteps - 1 && (
        <motion.button
          whileHover={{ scale: 1.1, x: 5 }}
          whileTap={{ scale: 0.9 }}
          onClick={nextStep}
          className="hidden md:flex items-center justify-center w-12 h-12 rounded-full bg-gray-700/80 hover:bg-gray-600 border border-gray-500 transition-all z-20 group"
          aria-label="Next"
        >
          <svg className="w-6 h-6 text-white group-hover:text-purple-400 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </motion.button>
      )}
    </div>
    </>
  );
};

export default WrappedStory;