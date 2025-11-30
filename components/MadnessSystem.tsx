import React, { useState, useEffect } from 'react';
import { generateMadnessEvent } from '../services/gemini';
import { MadnessEvent } from '../types';
import { DirtyCard, GrittyButton } from './DirtyUI';
import { RefreshCw, Skull } from 'lucide-react';

interface MadnessSystemProps {
  playVoice: (text: string) => void;
}

const MadnessSystem: React.FC<MadnessSystemProps> = ({ playVoice }) => {
  const [event, setEvent] = useState<MadnessEvent | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchMadness = async () => {
    setLoading(true);
    const newEvent = await generateMadnessEvent();
    setEvent(newEvent);
    setLoading(false);
    playVoice("Новый день, новые страдания.");
  };

  useEffect(() => {
    // Check if we have one for today
    const stored = localStorage.getItem('todays_madness');
    const storedDate = localStorage.getItem('madness_date');
    const today = new Date().toDateString();

    if (stored && storedDate === today) {
      setEvent(JSON.parse(stored));
    } else {
      fetchMadness();
    }
  }, []);

  useEffect(() => {
    if (event) {
      localStorage.setItem('todays_madness', JSON.stringify(event));
      localStorage.setItem('madness_date', new Date().toDateString());
    }
  }, [event]);

  return (
    <div className="flex flex-col items-center justify-center h-full p-6">
      <h2 className="text-4xl font-impact text-postal-rust mb-8 dirty-text-shadow uppercase transform -rotate-2">
        Дневной Хаос
      </h2>

      {loading ? (
        <div className="animate-pulse text-xl font-dirty text-white">Генерирую проблемы...</div>
      ) : event ? (
        <DirtyCard className="w-full max-w-sm transform rotate-1">
          <div className="border-b-2 border-stone-800 pb-2 mb-4 flex justify-between items-center">
            <span className="bg-postal-alert text-white px-2 py-0.5 text-xs font-bold uppercase">Тревога</span>
            <span className="font-dirty text-xs">{new Date().toLocaleDateString('ru-RU')}</span>
          </div>
          
          <h3 className="text-2xl font-impact uppercase mb-4 text-stone-900 leading-6">
            {event.title}
          </h3>
          
          <p className="font-dirty text-stone-800 mb-6 text-lg leading-tight">
            {event.description}
          </p>

          <div className="bg-stone-800 p-2 text-postal-paper font-mono text-sm border-2 border-stone-600">
            <span className="text-postal-rust font-bold">ЭФФЕКТ:</span> {event.buff}
          </div>
        </DirtyCard>
      ) : null}

      <div className="mt-8 flex flex-col items-center gap-4">
        <p className="text-stone-400 font-dirty text-sm text-center max-w-xs">
          Не нравится прогноз? Можешь попробовать перебросить, но судьба жестока.
        </p>
        <GrittyButton onClick={fetchMadness} disabled={loading} className="flex gap-2 items-center">
          <RefreshCw className={loading ? 'animate-spin' : ''} />
          Испытать Удачу
        </GrittyButton>
      </div>
      
      <div className="absolute bottom-20 opacity-10 pointer-events-none">
        <Skull size={200} />
      </div>
    </div>
  );
};

export default MadnessSystem;