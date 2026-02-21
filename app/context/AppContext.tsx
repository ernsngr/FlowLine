import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 1. Veri Yapıları - Geliştirildi
export interface Session {
  id: string;
  date: string;
  goal: string;
  rating: number;
  distractions: string[];
  points: number;
  duration: number;
  // --- YENİ ALANLAR ---
  type: 'pomo' | 'break'; // Pomo mu mola mı olduğunu ayırt etmek için
  interruptedCount: number; // Bu oturumda kaç kez pause yapıldı?
}

interface AppContextType {
  goal: string;
  setGoal: (goal: string) => void;
  isFirstLaunch: boolean | null;
  completeOnboarding: () => Promise<void>;
  sessions: Session[];
  saveSession: (sessionData: {
    goal: string,
    rating: number,
    distractions: string[],
    duration: number,
    type: 'pomo' | 'break', // Yeni
    interruptedCount: number // Yeni
  }) => Promise<void>;
  todaySessionsCount: number;
  todayTotalPoints: number;
  totalFocusMinutes: number;
  // --- Ayarlar Bölümü ---
  pomodoroTime: number;
  setPomodoroTime: (t: number) => void;
  shortBreak: number;
  setShortBreak: (t: number) => void;
  autoStartBreaks: boolean;
  setAutoStartBreaks: (v: boolean) => void;
  autoStartTimer: boolean;
  setAutoStartTimer: (v: boolean) => void;
  soundEnabled: boolean;
  setSoundEnabled: (v: boolean) => void;
  saveSettings: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [goal, setGoal] = useState("Derin Çalışma");
  const [isFirstLaunch, setIsFirstLaunch] = useState<boolean | null>(null);
  const [sessions, setSessions] = useState<Session[]>([]);

  const [pomodoroTime, setPomodoroTime] = useState(25);
  const [shortBreak, setShortBreak] = useState(5);
  const [autoStartBreaks, setAutoStartBreaks] = useState(true);
  const [autoStartTimer, setAutoStartTimer] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);

  const isSaving = useRef(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('alreadyLaunched');
        setIsFirstLaunch(hasLaunched !== 'true');

        const savedSessions = await AsyncStorage.getItem('sessions_history');
        if (savedSessions) {
          setSessions(JSON.parse(savedSessions));
        }

        const savedSettings = await AsyncStorage.getItem('user_settings');
        if (savedSettings) {
          const parsed = JSON.parse(savedSettings);
          setPomodoroTime(parseInt(parsed.pomodoroTime) || 25);
          setShortBreak(parseInt(parsed.shortBreak) || 5);
          setAutoStartBreaks(parsed.autoStartBreaks ?? true);
          setAutoStartTimer(parsed.autoStartTimer ?? true);
          setSoundEnabled(parsed.soundEnabled ?? true);
        }
      } catch (error) {
        console.error("Veri yükleme hatası:", error);
        setIsFirstLaunch(false);
      }
    };
    loadData();
  }, []);

  const completeOnboarding = async () => {
    try {
      await AsyncStorage.setItem('alreadyLaunched', 'true');
      setIsFirstLaunch(false);
    } catch (error) {
      console.error("Onboarding hatası:", error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        pomodoroTime,
        shortBreak,
        autoStartBreaks,
        autoStartTimer,
        soundEnabled
      };
      await AsyncStorage.setItem('user_settings', JSON.stringify(settings));
    } catch (error) {
      console.error("Ayarlar kaydedilemedi:", error);
    }
  };

  // --- SEANS KAYDETME (ANALİZ İÇİN GELİŞTİRİLDİ) ---
  const saveSession = async (sessionData: {
    goal: string,
    rating: number,
    distractions: string[],
    duration: number,
    type: 'pomo' | 'break',
    interruptedCount: number
  }) => {
    if (isSaving.current || sessionData.duration <= 0) return;

    try {
      isSaving.current = true;

      // Puan Hesaplama Mantığı: 
      // Rating (1-5) * 10 baz puan + (Süre / 5) bonus - (Kesinti * 2) ceza
      const basePoints = sessionData.rating * 10;
      const durationBonus = Math.floor(sessionData.duration / 5);
      const interruptionPenalty = sessionData.interruptedCount * 2;

      const finalPoints = Math.max(5, basePoints + durationBonus - interruptionPenalty);

      const newSession: Session = {
        id: Date.now().toString(),
        date: new Date().toISOString(),
        goal: sessionData.goal || "Odaklanma",
        rating: sessionData.rating,
        distractions: sessionData.distractions,
        duration: Number(sessionData.duration),
        points: finalPoints,
        type: sessionData.type,
        interruptedCount: sessionData.interruptedCount,
      };

      const updatedSessions = [newSession, ...sessions];
      setSessions(updatedSessions);
      await AsyncStorage.setItem('sessions_history', JSON.stringify(updatedSessions));

    } catch (error) {
      console.error("Seans kaydedilemedi:", error);
    } finally {
      setTimeout(() => {
        isSaving.current = false;
      }, 2000);
    }
  };

  // --- İSTATİSTİK HESAPLAMALARI (SADECE POMO'LAR) ---
  const todaySessions = sessions.filter(session => {
    if (!session.date || session.type !== 'pomo') return false;
    return new Date(session.date).toDateString() === new Date().toDateString();
  });

  const todaySessionsCount = todaySessions.length;

  const todayTotalPoints = todaySessions.reduce((total, session) =>
    total + (Number(session.points) || 0), 0
  );

  const totalFocusMinutes = sessions
    .filter(s => s.type === 'pomo')
    .reduce((total, session) => total + (Number(session.duration) || 0), 0);

  return (
    <AppContext.Provider value={{
      goal, setGoal,
      isFirstLaunch, completeOnboarding,
      sessions, saveSession,
      todaySessionsCount, todayTotalPoints, totalFocusMinutes,
      pomodoroTime, setPomodoroTime,
      shortBreak, setShortBreak,
      autoStartBreaks, setAutoStartBreaks,
      autoStartTimer, setAutoStartTimer,
      soundEnabled, setSoundEnabled,
      saveSettings
    }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error("useApp bir AppProvider içinde kullanılmalıdır");
  return context;
};