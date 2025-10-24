
import React from 'react';
import type { LucideProps } from 'lucide-react';
import { motion } from 'framer-motion';

interface StatCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<LucideProps>;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, description, icon: Icon }) => {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className="text-center p-6 flex flex-col items-center"
    >
      <div className="flex items-center justify-center w-20 h-20 mb-6 bg-purple-900/50 rounded-full border-2 border-purple-500">
        <Icon className="w-10 h-10 text-purple-300" />
      </div>
      <h2 className="text-xl font-semibold text-gray-300">{title}</h2>
      <p className="text-5xl md:text-7xl font-black my-4 text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
        {value}
      </p>
      <p className="text-md text-gray-400 max-w-md">{description}</p>
    </motion.div>
  );
};

// You need to install framer-motion: npm install framer-motion
// You need to install lucide-react: npm install lucide-react

export default StatCard;
