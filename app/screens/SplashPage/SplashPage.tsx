import React, { useEffect } from "react";
import { View, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, CommonActions } from "@react-navigation/native";
import { useApp } from "app/context/AppContext";

const { width, height } = Dimensions.get("window");

export const SplashPage = () => {
    const navigation = useNavigation<any>();
    const { isFirstLaunch, loadRewardedAd, rewardedAdLoaded } = useApp();
    const [timerDone, setTimerDone] = React.useState(false);

    useEffect(() => {
        // 1. Reklam Ön Yükleme (Background loading)
        loadRewardedAd();

        // 2. Minimum 3 Saniye Bekleme Sayacı
        const timer = setTimeout(() => {
            setTimerDone(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, [loadRewardedAd]);

    useEffect(() => {
        // 3. Yönlendirme Şartı: 
        // Veri yüklenmiş olmalı (isFirstLaunch !== null)
        // VE Minimum 3 saniye geçmiş olmalı (timerDone)
        // VE Reklamlar inmiş olmalı (rewardedAdLoaded)
        if (isFirstLaunch !== null && timerDone && rewardedAdLoaded) {
            const targetRoute = isFirstLaunch ? "OnboardingPage" : "GoalSettings";
            navigation.dispatch(
                CommonActions.reset({
                    index: 0,
                    routes: [{ name: targetRoute }],
                })
            );
        }
    }, [isFirstLaunch, timerDone, rewardedAdLoaded, navigation]);

    return (
        <SafeAreaView className="flex-1 bg-[#050705]">
            <View className="flex-1 items-center justify-center">
                <Image
                    source={require("app/assets/splashscreen.png")}
                    style={{
                        width: width,
                        height: height,
                    }}
                    resizeMode="contain"
                />
            </View>
        </SafeAreaView>
    );
};
