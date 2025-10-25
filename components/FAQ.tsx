import React from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';

const faqData = [
  {
    question: "Is my conversation data safe?",
    answer: "Absolutely. This application processes all your data directly in your web browser. Nothing is ever uploaded to a server, ensuring your privacy is completely protected.",
  },
  {
    question: "How do I get my data from ChatGPT or Claude?",
    answer: "On the upload screen, select your platform and click the 'Show Instructions' button. We provide step-by-step guidance on how to export your data correctly.",
  },
  {
    question: "Why did my file upload fail?",
    answer: "The most common reasons are uploading the wrong file (e.g., the .zip instead of 'conversations.json' for ChatGPT) or a corrupted/improperly formatted JSON file. Please double-check the instructions and try again.",
  },
  {
    question: "What does this app do?",
    answer: "AI Wrapped analyzes your chat history to create a fun, personalized 'Wrapped' story, similar to Spotify Wrapped. It visualizes your usage patterns, identifies your AI persona, and gives you fun insights into your conversation habits, all while keeping your data private.",
  },
];

const FAQ: React.FC = () => {
  return (
    <div className="w-full max-w-4xl mx-auto mt-12 mb-8 p-4 md:p-6">
      <h2 className="text-3xl font-bold text-center mb-8 flex items-center justify-center gap-3">
        <HelpCircle className="w-8 h-8 text-purple-400" />
        Frequently Asked Questions
      </h2>
      <div className="space-y-4">
        {faqData.map((item, index) => (
          <details key={index} className="group bg-gray-800/50 border border-gray-700 rounded-lg p-4 cursor-pointer transition-all duration-300 hover:border-purple-500">
            <summary className="flex justify-between items-center font-semibold text-lg list-none">
              {item.question}
              <ChevronDown className="w-5 h-5 transition-transform duration-300 group-open:rotate-180" />
            </summary>
            <p className="text-gray-400 mt-3 pt-3 border-t border-gray-700">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </div>
  );
};

export default FAQ;
