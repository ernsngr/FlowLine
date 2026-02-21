import React, { useMemo } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView, Dimensions } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import { useApp } from "app/context/AppContext";

const { width } = Dimensions.get("window");

export const InsightsPage = () => {
  const navigation = useNavigation<any>();
  const { sessions = [] } = useApp();

  const analytics = useMemo(() => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    // 1. Filtreleme (Sadece Pomo'lar)
    const last30Days = sessions.filter(s => new Date(s.date) >= thirtyDaysAgo && s.type === 'pomo');

    // 2. Süre ve Puan Hesaplama
    const totalMins = last30Days.reduce((acc, s) => acc + (Number(s.duration) || 0), 0);
    const totalPoints = last30Days.reduce((acc, s) => acc + (Number(s.points) || 0), 0);

    // 3. Kesinti ve Verimlilik Analizi
    const totalInterruption = last30Days.reduce((acc, s) => acc + (Number(s.interruptedCount) || 0), 0);

    // GERÇEKÇİ VERİMLİLİK HESABI (Genel Ortalama)
    // Rating (%60 ağırlık) + Kesintisiz çalışma (%40 ağırlık)
    const avgRating = last30Days.length > 0
      ? last30Days.reduce((acc, s) => acc + (s.rating || 0), 0) / last30Days.length
      : 0;

    const avgInterruptionPerSession = last30Days.length > 0
      ? totalInterruption / last30Days.length
      : 0;

    const ratingScore = (avgRating / 5) * 100;
    const interruptionScore = Math.max(0, 100 - (avgInterruptionPerSession * 15)); // Her kesinti ortalamayı %15 düşürür

    const avgFocusScore = last30Days.length > 0
      ? Math.round((ratingScore * 0.6) + (interruptionScore * 0.4))
      : 0;

    // 4. Konu Dağılımı
    const tagMap: any = {};
    last30Days.forEach(s => {
      const goalName = s.goal || "Genel";
      tagMap[goalName] = (tagMap[goalName] || 0) + (s.duration || 0);
    });
    const topTags = Object.keys(tagMap)
      .map(name => ({ name, mins: tagMap[name], percent: totalMins > 0 ? Math.round((tagMap[name] / totalMins) * 100) : 0 }))
      .sort((a, b) => b.mins - a.mins).slice(0, 3);

    // 5. Zaman Profili
    let morningSessions = 0;
    let eveningSessions = 0;
    last30Days.forEach(s => {
      const hour = new Date(s.date).getHours();
      if (hour >= 5 && hour < 17) morningSessions++;
      else eveningSessions++;
    });
    const primeTime = morningSessions >= eveningSessions ? "Gündüz İnsanı" : "Gece Savaşçısı";

    // 6. Haftalık Grafik
    const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
    const weeklyData = Array.from({ length: 7 }).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      const dayMinutes = sessions
        .filter(s => new Date(s.date).toDateString() === d.toDateString() && s.type === 'pomo')
        .reduce((acc, s) => acc + (s.duration || 0), 0);
      return { dayName: days[d.getDay()], minutes: dayMinutes };
    });
    const maxMin = Math.max(...weeklyData.map(d => d.minutes), 1);

    return {
      totalHours: Math.floor(totalMins / 60),
      remainingMins: totalMins % 60,
      totalPoints,
      avgFocusScore,
      totalSessions: last30Days.length,
      topTags,
      primeTime,
      weeklyData,
      maxMin,
      totalInterruption
    };
  }, [sessions]);
  console.log("Tüm sessions:", sessions);

  return (
    <SafeAreaView className="flex-1 bg-[#050705] pt-10">
      <View className="h-16 flex-row items-center px-6 mt-2">
        <TouchableOpacity onPress={() => navigation.goBack()} className="w-10 h-10 bg-[#111411] rounded-xl items-center justify-center border border-white/5">
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>
        <Text className="flex-1 text-center text-white text-[14px] font-black tracking-[4px]">ANALİZ MERKEZİ</Text>
        <View className="w-10" />
      </View>

      <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>

        <View className="bg-[#111411] p-8 rounded-[40px] border border-white/5 mt-6 mb-6 items-center shadow-2xl">
          <View className="w-12 h-12 bg-[#44f24a]/10 rounded-full items-center justify-center mb-4">
            <Feather name="clock" size={24} color="#44f24a" />
          </View>
          <Text className="text-[#5c635c] font-bold text-[10px] uppercase tracking-widest mb-2">30 GÜNLÜK TOPLAM MESAİ</Text>
          <View className="flex-row items-baseline">
            <Text className="text-white text-6xl font-black">{analytics.totalHours}</Text>
            <Text className="text-[#44f24a] text-xl font-bold ml-1">sa</Text>
            <Text className="text-white text-6xl font-black ml-4">{analytics.remainingMins}</Text>
            <Text className="text-[#44f24a] text-xl font-bold ml-1">dk</Text>
          </View>
        </View>

        <View className="flex-row justify-between mb-8">
          <View className="items-center flex-1">
            <Text className="text-white text-xl font-black">{analytics.totalSessions}</Text>
            <Text className="text-[#5c635c] text-[9px] font-bold uppercase mt-1">Oturum</Text>
          </View>
          <View className="w-[1px] h-8 bg-white/10" />
          <View className="items-center flex-1">
            <Text className="text-[#44f24a] text-xl font-black">%{analytics.avgFocusScore}</Text>
            <Text className="text-[#5c635c] text-[9px] font-bold uppercase mt-1">Verimlilik</Text>
          </View>
          <View className="w-[1px] h-8 bg-white/10" />
          <View className="items-center flex-1">
            <Text className="text-white text-xl font-black">{analytics.totalPoints}</Text>
            <Text className="text-[#5c635c] text-[9px] font-bold uppercase mt-1">Toplam XP</Text>
          </View>
        </View>

        <View className="flex-row gap-4 mb-8">
          <View className="flex-1 bg-[#111411] p-5 rounded-[32px] border border-white/5">
            <Feather name="zap" size={18} color="#facc15" />
            <Text className="text-[#5c635c] text-[9px] font-bold uppercase mt-3 mb-1">PROFİL</Text>
            <Text className="text-white text-sm font-black">{analytics.primeTime}</Text>
          </View>
          <View className="flex-1 bg-[#111411] p-5 rounded-[32px] border border-white/5">
            <Feather name="alert-circle" size={18} color="#ef4444" />
            <Text className="text-[#5c635c] text-[9px] font-bold uppercase mt-3 mb-1">KESİNTİLER</Text>
            <Text className="text-white text-sm font-black">{analytics.totalInterruption} Kez Durdu</Text>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-white/40 font-black text-[10px] uppercase tracking-[2px] mb-4 ml-1">Haftalık Odak Trendi</Text>
          <View className="bg-[#111411] rounded-[32px] p-8 border border-white/5">
            <View className="flex-row justify-between items-end h-32 px-2">
              {analytics.weeklyData.map((data, i) => (
                <View key={i} className="items-center">
                  <View
                    style={{
                      height: `${(data.minutes / analytics.maxMin) * 85 + 10}%`,
                      width: 14,
                      backgroundColor: i === 6 ? '#44f24a' : '#222822',
                      borderRadius: 6,
                    }}
                  />
                  <Text className="text-[#5c635c] text-[8px] font-bold mt-3 uppercase">{data.dayName}</Text>
                </View>
              ))}
            </View>
          </View>
        </View>

        <View className="mb-8">
          <Text className="text-white/40 font-black text-[10px] uppercase tracking-[2px] mb-4 ml-1">Zamanını Nereye Harcadın?</Text>
          <View className="bg-[#111411] rounded-[32px] p-6 border border-white/5">
            {analytics.topTags.length > 0 ? analytics.topTags.map((tag, index) => (
              <View key={index} className="mb-5 last:mb-0">
                <View className="flex-row justify-between mb-2">
                  <Text className="text-white text-[12px] font-bold uppercase">{tag.name}</Text>
                  <Text className="text-[#44f24a] text-[12px] font-mono">%{tag.percent}</Text>
                </View>
                <View className="h-2 bg-black/40 rounded-full overflow-hidden">
                  <View style={{ width: `${tag.percent}%` }} className="h-full bg-[#44f24a]" />
                </View>
              </View>
            )) : (
              <Text className="text-white/20 text-center py-4 italic text-[11px]">Henüz veri girişi yapılmadı.</Text>
            )}
          </View>
        </View>

        <View className="bg-[#44f24a]/5 p-6 rounded-[32px] border border-[#44f24a]/10 items-center">
          <Text className="text-[#44f24a] font-black text-[10px] uppercase tracking-widest mb-1">Gelişim Notu</Text>
          <Text className="text-white/70 text-center text-[11px] leading-4">
            {analytics.totalSessions > 5
              ? "Son 30 günde harika bir istikrar yakaladın. Odak kaliteni artırmak için telefon bildirimlerini kapatmayı unutma!"
              : "Verilerini analiz edebilmemiz için biraz daha oturum tamamlaman gerekiyor. Bugün bir tane başlatmaya ne dersin?"}
          </Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};