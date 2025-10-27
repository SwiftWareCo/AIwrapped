import { AnalyticsResult } from '../types';

export interface Persona {
  title: string;
  icon: string;
  rarity: number; // percentage (0-100)
  description: string; // base description, will be customized by AI
  detectionCriteria?: (analytics: AnalyticsResult) => boolean;
}

// Comprehensive persona database with rarities
const PERSONA_DATABASE: Persona[] = [
  {
    title: 'The Conversationalist',
    icon: '💬',
    rarity: 15,
    description: 'A master of dialogue with an endless appetite for discussion',
    detectionCriteria: (a) => a.userMessageCount > a.assistantMessageCount * 0.7 && a.totalMessages > 1000,
  },
  {
    title: 'The Philosopher',
    icon: '🧠',
    rarity: 12,
    description: 'Deep thinker who explores abstract concepts and existential questions',
    detectionCriteria: (a) => a.wordFrequency.some(w =>
      ['think', 'meaning', 'question', 'understand', 'concept', 'why'].includes(w.text.toLowerCase())
      && w.value > 5
    ),
  },
  {
    title: 'The Night Owl',
    icon: '🌙',
    rarity: 12,
    description: 'A creature of the night who finds inspiration in the dark hours',
    detectionCriteria: (a) => {
      const nightHours = a.hourlyActivity.filter(h => {
        const hour = parseInt(h.hour);
        return hour >= 22 || hour <= 5;
      });
      return nightHours.length > 0 && nightHours.reduce((sum, h) => sum + h.count, 0) > a.totalMessages * 0.3;
    },
  },
  {
    title: 'The Researcher',
    icon: '🔬',
    rarity: 10,
    description: 'An investigator of facts, figures, and fascinating information',
    detectionCriteria: (a) => a.wordFrequency.length > 100 && a.avgMessagesPerConvo > 12,
  },
  {
    title: 'The Curious Mind',
    icon: '❓',
    rarity: 10,
    description: 'Forever asking questions and seeking deeper understanding',
    detectionCriteria: (a) => a.userMessages.filter(m => m.content.includes('?')).length > a.totalMessages * 0.25,
  },
  {
    title: 'The Storyteller',
    icon: '📖',
    rarity: 8,
    description: 'A weaver of narratives who crafts tales and shares experiences',
    detectionCriteria: (a) => a.userMessages.some(m => m.content.length > 500) && a.avgMessagesPerConvo > 15,
  },
  {
    title: 'The Explorer',
    icon: '🧭',
    rarity: 8,
    description: 'An adventurer navigating diverse topics and unexplored territories',
    detectionCriteria: (a) => a.wordFrequency.length > 150 && a.totalConversations > 50,
  },
  {
    title: 'The Analyst',
    icon: '📊',
    rarity: 7,
    description: 'A data-driven mind breaking down complex problems systematically',
    detectionCriteria: (a) => a.wordFrequency.some(w =>
      ['analyze', 'data', 'pattern', 'metric', 'analyze', 'logic'].includes(w.text.toLowerCase())
      && w.value > 3
    ),
  },
  {
    title: 'The Creative',
    icon: '🎨',
    rarity: 6,
    description: 'An artist and innovator channeling imagination into ideas',
    detectionCriteria: (a) => a.wordFrequency.some(w =>
      ['create', 'design', 'art', 'music', 'write', 'imagine'].includes(w.text.toLowerCase())
      && w.value > 2
    ),
  },
  {
    title: 'The Time Traveler',
    icon: '⏰',
    rarity: 4,
    description: 'A scattered soul with conversations across random moments in time',
    detectionCriteria: (a) => {
      const dayGaps = a.dailyActivity.map(d => d.count).filter(c => c === 0).length;
      return dayGaps > 100; // Many inactive days = sporadic usage
    },
  },
  {
    title: 'The Polymath',
    icon: '🌟',
    rarity: 4,
    description: 'A master of many domains, traversing knowledge across disciplines',
    detectionCriteria: (a) => a.wordFrequency.length > 200 && a.totalMessages > 2000 && a.totalConversations > 100,
  },
  {
    title: 'The Minimalist',
    icon: '📍',
    rarity: 3,
    description: 'Someone who speaks with purpose and brevity, every word counts',
    detectionCriteria: (a) => a.avgMessagesPerConvo < 8 && a.userMessageCount < 200,
  },
  {
    title: 'The Nocturnalist',
    icon: '🌑',
    rarity: 2,
    description: 'Exclusively a creature of the night, fully embracing the darkness',
    detectionCriteria: (a) => {
      const nightHours = a.hourlyActivity.filter(h => {
        const hour = parseInt(h.hour);
        return hour >= 23 || hour <= 4;
      });
      return nightHours.length > 0 && nightHours.reduce((sum, h) => sum + h.count, 0) / a.totalMessages > 0.75;
    },
  },
  {
    title: 'The Echo',
    icon: '🎯',
    rarity: 1,
    description: 'THE SINGULARITY: A perfectly balanced existence, one with the algorithm',
    detectionCriteria: (a) => {
      // Super rare: top 1% message count AND top 1% topic diversity AND perfectly balanced activity
      const messagePercentile = a.totalMessages > 5000;
      const diversityPercentile = a.wordFrequency.length > 300;

      // Check if activity is evenly distributed across hours (perfect balance)
      const avgHourlyActivity = a.hourlyActivity.reduce((sum, h) => sum + h.count, 0) / a.hourlyActivity.length;
      const hourVariance = a.hourlyActivity.reduce((sum, h) => sum + Math.pow(h.count - avgHourlyActivity, 2), 0) / a.hourlyActivity.length;
      const isBalancedHours = hourVariance < avgHourlyActivity * 0.5; // Low variance

      // Check if activity is evenly distributed across days
      const avgDailyActivity = a.dailyActivity.reduce((sum, d) => sum + d.count, 0) / a.dailyActivity.length;
      const dayVariance = a.dailyActivity.reduce((sum, d) => sum + Math.pow(d.count - avgDailyActivity, 2), 0) / a.dailyActivity.length;
      const isBalancedDays = dayVariance < avgDailyActivity * 0.3; // Low variance

      return messagePercentile && diversityPercentile && isBalancedHours && isBalancedDays;
    },
  },
  {
    title: 'The Wordsmith',
    icon: '✍️',
    rarity: 9,
    description: 'A master of language, crafting eloquent and detailed responses',
    detectionCriteria: (a) => a.userMessages.filter(m => m.content.split(' ').length > 50).length > a.totalMessages * 0.3,
  },
  {
    title: 'The Code Whisperer',
    icon: '💻',
    rarity: 8,
    description: 'A digital sage conversing in algorithms and computational logic',
    detectionCriteria: (a) => a.userMessages.some(m => /code|function|const|import|class|def|sql|api/i.test(m.content)) &&
      a.userMessages.filter(m => /[{}\[\]()]/g.test(m.content)).length > a.totalMessages * 0.15,
  },
  {
    title: 'The Morning Person',
    icon: '🌅',
    rarity: 6,
    description: 'An early riser who greets each day with enthusiasm and energy',
    detectionCriteria: (a) => {
      const morningHours = a.hourlyActivity.filter(h => {
        const hour = parseInt(h.hour);
        return hour >= 5 && hour <= 11;
      });
      return morningHours.length > 0 && morningHours.reduce((sum, h) => sum + h.count, 0) > a.totalMessages * 0.35;
    },
  },
  {
    title: 'The Speedrunner',
    icon: '⚡',
    rarity: 7,
    description: 'Moving fast and breaking through topics at lightning speed',
    detectionCriteria: (a) => a.totalMessages > 3000 && a.totalConversations > 150 && a.avgMessagesPerConvo < 12,
  },
  {
    title: 'The Perfectionist',
    icon: '✨',
    rarity: 5,
    description: 'Always seeking the best answer, refining every detail',
    detectionCriteria: (a) => a.userMessages.filter(m => /refine|improve|better|perfect|detail/i.test(m.content)).length > 5,
  },
  {
    title: 'The Daydreamer',
    icon: '☁️',
    rarity: 6,
    description: 'Lost in thought, exploring imaginary worlds and possibilities',
    detectionCriteria: (a) => a.wordFrequency.some(w =>
      ['imagine', 'dream', 'what if', 'suppose', 'maybe', 'perhaps'].includes(w.text.toLowerCase())
      && w.value > 2
    ),
  },
  {
    title: 'The Debugger',
    icon: '🐛',
    rarity: 5,
    description: 'A problem solver meticulously hunting for issues and solutions',
    detectionCriteria: (a) => a.userMessages.some(m => /error|bug|issue|problem|fix|solve|debug/i.test(m.content)) &&
      a.userMessages.filter(m => /error|bug|issue|problem|fix|solve|debug/i.test(m.content)).length > 5,
  },
];

/**
 * Select a persona based on analytics and rarity weights
 */
export const selectPersona = (analytics: AnalyticsResult): Persona => {
  // First, try to match personas based on detection criteria
  for (const persona of PERSONA_DATABASE) {
    if (persona.detectionCriteria && persona.detectionCriteria(analytics)) {
      // Return this persona with weighted probability
      return persona;
    }
  }

  // If no criteria matched, use weighted random selection based on rarity
  const totalWeight = PERSONA_DATABASE.reduce((sum, p) => sum + p.rarity, 0);
  let random = Math.random() * totalWeight;

  for (const persona of PERSONA_DATABASE) {
    random -= persona.rarity;
    if (random <= 0) {
      return persona;
    }
  }

  // Fallback to first persona (should never reach here)
  return PERSONA_DATABASE[0];
};

/**
 * Get persona by title
 */
export const getPersonaByTitle = (title: string): Persona | undefined => {
  return PERSONA_DATABASE.find(p => p.title === title);
};

/**
 * Get all personas (useful for debugging/admin)
 */
export const getAllPersonas = (): Persona[] => {
  return PERSONA_DATABASE.sort((a, b) => b.rarity - a.rarity);
};
