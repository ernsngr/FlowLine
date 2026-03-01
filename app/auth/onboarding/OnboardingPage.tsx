import React, { useState, useRef } from "react";
import {
  View,
  Text,
  FlatList,
  Dimensions,
  TouchableOpacity,
  Animated
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import { useApp } from "app/context/AppContext"; // Context'i ekledik

const { width } = Dimensions.get("window");

const SLIDES = [
  {
    id: "1",
    title: "Gürültüyü Sustur",
    description: "Dikkat dağıtıcılarla dolu bir dünyada, odaklanmak senin süper gücündür. Zamanını geri almana yardım ediyoruz.",
    icon: "wind",
    color: "#44f24a"
  },
  {
    id: "2",
    title: "Derin Çalışma",
    description: "Bilimsel olarak kanıtlanmış Pomodoro tekniğini, hedef odaklı takip sistemiyle birleştiriyoruz.",
    icon: "layers",
    color: "#44f24a"
  },
  {
    id: "3",
    title: "Gelişimini İzle",
    description: "Detaylı analizlerle ilerlemeni görselleştir ve her gün motivasyonunu en üst seviyede tut.",
    icon: "trending-up",
    color: "#44f24a"
  }
];

export const OnboardingPage = () => {
  const navigation = useNavigation<any>();
  const { completeOnboarding } = useApp(); // Fonksiyonu çektik
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<any>(null);

  const viewableItemsChanged = useRef(({ viewableItems }: any) => {
    if (viewableItems && viewableItems.length > 0) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const handleFinish = async () => {
    // Bu fonksiyon çağrıldığında AppContext'teki isFirstLaunch false olur
    // ve App.tsx otomatik olarak seni bir sonraki gruba taşır.
    await completeOnboarding();
  };

  const scrollToNext = () => {
    if (currentIndex < SLIDES.length - 1) {
      slidesRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      handleFinish(); // Son slaytta bitir
    }
  };

  const renderItem = ({ item }: any) => (
    <View style={{ width }} className="items-center justify-center px-10">
      <View className="w-64 h-64 bg-[#161b16] rounded-[60px] items-center justify-center mb-12 border border-[#44f24a]/10">
        <Feather name={item.icon} size={100} color="#44f24a" />
      </View>
      <Text className="text-white text-4xl font-black text-center mb-4 tracking-tighter">
        {item.title}
      </Text>
      <Text className="text-[#5c635c] text-center text-lg leading-6 font-medium">
        {item.description}
      </Text>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-[#0a0d0a]">
      {/* Üst Kısım: Atla Butonu */}
      <View className="h-10 px-6 flex-row justify-end mt-3">
        <TouchableOpacity onPress={handleFinish}>
          <Text className="text-[#5c635c] font-bold uppercase tracking-widest text-lg">Atla</Text>
        </TouchableOpacity>
      </View>

      {/* Kaydırılabilir İçerik */}
      <FlatList
        data={SLIDES}
        renderItem={renderItem}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        keyExtractor={(item) => item.id}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        ref={slidesRef}
      />

      {/* Alt Kısım: Sayfa Belirteci ve Buton */}
      <View className="pb-12 px-10">
        {/* Pagination Dots */}
        <View className="flex-row justify-center mb-10">
          {SLIDES.map((_, i) => {
            const inputRange = [(i - 1) * width, i * width, (i + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [10, 30, 10],
              extrapolate: "clamp",
            });
            const opacity = scrollX.interpolate({
              inputRange,
              outputRange: [0.2, 1, 0.2],
              extrapolate: "clamp",
            });
            return (
              <Animated.View
                key={i}
                style={{ width: dotWidth, opacity }}
                className="h-2 bg-[#44f24a] rounded-full mx-1"
              />
            );
          })}
        </View>

        {/* İleri / Başla Butonu */}
        <TouchableOpacity
          onPress={scrollToNext}
          className="bg-[#44f24a] h-16 rounded-[24px] items-center justify-center shadow-xl shadow-green-500/20"
        >
          <Text className="text-[#051405] font-black uppercase tracking-widest text-base">
            {currentIndex === SLIDES.length - 1 ? "Hemen Başla" : "İleri"}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};