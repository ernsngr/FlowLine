import React, { createContext, useState, useContext, useEffect, useRef } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RewardedAd, TestIds, RewardedAdEventType, AdEventType } from 'react-native-google-mobile-ads';

const adUnitId = __DEV__ ? TestIds.REWARDED : "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx";

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
    type: 'pomo' | 'break',
    interruptedCount: number,
    targetDuration?: number
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
  // --- Reklam Yönetimi ---
  rewardedAd: RewardedAd | null;
  rewardedAdLoaded: boolean;
  loadRewardedAd: () => void;
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

  // --- Reklam Durumu ---
  const [rewardedAdLoaded, setRewardedAdLoaded] = useState(false);
  const rewardedAdRef = useRef<RewardedAd | null>(null);

  const isSaving = useRef(false);

  const loadRewardedAd = () => {
    if (!rewardedAdRef.current) {
      const ad = RewardedAd.createForAdRequest(adUnitId, {
        requestNonPersonalizedAdsOnly: true,
      });

      ad.addAdEventListener(RewardedAdEventType.LOADED, () => {
        setRewardedAdLoaded(true);
      });

      ad.addAdEventListener(RewardedAdEventType.EARNED_REWARD, () => {
        setRewardedAdLoaded(false);
        rewardedAdRef.current = null;
        loadRewardedAd(); // Bir sonraki kullanım için tekrar yükle
      });

      ad.addAdEventListener(AdEventType.CLOSED, () => {
        setRewardedAdLoaded(false);
        rewardedAdRef.current = null;
        loadRewardedAd();
      });

      rewardedAdRef.current = ad;
    }
    rewardedAdRef.current.load();
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        const hasLaunched = await AsyncStorage.getItem('alreadyLaunched');
        setIsFirstLaunch(hasLaunched !== 'true');

        // Reklamı erkenden yüklemeye başla
        loadRewardedAd();

        // --- ESKİ VERİLERİ SİLME (BİR KEZ ÇALIŞIR) ---
        const dataMigrated = await AsyncStorage.getItem('data_migrated_v2');
        if (!dataMigrated) {
          await AsyncStorage.removeItem('sessions_history');
          setSessions([]);
          await AsyncStorage.setItem('data_migrated_v2', 'true');
        } else {
          const savedSessions = await AsyncStorage.getItem('sessions_history');
          if (savedSessions) {
            setSessions(JSON.parse(savedSessions));
          }
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
    interruptedCount: number,
    targetDuration?: number // Hedeflenen süre (çarpan için)
  }) => {
    if (isSaving.current || sessionData.duration <= 0) return;

    try {
      isSaving.current = true;

      // 1. Günlük Limit Kontrolü (Max 10 Pomo oturumu)
      const todaySessionsCount = sessions.filter(s => {
        if (!s.date || s.type !== 'pomo') return false;
        return new Date(s.date).toDateString() === new Date().toDateString();
      }).length;

      let finalPoints = 0;

      if (sessionData.type === 'pomo') {
        if (todaySessionsCount < 10) {
          // A. Sabit Dakika Başı Puan (1 Dk = 1 Puan)
          const minutePoints = sessionData.duration;

          // B. Tamamlama Çarpanı (Hedeflenen sürenin yüzdesi)
          const target = sessionData.targetDuration || 25;
          const completionRatio = Math.min(sessionData.duration / target, 1);
          const completionMultiplier = completionRatio >= 1 ? 1.5 : (1 + (completionRatio * 0.5));

          // C. Kesinti Cezası (Her durdurma -5 puan)
          const interruptionPenalty = sessionData.interruptedCount * 5;

          // D. Mola Bonusu Kontrolü (AsyncStorage'dan veya Context'ten çekilebilir)
          const breakBonusActive = await AsyncStorage.getItem('next_session_bonus');
          const multiplier = breakBonusActive === 'true' ? 1.2 : 1.0;
          if (breakBonusActive === 'true') await AsyncStorage.removeItem('next_session_bonus');

          finalPoints = Math.round(((minutePoints * completionMultiplier) - interruptionPenalty) * multiplier);
          finalPoints = Math.max(0, finalPoints);
        } else {
          // Limit aşılmışsa 0 puan
          finalPoints = 0;
        }
      } else if (sessionData.type === 'break') {
        // Mola tamamlama kontrolü: Eğer hedeflenen mola süresi tamamlandıysa bonus set et
        const targetBreak = shortBreak;
        if (sessionData.duration >= targetBreak) {
          await AsyncStorage.setItem('next_session_bonus', 'true');
        }
        return; // Mola seanslarını geçmişe kaydetmiyoruz şimdilik, sadece bonus veriyoruz
      }

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
      saveSettings,
      rewardedAd: rewardedAdRef.current,
      rewardedAdLoaded,
      loadRewardedAd
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