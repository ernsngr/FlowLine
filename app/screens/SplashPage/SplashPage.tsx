import React, { useEffect, useRef, useState } from "react";
import { View, Text, Animated, SafeAreaView, Easing, Dimensions } from "react-native";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useApp } from "app/context/AppContext";

const { width } = Dimensions.get("window");

export const SplashPage = () => {
    const navigation = useNavigation<any>();
    const { isFirstLaunch, loadRewardedAd } = useApp();
    const opacity = useRef(new Animated.Value(0.5)).current;
    const progress = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        // 1. Yazı Pulsing Animasyonu
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, {
                    toValue: 1,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
                Animated.timing(opacity, {
                    toValue: 0.5,
                    duration: 800,
                    useNativeDriver: true,
                    easing: Easing.inOut(Easing.ease),
                }),
            ])
        ).start();

        // 2. Yükleme Çubuğu Animasyonu (Görsel algı için)
        Animated.timing(progress, {
            toValue: 1,
            duration: 4000,
            useNativeDriver: false, // Genişlik animasyonunda false olmalı
            easing: Easing.out(Easing.exp),
        }).start();

        // 3. Reklam Ön Yükleme Tetikleme
        loadRewardedAd();

        // 4. Yönlendirme
        const timer = setTimeout(() => {
            if (isFirstLaunch !== null) {
                const targetRoute = isFirstLaunch ? "OnboardingPage" : "GoalSettings";
                navigation.dispatch(
                    CommonActions.reset({
                        index: 0,
                        routes: [{ name: targetRoute }],
                    })
                );
            }
        }, 4500);

        return () => clearTimeout(timer);
    }, [isFirstLaunch, navigation, loadRewardedAd]);

    const progressBarWidth = progress.interpolate({
        inputRange: [0, 1],
        outputRange: ["0%", "100%"],
    });

    return (
        <SafeAreaView className="flex-1 bg-[#050705] items-center justify-center">
            <View className="items-center w-full px-12">
                {/* Parlak Neon Logo */}
                <Animated.View style={{ opacity }} className="mb-12">
                    <Text
                        style={{
                            fontFamily: "System",
                            textShadowColor: "rgba(68, 242, 74, 0.8)",
                            textShadowOffset: { width: 0, height: 0 },
                            textShadowRadius: 20
                        }}
                        className="text-[#44f24a] text-5xl font-black italic uppercase tracking-[10px] text-center"
                    >
                        FLOW LINE
                    </Text>
                </Animated.View>

                {/* Yükleme Çubuğu Container */}
                <View className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                    <Animated.View
                        style={{
                            width: progressBarWidth,
                            backgroundColor: "#44f24a",
                            shadowColor: "#44f24a",
                            shadowOffset: { width: 0, height: 0 },
                            shadowOpacity: 1,
                            shadowRadius: 10,
                            elevation: 5
                        }}
                        className="h-full"
                    />
                </View>

                <Text className="text-[#44f24a]/40 text-[10px] uppercase font-bold tracking-widest mt-4">
                    Hazırlanıyor...
                </Text>
            </View>
        </SafeAreaView>
    );
};
