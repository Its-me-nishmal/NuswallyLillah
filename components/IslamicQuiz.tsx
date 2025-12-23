
import React, { useState } from 'react';
import { HelpCircle, CheckCircle, XCircle, RotateCcw, Trophy, Brain } from 'lucide-react';

interface Question {
  id: number;
  question: string;
  options: string[];
  correct: number;
  explanation: string;
}

const QUESTIONS: Question[] = [
  {
    id: 1,
    question: "Which Surah is known as the 'Heart of the Quran'?",
    options: ["Surah Al-Fatiha", "Surah Ya-Sin", "Surah Al-Mulk", "Surah Al-Baqarah"],
    correct: 1,
    explanation: "Surah Ya-Sin is widely referred to as the heart of the Quran in various hadith traditions."
  },
  {
    id: 2,
    question: "In which month was the Quran first revealed?",
    options: ["Rajab", "Sha'ban", "Ramadan", "Dhul-Hijjah"],
    correct: 2,
    explanation: "The Quran was revealed in the month of Ramadan, specifically on Laylat al-Qadr."
  },
  {
    id: 3,
    question: "Who was the first muezzin (caller to prayer) in Islam?",
    options: ["Abu Bakr (RA)", "Bilal ibn Rabah (RA)", "Umar ibn Al-Khattab (RA)", "Ali ibn Abi Talib (RA)"],
    correct: 1,
    explanation: "Bilal ibn Rabah (RA) was chosen by the Prophet (PBUH) to be the first muezzin."
  },
  {
    id: 4,
    question: "How many pillars of Islam are there?",
    options: ["3", "5", "6", "7"],
    correct: 1,
    explanation: "There are 5 pillars: Shahada, Salah, Zakat, Sawm (Fasting), and Hajj."
  },
  {
    id: 5,
    question: "Which Prophet was swallowed by a whale?",
    options: ["Musa (AS)", "Isa (AS)", "Yunus (AS)", "Nuh (AS)"],
    correct: 2,
    explanation: "Prophet Yunus (Jonah) was swallowed by a whale after leaving his people."
  }
];

export const IslamicQuiz: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [showScore, setShowScore] = useState(false);

  const handleAnswer = (index: number) => {
    if (isAnswered) return;

    setSelectedOption(index);
    setIsAnswered(true);

    if (index === QUESTIONS[currentIndex].correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < QUESTIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsAnswered(false);
    } else {
      setShowScore(true);
    }
  };

  const restartQuiz = () => {
    setCurrentIndex(0);
    setSelectedOption(null);
    setIsAnswered(false);
    setScore(0);
    setShowScore(false);
  };

  if (showScore) {
    return (
      <div className="max-w-md mx-auto mt-10 p-8 bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-100 dark:border-slate-800 text-center animate-in zoom-in-95 duration-300">
        <div className="w-20 h-20 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600 dark:text-emerald-400">
          <Trophy className="w-10 h-10" />
        </div>
        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2">Quiz Complete!</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">You scored</p>

        <div className="text-6xl font-bold text-emerald-600 dark:text-emerald-400 mb-8">{score} <span className="text-2xl text-slate-300 dark:text-slate-600">/ {QUESTIONS.length}</span></div>

        <p className="text-sm text-slate-600 dark:text-slate-300 mb-8 px-4">
          {score === QUESTIONS.length ? "MashaAllah! Perfect score!" :
            score > QUESTIONS.length / 2 ? "Great job! Keep learning." :
              "Good effort! Try again to improve."}
        </p>

        <button
          onClick={restartQuiz}
          className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  const question = QUESTIONS[currentIndex];

  return (
    <div className="max-w-2xl mx-auto pb-10 animate-in slide-in-from-bottom-4 duration-500">

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-lime-100 dark:bg-lime-900/30 rounded-2xl flex items-center justify-center text-lime-700 dark:text-lime-400">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Islamic Quiz</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">Question {currentIndex + 1} of {QUESTIONS.length}</p>
          </div>
        </div>
        <div className="text-sm font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30">
          Score: {score}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mb-8 overflow-hidden">
        <div
          className="h-full bg-lime-500 transition-all duration-500 ease-out"
          style={{ width: `${((currentIndex + 1) / QUESTIONS.length) * 100}%` }}
        ></div>
      </div>

      {/* Question Card */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 md:p-8 shadow-sm border border-slate-100 dark:border-slate-800">
        <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-8 leading-relaxed">
          {question.question}
        </h3>

        <div className="space-y-3">
          {question.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            const isCorrect = idx === question.correct;
            const showResultState = isAnswered && (isSelected || isCorrect);

            let styleClass = "border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-600";
            let icon = null;

            if (isAnswered) {
              if (isCorrect) {
                styleClass = "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400 ring-1 ring-emerald-200 dark:ring-emerald-900/50";
                icon = <CheckCircle className="w-5 h-5 text-emerald-500" />;
              } else if (isSelected && !isCorrect) {
                styleClass = "bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-900/50 text-red-700 dark:text-red-400 ring-1 ring-red-200 dark:ring-red-900/50";
                icon = <XCircle className="w-5 h-5 text-red-500" />;
              } else {
                styleClass = "border-slate-100 dark:border-slate-800 opacity-50 text-slate-400";
              }
            } else if (isSelected) {
              styleClass = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-900 dark:text-emerald-100";
            }

            return (
              <button
                key={idx}
                onClick={() => handleAnswer(idx)}
                disabled={isAnswered}
                className={`w-full p-4 rounded-xl border-2 text-left font-medium transition-all flex items-center justify-between ${styleClass}`}
              >
                <span>{option}</span>
                {icon}
              </button>
            );
          })}
        </div>

        {/* Explanation Footer */}
        {isAnswered && (
          <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2">
            <div className="flex gap-3">
              <HelpCircle className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-bold text-slate-800 dark:text-white mb-1">Explanation</p>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{question.explanation}</p>
              </div>
            </div>
            <div className="mt-6 flex justify-end">
              <button
                onClick={nextQuestion}
                className="px-6 py-2 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-200 dark:shadow-emerald-900/30"
              >
                {currentIndex === QUESTIONS.length - 1 ? "Finish Quiz" : "Next Question"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
