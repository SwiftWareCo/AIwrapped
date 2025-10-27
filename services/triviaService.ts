import { AnalyticsResult } from '../types';

export interface TriviaQuestion {
  question: string;
  options: string[];
  correctAnswerIndex: number;
}

/**
 * Generate a trivia question based on user's conversation content and topics
 * This creates questions derived from their actual conversation messages
 */
export const generateTriviaQuestion = (analytics: AnalyticsResult): TriviaQuestion => {
  const questionGenerators = [
    generateTopFrequentWordQuestion,
    generateTopicQuestion,
    generateConversationStyleQuestion,
    generateCommonThemeQuestion,
    generateMessagePatternQuestion,
  ];

  // Pick a random question generator (focus on content, not just statistics)
  const generator = questionGenerators[Math.floor(Math.random() * questionGenerators.length)];
  return generator(analytics);
};

/**
 * Question about the most frequently used word in conversations
 */
const generateTopFrequentWordQuestion = (analytics: AnalyticsResult): TriviaQuestion => {
  if (analytics.wordFrequency.length < 2) {
    return generateCommonThemeQuestion(analytics);
  }

  const topWords = analytics.wordFrequency.slice(0, 5);
  const correctWord = topWords[0].text;
  const wrongWords = topWords.slice(1, 4).map(w => w.text);

  // Add distractors if needed
  const distractors = ['python', 'javascript', 'analysis', 'design', 'workflow', 'strategy'];
  while (wrongWords.length < 3) {
    const distractor = distractors[Math.floor(Math.random() * distractors.length)];
    if (!wrongWords.includes(distractor) && distractor !== correctWord) {
      wrongWords.push(distractor);
    }
  }

  const options = [correctWord, ...wrongWords.slice(0, 3)].sort(() => Math.random() - 0.5);
  const correctAnswerIndex = options.indexOf(correctWord);

  return {
    question: `Which word did you use most frequently in your conversations?`,
    options,
    correctAnswerIndex,
  };
};


/**
 * Question about main topics in conversations
 */
const generateTopicQuestion = (analytics: AnalyticsResult): TriviaQuestion => {
  if (analytics.wordFrequency.length < 2) {
    return generateConversationStyleQuestion(analytics);
  }

  const topWords = analytics.wordFrequency.slice(0, 6);
  const correctWord = topWords[0].text;
  const wrongWords = topWords.slice(1, 4).map(w => w.text);

  const options = [correctWord, ...wrongWords].sort(() => Math.random() - 0.5);
  const correctAnswerIndex = options.indexOf(correctWord);

  return {
    question: `What was one of your most discussed topics?`,
    options,
    correctAnswerIndex,
  };
};

/**
 * Question about conversation style/patterns
 */
const generateConversationStyleQuestion = (analytics: AnalyticsResult): TriviaQuestion => {
  const questionsCount = analytics.userMessages.filter(m => m.content?.includes('?')).length;
  const questionPercentage = Math.round((questionsCount / analytics.userMessageCount) * 100);

  let style = 'Balanced';
  let description = '';

  if (questionPercentage > 50) {
    style = 'Question-Heavy';
    description = 'You asked a lot of questions';
  } else if (questionPercentage < 20) {
    style = 'Statement-Heavy';
    description = 'You made mostly statements and declarations';
  } else {
    style = 'Conversational';
    description = 'You balanced questions and statements';
  }

  const options = [style, 'Technical-Focused', 'Abstract-Focused', 'Detail-Oriented'].sort(() => Math.random() - 0.5);
  const correctAnswerIndex = options.indexOf(style);

  return {
    question: `Which best describes your conversation style?`,
    options,
    correctAnswerIndex,
  };
};

/**
 * Question about common themes based on word frequency
 */
const generateCommonThemeQuestion = (analytics: AnalyticsResult): TriviaQuestion => {
  if (analytics.wordFrequency.length < 3) {
    return generateMessagePatternQuestion(analytics);
  }

  const topWords = analytics.wordFrequency.slice(0, 5);
  const wordList = topWords.map(w => w.text).join(', ');

  // Guess at theme based on words
  const hasCreativeWords = topWords.some(w => ['design', 'create', 'art', 'music', 'write', 'creative'].includes(w.text.toLowerCase()));
  const hasTechWords = topWords.some(w => ['code', 'python', 'function', 'api', 'database', 'server'].includes(w.text.toLowerCase()));
  const hasAnalysisWords = topWords.some(w => ['data', 'analyze', 'metric', 'trend', 'pattern', 'insight'].includes(w.text.toLowerCase()));

  let theme = 'General Discussion';
  if (hasCreativeWords) theme = 'Creative Projects';
  else if (hasTechWords) theme = 'Technical Topics';
  else if (hasAnalysisWords) theme = 'Data & Analysis';

  const options = ['Creative Projects', 'Technical Topics', 'Data & Analysis', 'General Discussion'].sort(() => Math.random() - 0.5);
  const correctAnswerIndex = options.indexOf(theme);

  return {
    question: `What was a primary theme in your conversations?`,
    options,
    correctAnswerIndex,
  };
};

/**
 * Question about message length patterns
 */
const generateMessagePatternQuestion = (analytics: AnalyticsResult): TriviaQuestion => {
  const avgLength = analytics.userMessages.reduce((sum, m) => sum + (m.content?.length || 0), 0) / analytics.userMessageCount;

  let pattern = 'Concise';
  if (avgLength > 300) pattern = 'Detailed';
  else if (avgLength > 100) pattern = 'Moderate';

  const options = ['Concise', 'Moderate', 'Detailed', 'Elaborate'].sort(() => Math.random() - 0.5);
  const correctAnswerIndex = options.indexOf(pattern);

  return {
    question: `How would you describe the length of your typical message?`,
    options,
    correctAnswerIndex,
  };
};
