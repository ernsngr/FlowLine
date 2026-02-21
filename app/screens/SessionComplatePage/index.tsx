import React, { useState } from "react";
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView } from "react-native";
import { useNavigation, useRoute } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import { useApp } from "app/context/AppContext";

export const SessionComplatePage = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>(); 
  
  const { goal, saveSession, pomodoroTime } = useApp();

  // --- TIMER'DAN GELEN VERİLER ---
  const spentTime = route.params?.actualDuration !== undefined 
    ? route.params.actualDuration 
    : pomodoroTime;

  // Analiz merkezi için kritik parametreler
  const sessionType = route.params?.type || 'pomo'; 
  const interruptedCount = route.params?.interruptedCount || 0;

  // --- FORM STATE ---
  const [rating, setRating] = useState(3);
  const [selectedDistractions, setSelectedDistractions] = useState<string[]>([]);
  const [isSavingInProgress, setIsSavingInProgress] = useState(false);

  const distractions = [
    { id: 'phone', label: 'Telefon', icon: 'smartphone' },
    { id: 'noise', label: 'Gürültü', icon: 'volume-2' },
    { id: 'people', label: 'İnsanlar', icon: 'users' },
    { id: 'web', label: 'İnternet', icon: 'globe' },
  ];

  const toggleDistraction = (id: string) => {
    if (selectedDistractions.includes(id)) {
      setSelectedDistractions(prev => prev.filter(item => item !== id));
    } else {
      setSelectedDistractions(prev => [...prev, id]);
    }
  };

  // --- KAYIT FONKSİYONU ---
  const handleSave = async () => {
    if (isSavingInProgress) return;

    try {
      setIsSavingInProgress(true);

      // Veritabanına/Context'e gönderilen data paketi
      await saveSession({
        goal: goal,
        rating: rating,
        distractions: selectedDistractions,
        duration: Number(spentTime),
        type: sessionType, 
        interruptedCount: Number(interruptedCount), // Sayısal olduğundan emin oluyoruz
      });

      // Ana sayfaya dön ve stack'i temizle
      navigation.popToTop(); 
    } catch (error) {
      console.error("Kayıt hatası:", error);
      setIsSavingInProgress(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0d0a] pt-10">
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', paddingVertical: 40, paddingHorizontal: 32 }}>
        
        {/* ÜST KISIM - BAŞARI İKONU */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-[#44f24a]/10 rounded-full items-center justify-center mb-4">
            <View className="w-14 h-14 bg-[#44f24a] rounded-full items-center justify-center shadow-lg shadow-green-500/50">
              <Feather name="check" size={32} color="#051405" />
            </View>
          </View>
          <Text className="text-3xl text-white font-black text-center tracking-tighter">
            {sessionType === 'pomo' ? 'Oturum Tamamlandı!' : 'Mola Bitti!'}
          </Text>
          <Text className="text-[#44f24a] font-bold mt-2">+{spentTime} dakika eklendi</Text>
        </View>

        {/* ANA KART */}
        <View className="w-full bg-[#161b16] rounded-[40px] p-8 border border-white/5 shadow-2xl">
          
          <Text className="text-[#5c635c] font-bold uppercase tracking-widest text-[10px] mb-4 text-center">
            Odaklanma kaliten nasıldı?
          </Text>
          
          {/* RATING SİSTEMİ */}
          <View className="flex-row justify-between mb-10">
            {[1, 2, 3, 4, 5].map((star) => (
              <TouchableOpacity 
                key={star} 
                onPress={() => setRating(star)}
                className={`w-12 h-12 rounded-2xl items-center justify-center border ${
                  rating >= star ? 'bg-[#44f24a] border-[#44f24a]' : 'bg-[#0a0d0a] border-white/5'
                }`}
              >
                <Feather 
                  name="zap" 
                  size={20} 
                  color={rating >= star ? "#051405" : "#2a2d2a"} 
                />
              </TouchableOpacity>
            ))}
          </View>

          {/* DİKKAT DAĞITICILAR (SADECE ODAK MODUNDA) */}
          {sessionType === 'pomo' && (
            <>
              <Text className="text-[#5c635c] font-bold uppercase tracking-widest text-[10px] mb-4 text-center">
                Dikkatini bir şey dağıttı mı?
              </Text>
              <View className="flex-row flex-wrap justify-between mb-8">
                {distractions.map((item) => {
                  const isSelected = selectedDistractions.includes(item.id);
                  return (
                    <TouchableOpacity 
                      key={item.id}
                      onPress={() => toggleDistraction(item.id)}
                      className={`flex-row items-center w-[48%] h-12 px-4 rounded-2xl mb-3 border ${
                        isSelected ? 'bg-[#44f24a]/10 border-[#44f24a]' : 'bg-[#0a0d0a] border-white/5'
                      }`}
                    >
                      <Feather name={item.icon as any} size={14} color={isSelected ? "#44f24a" : "#5c635c"} />
                      <Text className={`text-[11px] font-bold ml-2 ${isSelected ? 'text-[#44f24a]' : 'text-[#5c635c]'}`}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </>
          )}

          {/* ÖZET İSTATİSTİKLER */}
          <View className="pt-6 border-t border-white/5 gap-y-4">
            <View className="flex-row items-center justify-between">
              <Text className="text-[#5c635c] text-[10px] uppercase font-black">Hedeflenen</Text>
              <Text className="text-white text-xs font-bold" numberOfLines={1}>{goal}</Text>
            </View>
            
            {/* Analiz Merkezi için kritik veri: Kaç kez bölündü? */}
            <View className="flex-row items-center justify-between">
              <Text className="text-[#5c635c] text-[10px] uppercase font-black">Duraklatma</Text>
              <Text className={`${interruptedCount > 0 ? 'text-red-400' : 'text-[#44f24a]'} text-xs font-bold`}>
                {interruptedCount > 0 ? `${interruptedCount} kez bölündü` : 'Hiç bölünmedi'}
              </Text>
            </View>

            <View className="flex-row items-center justify-between">
              <Text className="text-[#5c635c] text-[10px] uppercase font-black">Gerçekleşen</Text>
              <Text className="text-[#44f24a] text-xs font-black">{spentTime} dk</Text>
            </View>
          </View>
        </View>

        {/* KAYDET BUTONU */}
        <View className="w-full mt-10">
          <TouchableOpacity 
            onPress={handleSave} 
            activeOpacity={0.8}
            disabled={isSavingInProgress}
            className={`w-full h-16 rounded-3xl items-center justify-center shadow-xl ${
              isSavingInProgress ? 'bg-white/10' : 'bg-[#44f24a] shadow-green-500/20'
            }`}
          >
            <Text className={`text-base font-black uppercase tracking-widest ${isSavingInProgress ? 'text-[#5c635c]' : 'text-[#051405]'}`}>
              {isSavingInProgress ? "Kaydediliyor..." : "Verileri İşle ve Bitir"}
            </Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
};