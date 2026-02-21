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
  Keyboard,
  ScrollView
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Feather from "@expo/vector-icons/Feather";

export const RegisterPage = () => {
  const navigation = useNavigation<any>();
  
  // Form State'leri
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleRegister = () => {
    // Firebase bağlandığında gerçek kayıt buraya gelecek
    // Şimdilik ana ekrana uçuyoruz
    navigation.navigate("GoalSettingPage");
  };

  return (
    <SafeAreaView className="flex-1 bg-[#0a0d0a]">
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === "ios" ? "padding" : "height"} 
          className="flex-1"
        >
          <ScrollView 
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', paddingHorizontal: 32 }}
          >
            {/* BAŞLIK KISMI */}
            <View className="mb-10">
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                className="w-10 h-10 bg-[#161b16] rounded-full items-center justify-center border border-white/5 mb-8"
              >
                <Feather name="arrow-left" size={20} color="white" />
              </TouchableOpacity>
              
              <Text className="text-white text-4xl font-black tracking-tighter">Join the</Text>
              <Text className="text-[#44f24a] text-4xl font-black tracking-tighter">Deep Work.</Text>
              <Text className="text-[#5c635c] text-sm mt-3 leading-5">
                Create an account to sync your focus sessions and unlock detailed analytics.
              </Text>
            </View>

            {/* INPUT ALANLARI */}
            <View className="space-y-4">
              {/* Full Name */}
              <View 
                className={`flex-row items-center h-16 px-5 rounded-2xl bg-[#161b16] border ${
                  focusedInput === "name" ? "border-[#44f24a]" : "border-white/5"
                }`}
              >
                <Feather name="user" size={20} color={focusedInput === "name" ? "#44f24a" : "#5c635c"} />
                <TextInput
                  placeholder="Full Name"
                  placeholderTextColor="#3a3d3a"
                  className="flex-1 ml-4 text-white font-medium"
                  value={name}
                  onChangeText={setName}
                  onFocus={() => setFocusedInput("name")}
                  onBlur={() => setFocusedInput(null)}
                />
              </View>

              {/* Email */}
              <View 
                className={`flex-row items-center h-16 px-5 rounded-2xl bg-[#161b16] border mt-4 ${
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

              {/* Password */}
              <View 
                className={`flex-row items-center h-16 px-5 rounded-2xl bg-[#161b16] border mt-4 ${
                  focusedInput === "password" ? "border-[#44f24a]" : "border-white/5"
                }`}
              >
                <Feather name="lock" size={20} color={focusedInput === "password" ? "#44f24a" : "#5c635c"} />
                <TextInput
                  placeholder="Create Password"
                  placeholderTextColor="#3a3d3a"
                  className="flex-1 ml-4 text-white font-medium"
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  onFocus={() => setFocusedInput("password")}
                  onBlur={() => setFocusedInput(null)}
                />
                <TouchableOpacity onPress={() => setIsPasswordVisible(!isPasswordVisible)}>
                  <Feather name={isPasswordVisible ? "eye" : "eye-off"} size={20} color="#5c635c" />
                </TouchableOpacity>
              </View>
            </View>

            {/* ŞARTLAR BİLGİSİ */}
            <Text className="text-[#3a3d3a] text-[10px] mt-6 text-center px-4">
              By signing up, you agree to our <Text className="text-[#5c635c] underline">Terms of Service</Text> and <Text className="text-[#5c635c] underline">Privacy Policy</Text>.
            </Text>

            {/* KAYIT BUTONU */}
            <TouchableOpacity 
              onPress={handleRegister}
              className="bg-[#44f24a] h-16 rounded-2xl items-center justify-center mt-8 shadow-xl shadow-green-500/20"
            >
              <Text className="text-[#051405] font-black uppercase tracking-widest text-base">Create Account</Text>
            </TouchableOpacity>

            {/* GİRİŞE DÖNÜŞ */}
            <View className="flex-row justify-center mt-8 mb-10">
              <Text className="text-[#5c635c] font-medium">Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate("LoginPage")}>
                <Text className="text-white font-bold">Log In</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </TouchableWithoutFeedback>
    </SafeAreaView>
  );
};