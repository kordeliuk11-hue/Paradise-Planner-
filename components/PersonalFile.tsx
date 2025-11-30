import React, { useState, useEffect, useRef } from 'react';
import { User, Fingerprint, Upload } from 'lucide-react';
import { generatePsychProfile } from '../services/gemini';
import { DirtyCard } from './DirtyUI';
import { Achievement, UserStats } from '../types';

interface PersonalFileProps {
  playVoice: (text: string) => void;
  stats: UserStats;
  achievements: Achievement[];
}

const PersonalFile: React.FC<PersonalFileProps> = ({ playVoice, stats, achievements }) => {
  const [name, setName] = useState('');
  const [photo, setPhoto] = useState<string | null>(null);
  const [bio, setBio] = useState('');
  const [loadingBio, setLoadingBio] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Load User Data (Profile info is still local, stats come from props)
    const savedName = localStorage.getItem('paradise_username') || 'Чувак';
    const savedPhoto = localStorage.getItem('paradise_userphoto');
    const savedBio = localStorage.getItem('paradise_userbio') || 'Характеристика не составлена.';
    
    setName(savedName);
    setPhoto(savedPhoto);
    setBio(savedBio);
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    localStorage.setItem('paradise_username', newName);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhoto(result);
        localStorage.setItem('paradise_userphoto', result);
        playVoice("Отличное фото. В розыск подойдет.");
      };
      reader.readAsDataURL(file);
    }
  };

  const updateBio = async () => {
    setLoadingBio(true);
    playVoice("Запрашиваю данные у федералов...");
    const newBio = await generatePsychProfile(name);
    setBio(newBio);
    localStorage.setItem('paradise_userbio', newBio);
    setLoadingBio(false);
  };

  return (
    <div className="flex flex-col h-full p-4 overflow-y-auto">
      <div className="bg-postal-paper p-1 shadow-lg transform rotate-1 mb-6 border-2 border-stone-400">
        <div className="border-4 border-double border-stone-800 p-4 relative">
            <div className="absolute top-2 right-2 border-2 border-red-800 text-red-800 px-2 py-1 font-impact uppercase transform rotate-12 opacity-80 text-sm">
                Секретно
            </div>

            <h2 className="text-3xl font-impact uppercase text-center mb-6 tracking-wider border-b-2 border-stone-800 pb-2 text-stone-900">
                ЛИЧНОЕ ДЕЛО
            </h2>

            <div className="flex flex-col sm:flex-row gap-6 items-center">
                {/* Photo Section */}
                <div 
                    className="w-32 h-40 bg-stone-300 border-4 border-stone-800 flex items-center justify-center relative cursor-pointer overflow-hidden group shadow-md"
                    onClick={() => fileInputRef.current?.click()}
                >
                    {photo ? (
                        <img 
                            src={photo} 
                            alt="User" 
                            className="w-full h-full object-cover filter grayscale contrast-125 sepia brightness-90" 
                        />
                    ) : (
                        <User size={64} className="text-stone-500 opacity-50" />
                    )}
                    
                    <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all flex items-center justify-center">
                         <Upload className="text-white opacity-0 group-hover:opacity-100" />
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*" 
                        onChange={handlePhotoUpload} 
                    />
                </div>

                {/* Info Section */}
                <div className="flex-1 w-full space-y-4">
                    <div>
                        <label className="block font-dirty text-stone-600 text-xs uppercase mb-1">ФИО Подозреваемого</label>
                        <input 
                            type="text" 
                            value={name} 
                            onChange={handleNameChange}
                            className="w-full bg-transparent border-b-2 border-stone-800 font-hand text-2xl font-bold text-stone-900 focus:outline-none focus:border-postal-rust"
                        />
                    </div>
                    
                    <div className="bg-stone-200 p-2 border border-stone-400 relative">
                        <label className="block font-dirty text-stone-500 text-[10px] uppercase mb-1">Психологический портрет</label>
                        <p className="font-dirty text-sm leading-tight text-stone-800 min-h-[40px]">
                            {loadingBio ? "Анализ личности..." : bio}
                        </p>
                        <button 
                            onClick={updateBio} 
                            disabled={loadingBio}
                            className="absolute -bottom-3 -right-2 bg-stone-800 text-white p-1 rounded-full hover:bg-postal-rust"
                        >
                            <Fingerprint size={16} />
                        </button>
                    </div>
                </div>
            </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <DirtyCard className="text-center py-2 bg-stone-800 text-white border-stone-600">
            <div className="text-3xl font-impact text-postal-rust">{stats.tasksCompleted}</div>
            <div className="text-[10px] font-dirty uppercase tracking-widest text-stone-400">Исполнено</div>
        </DirtyCard>
        <DirtyCard className="text-center py-2 bg-stone-800 text-white border-stone-600">
            <div className="text-3xl font-impact text-stone-300">{stats.tasksCreated}</div>
            <div className="text-[10px] font-dirty uppercase tracking-widest text-stone-400">Назначено</div>
        </DirtyCard>
      </div>

      {/* Achievements */}
      <div>
        <h3 className="font-impact text-xl text-stone-400 uppercase mb-3 px-2 border-l-4 border-postal-rust">
            Достижения Дна
        </h3>
        <div className="grid grid-cols-1 gap-3 pb-20">
            {achievements.map(ach => (
                <div 
                    key={ach.id} 
                    className={`
                        flex items-center gap-4 p-3 border-2 
                        ${ach.unlocked 
                            ? 'bg-stone-800 border-postal-rust shadow-[4px_4px_0px_0px_rgba(139,69,19,0.3)]' 
                            : 'bg-stone-900 border-stone-700 opacity-50 grayscale'}
                    `}
                >
                    <div className={`
                        p-2 rounded-full border-2 min-w-[50px] flex justify-center
                        ${ach.unlocked ? 'bg-postal-rust border-white text-white' : 'bg-stone-800 border-stone-600 text-stone-600'}
                    `}>
                        {ach.icon}
                    </div>
                    <div>
                        <h4 className={`font-impact uppercase tracking-wide ${ach.unlocked ? 'text-white' : 'text-stone-500'}`}>
                            {ach.title}
                        </h4>
                        <p className="font-hand text-lg leading-none text-stone-400">
                            {ach.description}
                        </p>
                    </div>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};

export default PersonalFile;