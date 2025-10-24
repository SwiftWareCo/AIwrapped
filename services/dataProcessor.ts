import { IConversation, Platform, ChatGPTConversation, AnalyticsResult, IMessage, ChatGPTMessageNode } from '../types';
import { formatHour } from '../utils/formatters';

// A list of common words to exclude from the word cloud
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'tell', 'me', 'about', 'give', 'can', 'you'
]);


// --- PARSING LOGIC ---

const parseClaudeData = (content: string): IConversation[] => {
    try {
        const rawConversations: any[] = JSON.parse(content);
        return rawConversations.map((convo, index) => ({
          id: convo.uuid || `claude-${index}`,
          title: convo.title || 'Untitled Conversation',
          create_time: convo.create_time ? new Date(convo.create_time).getTime() / 1000 : Date.now() / 1000,
          messages: convo.history.map((msg: any) => ({
            author: msg.role === 'user' ? 'user' : 'assistant',
            content: msg.content,
            timestamp: new Date(convo.create_time || Date.now()),
          })),
        }));
    } catch (e) {
        throw new Error("Invalid Claude JSON format. Please ensure it's an array of conversation objects.");
    }
};

const parseChatGPTData = (content: string): IConversation[] => {
    try {
        const rawConversations: ChatGPTConversation[] = JSON.parse(content);
        if (!Array.isArray(rawConversations)) {
            throw new Error("ChatGPT data is not an array. Please check the file.");
        }
        
        return rawConversations
            .map(convo => {
                if (!convo.mapping) return null;

                const messages: IMessage[] = Object.values(convo.mapping)
                    .filter(node =>
                        node &&
                        node.message &&
                        node.message.author &&
                        node.message.author.role !== 'system' &&
                        node.message.content &&
                        !node.message.metadata?.is_visually_hidden_from_conversation
                    )
                    .map(node => {
                        const messageNode = node.message as ChatGPTMessageNode;
                        let textContent = '';

                        if (messageNode.content.parts && Array.isArray(messageNode.content.parts)) {
                             textContent = messageNode.content.parts
                                .filter(part => typeof part === 'string')
                                .join(' ')
                                .trim();
                        } else if (typeof messageNode.content.text === 'string') {
                            textContent = messageNode.content.text;
                        }

                        const timestamp = (messageNode.create_time ?? convo.create_time ?? 0) * 1000;

                        return {
                            author: messageNode.author.role,
                            content: textContent,
                            timestamp: new Date(timestamp),
                        };
                    })
                    .filter(msg => msg.content && msg.timestamp.getFullYear() > 1970) // Ensure there's text content and a valid date
                    .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

                if (messages.length === 0) return null;

                return {
                    id: convo.id,
                    title: convo.title || 'Untitled Conversation',
                    create_time: convo.create_time,
                    messages: messages
                };
            })
            .filter((convo): convo is IConversation => convo !== null);
    } catch (e) {
        console.error("Error parsing ChatGPT data:", e);
        if (e instanceof Error) {
            throw new Error(`The file does not seem to be a valid ChatGPT 'conversations.json' export. Error: ${e.message}`);
        }
        throw new Error("An unknown error occurred while parsing ChatGPT data.");
    }
};


export const parseData = (content: string, platform: Platform): IConversation[] => {
    if (platform === 'ChatGPT') {
        return parseChatGPTData(content);
    }
    if (platform === 'Claude') {
        return parseClaudeData(content);
    }
    throw new Error(`Unsupported platform: ${platform}`);
};

// --- ANALYSIS LOGIC ---

const getWordFrequency = (messages: IMessage[]): { text: string; value: number }[] => {
    const wordCounts: { [key: string]: number } = {};
    messages.forEach(msg => {
        if (typeof msg.content !== 'string') return;
        const words = msg.content.toLowerCase().match(/\b(\w{3,})\b/g) || []; // Only count words with 3+ letters
        words.forEach(word => {
            if (!STOP_WORDS.has(word) && isNaN(parseInt(word))) {
                wordCounts[word] = (wordCounts[word] || 0) + 1;
            }
        });
    });

    return Object.entries(wordCounts)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 50)
        .map(([text, value]) => ({ text, value }));
};

const getUserPersona = (userMessages: IMessage[]): { title: string; description: string; icon: string } => {
    const totalMessages = userMessages.length;
    if (totalMessages === 0) return { title: 'The Silent Observer', description: "You didn't send any messages!", icon: '🤫' };
    
    const avgLength = userMessages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0) / totalMessages;
    const questionCount = userMessages.filter(m => m.content?.includes('?')).length;

    if (userMessages.some(m => m.content?.toLowerCase().includes('code') || m.content?.includes('```') || m.content?.includes('python'))) return { title: 'The Coder', description: 'You frequently ask for code snippets, debugging help, and technical explanations.', icon: '💻' };
    if (avgLength > 500) return { title: 'The Novelist', description: 'Your prompts are detailed and elaborate, often spanning multiple paragraphs to get the perfect answer.', icon: '✍️' };
    if (questionCount / totalMessages > 0.6) return { title: 'The Inquisitor', description: 'Driven by curiosity, your conversations are a rapid-fire series of questions, always digging deeper.', icon: '🤔' };
    if (avgLength < 50) return { title: 'The Director', description: 'Short, sweet, and to the point. You know what you want and ask for it with precision.', icon: '🎬' };
    
    return { title: 'The Explorer', description: 'Curious and versatile, you explore a wide range of topics with the AI, from the practical to the profound.', icon: '🧭' };
};

const getLongestStreak = (dates: Date[]): number => {
    if (dates.length === 0) return 0;

    const uniqueDays = [...new Set(dates.map(d => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()))].sort((a,b) => a-b);
    
    if (uniqueDays.length < 2) return uniqueDays.length;

    let longestStreak = 1;
    let currentStreak = 1;
    const oneDay = 24 * 60 * 60 * 1000;

    for (let i = 1; i < uniqueDays.length; i++) {
        if (uniqueDays[i] - uniqueDays[i-1] === oneDay) {
            currentStreak++;
        } else {
            longestStreak = Math.max(longestStreak, currentStreak);
            currentStreak = 1;
        }
    }

    return Math.max(longestStreak, currentStreak);
};


export const analyzeData = (conversations: IConversation[], platform: Platform): AnalyticsResult => {
    const allMessages = conversations.flatMap(c => c.messages);
    if (allMessages.length === 0) {
      throw new Error("No messages found in the provided conversation data.");
    }

    const userMessages = allMessages.filter(m => m.author === 'user');
    const assistantMessages = allMessages.filter(m => m.author === 'assistant');

    const dailyCounts: { [key: string]: number } = {};
    const hourlyCounts: { [key: string]: number } = {};
    const monthlyCounts: { [key: string]: number } = {};
    const allDates = allMessages.map(m => m.timestamp);

    allDates.forEach(date => {
        if (!date || !(date instanceof Date) || isNaN(date.getTime())) return;
        const day = date.toLocaleDateString('en-US', { weekday: 'long' });
        const hour = date.getHours();
        const month = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
        
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    const busiestDay = Object.entries(dailyCounts).sort(([, a], [, b]) => b - a)[0] || ['N/A', 0];
    const busiestHourEntry = Object.entries(hourlyCounts).sort(([, a], [, b]) => b - a)[0] || ['N/A', 0];
    const busiestHour = parseInt(busiestHourEntry[0] as string);

    const sortedMonths = Object.keys(monthlyCounts).sort((a, b) => {
        const dateA = new Date(`01 ${a}`);
        const dateB = new Date(`01 ${b}`);
        return dateA.getTime() - dateB.getTime();
    });

    return {
        platform: platform,
        totalConversations: conversations.length,
        totalMessages: allMessages.length,
        userMessageCount: userMessages.length,
        assistantMessageCount: assistantMessages.length,
        firstChatDate: allDates.length > 0 ? allDates[0] : new Date(),
        lastChatDate: allDates.length > 0 ? allDates[allDates.length - 1] : new Date(),
        avgMessagesPerConvo: conversations.length > 0 ? parseFloat((allMessages.length / conversations.length).toFixed(1)) : 0,
        busiestDay: { day: busiestDay[0] as string, count: busiestDay[1] as number },
        busiestHour: { hour: formatHour(busiestHour), count: busiestHourEntry[1] as number },
        dailyActivity: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => ({ day, count: dailyCounts[day] || 0 })),
        hourlyActivity: Array.from({ length: 24 }, (_, i) => ({ hour: formatHour(i), count: hourlyCounts[i] || 0 })),
        monthlyActivity: sortedMonths.map(month => ({ month, count: monthlyCounts[month] || 0 })),
        wordFrequency: getWordFrequency(userMessages),
        userPersona: getUserPersona(userMessages),
        longestStreak: getLongestStreak(allDates),
    };
};
