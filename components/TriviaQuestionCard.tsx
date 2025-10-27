import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Check, X } from 'lucide-react';

interface TriviaQuestionCardProps {
  question: string;
  options: string[];
  correctAnswerIndex: number;
  onAnswer: (isCorrect: boolean) => void;
  themeStyles?: {
    bgGradient?: string;
    animation?: string;
    customClass?: string;
  };
  textClass?: string;
}

const TriviaQuestionCard: React.FC<TriviaQuestionCardProps> = ({
  question,
  options,
  correctAnswerIndex,
  onAnswer,
  themeStyles,
  textClass,
}) => {
  const [answeredIndex, setAnsweredIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleAnswer = (index: number) => {
    setAnsweredIndex(index);
    setIsAnswered(true);
    const isCorrect = index === correctAnswerIndex;
    onAnswer(isCorrect);
  };

  const isCorrect = answeredIndex === correctAnswerIndex;

  return (
    <motion.div
      key="trivia"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`text-center p-6 flex flex-col items-center ${themeStyles?.animation || ''} ${themeStyles?.customClass || ''}`}
    >
      {/* Question Title */}
      <h2 className={`text-2xl font-bold text-white mb-8 ${textClass || 'drop-shadow-lg'}`}>
        {question}
      </h2>

      {/* Options */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-md">
        {options.map((option, index) => {
          const isThisAnswerCorrect = index === correctAnswerIndex;
          const isThisAnswerSelected = index === answeredIndex;
          const showAsCorrect = isAnswered && isThisAnswerCorrect;
          const showAsIncorrect = isAnswered && isThisAnswerSelected && !isThisAnswerCorrect;

          return (
            <motion.button
              key={index}
              onClick={() => !isAnswered && handleAnswer(index)}
              disabled={isAnswered}
              whileHover={!isAnswered ? { scale: 1.05 } : {}}
              whileTap={!isAnswered ? { scale: 0.95 } : {}}
              animate={
                showAsCorrect
                  ? { scale: 1.1, backgroundColor: 'rgb(34, 197, 94)' }
                  : showAsIncorrect
                  ? { x: [-10, 10, -10, 10, 0], backgroundColor: 'rgb(239, 68, 68)' }
                  : {}
              }
              transition={{
                duration: showAsIncorrect ? 0.5 : 0.3,
              }}
              className={`p-4 rounded-lg font-semibold transition-all ${
                isAnswered && !showAsCorrect && !showAsIncorrect
                  ? 'bg-gray-700 cursor-not-allowed opacity-50'
                  : isAnswered && showAsCorrect
                  ? 'bg-green-500 text-white cursor-not-allowed'
                  : isAnswered && showAsIncorrect
                  ? 'bg-red-500 text-white cursor-not-allowed'
                  : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
              }`}
            >
              {option}
            </motion.button>
          );
        })}
      </div>

      {/* Feedback Message */}
      {isAnswered && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className={`mt-8 p-4 rounded-lg text-white font-semibold text-lg ${
            isCorrect
              ? 'bg-green-500/20 border border-green-500'
              : 'bg-red-500/20 border border-red-500'
          }`}
        >
          <div className="flex items-center justify-center gap-2 mb-2">
            {isCorrect ? (
              <>
                <Check className="w-6 h-6" />
                <span>Correct!</span>
              </>
            ) : (
              <>
                <X className="w-6 h-6" />
                <span>Oops!</span>
              </>
            )}
          </div>
          <p className="text-sm">
            {isCorrect
              ? "You really know your conversation history! 🎉"
              : `The correct answer was: ${options[correctAnswerIndex]}`}
          </p>
        </motion.div>
      )}

      {/* Confetti Animation for Correct Answer */}
      {isAnswered && isCorrect && <ConfettiAnimation />}
    </motion.div>
  );
};

// Confetti animation component for correct answers
const ConfettiAnimation: React.FC = () => {
  const confettiPieces = Array.from({ length: 30 }, (_, i) => i);

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {confettiPieces.map((i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-10px',
            backgroundColor: ['#fbbf24', '#60a5fa', '#34d399', '#f87171', '#a78bfa'][
              Math.floor(Math.random() * 5)
            ],
          }}
          animate={{
            top: '100vh',
            left: `${Math.random() * 100}%`,
            rotate: Math.random() * 360,
            opacity: [1, 0],
          }}
          transition={{
            duration: 2,
            ease: 'easeInOut',
          }}
        />
      ))}
    </div>
  );
};

export default TriviaQuestionCard;
