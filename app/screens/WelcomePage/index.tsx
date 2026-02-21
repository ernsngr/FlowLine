import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useApp } from "app/context/AppContext";

export const WelcomePage = () => {
    // Context'ten onboarding tamamlama fonksiyonunu çekiyoruz
    const { completeOnboarding } = useApp();

    const handleStart = () => {
        // 1. AsyncStorage'a "artık bu kullanıcıyı tanıyoruz" bilgisini kaydeder.
        // 2. App.tsx'teki state'i değiştirerek navigasyonu yeniler.
        completeOnboarding(); 
    };

    return (
        <View className="flex-1 bg-[#0a0d0a] items-center justify-center">
            
            {/* MERKEZDEKİ PARLAYAN DAİRE TASARIMI */}
            <View className="items-center justify-center">
                
                {/* Dış Işık (Glow) Katmanı */}
                <View className="w-[200px] h-[200px] rounded-full bg-green-500/10 items-center justify-center">
                    
                    {/* Orta Katman (Kenarlık Efekti) */}
                    <View className="w-[160px] h-[160px] rounded-full bg-green-900/20 border border-green-500/20 items-center justify-center">
                        
                        {/* En İçteki Ana Daire */}
                        <View className="w-[120px] h-[120px] rounded-full bg-[#121c12] border-[0.5px] border-green-400/40 shadow-inner">
                            {/* Sade ve derinlikli merkez */}
                        </View>

                    </View>
                </View>
                
                {/* METİN ALANI */}
                <Text className="text-6xl text-white mt-12 font-bold tracking-tight">
                    Odak
                </Text>
                
                <Text className="text-xl text-[#5c635c] mt-4 text-center px-12 leading-7">
                    Daha çok değil,{"\n"}odaklı çalış.
                </Text>
            </View>

            {/* ALT BUTON */}
            <TouchableOpacity 
                onPress={handleStart}
                activeOpacity={0.8}
                className="w-[90%] h-14 bg-[#44f24a] rounded-2xl items-center justify-center absolute bottom-16 shadow-xl shadow-green-500/40"
            >
                <Text className="text-xl font-bold text-[#051405]">
                    Başla
                </Text>
            </TouchableOpacity>
        </View>
    );
};