
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { LucideProps } from 'lucide-react';
import { motion } from 'framer-motion';


interface BarChartVizProps {
  title: string;
  data: any[];
  dataKey: string;
  xAxisKey: string;
  description: string;
  icon: React.ComponentType<LucideProps>;
  themeStyles?: {
    bgGradient?: string;
    animation?: string;
    customClass?: string;
  };
  textClass?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="p-2 bg-gray-800 border border-gray-700 rounded-lg shadow-lg">
        <p className="label text-white">{`${label} : ${payload[0].value}`}</p>
      </div>
    );
  }
  return null;
};

const BarChartViz: React.FC<BarChartVizProps> = ({ title, data, dataKey, xAxisKey, description, icon: Icon, themeStyles, textClass }) => {
  return (
    <motion.div
      key={title}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`text-center p-4 w-full h-full flex flex-col ${themeStyles?.animation || ''} ${themeStyles?.customClass || ''}`}
    >
      <div className="flex items-center justify-center gap-3 mb-4">
        <Icon className="w-6 h-6 text-purple-300" />
        <h2 className={`text-xl font-semibold text-white ${textClass || 'drop-shadow-lg'}`}>{title}</h2>
      </div>
      <div className="flex-grow w-full h-64 md:h-80">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#4A5568" />
            <XAxis dataKey={xAxisKey} tick={{ fill: '#A0AEC0' }} tickLine={{ stroke: '#718096' }}/>
            <YAxis tick={{ fill: '#A0AEC0' }} tickLine={{ stroke: '#718096' }} />
            <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(128, 90, 213, 0.1)'}} />
            <Bar dataKey={dataKey} fill="#805AD5" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className={`text-md text-gray-300 mt-4 font-medium ${textClass || 'drop-shadow-md'}`}>{description}</p>
    </motion.div>
  );
};

export default BarChartViz;