import React, { useState, useEffect } from 'react';
import { ClipboardList, AlertTriangle, Camera, Skull, Volume2, VolumeX, User, Award, ShieldAlert, FileText, Trash2, Zap, Brain, MessageSquareWarning, Download } from 'lucide-react';
import { AppView, Task, UserStats, Achievement } from './types';
import TaskTracker from './components/TaskTracker';
import MadnessSystem from './components/MadnessSystem';
import Antistress from './components/Antistress';
import GrittyCamera from './components/GrittyCamera';
import PersonalFile from './components/PersonalFile';
import Ramblings from './components/Ramblings';
import AchievementPopup from './components/AchievementPopup';
import { playTts } from './services/gemini';

const App: React.FC = () => {
  const [view, setView] = useState<AppView>(AppView.TASKS);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  // --- STATE MANAGEMENT ---
  const [tasks, setTasks] = useState<Task[]>(() => {
    const saved = localStorage.getItem('paradise_tasks');
    return saved ? JSON.parse(saved) : [];
  });

  const [stats, setStats] = useState<UserStats>(() => {
    const saved = localStorage.getItem('paradise_stats');
    return saved ? JSON.parse(saved) : { tasksCreated: 0, tasksCompleted: 0, tasksDeleted: 0, ventingClicks: 0, excusesGenerated: 0 };
  });

  const [achievements, setAchievements] = useState<Achievement[]>([
    { id: 'first_blood', title: 'Первый Шаг', description: 'Выполнил 1 задачу. Не надорвись.', unlocked: false, icon: <User size={20} /> },
    { id: 'worker', title: 'Офисный Планктон', description: 'Выполнил 5 задач. Тебе не заплатят.', unlocked: false, icon: <FileText size={20} /> },
    { id: 'psycho', title: 'Маньяк', description: 'Выполнил 20 задач. Твой врач в шоке.', unlocked: false, icon: <ShieldAlert size={20} /> },
    { id: 'hoarder', title: 'Барахольщик', description: 'Накопил 10 невыполненных задач.', unlocked: false, icon: <Award size={20} /> },
    { id: 'quitter', title: 'Тряпка', description: 'Удалил задачу вместо того чтобы сделать.', unlocked: false, icon: <Trash2 size={20} /> },
    { id: 'anger', title: 'Психопат', description: 'Натыкал 50 раз в антистресс.', unlocked: false, icon: <Zap size={20} /> },
    { id: 'liar', title: 'Бюрократ', description: 'Использовал 3 отмазки.', unlocked: false, icon: <MessageSquareWarning size={20} /> },
  ]);

  const [lastUnlocked, setLastUnlocked] = useState<Achievement | null>(null);

  // --- EFFECTS ---
  useEffect(() => {
    localStorage.setItem('paradise_tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('paradise_stats', JSON.stringify(stats));
    checkAchievements();
  }, [stats, tasks]);

  useEffect(() => {
    // Load unlocked status from local storage to sync with definitions
    const savedUnlocked = JSON.parse(localStorage.getItem('paradise_unlocked_ids') || '[]');
    setAchievements(prev => prev.map(a => ({
        ...a,
        unlocked: savedUnlocked.includes(a.id)
    })));

    // PWA Install Prompt Listener
    const handleBeforeInstallPrompt = (e: any) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later.
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  // --- LOGIC ---

  const playVoice = (text: string) => {
    if (!soundEnabled) return;
    playTts(text);
  };

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    // Show the install prompt
    deferredPrompt.prompt();
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setDeferredPrompt(null);
    }
  };

  const unlockAchievement = (id: string) => {
    setAchievements(prev => {
        const achievement = prev.find(a => a.id === id);
        if (achievement && !achievement.unlocked) {
            const updated = prev.map(a => a.id === id ? { ...a, unlocked: true } : a);
            
            // Save to local storage
            const unlockedIds = updated.filter(a => a.unlocked).map(a => a.id);
            localStorage.setItem('paradise_unlocked_ids', JSON.stringify(unlockedIds));
            
            // Trigger Notification
            setLastUnlocked({ ...achievement, unlocked: true });
            playVoice(`Достижение получено: ${achievement.title}`);
            
            return updated;
        }
        return prev;
    });
  };

  const checkAchievements = () => {
    if (stats.tasksCompleted >= 1) unlockAchievement('first_blood');
    if (stats.tasksCompleted >= 5) unlockAchievement('worker');
    if (stats.tasksCompleted >= 20) unlockAchievement('psycho');
    if (tasks.filter(t => !t.isCompleted).length >= 10) unlockAchievement('hoarder');
    if (stats.tasksDeleted >= 1) unlockAchievement('quitter');
    if (stats.ventingClicks >= 50) unlockAchievement('anger');
    if ((stats.excusesGenerated || 0) >= 3) unlockAchievement('liar');
  };

  // --- HANDLERS ---

  const handleAddTask = (task: Task) => {
    setTasks(prev => [task, ...prev]);
    setStats(prev => ({ ...prev, tasksCreated: prev.tasksCreated + 1 }));
  };

  const handleToggleTask = (id: string) => {
    setTasks(prev => prev.map(t => {
        if (t.id === id) {
            const newState = !t.isCompleted;
            if (newState) {
                setStats(s => ({ ...s, tasksCompleted: s.tasksCompleted + 1 }));
                playVoice("Ого, ты реально это сделал?");
            }
            return { ...t, isCompleted: newState };
        }
        return t;
    }));
  };

  const handleDeleteTask = (id: string) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setStats(prev => ({ ...prev, tasksDeleted: prev.tasksDeleted + 1 }));
    playVoice("Сдаешься? Типично.");
  };

  const handleExcuseTask = (id: string) => {
      setTasks(prev => prev.filter(t => t.id !== id));
      setStats(prev => ({ ...prev, excusesGenerated: (prev.excusesGenerated || 0) + 1 }));
      playVoice("Отлично. Меньше проблем.");
  };

  const handleVentClick = () => {
      setStats(prev => ({ ...prev, ventingClicks: prev.ventingClicks + 1 }));
  };

  // --- RENDER ---

  const renderView = () => {
    switch (view) {
      case AppView.TASKS:
        return <TaskTracker 
            tasks={tasks} 
            onAddTask={handleAddTask} 
            onToggleTask={handleToggleTask} 
            onDeleteTask={handleDeleteTask}
            onExcuseTask={handleExcuseTask}
            playVoice={playVoice} 
        />;
      case AppView.MADNESS:
        return <MadnessSystem playVoice={playVoice} />;
      case AppView.ANTISTRESS:
        return <Antistress playVoice={playVoice} onVent={handleVentClick} />;
      case AppView.CAMERA:
        return <GrittyCamera />;
      case AppView.PROFILE:
        return <PersonalFile playVoice={playVoice} stats={stats} achievements={achievements} />;
      case AppView.RAMBLINGS:
        return <Ramblings playVoice={playVoice} />;
      default:
        return <TaskTracker 
            tasks={tasks} 
            onAddTask={handleAddTask} 
            onToggleTask={handleToggleTask} 
            onDeleteTask={handleDeleteTask}
            playVoice={playVoice} 
        />;
    }
  };

  return (
    <div className="min-h-screen bg-stone-900 flex flex-col font-sans text-stone-200 bg-noise bg-repeat">
      
      <AchievementPopup achievement={lastUnlocked} onClose={() => setLastUnlocked(null)} />

      {/* Top Header */}
      <header className="h-14 bg-postal-ui border-b-4 border-stone-950 flex items-center justify-between px-4 shadow-lg z-10">
        <h1 className="text-xl font-impact tracking-widest text-postal-rust uppercase dirty-text-shadow">
          Paradise<span className="text-white">Planner</span>
        </h1>
        <div className="flex items-center gap-2">
            {deferredPrompt && (
                <button
                    onClick={handleInstallClick}
                    className="p-2 bg-postal-rust text-white rounded hover:bg-orange-800 animate-pulse border-2 border-stone-950 shadow-sm"
                    title="Установить приложение"
                >
                    <Download size={20} />
                </button>
            )}
            <button 
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="p-2 hover:bg-stone-700 rounded"
            >
                {soundEnabled ? <Volume2 size={20} className="text-green-500" /> : <VolumeX size={20} className="text-red-500" />}
            </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 pointer-events-none opacity-5 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-transparent via-black to-black"></div>
        {renderView()}
      </main>

      {/* Bottom Navigation */}
      <nav className="h-16 bg-postal-ui border-t-4 border-stone-950 flex items-stretch justify-between px-1 shadow-[0px_-5px_15px_rgba(0,0,0,0.5)] z-20 overflow-x-auto">
        <NavButton 
            active={view === AppView.TASKS} 
            onClick={() => setView(AppView.TASKS)}
            icon={<ClipboardList size={18} />}
            label="Дела"
        />
        <NavButton 
            active={view === AppView.MADNESS} 
            onClick={() => setView(AppView.MADNESS)}
            icon={<AlertTriangle size={18} />}
            label="Хаос"
        />
        <NavButton 
            active={view === AppView.ANTISTRESS} 
            onClick={() => setView(AppView.ANTISTRESS)}
            icon={<Skull size={18} />}
            label="Нервы"
        />
        <NavButton 
            active={view === AppView.CAMERA} 
            onClick={() => setView(AppView.CAMERA)}
            icon={<Camera size={18} />}
            label="Глаза"
        />
        <NavButton 
            active={view === AppView.RAMBLINGS} 
            onClick={() => setView(AppView.RAMBLINGS)}
            icon={<Brain size={18} />}
            label="Бредни"
        />
        <NavButton 
            active={view === AppView.PROFILE} 
            onClick={() => setView(AppView.PROFILE)}
            icon={<User size={18} />}
            label="Досье"
        />
      </nav>
    </div>
  );
};

const NavButton: React.FC<{
    active: boolean;
    onClick: () => void;
    icon: React.ReactNode;
    label: string;
}> = ({ active, onClick, icon, label }) => (
    <button 
        onClick={onClick}
        className={`
            flex-1 min-w-[50px] flex flex-col items-center justify-center gap-1 p-1
            transition-colors duration-150
            ${active 
                ? 'bg-postal-rust text-white shadow-[inset_0px_0px_10px_rgba(0,0,0,0.5)]' 
                : 'bg-stone-800 text-stone-500 hover:bg-stone-700 hover:text-stone-300'}
        `}
    >
        <div className={active ? 'scale-110 transform transition-transform' : ''}>
            {icon}
        </div>
        <span className="text-[9px] sm:text-[10px] font-impact uppercase tracking-wider">{label}</span>
    </button>
);

export default App;