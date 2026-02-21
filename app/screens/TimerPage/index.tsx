import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, Animated, Modal, Pressable } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Svg, { Circle } from "react-native-svg";
import Feather from "@expo/vector-icons/Feather";
import { useApp } from "app/context/AppContext";
import { BannerAd, BannerAdSize, TestIds } from "react-native-google-mobile-ads";

type TimerMode = 'FOCUS' | 'BREAK';

const AD_UNIT_ID = __DEV__ ? TestIds.BANNER : "ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX";

export const TimerPage = () => {
  const navigation = useNavigation<any>();
  const { goal, pomodoroTime, shortBreak, autoStartTimer, autoStartBreaks } = useApp();

  const [mode, setMode] = useState<TimerMode>('FOCUS');
  const [secondsLeft, setSecondsLeft] = useState(pomodoroTime * 60);
  const [isActive, setIsActive] = useState(autoStartTimer);
  const [modalVisible, setModalVisible] = useState(false);

  // --- EKLEME: DURDURMA SAYACI ---
  const [interruptedCount, setInterruptedCount] = useState(0);

  const statusAnim = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    const newTime = mode === 'FOCUS' ? pomodoroTime : shortBreak;
    setSecondsLeft(newTime * 60);
    setIsActive(mode === 'BREAK' ? autoStartBreaks : autoStartTimer);
    // Mod değiştiğinde (odaktan molaya geçerken) kesinti sayısını sıfırlayabiliriz
    if (mode === 'BREAK') setInterruptedCount(0);
  }, [pomodoroTime, shortBreak, mode]);

  useEffect(() => {
    Animated.timing(statusAnim, {
      toValue: isActive ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  }, [isActive]);

  const animatedBg = statusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['#1a1a1a', '#161b16']
  });

  const animatedBorder = statusAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.15)']
  });

  const theme = {
    primary: mode === 'FOCUS' ? '#44f24a' : '#3b82f6',
    shadow: mode === 'FOCUS' ? 'shadow-green-500/50' : 'shadow-blue-500/50'
  };

  useEffect(() => {
    let interval: any = null;
    if (isActive && secondsLeft > 0) {
      interval = setInterval(() => {
        setSecondsLeft((prev) => prev - 1);
      }, 1000);
    } else if (secondsLeft === 0) {
      clearInterval(interval);
      if (mode === 'FOCUS') {
        // Odak bittiğinde doğrudan başarı sayfasına gönder (Otomatik Tamamlama)
        completeSessionManually(true);
      } else {
        // Mola bittiğinde ana ekrana dön
        navigation.goBack();
      }
    }
    return () => clearInterval(interval);
  }, [isActive, secondsLeft]);

  // --- EKLEME: DURDURMA TAKİBİ FONKSİYONU ---
  const handleToggleTimer = () => {
    if (isActive) {
      // Eğer şu an çalışıyorsa ve biz durduruyorsak sayacı artır
      setInterruptedCount(prev => prev + 1);
    }
    setIsActive(!isActive);
  };

  const completeSessionManually = (isAutoFinish = false) => {
    setModalVisible(false);

    if (mode === 'FOCUS') {
      const initialSeconds = pomodoroTime * 60;
      const elapsedSeconds = initialSeconds - secondsLeft;

      // Saniyeyi dakikaya çeviriyoruz. 
      // 20 saniye bile çalışsa 1 dk sayılsın (emek zayi olmasın) ama 0 ise 0 kalsın.
      const elapsedMinutes = Math.floor(elapsedSeconds / 60);
      const finalDuration = isAutoFinish ? pomodoroTime : (elapsedSeconds > 0 && elapsedSeconds < 60 ? 1 : elapsedMinutes);

      navigation.navigate("SessionComplate", {
        actualDuration: finalDuration,
        targetDuration: pomodoroTime, // Hedeflenen süreyi de gönderiyoruz
        interruptedCount: interruptedCount
      });
    } else {
      // Mola tamamlandığında veya atlandığında mola verisini kaydetmek için saveSession çağırıyoruz.
      // saveSession içinde mola ise sadece bonus set ediliyor, geçmişe kaydedilmiyor.
      const initialBreakSeconds = shortBreak * 60;
      const elapsedBreakSeconds = initialBreakSeconds - secondsLeft;
      const finalBreakDuration = Math.floor(elapsedBreakSeconds / 60);

      const { saveSession } = useApp(); // useApp'ten çekiyoruz
      saveSession({
        goal: "Mola",
        rating: 0,
        distractions: [],
        duration: finalBreakDuration,
        type: 'break',
        interruptedCount: 0
      });

      navigation.goBack();
    }
  };

  const handleFinishAndNavigate = () => {
    setIsActive(false);
    setModalVisible(true);
  };

  const size = 280;
  const strokeWidth = 8;
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  const totalSecondsForMode = mode === 'FOCUS' ? pomodoroTime * 60 : shortBreak * 60;
  const progress = secondsLeft / totalSecondsForMode;
  const strokeDashoffset = circumference - progress * circumference;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0d0a] pt-10">

      <Modal animationType="fade" transparent={true} visible={modalVisible}>
        <Pressable className="flex-1 justify-center items-center bg-black/80 px-10" onPress={() => { setModalVisible(false); setIsActive(true); }}>
          <View className="w-full bg-[#111411] border border-white/10 rounded-[32px] p-8 items-center" onStartShouldSetResponder={() => true}>
            <View className="w-16 h-16 bg-[#161b16] rounded-2xl items-center justify-center mb-6 border border-white/5">
              <Feather name={mode === 'FOCUS' ? "check-circle" : "skip-forward"} size={32} color={theme.primary} />
            </View>
            <Text className="text-white text-xl font-black uppercase tracking-widest text-center mb-2">{mode === 'FOCUS' ? "OTURUMU TAMAMLA" : "MOLAYI ATLA"}</Text>
            <Text className="text-[#5c635c] text-center font-medium mb-8">{mode === 'FOCUS' ? "Şu ana kadar yaptığın çalışmayı kaydedip özet ekranına geçmek istiyor musun?" : "Dinlenmeyi sonlandırıp ana ekrana dönmek üzeresin."}</Text>
            <View className="w-full flex-row">
              <TouchableOpacity onPress={() => { setModalVisible(false); setIsActive(true); }} className="flex-1 h-14 bg-[#1a1a1a] rounded-2xl items-center justify-center mr-3 border border-white/5"><Text className="text-white font-bold uppercase text-[10px] tracking-widest">VAZGEÇ</Text></TouchableOpacity>
              <TouchableOpacity onPress={() => mode === 'FOCUS' ? completeSessionManually() : navigation.goBack()} style={{ backgroundColor: theme.primary }} className="flex-1 h-14 rounded-2xl items-center justify-center"><Text className="text-[#051405] font-black uppercase text-[10px] tracking-widest">{mode === 'FOCUS' ? "BİTİR" : "ATLA"}</Text></TouchableOpacity>
            </View>
          </View>
        </Pressable>
      </Modal>

      <View className="w-full flex-row justify-between px-8 items-center mt-6">
        <TouchableOpacity onPress={() => navigation.goBack()}><Feather name="x" size={28} color="white" /></TouchableOpacity>
        <Animated.View style={{ backgroundColor: animatedBg, borderColor: animatedBorder, borderWidth: 1, paddingHorizontal: 16, paddingVertical: 6, borderRadius: 100, flexDirection: 'row', alignItems: 'center' }}>
          <View className="w-2 h-2 rounded-full mr-2" style={{ backgroundColor: isActive ? theme.primary : '#5c635c' }} />
          <Text className="font-bold text-[10px] uppercase tracking-widest" style={{ color: isActive ? theme.primary : '#5c635c' }}>{mode === 'FOCUS' ? (isActive ? "Odak Modu" : "Durduruldu") : (isActive ? "Mola Zamanı" : "Mola Durduruldu")}</Text>
        </Animated.View>
        <TouchableOpacity onPress={() => navigation.navigate("SettingsPage")}><Feather name="sliders" size={24} color="white" /></TouchableOpacity>
      </View>

      <View className="flex-1 items-center justify-center">
        <View className="items-center justify-center">
          <Svg width={size} height={size}>
            <Circle cx={center} cy={center} r={radius} stroke="#161b16" strokeWidth={strokeWidth} />
            <Circle cx={center} cy={center} r={radius} stroke={theme.primary} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" transform={`rotate(-90 ${center} ${center})`} fill="#0a0d0a" />
          </Svg>
          <View className="absolute items-center px-10">
            <Text className="text-7xl text-white font-light tracking-tighter">{formatTime(secondsLeft)}</Text>
            <Text className="text-[#5c635c] mt-2 font-bold uppercase tracking-[4px] text-xs">{mode === 'FOCUS' ? "HEDEF" : "DİNLEN"}</Text>
            <Text numberOfLines={2} className="text-white text-lg font-medium mt-1 text-center">{mode === 'FOCUS' ? goal : "Enerji toplama zamanı"}</Text>
          </View>
        </View>
      </View>

      <View className="w-full items-center mb-8">
        <View className="mb-10">
          <TouchableOpacity
            onPress={handleToggleTimer}
            activeOpacity={0.8}
            style={{ backgroundColor: theme.primary }}
            className={`w-24 h-24 rounded-[32px] items-center justify-center shadow-2xl ${theme.shadow}`}
          >
            <Feather name={isActive ? "pause" : "play"} size={40} color="#051405" />
          </TouchableOpacity>
        </View>

        <View className="flex-row items-center justify-center px-8 w-full">
          <TouchableOpacity
            onPress={() => { setSecondsLeft(totalSecondsForMode); setIsActive(false); setInterruptedCount(0); }}
            className="w-full h-16 rounded-2xl bg-[#161b16] items-center justify-center border border-white/5"
          >
            <View className="flex-row items-center">
              <Feather name="rotate-ccw" size={20} color="white" />
              <Text className="text-white font-bold ml-3 uppercase text-[10px] tracking-widest">Süreyi Sıfırla</Text>
            </View>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleFinishAndNavigate} className="mt-8">
          <Text style={{ color: mode === 'FOCUS' ? '#44f24a' : '#3b82f6' }} className="font-black text-[11px] uppercase tracking-[3px]">{mode === 'FOCUS' ? "Oturumu Tamamla" : "Molayı Atla"}</Text>
        </TouchableOpacity>
      </View>

      <View style={{ alignItems: 'center', backgroundColor: '#0a0d0a', paddingBottom: 2 }}>
        <BannerAd unitId={AD_UNIT_ID} size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER} requestOptions={{ requestNonPersonalizedAdsOnly: true }} />
      </View>

    </SafeAreaView>
  );
};