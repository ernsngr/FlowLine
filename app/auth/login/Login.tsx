import React, { useState } from "react";
import { 
  View, 
  Text, 
  SafeAreaView, 
  TextInput, 
  TouchableOpacity, 
  KeyboardAvoidingView, 
  Platform,
  TouchableWithoutFeedback,
  Keyboard
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";

export const LoginPage = () => {
  const navigation = useNavigation<any>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleLogin = () => {
    // Şimdilik sadece yönlendirme yapıyoruz, Firebase bağlanınca burayı güncelleyeceğiz
    navigation.navigate("GoalSettingPage");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0d0a]">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          className="flex-1 px-8 justify-center"
        >
          {/* LOGO & BAŞLIK */}
          <View className="mb-12 items-center">
            <View className="w-20 h-20 bg-[#161b16] rounded-3xl items-center justify-center border border-[#44f24a]/20 mb-6">
              <Feather name="zap" size={40} color="#44f24a" />
            </View>
            <Text className="text-white text-3xl font-black tracking-tight">Welcome Back</Text>
            <Text className="text-[#5c635c] text-sm mt-2">Log in to track your deep work sessions.</Text>
          </View>

          {/* INPUT ALANLARI */}
          <View className="space-y-4">
            {/* Email Input */}
            <View 
              className={`flex-row items-center h-16 px-5 rounded-2xl bg-[#161b16] border ${
                focusedInput === "email" ? "border-[#44f24a]" : "border-white/5"
              }`}
            >
              <Feather name="mail" size={20} color={focusedInput === "email" ? "#44f24a" : "#5c635c"} />
              <TextInput
                placeholder="Email Address"
                placeholderTextColor="#3a3d3a"
                className="flex-1 ml-4 text-white font-medium"
                keyboardType="email-address"
                autoCapitalize="none"
                value={email}
                onChangeText={setEmail}
                onFocus={() => setFocusedInput("email")}
                onBlur={() => setFocusedInput(null)}
              />
            </View>

            {/* Password Input */}
            <View 
              className={`flex-row items-center h-16 px-5 rounded-2xl bg-[#161b16] border mt-4 ${
                focusedInput === "password" ? "border-[#44f24a]" : "border-white/5"
              }`}
            >
              <Feather name="lock" size={20} color={focusedInput === "password" ? "#44f24a" : "#5c635c"} />
              <TextInput
                placeholder="Password"
                placeholderTextColor="#3a3d3a"
                className="flex-1 ml-4 text-white font-medium"
                secureTextEntry={!isPasswordVisible}
                value={password}
                onChangeText={setPassword}
                onFocus={() => setFocusedInput("password")}
                onBlur={() => setFocusedInput(null)}
              />
              <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                <Feather 
                  name={isPasswordVisible ? "eye" : "eye-off"} 
                  size={20} 
                  color="#5c635c" 
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* ŞİFREMİ UNUTTUM */}
          <TouchableOpacity className="mt-4 self-end">
            <Text className="text-[#44f24a] text-xs font-bold">Forgot Password?</Text>
          </TouchableOpacity>

          {/* GİRİŞ BUTONU */}
          <TouchableOpacity 
            onPress={handleLogin}
            className="bg-[#44f24a] h-16 rounded-2xl items-center justify-center mt-10 shadow-xl shadow-green-500/20"
          >
            <Text className="text-[#051405] font-black uppercase tracking-widest text-base">Sign In</Text>
          </TouchableOpacity>

          {/* KAYIT OL YÖNLENDİRME */}
          <View className="flex-row justify-center mt-8">
            <Text className="text-[#5c635c] font-medium">Don't have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("RegisterPage")}>
              <Text className="text-white font-bold">Sign Up</Text>
            </TouchableOpacity>
          </View>

        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};