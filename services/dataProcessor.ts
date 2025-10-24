
import { IConversation, Platform, ChatGPTConversation, AnalyticsResult, IMessage } from '../types';

// A list of common words to exclude from the word cloud
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'tell', 'me', 'about', 'give', 'can', 'you'
]);


// --- PARSING LOGIC ---

// Placeholder for Claude parser. As there's no official format, we'll assume a simple one.
const parseClaudeData = (content: string): IConversation[] => {
    // This is a hypothetical structure. Users would need to match this.
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
};

const parseChatGPTData = (content: string): IConversation[] => {
    const rawConversations: ChatGPTConversation[] = JSON.parse(content);
    return rawConversations
        .map(convo => {
            const messages: IMessage[] = Object.values(convo.mapping)
                .filter(node =>
                    node.message &&
                    node.message.author.role !== 'system' && // System messages are internal
                    node.message.content?.parts &&
                    Array.isArray(node.message.content.parts) &&
                    node.message.content.parts.length > 0
                )
                .map(node => {
                    // Extract text content from parts, which can be mixed type.
                    const textContent = node.message!.content.parts
                        .filter(part => typeof part === 'string')
                        .join(' ')
                        .trim();
                    
                    // Fallback for timestamp if message-level one is missing
                    const timestamp = (node.message!.create_time || convo.create_time || 0) * 1000;

                    return {
                        author: node.message!.author.role,
                        content: textContent,
                        timestamp: new Date(timestamp),
                    };
                })
                .filter(msg => msg.content) // Ensure there's text content
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
};


export const parseData = (content: string, platform: Platform): IConversation[] => {
    if (platform === 'ChatGPT') {
        return parseChatGPTData(content);
    }
    // Simple check for Claude: if ChatGPT parsing fails, try Claude as a fallback
    try {
        return parseChatGPTData(content);
    } catch {
        try {
            return parseClaudeData(content);
        } catch {
            throw new Error(`Failed to parse file. The content doesn't seem to be a valid ${platform} export.`);
        }
    }
};

// --- ANALYSIS LOGIC ---

const getWordFrequency = (messages: IMessage[]): { text: string; value: number }[] => {
    const wordCounts: { [key: string]: number } = {};
    messages.forEach(msg => {
        if (typeof msg.content !== 'string') return;
        const words = msg.content.toLowerCase().match(/\b(\w+)\b/g) || [];
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
    const avgLength = userMessages.reduce((acc, msg) => acc + (msg.content?.length || 0), 0) / totalMessages;
    
    if (totalMessages === 0) return { title: 'The Silent Observer', description: "You didn't send any messages!", icon: '🤫' };
    if (avgLength > 500) return { title: 'The Novelist', description: 'Your prompts are detailed and elaborate, often spanning multiple paragraphs.', icon: '✍️' };
    if (userMessages.some(m => m.content?.toLowerCase().includes('code') || m.content?.includes('```'))) return { title: 'The Coder', description: 'You frequently ask for code snippets, debugging help, and technical explanations.', icon: '💻' };
    if (avgLength < 50) return { title: 'The Director', description: 'Short, sweet, and to the point. You know what you want and ask for it directly.', icon: '🎬' };
    
    return { title: 'The Explorer', description: 'Curious and inquisitive, you explore a wide range of topics with the AI.', icon: '🧭' };
};

const getLongestStreak = (dates: Date[]): number => {
    if (dates.length === 0) return 0;

    const uniqueDays = [...new Set(dates.map(d => d.setHours(0, 0, 0, 0)))].sort((a,b) => a-b);
    
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
        const month = date.toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
        
        dailyCounts[day] = (dailyCounts[day] || 0) + 1;
        hourlyCounts[hour] = (hourlyCounts[hour] || 0) + 1;
        monthlyCounts[month] = (monthlyCounts[month] || 0) + 1;
    });

    const busiestDay = Object.entries(dailyCounts).sort(([, a], [, b]) => b - a)[0] || ['N/A', 0];
    const busiestHour = Object.entries(hourlyCounts).sort(([, a], [, b]) => b - a)[0] || ['N/A', 0];

    const sortedMonths = Object.keys(monthlyCounts).sort((a, b) => new Date(a).getTime() - new Date(b).getTime());

    return {
        platform: platform,
        totalConversations: conversations.length,
        totalMessages: allMessages.length,
        userMessageCount: userMessages.length,
        assistantMessageCount: assistantMessages.length,
        firstChatDate: allDates[0],
        lastChatDate: allDates[allMessages.length - 1],
        avgMessagesPerConvo: parseFloat((allMessages.length / conversations.length).toFixed(1)),
        busiestDay: { day: busiestDay[0] as string, count: busiestDay[1] as number },
        busiestHour: { hour: `${parseInt(busiestHour[0] as string)}:00`, count: busiestHour[1] as number },
        dailyActivity: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map(day => ({ day, count: dailyCounts[day] || 0 })),
        hourlyActivity: Array.from({ length: 24 }, (_, i) => ({ hour: `${i}:00`, count: hourlyCounts[i] || 0 })),
        monthlyActivity: sortedMonths.map(month => ({ month, count: monthlyCounts[month] || 0 })),
        wordFrequency: getWordFrequency(userMessages),
        userPersona: getUserPersona(userMessages),
        longestStreak: getLongestStreak(allDates),
    };
};
