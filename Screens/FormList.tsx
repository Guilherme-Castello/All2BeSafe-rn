import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, FlatList, Image, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { Form } from "../Types/FormStructure";
import { colors } from "../Utils/colors";
import PrimaryButton from "../Components/PrimaryButton";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../Server/api";
import { router } from "expo-router";
import AnimatedModal from "../Components/AnimatedModal";
import PrimaryInput from "../Components/PrimaryInput";
import CheckBox from "../Components/CheckBox";
import { useAuth } from "../contexts/AuthContext";

function FormCard({ title, status, onPress }: { onPress: () => void, title: string, status: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: colors.secondary, justifyContent: 'space-around', flexDirection: 'row', marginHorizontal: 20, paddingVertical: 20, alignItems: 'center', borderRadius: 20 }}>
      <Text>{title}</Text>
      <Text>{status}</Text>
    </TouchableOpacity>
  )
}

export default function FormList() {

  const { setNewForm, newForm } = useAuth()

  const [loadedForms, setLoadedForms] = useState<Form[]>()
  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState<boolean>(false)
  const navigate = useNavigation()

  const [formName, setFormName] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formInCharge, setFormInCharge] = useState<string>('')
  const [formWeather, setFormWeather] = useState<boolean>(true)
  const [formLocation, setFormLocation] = useState<boolean>(true)

  function resetFormConfigState(){
    setFormName('')
    setFormDescription('')
    setFormInCharge('')
    setFormLocation(true)
    setFormWeather(true)
  }

  function handleContinue(){
    if(formName == '' || formDescription == '' || formInCharge == '') return
    resetFormConfigState()
    setNewForm({...newForm, config: {description: formDescription, in_charge: formInCharge, location: formLocation, name: formName, weather: formWeather}, status: 'open'})
  }

  useFocusEffect(
    useCallback(() => {
      console.log('FormList focused')

      async function getForms() {
        // const forms = await AsyncStorage.getItem('forms')
        try {
          const forms: any = await api.getForms();
          forms && setLoadedForms(forms)
        } catch (error) {
          console.error('Error fetching forms from AsyncStorage:', error);
        }
      }
      getForms();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* @ts-ignore */}
      <FlatList contentContainerStyle={{ gap: 10, top: 10 }} data={loadedForms} renderItem={(item) => <FormCard status={item.item.status} title={item.item.config.name} onPress={() => navigate.navigate("FormViewer", { id: item.item._id })} />} />
      {/* @ts-ignore */}
      <PrimaryButton label="+" onPress={() => setIsNewFormModalOpen(true)} style={{position: 'absolute', bottom: 100, right: 10, width: 80, height: 80, borderRadius: 100}} textStyle={{fontSize: 40, color: 'white'}}/>
      {isNewFormModalOpen && <AnimatedModal position={Dimensions.get('screen').height * 0.9} title="Choose an option">
        {({ closeModal }) =>
          <ScrollView style={{ height: '90%' }} contentContainerStyle={{alignItems: 'center'}}>
            <View>
              <Image source={require('../assets/all2bsafe.png')} width={200} height={200}/>
            </View>
            <View style={{width: '100%', gap: 10}}>
              <Text>Form name</Text>
              <PrimaryInput onChange={e => setFormName(e)} value={formName}/>

              <Text>Description</Text>
              <PrimaryInput onChange={e => setFormDescription(e)} value={formDescription}/>
              
              <Text>In charge of</Text>
              <PrimaryInput onChange={e => setFormInCharge(e)} value={formInCharge}/>
              
              <View style={{width: '100%', flexDirection: 'row', justifyContent: 'space-between'}}>
                <CheckBox label="Get Wheather on fill" isCheck={formWeather} setIsCheck={() => setFormWeather(!formWeather)}/>
                <CheckBox label="Get Location on fill" isCheck={formLocation} setIsCheck={() => setFormLocation(!formLocation)}/>
              </View>

              <PrimaryButton label="Continue" onPress={() => closeModal(() => [navigate.navigate("FormCreate" as never), setIsNewFormModalOpen(false), handleContinue()])}/>
              <PrimaryButton label="Cancel" onPress={() => closeModal(() => [setIsNewFormModalOpen(false), resetFormConfigState()])}/>
            </View>
          </ScrollView>
        }
      </AnimatedModal>}
    </View>
  )
}