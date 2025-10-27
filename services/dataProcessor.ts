import { IConversation, Platform, ChatGPTConversation, AnalyticsResult, IMessage, ChatGPTMessageNode } from '../types';
import { formatHour } from '../utils/formatters';
import { selectPersona } from './personaService';

// A list of common words to exclude from the word cloud
const STOP_WORDS = new Set([
  'i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'd', 'll', 'm', 'o', 're', 've', 'y', 'ain', 'aren', 'couldn', 'didn', 'doesn', 'hadn', 'hasn', 'haven', 'isn', 'ma', 'mightn', 'mustn', 'needn', 'shan', 'shouldn', 'wasn', 'weren', 'won', 'wouldn', 'tell', 'me', 'about', 'give', 'can', 'you'
]);


// --- PARSING LOGIC ---

const parseClaudeData = (content: string): IConversation[] => {
    try {
        const rawConversations: any[] = JSON.parse(content);
        return rawConversations
            .filter(convo => convo.chat_messages && convo.chat_messages.length > 0)
            .map((convo, index) => {
                const createTime = convo.created_at ? new Date(convo.created_at).getTime() / 1000 : Date.now() / 1000;

                return {
                    id: convo.uuid || `claude-${index}`,
                    title: convo.name || convo.summary || 'Untitled Conversation',
                    create_time: createTime,
                    messages: convo.chat_messages
                        .filter((msg: any) => msg.text || (msg.content && msg.content.length > 0))
                        .map((msg: any) => {
                            // Extract text content from the message
                            let textContent = msg.text || '';
                            if (!textContent && msg.content && Array.isArray(msg.content)) {
                                textContent = msg.content
                                    .filter((c: any) => c.type === 'text' && c.text)
                                    .map((c: any) => c.text)
                                    .join(' ')
                                    .trim();
                            }

                            const messageTime = msg.created_at ? new Date(msg.created_at) : new Date(convo.created_at || Date.now());

                            return {
                                author: msg.sender === 'human' ? 'user' : 'assistant',
                                content: textContent,
                                timestamp: messageTime,
                            };
                        })
                        .filter((msg: IMessage) => msg.content && msg.content.trim().length > 0),
                };
            })
            .filter(convo => convo.messages.length > 0);
    } catch (e) {
        console.error("Error parsing Claude data:", e);
        throw new Error("Invalid Claude JSON format. Please ensure you uploaded the conversations.json file from your Claude export.");
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

const getUserPersona = (analytics: AnalyticsResult): { title: string; description: string; icon: string } => {
    if (analytics.userMessageCount === 0) {
        return { title: 'The Silent Observer', description: "You didn't send any messages!", icon: '🤫' };
    }

    // Use the new persona selection logic
    const persona = selectPersona(analytics);

    return {
        title: persona.title,
        description: persona.description,
        icon: persona.icon,
    };
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

    // Build analytics object without persona first (needed for persona selection)
    const analyticsWithoutPersona: AnalyticsResult = {
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
        userPersona: { title: 'The Explorer', description: '', icon: '🧭' }, // Placeholder
        longestStreak: getLongestStreak(allDates),
        userMessages: userMessages,
    };

    // Now use the complete analytics to select the persona
    analyticsWithoutPersona.userPersona = getUserPersona(analyticsWithoutPersona);

    return analyticsWithoutPersona;
};