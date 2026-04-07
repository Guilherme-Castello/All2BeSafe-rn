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
import { Search } from "../Components/Search";
// Importe sua função de normalização aqui. 
// Se o caminho for diferente, ajuste conforme sua estrutura.
import { normalizeString } from "../Utils/string";
import FormCard from "../Components/FormCard";

export default function Library() {
  const { user, newForm, setNewForm } = useAuth()
  const navigate = useNavigation()

  const [loadedForms, setLoadedForms] = useState('')
  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState(false)

  const [selectedMasterTemplate, setSelectedMasterTemplate] = useState<string | undefined>()

  const [formName, setFormName] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formInCharge, setFormInCharge] = useState<string>('')

  function handleContinue() {
    if (formName == '' || formDescription == '' || formInCharge == '') return
    resetFormConfigState()
    setNewForm({ ...newForm, config: { description: formDescription, in_charge: formInCharge, location: false, name: formName, weather: false, kind: -2 }, status: 'open' })
    // @ts-ignore
    navigate.navigate("FormCreate", {id: selectedMasterTemplate})
  }

  function resetFormConfigState() {
    setFormName('')
    setFormDescription('')
    setFormInCharge('')
  }

  async function getForms() {
    try {
      if (user == undefined) {
        return
      }

      const forms: any = await api.getForms({});
      forms && setLoadedForms(forms)

    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  }

  // Carregamento Inicial dos Dados
  useFocusEffect(
    useCallback(() => {

      getForms();
    }, [])
  );


  return (
    <>
      <View style={{ flex: 1, backgroundColor: 'white' }}>
        {/* <Search
        placeholder="what do you want to search?"
        value={searchTerm}
        onChangeText={setSearchTerm}
        /> */}

        {/* @ts-ignore */}

        <FlatList
          contentContainerStyle={{ gap: 10, top: 10, paddingBottom: 100 }}
          data={loadedForms}
          keyExtractor={(item: any) => item._id || Math.random().toString()}
          renderItem={(item) => {
            return (
              <FormCard
                status={'open'}
                title={item.item.config.name}
                description={item.item.config.description}
                onPress={() => [setIsNewFormModalOpen(true), setSelectedMasterTemplate(item.item._id)]}
                isAnsware={false}
              />
            )
          }}
        />
      </View>
      {isNewFormModalOpen && <AnimatedModal onClose={() => setIsNewFormModalOpen(false)} position={Dimensions.get('screen').height * 0.9} title="Choose an option">
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

              <PrimaryButton label="Continue" onPress={() => closeModal(() => [navigate.navigate("FormCreate" as never), setIsNewFormModalOpen(false), handleContinue()])} />
              <PrimaryButton label="Cancel" onPress={() => closeModal(() => [setIsNewFormModalOpen(false), resetFormConfigState()])} />
            </View>
          </ScrollView>
        }
      </AnimatedModal>}
    </>
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