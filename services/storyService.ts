import { AnalyticsResult, StoryStep } from '../types';
import { formatDate } from '../utils/formatters';
import { generatePersonaDescription, generateTopicSummary } from './geminiService';
import { generateTriviaQuestion } from './triviaService';
import {
  BarChart,
  Users,
  Clock,
  Calendar,
  Zap,
  Lightbulb,
  MessageSquare,
  Repeat,
} from 'lucide-react';

export const generateStory = async (analytics: AnalyticsResult): Promise<StoryStep[]> => {
  // Start AI-powered content generation in parallel
  const topicSummaryPromise = generateTopicSummary(analytics.userMessages);
  const bombasticDescriptionPromise = generatePersonaDescription(analytics.userPersona, analytics.wordFrequency);

  const steps: StoryStep[] = [];

  // --- Step 1: Intro ---
  steps.push({
    component: 'StatCard',
    title: 'Your Year in Review',
    value: analytics.platform,
    description: `You had ${analytics.totalConversations} conversations from ${formatDate(analytics.firstChatDate)} to ${formatDate(analytics.lastChatDate)}.`,
    icon: Users,
    theme: {
      bgFrom: 'from-pink-600',
      bgTo: 'to-purple-600',
      animation: 'glow',
      mood: 'bright',
      customClass: 'shadow-2xl shadow-pink-500/50',
      backgroundEffect: {
        type: 'particles',
        color: 'pink',
        intensity: 'medium',
        duration: 4,
      },
      progressBarColor: 'bg-pink-500',
    },
  });

  // --- Step 2: Message Volume ---
  steps.push({
    component: 'StatCard',
    title: 'Message Volume',
    value: analytics.totalMessages.toLocaleString(),
    description: `messages exchanged. You sent ${analytics.userMessageCount.toLocaleString()} and the AI sent ${analytics.assistantMessageCount.toLocaleString()}.`,
    icon: MessageSquare,
    theme: {
      bgFrom: 'from-blue-600',
      bgTo: 'to-cyan-500',
      animation: 'shimmer',
      mood: 'energetic',
      customClass: 'shadow-2xl shadow-blue-500/50',
      backgroundEffect: {
        type: 'lines',
        color: 'blue',
        intensity: 'high',
        duration: 3,
      },
      progressBarColor: 'bg-blue-500',
    },
  });
  
  // --- Conditional Steps ---
  // Show longest streak if it's significant
  if (analytics.longestStreak > 5) {
    steps.push({
      component: 'StatCard',
      title: 'Longest Streak',
      value: `${analytics.longestStreak} days`,
      description: `Was your longest stretch of consecutive daily chats. Talk about commitment!`,
      icon: Zap,
      theme: {
        bgFrom: 'from-orange-500',
        bgTo: 'to-red-600',
        animation: 'pulse',
        mood: 'energetic',
        customClass: 'shadow-2xl shadow-orange-500/50',
        backgroundEffect: {
          type: 'shapes',
          color: 'orange',
          intensity: 'high',
          duration: 5,
        },
        progressBarColor: 'bg-orange-500',
      },
    });
  }

  // Show avg messages if it's high
  if (analytics.avgMessagesPerConvo > 15) {
      steps.push({
        component: 'StatCard',
        title: 'Deep Dives',
        value: `${analytics.avgMessagesPerConvo} messages`,
        description: 'Was your average per conversation. You love to explore topics thoroughly!',
        icon: Repeat,
        theme: {
          bgFrom: 'from-teal-600',
          bgTo: 'to-green-600',
          animation: 'float',
          mood: 'calm',
          customClass: 'shadow-2xl shadow-teal-500/50',
          backgroundEffect: {
            type: 'wave',
            color: 'teal',
            intensity: 'medium',
            duration: 6,
          },
          progressBarColor: 'bg-teal-500',
        },
      });
  }
  
  // --- New AI Step: Top Topic ---
  const topicSummary = await topicSummaryPromise;
  if (topicSummary) {
      steps.push({
        component: 'StatCard',
        title: 'Your Top Topic',
        value: topicSummary.title,
        description: topicSummary.insight,
        icon: Lightbulb,
        theme: {
          bgFrom: 'from-amber-500',
          bgTo: 'to-yellow-400',
          animation: 'glow',
          mood: 'bright',
          customClass: 'shadow-2xl shadow-yellow-500/50',
          backgroundEffect: {
            type: 'orbs',
            color: 'amber',
            intensity: 'high',
            duration: 4,
          },
          progressBarColor: 'bg-amber-500',
        },
      });
  }

  // --- Trivia Question Step ---
  const triviaQuestion = generateTriviaQuestion(analytics);
  steps.push({
    component: 'TriviaCard',
    title: 'Quick Quiz',
    question: triviaQuestion.question,
    options: triviaQuestion.options,
    correctAnswerIndex: triviaQuestion.correctAnswerIndex,
    theme: {
      bgFrom: 'from-cyan-600',
      bgTo: 'to-blue-600',
      animation: 'pulse',
      mood: 'bright',
      customClass: 'shadow-2xl shadow-cyan-500/50',
      backgroundEffect: {
        type: 'sparkles',
        color: 'cyan',
        intensity: 'high',
        duration: 3,
      },
      progressBarColor: 'bg-cyan-500',
    },
  });

  // --- Step 4 & 5: Activity Charts ---
  steps.push({
    component: 'BarChartViz',
    title: 'Busiest Day of the Week',
    data: analytics.dailyActivity,
    dataKey: 'count',
    xAxisKey: 'day',
    description: `Looks like ${analytics.busiestDay.day} was your go-to day for chatting.`,
    icon: Calendar,
    theme: {
      bgFrom: 'from-indigo-600',
      bgTo: 'to-purple-500',
      animation: 'shimmer',
      mood: 'calm',
      customClass: 'shadow-2xl shadow-indigo-500/50',
      backgroundEffect: {
        type: 'grid',
        color: 'indigo',
        intensity: 'medium',
        duration: 5,
      },
      progressBarColor: 'bg-indigo-500',
    },
  });

  steps.push({
    component: 'BarChartViz',
    title: 'Most Active Hour',
    data: analytics.hourlyActivity,
    dataKey: 'count',
    xAxisKey: 'hour',
    description: `You were most active around ${analytics.busiestHour.hour}. A true night owl or an early bird?`,
    icon: Clock,
    theme: {
      bgFrom: 'from-violet-600',
      bgTo: 'to-fuchsia-500',
      animation: 'float',
      mood: 'calm',
      customClass: 'shadow-2xl shadow-violet-500/50',
      backgroundEffect: {
        type: 'sparkles',
        color: 'violet',
        intensity: 'high',
        duration: 4,
      },
      progressBarColor: 'bg-violet-500',
    },
  });
  
  // --- Step 6: Monthly Activity ---
  if(analytics.monthlyActivity.length > 1) {
    steps.push({
        component: 'BarChartViz',
        title: 'Monthly Activity',
        data: analytics.monthlyActivity,
        dataKey: 'count',
        xAxisKey: 'month',
        description: "Here's a look at your chat activity throughout the year.",
        icon: BarChart,
        theme: {
          bgFrom: 'from-emerald-600',
          bgTo: 'to-cyan-600',
          animation: 'shimmer',
          mood: 'calm',
          customClass: 'shadow-2xl shadow-emerald-500/50',
          backgroundEffect: {
            type: 'lines',
            color: 'emerald',
            intensity: 'medium',
            duration: 5,
          },
          progressBarColor: 'bg-emerald-500',
        },
    });
  }

  // --- Final Step: Bombastic Persona Reveal ---
  const bombasticDescription = await bombasticDescriptionPromise;

  steps.push({
      component: 'PersonaCard',
      title: "Your AI Personality Is...",
      personaTitle: `${analytics.userPersona.icon} The ${analytics.userPersona.title} ${analytics.userPersona.icon}`,
      description: bombasticDescription,
      icon: analytics.userPersona.icon,
      theme: {
        bgFrom: 'from-slate-900',
        bgTo: 'to-slate-800',
        animation: 'pulse',
        mood: 'epic',
        customClass: 'shadow-2xl shadow-purple-600/50 border-2 border-purple-500',
        backgroundEffect: {
          type: 'sparkles',
          color: 'purple',
          intensity: 'high',
          duration: 3,
        },
        progressBarColor: 'bg-purple-500',
      },
  });

  return steps;
};