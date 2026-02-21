import React, { useRef } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, Switch } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import { useApp } from "app/context/AppContext";

export const SettingsPage = () => {
  const navigation = useNavigation<any>();
  const { 
    pomodoroTime, setPomodoroTime,
    shortBreak, setShortBreak,
    autoStartBreaks, setAutoStartBreaks,
    autoStartTimer, setAutoStartTimer,
    soundEnabled, setSoundEnabled,
    saveSettings 
  } = useApp();

  const handleDone = async () => {
    await saveSettings();
    navigation.goBack();
  };

  const adjustTime = (type: 'pomo' | 'break', delta: number) => {
    if (type === 'pomo') {
      const nextValue = Number(pomodoroTime) + delta;
      // Sadece sınırlar dahilindeyse güncelleme yapıyoruz, alert yok
      if (nextValue >= 1 && nextValue <= 120) {
        setPomodoroTime(nextValue);
      }
    } else {
      const nextValue = Number(shortBreak) + delta;
      if (nextValue >= 5 && nextValue <= 60) {
        setShortBreak(nextValue);
      }
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0d0a] pt-10">
      
      {/* HEADER */}
      <View className="w-full flex-row justify-between px-8 items-center py-6 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} activeOpacity={0.7}>
            <Feather name="chevron-left" size={28} color="white" />
        </TouchableOpacity>
        <Text className="text-white text-xl font-black uppercase tracking-widest">Ayarlar</Text>
        <TouchableOpacity onPress={handleDone} activeOpacity={0.7}>
            <Text className="text-[#44f24a] text-lg font-black uppercase">Tamam</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
        <View className="mt-4">
          <View className="flex-row items-center mb-6 ml-2">
            <View className="w-1 h-6 bg-[#44f24a] rounded-full mr-3" />
            <Text className="text-white font-black text-lg uppercase tracking-widest">Süreler</Text>
          </View>

          <View className="bg-[#161b16] rounded-[32px] p-6 border border-white/5">
            {/* Focus Interval */}
            <View className="flex-row items-center justify-between py-4 border-b border-white/5">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-2xl bg-[#44f24a]/10 items-center justify-center border border-[#44f24a]/20">
                  <Feather name="target" size={20} color="#44f24a" />
                </View>
                <View className="ml-4">
                  <Text className="text-white font-bold text-lg">Odaklanma</Text>
                  <Text className="text-[#5c635c] text-xs font-bold uppercase tracking-tighter">Süre (Dakika)</Text>
                </View>
              </View>
              <View className="flex-row items-center bg-[#0a0d0a] rounded-2xl p-1 border border-white/5">
                <TouchableOpacity 
                  onPress={() => adjustTime('pomo', -5)} 
                  activeOpacity={1} 
                  className="w-10 h-10 items-center justify-center"
                >
                    <Feather name="minus" size={18} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-black text-lg mx-2 w-10 text-center">{pomodoroTime}</Text>
                <TouchableOpacity 
                  onPress={() => adjustTime('pomo', 5)} 
                  activeOpacity={1}
                  className="w-10 h-10 items-center justify-center"
                >
                    <Feather name="plus" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>

            {/* Break Interval */}
            <View className="flex-row items-center justify-between py-4">
              <View className="flex-row items-center">
                <View className="w-12 h-12 rounded-2xl bg-[#3b82f6]/10 items-center justify-center border border-[#3b82f6]/20">
                  <Feather name="coffee" size={20} color="#3b82f6" />
                </View>
                <View className="ml-4">
                  <Text className="text-white font-bold text-lg">Mola</Text>
                  <Text className="text-[#5c635c] text-xs font-bold uppercase tracking-tighter">Süre (Dakika)</Text>
                </View>
              </View>
              <View className="flex-row items-center bg-[#0a0d0a] rounded-2xl p-1 border border-white/5">
                <TouchableOpacity 
                  onPress={() => adjustTime('break', -5)} 
                  activeOpacity={1} 
                  className="w-10 h-10 items-center justify-center"
                >
                    <Feather name="minus" size={18} color="white" />
                </TouchableOpacity>
                <Text className="text-white font-black text-lg mx-2 w-10 text-center">{shortBreak}</Text>
                <TouchableOpacity 
                  onPress={() => adjustTime('break', 5)} 
                  activeOpacity={1}
                  className="w-10 h-10 items-center justify-center"
                >
                    <Feather name="plus" size={18} color="white" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>

        {/* Preferences Section */}
        <View className="mt-10 mb-10">
          <View className="flex-row items-center mb-6 ml-2">
            <View className="w-1 h-6 bg-[#44f24a] rounded-full mr-3" />
            <Text className="text-white font-black text-lg uppercase tracking-widest">Tercihler</Text>
          </View>

          <View className="bg-[#161b16] rounded-[32px] p-6 border border-white/5">
            <View className="flex-row items-center justify-between py-4 border-b border-white/5">
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-lg">Otomatik Başlat</Text>
                <Text className="text-[#5c635c] text-xs mt-1 font-medium">Odaklanma süresi hemen başlar</Text>
              </View>
              <Switch value={autoStartTimer} onValueChange={setAutoStartTimer} trackColor={{ false: "#0a0d0a", true: "#44f24a" }} thumbColor={"#fff"} />
            </View>

            <View className="flex-row items-center justify-between py-4 border-b border-white/5">
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-lg">Molayı Başlat</Text>
                <Text className="text-[#5c635c] text-xs mt-1 font-medium">Molaya otomatik geçiş yapar</Text>
              </View>
              <Switch value={autoStartBreaks} onValueChange={setAutoStartBreaks} trackColor={{ false: "#0a0d0a", true: "#44f24a" }} thumbColor={"#fff"} />
            </View>

            <View className="flex-row items-center justify-between py-4">
              <View className="flex-1 pr-4">
                <Text className="text-white font-bold text-lg">Ses Efektleri</Text>
                <Text className="text-[#5c635c] text-xs mt-1 font-medium">Süre bitiminde uyarı sesi çal</Text>
              </View>
              <Switch value={soundEnabled} onValueChange={setSoundEnabled} trackColor={{ false: "#0a0d0a", true: "#44f24a" }} thumbColor={"#fff"} />
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};