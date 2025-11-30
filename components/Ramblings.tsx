import React, { useState, useEffect } from 'react';
import { Trash2, Plus, Brain } from 'lucide-react';
import { Note } from '../types';
import { GrittyButton } from './DirtyUI';

interface RamblingsProps {
  playVoice: (text: string) => void;
}

const Ramblings: React.FC<RamblingsProps> = ({ playVoice }) => {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('paradise_notes');
    return saved ? JSON.parse(saved) : [];
  });
  const [input, setInput] = useState('');

  useEffect(() => {
    localStorage.setItem('paradise_notes', JSON.stringify(notes));
  }, [notes]);

  const addNote = () => {
    if (!input.trim()) return;
    
    const newNote: Note = {
      id: Date.now().toString(),
      content: input,
      createdAt: Date.now(),
    };
    
    setNotes([newNote, ...notes]);
    setInput('');
    playVoice("Записано. Теперь не отвертишься.");
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    playVoice("Уничтожение улик...");
  };

  return (
    <div className="flex flex-col h-full p-4 space-y-4">
      <div className="bg-stone-800 p-2 border-b-4 border-postal-rust flex items-center justify-between">
         <h2 className="text-2xl font-impact text-postal-paper uppercase tracking-wider dirty-text-shadow">
            БРЕДНИ
        </h2>
        <Brain className="text-postal-rust animate-pulse" />
      </div>

      <div className="flex flex-col gap-2 bg-stone-300 p-2 border-2 border-stone-600 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="О чем шепчут голоса?.."
          className="w-full h-20 bg-transparent font-hand text-xl text-stone-900 placeholder-stone-500 focus:outline-none resize-none"
        />
        <div className="flex justify-end">
             <GrittyButton onClick={addNote} disabled={!input.trim()} className="text-xs py-1">
                <Plus size={16} className="inline mr-1" /> Записать
             </GrittyButton>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 pb-20 content-start">
        {notes.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center opacity-30 mt-10">
                <Brain size={64} />
                <p className="font-dirty mt-2 text-center">Голова пуста.<br/>Это даже хорошо.</p>
            </div>
        ) : (
            notes.map(note => (
                <div key={note.id} className="relative bg-[#fefe95] p-4 shadow-md transform rotate-1 hover:rotate-0 transition-transform duration-200 border border-[#dcdc80]">
                    {/* Tape visual */}
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 w-16 h-6 bg-[#ffffffaa] rotate-2 shadow-sm"></div>
                    
                    <p className="font-hand text-xl text-stone-900 leading-tight break-words whitespace-pre-wrap">
                        {note.content}
                    </p>
                    <div className="mt-4 flex justify-between items-center border-t border-[#dcdc80] pt-2">
                        <span className="text-[10px] font-mono text-stone-500">
                            {new Date(note.createdAt).toLocaleDateString()}
                        </span>
                        <button 
                            onClick={() => deleteNote(note.id)}
                            className="text-stone-400 hover:text-red-600"
                        >
                            <Trash2 size={16} />
                        </button>
                    </div>
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default Ramblings;