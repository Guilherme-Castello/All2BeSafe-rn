import { SafeAreaView, ScrollView, Text, View } from "react-native";
import PrimaryInput from "../Components/PrimaryInput";
import { useState } from "react";
import Select from "../Components/Select";
import api from "../Server/api";
import { useAuth } from "../contexts/AuthContext";
import PrimaryButton from "../Components/PrimaryButton";

export default function UserCreate(){

  const { user } = useAuth()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repassword, setRePassword] = useState("")
  const [accessLevel, setAccessLevel] = useState("0")

  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function createUser(){
    if(!user) return
    if(password != repassword) return
    console.log(user)
    setIsLoading(true)
    try{
      api.registerUser({
        name: name,
        email: email,
        password: password,
        access_level: accessLevel,
        company: "0001"
      })
    } catch(e){

    } finally{
      setIsLoading(false)
    }
  }
  
  return(
    <SafeAreaView style={{marginHorizontal: 15, marginTop: 10}}>
      <ScrollView style={{height: '80%'}}>
        <View style={{gap: 5}}>
          <Text>Name</Text>
          <PrimaryInput onChange={setName} value={name}/>

          <Text>Email</Text>
          <PrimaryInput onChange={setEmail} value={email}/>
        
          <Text>Password</Text>
          <PrimaryInput isPassword onChange={setPassword} value={password}/>

          <Text>Repeat Password</Text>
          <PrimaryInput isPassword onChange={setRePassword} value={repassword}/>

          <Text>Access Level</Text>
          {/* <PrimaryInput onChange={setAccessLevel} value={accessLevel}/> */}
          <Select options={["0", "1", "2"]} selectedOption={accessLevel} setSelectedOption={e => setAccessLevel(e)}/>
        </View>
      </ScrollView>
      <View>
        <PrimaryButton label="Submit" onPress={() => createUser()} isLoading={isLoading}/>
      </View>
    </SafeAreaView>
  )
}