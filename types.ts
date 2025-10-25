import type { LucideProps } from 'lucide-react';
import React from 'react';

export type Platform = 'ChatGPT' | 'Claude';

export interface IMessage {
  author: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface IConversation {
  id: string;
  title: string;
  messages: IMessage[];
  create_time: number;
}

export interface AnalyticsResult {
  platform: Platform;
  totalConversations: number;
  totalMessages: number;
  userMessageCount: number;
  assistantMessageCount: number;
  firstChatDate: Date;
  lastChatDate: Date;
  avgMessagesPerConvo: number;
  busiestDay: { day: string; count: number };
  busiestHour: { hour: string; count: number };
  dailyActivity: { day: string; count: number }[];
  hourlyActivity: { hour: string; count: number }[];
  monthlyActivity: { month: string; count: number }[];
  wordFrequency: { text: string; value: number }[];
  userPersona: { title: string; description: string; icon: string };
  longestStreak: number;
  userMessages: IMessage[];
}

// Interfaces for raw ChatGPT data structure
export type ChatGPTContentPart = string | { 
  content_type?: string;
  asset_pointer?: string;
  text?: string;
  [key: string]: any;
};

export interface ChatGPTMessageContent {
  content_type: 'text' | 'multimodal_text' | 'code' | string;
  parts?: ChatGPTContentPart[];
  text?: string;
}

export interface ChatGPTMessageNode {
    id: string;
    author: { role: 'user' | 'assistant' | 'system' };
    content: ChatGPTMessageContent;
    create_time: number | null;
    metadata?: {
      is_visually_hidden_from_conversation?: boolean;
      [key: string]: any;
    };
}

export interface ChatGPTConversation {
    id: string;
    title: string;
    create_time: number;
    mapping: Record<string, { message: ChatGPTMessageNode | null; [key: string]: any; }>;
}


// --- Story Step Types ---

export interface StatCardStepProps {
  component: 'StatCard';
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<LucideProps>;
}

export interface BarChartVizStepProps {
  component: 'BarChartViz';
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
}

export interface PersonaCardStepProps {
  component: 'PersonaCard';
  title: string;
  personaTitle: string;
  icon: string;
  description: string;
}

export type StoryStep = StatCardStepProps | BarChartVizStepProps | PersonaCardStepProps;