import { Image, SafeAreaView, Text, View } from "react-native";
import PrimaryInput from "../Components/PrimaryInput";
import { useState } from "react";
import PrimaryButton from "../Components/PrimaryButton";
import { colors } from "../Utils/colors";
import api from "../Server/api";
import AnimatedModal from "../Components/AnimatedModal";
import { CommonActions, DrawerActions, useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {

  const { setUser } = useAuth()

  const [email, setEmail] = useState<string>('')
  const [password, setPassword] = useState<string>('')
  const [error, setError] = useState<string>('')

  const [isLoginLoading, setIsLoginLoading] = useState<boolean>(false)

  const navigate = useNavigation()

  async function login() {
    if (email != '' && password != '') {
      try{
        setIsLoginLoading(true)
        const response = await api.login({ email, password })
        await AsyncStorage.setItem('credentials', JSON.stringify({email, password}))
        setUser(response.user)
      } catch(e: any){
        console.error(e)
        setError(e.message)
      }
      finally{
        setIsLoginLoading(false)
      }
    } else {
      setError('Please insert email and password')
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white', justifyContent: 'center', paddingHorizontal: 20, gap: 25 }}>
      <View>
        <Image source={require('../assets/all2bsafe.png')} style={{ width: 200, height: 200, borderRadius: 10, alignSelf: 'center' }} width={200} height={200} />
        <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 10 }}>All 2 Be Safe</Text>
      </View>
      <View>
        <Text>Email</Text>
        <PrimaryInput onChange={setEmail} value={email} placeHolder="johndoe@email.com" />
      </View>
      <View>
        <Text>Password</Text>
        <PrimaryInput onChange={setPassword} value={password} placeHolder="******" />
      </View>
      <PrimaryButton label="Enter" isLoading={isLoginLoading} onPress={() => login()} style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white' }} />
      {error != '' && <AnimatedModal position={300} title="Attention!">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <Text>{error}</Text>
            <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setError(''))} />
          </View>
        }
      </AnimatedModal>}
    </SafeAreaView>
  )
}