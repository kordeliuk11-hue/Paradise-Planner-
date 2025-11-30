import React, { useEffect, useState } from 'react';
import { Award, X } from 'lucide-react';
import { Achievement } from '../types';

interface AchievementPopupProps {
    achievement: Achievement | null;
    onClose: () => void;
}

const AchievementPopup: React.FC<AchievementPopupProps> = ({ achievement, onClose }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (achievement) {
            setVisible(true);
            // Auto hide after 4 seconds
            const timer = setTimeout(() => {
                setVisible(false);
                setTimeout(onClose, 500); // Wait for animation to finish before clearing data
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [achievement, onClose]);

    if (!achievement) return null;

    return (
        <div 
            className={`
                fixed top-20 left-1/2 transform -translate-x-1/2 z-50 
                transition-all duration-500 ease-out
                ${visible ? 'translate-y-0 opacity-100' : '-translate-y-20 opacity-0'}
            `}
        >
            <div className="bg-stone-900 border-4 border-postal-rust shadow-[0px_0px_20px_rgba(139,69,19,0.5)] p-1 flex items-center w-80 max-w-[90vw]">
                <div className="bg-postal-rust p-3 flex items-center justify-center mr-3 border-2 border-stone-800">
                    <Award className="text-white w-8 h-8" />
                </div>
                <div className="flex-1 pr-2">
                    <h4 className="font-impact text-stone-400 text-xs uppercase tracking-widest mb-0.5">
                        Достижение Разблокировано
                    </h4>
                    <p className="font-dirty text-white font-bold text-sm leading-tight uppercase">
                        {achievement.title}
                    </p>
                    <p className="font-hand text-stone-400 text-sm leading-none mt-1">
                        {achievement.description}
                    </p>
                </div>
                <button onClick={() => setVisible(false)} className="text-stone-600 hover:text-red-500 self-start">
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default AchievementPopup;