import React, { useState } from 'react';
import { generateInsult } from '../services/gemini';
import { GrittyButton } from './DirtyUI';
import { Zap } from 'lucide-react';

interface AntistressProps {
  playVoice: (text: string) => void;
  onVent?: () => void;
}

const Antistress: React.FC<AntistressProps> = ({ playVoice, onVent }) => {
  const [phrase, setPhrase] = useState("Жми кнопку. Выпусти пар.");
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleVent = async () => {
    setCount(c => c + 1);
    if (onVent) onVent();
    
    // Play generic sound effect or voice every few clicks
    if (Math.random() > 0.7) {
       playVoice(["Аррргх!", "Угх.", "Да ладно.", "Серьезно?", "Жми сильнее."][Math.floor(Math.random() * 5)]);
    }

    if (count % 5 === 0) {
      setLoading(true);
      const newPhrase = await generateInsult();
      setPhrase(newPhrase);
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <div className="mb-10 p-6 bg-stone-900 border-2 border-dashed border-stone-600 max-w-xs">
        <p className="font-dirty text-green-500 text-lg min-h-[80px]">
          {loading ? "Придумываю гадости..." : `> ${phrase}`}
        </p>
      </div>

      <button 
        onClick={handleVent}
        className="
          w-64 h-64 rounded-full bg-red-800 
          shadow-[0px_10px_0px_0px_rgba(0,0,0,0.8)]
          border-8 border-red-950
          active:shadow-none active:translate-y-[10px]
          transition-all duration-75
          flex items-center justify-center
          group
        "
      >
        <div className="text-center">
          <Zap className="w-20 h-20 text-red-400 mx-auto mb-2 group-hover:text-white transition-colors" />
          <span className="font-impact text-2xl text-red-200 uppercase tracking-widest block">
            РАЗРЯДКА
          </span>
        </div>
      </button>

      <div className="mt-8 text-stone-500 font-mono">
        Потрачено кликов: {count}
      </div>
    </div>
  );
};

export default Antistress;