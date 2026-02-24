import {
  Image,
  SafeAreaView,
  Text,
  View,
  KeyboardAvoidingView,
  Platform,
  ScrollView
} from "react-native";
import PrimaryInput from "../Components/PrimaryInput";
import { useState } from "react";
import PrimaryButton from "../Components/PrimaryButton";
import { colors } from "../Utils/colors";
import api from "../Server/api";
import AnimatedModal from "../Components/AnimatedModal";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { setUser } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoginLoading, setIsLoginLoading] = useState(false);

  async function login() {
    if (email && password) {
      try {
        setIsLoginLoading(true);
        const response = await api.login({ email, password });
        
        if(!response.success){
          setError(response.message)
          return
        }

        
        await AsyncStorage.setItem(
          "credentials",
          JSON.stringify({ email, password })
        );
        setUser(response.content.user);
      } catch (e: any) {
        console.error('Login screen error: ', e);
        setError(e.message);
      } finally {
        setIsLoginLoading(false);
      }
    } else {
      setError("Please insert email and password");
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: "center",
            paddingHorizontal: 20,
            gap: 25,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Image
              source={require("../assets/all2bsafe.png")}
              style={{
                width: 200,
                height: 200,
                borderRadius: 10,
                alignSelf: "center",
              }}
            />
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                textAlign: "center",
                marginTop: 10,
              }}
            >
              All 2B Safe
            </Text>
          </View>

          <View>
            <Text>Email</Text>
            <PrimaryInput
              autoCapitalize="none"
              keyboardType="email-address"
              onChange={setEmail}
              value={email}
              placeHolder="johndoe@email.com"
            />
          </View>

          <View>
            <Text>Password</Text>
            <PrimaryInput
              onChange={setPassword}
              value={password}
              placeHolder="******"
              isPassword
            />
          </View>

          <PrimaryButton
            label="Enter"
            isLoading={isLoginLoading}
            onPress={login}
            style={{ backgroundColor: colors.primary }}
            textStyle={{ color: "white" }}
          />

          {error !== "" && (
            <AnimatedModal onClose={() => setError("")} position={300} title="Attention!">
              {({ closeModal }) => (
                <View style={{ gap: 20 }}>
                  <Text>{error}</Text>
                  <PrimaryButton
                    style={{ backgroundColor: colors.danger }}
                    textStyle={{ color: "white", fontSize: 18 }}
                    label="Close"
                    onPress={() => closeModal(() => setError(""))}
                  />
                </View>
              )}
            </AnimatedModal>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
