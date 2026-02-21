import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../App'; 
import Feather from '@expo/vector-icons/Feather';
import { useApp } from "app/context/AppContext";

export const GoalSettingPage = () => {
const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();
    const { setGoal } = useApp();

    const [customGoal, setCustomGoal] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);

    useEffect(() => {
        if (selectedTags.length > 0) {
            setCustomGoal(selectedTags.join(", "));
        } else {
            setCustomGoal("");
        }
    }, [selectedTags]);

    const handleStart = () => {
        const finalGoal = customGoal.trim() || "Odaklanma Oturumu";
        setGoal(finalGoal); 
        navigation.navigate("TimerPage");
    };

    const tags = [
        { id: 1, name: "Kodlama", icon: "code" },
        { id: 2, name: "Ders Çalışma", icon: "book" },
        { id: 3, name: "Tasarım", icon: "layers" },
        { id: 4, name: "Yazı Yazma", icon: "edit-3" },
        { id: 5, name: "Okuma", icon: "book-open" },
        { id: 6, name: "Araştırma", icon: "search" },
        { id: 7, name: "Planlama", icon: "calendar" },
        { id: 8, name: "Toplantı", icon: "users" },
        { id: 9, name: "E-posta", icon: "mail" },
        { id: 10, name: "Proje", icon: "briefcase" },
        { id: 11, name: "Yönetim", icon: "settings" },
        { id: 12, name: "Öğrenme", icon: "award" },
    ];

    const handleTagPress = (tagName: string) => {
        if (selectedTags.includes(tagName)) {
            setSelectedTags(selectedTags.filter(t => t !== tagName));
        } else {
            if (selectedTags.length < 3) {
                setSelectedTags([...selectedTags, tagName]);
            }
        }
    };

    return (
        <View className="flex-1 bg-[#0a0d0a] items-center pt-32 px-6">
            
            {/* SOL ÜST DASHBOARD BUTONU */}
            <TouchableOpacity 
                onPress={() => navigation.navigate("DashboardPage")}
                activeOpacity={0.7}
                style={{ position: 'absolute', top: 60, left: 24 }}
                className="w-12 h-12 bg-[#161b16] rounded-2xl items-center justify-center border border-white/5"
            >
                <Feather name="grid" size={20} color="white" />
            </TouchableOpacity>

            {/* SAĞ ÜST AYARLAR BUTONU */}
            <TouchableOpacity 
                onPress={() => navigation.navigate("SettingsPage")}
                activeOpacity={0.7}
                style={{ position: 'absolute', top: 60, right: 24 }}
                className="w-12 h-12 bg-[#161b16] rounded-2xl items-center justify-center border border-white/5"
            >
                <Feather name="settings" size={20} color="white" />
            </TouchableOpacity>

            {/* BAŞLIK ALANI */}
            <View className="w-full justify-center mb-6 mt-4">
                <Text className="text-5xl text-white font-bold tracking-tight">Neye</Text>
                <Text className="text-5xl text-[#44f24a] font-bold tracking-tight">odaklanıyorsun?</Text>
            </View>

            {/* INPUT ALANI */}
            <View className="w-full items-center justify-center mb-10">
                <TextInput
                    editable
                    placeholder="Örn. Mobil Uygulama Projesi"
                    placeholderTextColor="#3a3d3a"
                    value={customGoal}
                    onChangeText={(text) => setCustomGoal(text)}
                    className="w-full h-14 text-2xl pl-1 color-white border-b-2 border-[#44f24a]/50"
                />
            </View>

            {/* ETİKETLER ALANI */}
            <View className="w-full">
                <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-[12px] color-[#5c635c] font-bold uppercase tracking-[2px]">
                        Etiket Seç (İsteğe Bağlı)
                    </Text>
                    <Text className="text-[12px] color-[#44f24a] font-bold uppercase">
                        {selectedTags.length}/3
                    </Text>
                </View>

                <View className="flex-row flex-wrap justify-start mt-2">
                    {tags.map((tag) => {
                        const isActive = selectedTags.includes(tag.name);
                        return (
                            <TouchableOpacity
                                key={tag.id}
                                onPress={() => handleTagPress(tag.name)}
                                activeOpacity={0.8}
                                className={`flex-row h-12 items-center px-5 m-1.5 rounded-full border ${
                                    isActive 
                                    ? "bg-[#44f24a]/10 border-[#44f24a]" 
                                    : "bg-[#161b16] border-transparent"
                                }`}
                            >
                                <Feather 
                                    name={tag.icon as any} 
                                    size={16} 
                                    color={isActive ? "#44f24a" : "#5c635c"} 
                                />
                                <Text className={`text-base ml-2 font-medium ${
                                    isActive ? "text-[#44f24a]" : "text-[#5c635c]"
                                }`}>
                                    {tag.name}
                                </Text>
                            </TouchableOpacity>
                        );
                    })}
                </View>
            </View>

            {/* BAŞLAT BUTONU */}
            <TouchableOpacity 
                onPress={handleStart}
                activeOpacity={0.8}
                className="w-full h-16 bg-[#44f24a] rounded-3xl items-center justify-center absolute bottom-12 shadow-2xl shadow-green-500/40"
            >
                <Text className="text-xl font-extrabold text-[#051405]">
                    Odaklanmayı Başlat
                </Text>
            </TouchableOpacity>
        </View>
    );
}