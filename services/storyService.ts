import { AnalyticsResult, StoryStep } from '../types';
import { formatDate } from '../utils/formatters';
import { generatePersonaDescription, generateTopicSummary } from './geminiService';
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
  });

  // --- Step 2: Message Volume ---
  steps.push({
    component: 'StatCard',
    title: 'Message Volume',
    value: analytics.totalMessages.toLocaleString(),
    description: `messages exchanged. You sent ${analytics.userMessageCount.toLocaleString()} and the AI sent ${analytics.assistantMessageCount.toLocaleString()}.`,
    icon: MessageSquare,
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
      });
  }

  // --- Step 4 & 5: Activity Charts ---
  steps.push({
    component: 'BarChartViz',
    title: 'Busiest Day of the Week',
    data: analytics.dailyActivity,
    dataKey: 'count',
    xAxisKey: 'day',
    description: `Looks like ${analytics.busiestDay.day} was your go-to day for chatting.`,
    icon: Calendar,
  });

  steps.push({
    component: 'BarChartViz',
    title: 'Most Active Hour',
    data: analytics.hourlyActivity,
    dataKey: 'count',
    xAxisKey: 'hour',
    description: `You were most active around ${analytics.busiestHour.hour}. A true night owl or an early bird?`,
    icon: Clock,
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
  });

  return steps;
};