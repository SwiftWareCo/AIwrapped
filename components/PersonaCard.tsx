import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

interface PersonaCardProps {
  title: string;
  personaTitle: string;
  description: string;
  icon: string;
  themeStyles?: {
    bgGradient?: string;
    animation?: string;
    customClass?: string;
  };
  textClass?: string;
}

const PersonaCard: React.FC<PersonaCardProps> = ({ title, personaTitle, description, themeStyles, textClass }) => {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, scale: 0.8, rotate: -5 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 5 }}
      transition={{ duration: 0.7, type: 'spring' }}
      className={`text-center p-6 flex flex-col items-center bg-gradient-to-br from-purple-900 via-gray-900 to-pink-900 rounded-2xl shadow-2xl border border-purple-500 ${themeStyles?.animation || ''} ${themeStyles?.customClass || ''}`}
    >
      <div className="relative mb-6">
        <Sparkles className="absolute -top-4 -left-4 w-8 h-8 text-yellow-300 animate-bounce" />
        <Sparkles className="absolute -bottom-4 -right-4 w-8 h-8 text-pink-300 animate-spin" style={{ animationDuration: '3s' }} />
        <h2 className={`text-2xl font-semibold text-white ${textClass || 'drop-shadow-lg'}`}>{title}</h2>
      </div>
      <p className={`text-5xl md:text-7xl font-black my-4 ${textClass || 'drop-shadow-lg'}`}>
        {personaTitle}
      </p>
      <p className={`text-lg text-gray-200 max-w-md italic mt-4 font-medium ${textClass || 'drop-shadow-md'}`}>
        "{description}"
      </p>
    </motion.div>
  );
};

export default PersonaCard;
