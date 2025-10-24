import React, { useState, useEffect } from 'react';
import { AnalyticsResult } from '../types';
import StatCard from './StatCard';
import BarChartViz from './BarChartViz';
import {
  BarChart,
  Users,
  Clock,
  Calendar,
  Zap,
  Award,
  MessageSquare
} from 'lucide-react';
// FIX: Add LucideProps import for type definitions.
import type { LucideProps } from 'lucide-react';

interface WrappedStoryProps {
  analytics: AnalyticsResult;
  onReset: () => void;
}

// FIX: Define props for each step type to create a discriminated union.
interface StatCardStepProps {
  component: 'StatCard';
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<LucideProps>;
}

interface BarChartVizStepProps {
  component: 'BarChartViz';
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
}

type StoryStep = StatCardStepProps | BarChartVizStepProps;

const WrappedStory: React.FC<WrappedStoryProps> = ({ analytics, onReset }) => {
  const [step, setStep] = useState(0);

  // FIX: Apply the StoryStep[] type to the storySteps array.
  const storySteps: StoryStep[] = [
    {
      component: 'StatCard',
      title: 'Your Year in Review',
      value: analytics.platform,
      description: `You had ${analytics.totalConversations} conversations spanning from ${analytics.firstChatDate.toLocaleDateString()} to ${analytics.lastChatDate.toLocaleDateString()}.`,
      icon: Users
    },
    {
      component: 'StatCard',
      title: 'Message Volume',
      value: analytics.totalMessages.toLocaleString(),
      description: `messages exchanged in total. You sent ${analytics.userMessageCount.toLocaleString()} and the AI sent ${analytics.assistantMessageCount.toLocaleString()}.`,
      icon: MessageSquare
    },
    {
      component: 'StatCard',
      title: 'Longest Streak',
      value: `${analytics.longestStreak} days`,
      description: `Was your longest stretch of consecutive daily chats. Talk about commitment!`,
      icon: Zap
    },
    {
        component: 'StatCard',
        title: 'Your Persona',
        value: analytics.userPersona.title,
        description: analytics.userPersona.description,
        icon: Award
    },
    {
      component: 'BarChartViz',
      title: 'Busiest Day of the Week',
      data: analytics.dailyActivity,
      dataKey: 'count',
      xAxisKey: 'day',
      description: `Looks like ${analytics.busiestDay.day} was your go-to day for chatting.`,
      icon: Calendar
    },
    {
      component: 'BarChartViz',
      title: 'Most Active Hour',
      data: analytics.hourlyActivity,
      dataKey: 'count',
      xAxisKey: 'hour',
      description: `You were most active around ${analytics.busiestHour.hour}. A true night owl or an early bird?`,
      icon: Clock
    },
    {
      component: 'BarChartViz',
      title: 'Monthly Activity',
      data: analytics.monthlyActivity,
      dataKey: 'count',
      xAxisKey: 'month',
      description: "Here's a look at your chat activity throughout the year.",
      icon: BarChart
    },
  ];

  const totalSteps = storySteps.length;

  const nextStep = () => setStep(prev => Math.min(prev + 1, totalSteps - 1));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 0));

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight') nextStep();
      if (e.key === 'ArrowLeft') prevStep();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const currentStepData = storySteps[step];

  const renderStep = () => {
    // FIX: With proper typing, the switch statement will correctly narrow the type of currentStepData.
    switch (currentStepData.component) {
      case 'StatCard': {
        const { component, ...props } = currentStepData;
        return <StatCard {...props} />;
      }
      case 'BarChartViz': {
        const { component, ...props } = currentStepData;
        return <BarChartViz {...props} />;
      }
      default:
        return null;
    }
  };

  return (
    <div className="relative w-full max-w-2xl mx-auto p-4 md:p-8 bg-gray-800/50 rounded-2xl border border-gray-700 backdrop-blur-sm min-h-[500px] flex flex-col justify-between">
      <div className="flex-grow flex items-center justify-center">
        {renderStep()}
      </div>
      
      <div className="mt-8">
        <div className="w-full bg-gray-700 rounded-full h-1.5">
          <div
            className="bg-purple-500 h-1.5 rounded-full transition-all duration-300"
            style={{ width: `${((step + 1) / totalSteps) * 100}%` }}
          ></div>
        </div>
        <div className="flex justify-between items-center mt-4">
          <button
            onClick={prevStep}
            disabled={step === 0}
            className="px-4 py-2 bg-gray-700 rounded-lg disabled:opacity-50 hover:bg-gray-600 transition-colors"
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
