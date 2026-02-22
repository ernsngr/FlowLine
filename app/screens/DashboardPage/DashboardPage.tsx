import React, { useMemo, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, SafeAreaView } from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import { useApp } from "app/context/AppContext";
import { RewardedAd, TestIds, useRewardedAd, BannerAd, BannerAdSize, RewardedAdEventType, AdEventType } from "react-native-google-mobile-ads";

const adUnitId = __DEV__ ? TestIds.REWARDED : "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx";
const bannerAdUnitId = __DEV__ ? TestIds.BANNER : "ca-app-pub-xxxxxxxxxxxxxxxx/xxxxxxxxxx";

export const DashboardPage = () => {
  const navigation = useNavigation<any>();
  const { sessions, todaySessionsCount, todayTotalPoints, rewardedAd, rewardedAdLoaded } = useApp();

  useEffect(() => {
    if (!rewardedAd) return;

    const unsubscribeEarned = rewardedAd.addAdEventListener(
      RewardedAdEventType.EARNED_REWARD,
      () => {
        navigation.navigate("InsightsPage");
      }
    );

    const unsubscribeClosed = rewardedAd.addAdEventListener(
      AdEventType.CLOSED,
      () => {
        navigation.navigate("InsightsPage");
      }
    );

    return () => {
      unsubscribeEarned();
      unsubscribeClosed();
    };
  }, [rewardedAd, navigation]);

  const handleOpenReport = () => {
    if (rewardedAdLoaded && rewardedAd) {
      rewardedAd.show();
    } else {
      navigation.navigate("InsightsPage");
    }
  };

  // ✅ Bugünkü dakika
  const todayMinutes = useMemo(() => {
    const today = new Date().toDateString();

    return sessions
      .filter(
        (s) =>
          new Date(s.date).toDateString() === today &&
          (s.type === "pomo" || !s.type)
      )
      .reduce((acc, s) => acc + (s.duration || 0), 0);
  }, [sessions]);

  // ✅ Gerçek Bugünkü Verimlilik
  const todayEfficiency = useMemo(() => {
    const today = new Date().toDateString();

    const todaySessions = sessions.filter(
      (s) =>
        new Date(s.date).toDateString() === today &&
        (s.type === "pomo" || !s.type)
    );

    if (todaySessions.length === 0) return 0;

    const avgRating =
      todaySessions.reduce((acc, s) => acc + (s.rating || 0), 0) /
      todaySessions.length;

    const totalInterruption = todaySessions.reduce(
      (acc, s) => acc + (s.interruptedCount || 0),
      0
    );

    const avgInterruption =
      totalInterruption / todaySessions.length;

    const ratingScore = (avgRating / 5) * 100;
    const interruptionScore = Math.max(
      0,
      100 - avgInterruption * 15
    );

    return Math.round(ratingScore * 0.6 + interruptionScore * 0.4);
  }, [sessions]);

  return (
    <SafeAreaView className="flex-1 bg-[#050705] pt-10">
      <View className="h-16 flex-row items-center px-6 mt-4">
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          className="w-10 h-10 bg-[#111411] rounded-xl items-center justify-center border border-white/5"
        >
          <Feather name="chevron-left" size={24} color="white" />
        </TouchableOpacity>

        <View className="flex-1 items-center">
          <Text className="text-white font-black text-sm uppercase tracking-[4px]">
            PERFORMANS
          </Text>
        </View>

        <View className="w-10" />
      </View>

      <ScrollView
        className="flex-1 px-6"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 60 }}
      >
        {/* Günlük Performans */}
        <View className="bg-[#44f24a] rounded-[32px] p-8 mt-6 mb-8 shadow-2xl shadow-[#44f24a]/20">
          <View className="flex-row justify-between items-start mb-6">
            <View>
              <Text className="text-[#051405] font-black uppercase tracking-widest text-[11px]">
                Günlük Performans
              </Text>
              <Text className="text-[#051405]/50 font-bold text-[9px] uppercase">
                Gerçek Zamanlı Veri
              </Text>
            </View>
            <Feather name="zap" size={20} color="#051405" />
          </View>

          <View className="flex-row items-end justify-between">
            <View className="flex-1">
              <View className="flex-row items-baseline">
                <Text className="text-[#051405] text-6xl font-black">
                  {todayMinutes}
                </Text>
                <Text className="text-[#051405] font-black ml-1 text-sm uppercase">
                  Dk
                </Text>
              </View>
              <Text className="text-[#051405]/60 font-bold text-[10px] uppercase mt-1">
                Odaklanma Süresi
              </Text>
            </View>

            <View className="items-end">
              <Text className="text-[#051405] text-4xl font-black">
                {todaySessionsCount}
              </Text>
              <Text className="text-[#051405]/60 font-bold text-[10px] uppercase mt-1">
                Oturum
              </Text>
            </View>
          </View>
        </View>

        {/* İstatistik Kutuları */}
        <View className="flex-row justify-between mb-8">
          <View className="bg-[#111411] flex-1 mr-2 p-5 rounded-3xl border border-white/5">
            <Text className="text-[#5c635c] text-[8px] font-bold uppercase mb-1">
              Bugünkü Puan
            </Text>
            <Text className="text-[#44f24a] text-xl font-black">
              {todayTotalPoints}{" "}
              <Text className="text-[10px] opacity-40">puan</Text>
            </Text>
          </View>

          <View className="bg-[#111411] flex-1 ml-2 p-5 rounded-3xl border border-white/5">
            <Text className="text-[#5c635c] text-[8px] font-bold uppercase mb-1">
              Verimlilik
            </Text>
            <Text className="text-white text-xl font-black">
              %{todayEfficiency}
            </Text>
          </View>
        </View>

        {/* Premium Alan */}
        <View>
          <View className="flex-row justify-between items-end mb-4 ml-2">
            <Text className="text-white/30 font-black text-[10px] uppercase tracking-[2px]">
              DERİN PERFORMANS RAPORU
            </Text>
            <Feather name="lock" size={12} color="#44f24a" />
          </View>

          <View className="bg-[#111411] h-64 rounded-[32px] border border-white/5 overflow-hidden justify-center items-center">
            <View style={{ zIndex: 10, alignItems: "center", paddingHorizontal: 32 }}>
              <View className="w-12 h-12 bg-[#050705] rounded-2xl items-center justify-center mb-4 border border-[#44f24a]/20">
                <Feather name="bar-chart-2" size={20} color="#44f24a" />
              </View>

              <Text className="text-white font-black text-[16px] uppercase text-center mb-2">
                PREMIUM ANALİZ RAPORLARI
              </Text>

              <Text className="text-[#5c635c] text-[11px] text-center mb-4 leading-4">
                Aylık gelişim ve odak dağılımını görmek için kısa bir video izle.
              </Text>

              <TouchableOpacity
                onPress={handleOpenReport}
                disabled={!rewardedAdLoaded}
                className={`px-10 py-4 rounded-2xl flex-row items-center ${rewardedAdLoaded ? "bg-[#44f24a]" : "bg-gray-600"
                  }`}
              >
                <Feather
                  name={rewardedAdLoaded ? "play-circle" : "loader"}
                  size={14}
                  color="#051405"
                />
                <Text className="text-[#051405] font-black uppercase text-[11px] ml-2 tracking-widest">
                  {rewardedAdLoaded ? "Reklam İzle ve Aç" : "Yükleniyor..."}
                </Text>
              </TouchableOpacity>
            </View>

            <View
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                backgroundColor: "rgba(17,20,17,0.4)",
              }}
            />
          </View>
        </View>

        {/* SSS (FAQ) Bölümü */}
        <FAQSection />
      </ScrollView>

      {/* Banner Reklam */}
      <View className="items-center bg-[#050705] border-t border-white/5 py-2">
        <BannerAd
          unitId={bannerAdUnitId}
          size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
          requestOptions={{
            requestNonPersonalizedAdsOnly: true,
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const FAQ_DATA = [
  {
    question: "Puan sistemi nasıl çalışır?",
    answer: "FlowLine, sadece süreye değil, odak kalitenize ve sürekliliğinize odaklanır. Her başarılı oturum, kesintisiz çalışma ve mola disiplinine göre puan kazandırır.",
  },
  {
    question: "Performans verilerim gerçeği yansıtıyor mu?",
    answer: "Evet, verileriniz oturum sırasındaki uygulama içi etkileşimleriniz, kesinti sıklığınız ve oturum sonu öz değerlendirmelerinizle hesaplanan karmaşık bir algoritma ile oluşturulur.",
  },
  {
    question: "Verimlilik puanı neye göre belirlenir?",
    answer: "%60 oranında sizin verdiğiniz odak puanı, %40 oranında ise oturumdaki kesinti (interruption) sayısı baz alınır.",
  },
  {
    question: "Neden puan kaybediyorum?",
    answer: "Odak oturumunu vaktinden önce bitirmek veya çok sık ara vermek puan artış hızınızı yavaşlatabilir veya daha az puan kazanmanıza neden olabilir.",
  },
];

const FAQSection = () => {
  const [isExpanded, setIsExpanded] = React.useState(false);
  const [openIndexes, setOpenIndexes] = React.useState<number[]>([]);

  const toggleQuestion = (index: number) => {
    if (openIndexes.includes(index)) {
      setOpenIndexes(openIndexes.filter((i) => i !== index));
    } else {
      setOpenIndexes([...openIndexes, index]);
    }
  };

  return (
    <View className="mt-10">
      <TouchableOpacity
        onPress={() => setIsExpanded(!isExpanded)}
        className="flex-row justify-between items-center mb-4 ml-2"
        activeOpacity={0.7}
      >
        <Text className="text-white/30 font-black text-[10px] uppercase tracking-[2px]">
          MERAK EDİLENLER
        </Text>
        <Feather
          name={isExpanded ? "chevron-up" : "chevron-down"}
          size={14}
          color={isExpanded ? "#44f24a" : "rgba(255,255,255,0.3)"}
        />
      </TouchableOpacity>

      {isExpanded && (
        <View className="bg-[#111411] rounded-[32px] border border-white/5 overflow-hidden p-2">
          {FAQ_DATA.map((item, index) => {
            const isOpen = openIndexes.includes(index);
            return (
              <View key={index} className={`mb-1 ${index !== FAQ_DATA.length - 1 ? 'border-b border-white/5' : ''}`}>
                <TouchableOpacity
                  onPress={() => toggleQuestion(index)}
                  className="p-5 flex-row justify-between items-center"
                  activeOpacity={0.7}
                >
                  <Text className={`flex-1 font-bold text-[13px] ${isOpen ? 'text-[#44f24a]' : 'text-white/80'}`}>
                    {item.question}
                  </Text>
                  <Feather
                    name={isOpen ? "minus" : "plus"}
                    size={16}
                    color={isOpen ? "#44f24a" : "rgba(255,255,255,0.4)"}
                  />
                </TouchableOpacity>
                {isOpen && (
                  <View className="px-5 pb-5">
                    <Text className="text-[#5c635c] text-[12px] leading-5 font-medium">
                      {item.answer}
                    </Text>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      )}
    </View>
  );
};