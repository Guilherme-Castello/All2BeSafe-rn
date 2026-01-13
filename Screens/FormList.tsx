import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { Dimensions, FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
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
import { MaterialIcons } from "@expo/vector-icons";

function FormCard({ description, title, status, onPress, isAnsware = false }: { isAnsware: boolean, onPress: () => void, title: string, status: string, description: string }) {

  function getStatusColor(){
    switch(status){
      case 'open':
        return colors.primary
      case 'in_progress':
        return colors.secondary
      case 'done':
        return colors.safe
    }
  }

  function translateStatus(){
    switch(status){
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'done': return 'Done'
    }
  }

  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: colors.primary+'50', justifyContent: 'space-around', flexDirection: 'row', marginHorizontal: 10, paddingVertical: 20, alignItems: 'center', borderRadius: 20 }}>
      <View style={{ width: '15%' }}>
        <Image source={require('../assets/all2bsafe.png')} style={{ width: 50, height: 50, borderRadius: 10 }} />
      </View>
      <View style={{width: '80%'}}>
        <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
          <Text style={{fontSize: 16, fontWeight: 700, maxWidth: '75%'}}>{title}</Text>
          <Text style={[{backgroundColor: getStatusColor(), color: 'white', paddingHorizontal: 4, paddingVertical: 2, maxHeight: 27, borderRadius: 8}]}>{translateStatus()}</Text>
        </View>
        <View style={{ width: '100%'}}>
          <Text>{description}</Text>
          {!isAnsware && <View style={{flexDirection: 'row', alignContent: 'center', alignItems: 'center', gap: 5}}>
            <MaterialIcons name="person" size={15}/>
            <Text>All 2B Safe (office)</Text>
          </View>}
        </View>
      </View>
    </TouchableOpacity>
  )
}

export default function FormList() {

  const { setNewForm, newForm, user } = useAuth()
  const navigate = useNavigation()

  const [loadedForms, setLoadedForms] = useState<Form[]>()

  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState<boolean>(false)
  const [isNewAnswareModalOpen, setIsNewAnswareModalOpen] = useState<boolean>(false)
  const [answareName, setAnswareName] = useState<string>('')
  const [templateToOpen, setTemplateToOpen] = useState<string>('')

  const [listMode, setListMode] = useState<'template' | 'inProgress'>('template')

  const [formName, setFormName] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formInCharge, setFormInCharge] = useState<string>('')
  const [formWeather, setFormWeather] = useState<boolean>(true)
  const [formLocation, setFormLocation] = useState<boolean>(true)

  function resetFormConfigState() {
    setFormName('')
    setFormDescription('')
    setFormInCharge('')
    setFormLocation(true)
    setFormWeather(true)
  }

  function handleContinue() {
    if (formName == '' || formDescription == '' || formInCharge == '') return
    resetFormConfigState()
    setNewForm({ ...newForm, config: { description: formDescription, in_charge: formInCharge, location: formLocation, name: formName, weather: formWeather }, status: 'open' })
  }

  const [loadedInProgressForms, setLoadedInProgressForms] = useState([])

  useFocusEffect(
    useCallback(() => {

      async function getForms() {
        // const forms = await AsyncStorage.getItem('forms')
        try {
          const forms: any = await api.getForms();
          forms && setLoadedForms(forms)
          
          const inProgressForms: any = await api.getUserAnswares({uId: user?._id})
          setLoadedInProgressForms(inProgressForms.forms)

        } catch (error) {
          console.error('Error fetching forms from AsyncStorage:', error);
        }
      }
      getForms();
    }, [listMode])
  );



  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={{ flexDirection: 'row', height: '7%' }}>
        <TouchableOpacity onPress={() => setListMode('template')} style={[{ width: '50%', justifyContent: 'center', alignItems: 'center' }, listMode == 'template' ? styles.activeViewButton : styles.inactiveViewButton]}>
          <Text>Templates</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => setListMode('inProgress')} style={[{ width: '50%', justifyContent: 'center', alignItems: 'center' }, listMode == 'inProgress' ? styles.activeViewButton : styles.inactiveViewButton]}>
          <Text>In Progress</Text>
        </TouchableOpacity>
      </View>
      {/* @ts-ignore */}
      {listMode == 'template' && <FlatList contentContainerStyle={{ gap: 10, top: 10 }} data={loadedForms} renderItem={(item) => <FormCard status={'open'} title={item.item.config.name} description={item.item.config.description} onPress={() => [setIsNewAnswareModalOpen(true), setTemplateToOpen(item.item._id)]} />} />}
      {/* @ts-ignore */}
      {listMode == 'inProgress' && <FlatList contentContainerStyle={{ gap: 10, top: 10 }} data={loadedInProgressForms} renderItem={(item) => <FormCard isAnsware status={item.item.status} title={item.item.name} description={`Template: ${item.item.config.name}`} onPress={() => navigate.navigate("FormViewer", { id: item.item.answare_id, isAnsware: true })} />} />}
      
      <PrimaryButton label="+" onPress={() => setIsNewFormModalOpen(true)} style={{ position: 'absolute', bottom: 100, right: 10, width: 80, height: 80, borderRadius: 100 }} textStyle={{ fontSize: 40, color: 'white' }} />
      
      
      
      {isNewAnswareModalOpen && <AnimatedModal position={Dimensions.get('screen').height * 0.6} title="Choose an option">
        {({ closeModal }) =>
          <ScrollView style={{ height: '90%' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View>
              <Image source={require('../assets/all2bsafe.png')} width={200} height={200} />
            </View>
            <View style={{ width: '100%', gap: 10 }}>
              <Text>Form name</Text>
              <PrimaryInput onChange={e => setAnswareName(e)} value={answareName} />

              {/* @ts-ignore */}
              <PrimaryButton label="Continue" onPress={() => closeModal(() => [navigate.navigate("FormViewer", { id: templateToOpen, aName: answareName }), setIsNewAnswareModalOpen(false), setAnswareName('')])} />
              <PrimaryButton label="Cancel" onPress={() => closeModal(() => [setIsNewAnswareModalOpen(false), resetFormConfigState(), setAnswareName('')])} />
            </View>
          </ScrollView>
        }
      </AnimatedModal>}
      {isNewFormModalOpen && <AnimatedModal position={Dimensions.get('screen').height * 0.9} title="Choose an option">
        {({ closeModal }) =>
          <ScrollView style={{ height: '90%' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View>
              <Image source={require('../assets/all2bsafe.png')} width={200} height={200} />
            </View>
            <View style={{ width: '100%', gap: 10 }}>
              <Text>Form name</Text>
              <PrimaryInput onChange={e => setFormName(e)} value={formName} />

              <Text>Description</Text>
              <PrimaryInput onChange={e => setFormDescription(e)} value={formDescription} />

              <Text>In charge of</Text>
              <PrimaryInput onChange={e => setFormInCharge(e)} value={formInCharge} />

              <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
                <CheckBox label="Get Wheather on fill" isCheck={formWeather} setIsCheck={() => setFormWeather(!formWeather)} />
                <CheckBox label="Get Location on fill" isCheck={formLocation} setIsCheck={() => setFormLocation(!formLocation)} />
              </View>

              <PrimaryButton label="Continue" onPress={() => closeModal(() => [navigate.navigate("FormCreate" as never), setIsNewFormModalOpen(false), handleContinue()])} />
              <PrimaryButton label="Cancel" onPress={() => closeModal(() => [setIsNewFormModalOpen(false), resetFormConfigState()])} />
            </View>
          </ScrollView>
        }
      </AnimatedModal>}
    </View>
  )
}
const styles = StyleSheet.create({
  activeViewButton: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 5,
  },
  inactiveViewButton: {
    borderBottomColor: colors.primary,
    borderBottomWidth: 2,
  }
})