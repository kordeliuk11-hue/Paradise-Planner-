import React, { useState } from 'react';
import { Trash2, CheckSquare, Plus, Loader2, MessageCircleQuestion, X } from 'lucide-react';
import { Task } from '../types';
import { generateAbsurdTask, generateExcuse } from '../services/gemini';
import { GrittyButton, PaperSheet, DirtyCard } from './DirtyUI';

interface TaskTrackerProps {
  tasks: Task[];
  onAddTask: (task: Task) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onExcuseTask?: (id: string) => void;
  playVoice: (text: string) => void;
}

const TaskTracker: React.FC<TaskTrackerProps> = ({ tasks, onAddTask, onToggleTask, onDeleteTask, onExcuseTask, playVoice }) => {
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [excuseLoading, setExcuseLoading] = useState<string | null>(null);
  const [activeExcuse, setActiveExcuse] = useState<{taskId: string, text: string} | null>(null);

  const handleAddClick = async () => {
    if (!input.trim()) {
        playVoice("Напиши хоть что-то, гений.");
        return;
    }
    
    setLoading(true);
    const originalText = input;
    setInput('');
    
    // Generate description
    const absurdDesc = await generateAbsurdTask(originalText);
    
    const newTask: Task = {
      id: Date.now().toString(),
      originalText,
      absurdDescription: absurdDesc,
      isCompleted: false,
      createdAt: Date.now(),
      difficulty: 'meh',
    };

    onAddTask(newTask);
    setLoading(false);
    playVoice("Добавлено в список того, что ты вряд ли сделаешь.");
  };

  const handleGetExcuse = async (task: Task) => {
    setExcuseLoading(task.id);
    const excuse = await generateExcuse(task.originalText);
    setActiveExcuse({ taskId: task.id, text: excuse });
    setExcuseLoading(null);
    playVoice("Ну вот, другое дело.");
  };

  const confirmExcuse = () => {
      if (activeExcuse && onExcuseTask) {
          onExcuseTask(activeExcuse.taskId);
          setActiveExcuse(null);
      }
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4 max-w-lg mx-auto w-full relative">
      
      {/* Excuse Modal */}
      {activeExcuse && (
          <div className="absolute inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
              <DirtyCard className="w-full max-w-sm rotate-2 border-postal-rust">
                  <h3 className="font-impact text-xl text-postal-rust uppercase mb-2">Причина №{Math.floor(Math.random() * 999)}</h3>
                  <p className="font-hand text-2xl font-bold text-stone-900 mb-6 leading-tight">
                      "{activeExcuse.text}"
                  </p>
                  <div className="flex gap-2">
                      <GrittyButton onClick={() => setActiveExcuse(null)} variant="neutral" className="flex-1">
                          Бред
                      </GrittyButton>
                      <GrittyButton onClick={confirmExcuse} variant="primary" className="flex-1">
                          Использовать
                      </GrittyButton>
                  </div>
              </DirtyCard>
          </div>
      )}

      <div className="bg-stone-800 p-4 border-b-4 border-postal-rust relative">
        <h2 className="text-3xl font-impact text-postal-paper uppercase tracking-wider dirty-text-shadow text-center">
            СПИСОК ПОРУЧЕНИЙ
        </h2>
        <div className="absolute top-2 left-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
      </div>

      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
          placeholder="Какую скучную хрень надо сделать?"
          className="flex-1 bg-stone-200 border-4 border-stone-600 p-2 font-hand text-xl font-bold text-stone-900 placeholder-stone-500 focus:outline-none focus:border-postal-rust transition-colors"
          disabled={loading}
        />
        <GrittyButton onClick={handleAddClick} disabled={loading}>
          {loading ? <Loader2 className="animate-spin" /> : <Plus />}
        </GrittyButton>
      </div>

      <PaperSheet className="flex-1 overflow-y-auto">
        {tasks.length === 0 ? (
          <div className="text-center opacity-50 mt-10">
            <p className="font-hand text-2xl">Твой планшет пуст.</p>
            <p className="font-hand text-xl mt-2">Иди сделай что-нибудь полезное.<br/>Или не делай. Мне плевать.</p>
          </div>
        ) : (
          <ul className="space-y-6 pb-20">
            {tasks.map((task) => (
              <li key={task.id} className={`relative group ${task.isCompleted ? 'line-through opacity-40' : ''}`}>
                <div className="flex items-start gap-2">
                  <button 
                    onClick={() => onToggleTask(task.id)}
                    className="mt-1 w-6 h-6 border-2 border-stone-800 flex items-center justify-center hover:bg-stone-300 flex-shrink-0"
                  >
                    {task.isCompleted && <CheckSquare className="w-5 h-5 text-postal-rust" />}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-2xl sm:text-3xl font-hand tracking-tight leading-none mb-1 text-stone-900 break-words">
                        {task.absurdDescription}
                    </p>
                    <p className="text-lg font-hand text-stone-600 truncate">
                        ({task.originalText})
                    </p>
                  </div>

                  {!task.isCompleted && (
                      <button 
                        onClick={() => handleGetExcuse(task)}
                        disabled={excuseLoading === task.id}
                        className="text-stone-500 hover:text-blue-700 transition-colors p-1"
                        title="Найти отмазку"
                      >
                        {excuseLoading === task.id ? <Loader2 size={20} className="animate-spin" /> : <MessageCircleQuestion size={20} />}
                      </button>
                  )}

                  <button 
                    onClick={() => onDeleteTask(task.id)} 
                    className="text-stone-500 hover:text-red-700 transition-colors p-1"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
                
                {/* Visual marker line */}
                <div className="absolute bottom-[-12px] left-0 w-full h-[1px] bg-stone-400 opacity-50 transform rotate-1"></div>
              </li>
            ))}
          </ul>
        )}
      </PaperSheet>
    </div>
  );
};

export default TaskTracker;