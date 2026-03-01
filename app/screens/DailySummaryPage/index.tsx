import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";
import { useApp } from "app/context/AppContext"; // Context'i bağladık

export const DailySummaryPage = () => {
  const navigation = useNavigation<any>();

  // Context'ten bugün tamamlanan seans sayısını ve toplam puanı çekiyoruz
  const { todaySessionsCount, todayTotalPoints } = useApp();

  return (
    <SafeAreaView className="flex-1 bg-[#0a0d0a] items-center justify-between">

      {/* ÜST BAR */}
      <View className="w-full flex-row justify-between px-8 items-center">
        <TouchableOpacity onPress={() => navigation.popToTop()}>
          <Feather name="x" size={28} color="white" />
        </TouchableOpacity>

        <Text className="text-white text-lg font-bold">Daily Summary</Text>

        <View className="w-7" />
      </View>

      <View className="items-center w-full">
        {/* MERKEZİ ONAY İKONU */}
        <View className="w-36 h-36 rounded-full bg-[#121c12] items-center justify-center border border-green-500/20 shadow-2xl shadow-green-500/40">
          <View className="w-16 h-16 rounded-full bg-[#44f24a] items-center justify-center">
            <Feather name="check" size={32} color="#051405" />
          </View>
        </View>

        {/* ÖZET METNİ - DİNAMİK */}
        <View className="mt-12 px-10">
          <Text className="text-4xl text-white font-bold text-center leading-[48px]">
            You completed{" "}
            <Text className="text-[#44f24a]">{todaySessionsCount}</Text>
            {"\n"}focus sessions today.
          </Text>
        </View>

        {/* TOPLAM PUAN ETİKETİ (GÜNCELLENDİ) */}
        <View className="mt-8 bg-[#161b16] px-6 py-4 rounded-3xl flex-row items-center border border-green-500/10 shadow-sm">
          <View className="bg-[#44f24a]/20 p-2 rounded-full">
            <Feather name="zap" size={20} color="#44f24a" />
          </View>
          <View className="ml-4">
            <Text className="text-[#5c635c] font-bold text-xs uppercase tracking-widest">
              Daily Score
            </Text>
            <Text className="text-white font-bold text-xl">
              {todayTotalPoints} <Text className="text-sm text-[#5c635c]">Points</Text>
            </Text>
          </View>
        </View>
      </View>

      {/* ALT AKSİYONLAR */}
      <View className="w-full px-8 items-center">
        <TouchableOpacity
          onPress={() => navigation.navigate("GoalSettings")}
          activeOpacity={0.8}
          className="w-full h-16 bg-[#44f24a] rounded-2xl flex-row items-center justify-center shadow-xl shadow-green-500/30"
        >
          <Feather name="clock" size={22} color="#051405" />
          <Text className="text-[#051405] text-xl font-bold ml-3">
            Start another session
          </Text>
        </TouchableOpacity>
      </View>

    </SafeAreaView>
  );
};