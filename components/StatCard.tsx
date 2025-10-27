
import React from 'react';
import type { LucideProps } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<LucideProps>;
  themeStyles?: {
    bgGradient?: string;
    animation?: string;
    customClass?: string;
  };
  textClass?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon, themeStyles, textClass }) => {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`text-center p-6 flex flex-col items-center ${themeStyles?.animation || ''} ${themeStyles?.customClass || ''}`}
    >
      <div className="flex items-center justify-center w-20 h-20 mb-6 bg-purple-900/50 rounded-full border-2 border-purple-500">
        <Icon className="w-10 h-10 text-purple-300" />
      </div>
      <h2 className={`text-xl font-semibold text-white ${textClass || 'drop-shadow-lg'}`}>{title}</h2>
      <p className={`text-5xl md:text-7xl font-black my-4 text-white drop-shadow-2xl`}>
        {value}
      </p>
      <p className={`text-md text-gray-300 max-w-md font-medium ${textClass || 'drop-shadow-md'}`}>{description}</p>
    </motion.div>
  );
};

export default StatCard;