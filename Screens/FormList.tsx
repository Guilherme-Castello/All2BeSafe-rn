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



export default function FormList() {

  const { setNewForm, newForm, user } = useAuth()
  const navigate = useNavigation()

  // Dados originais (Brutos)
  const [loadedForms, setLoadedForms] = useState<Form[]>([])
  const [loadedInProgressForms, setLoadedInProgressForms] = useState([])

  // Dados Filtrados (Para exibição)
  const [filteredTemplates, setFilteredTemplates] = useState<Form[]>([])
  const [filteredInProgress, setFilteredInProgress] = useState([])

  // Estado da Pesquisa
  const [searchTerm, setSearchTerm] = useState('')

  const [isNewFormModalOpen, setIsNewFormModalOpen] = useState<boolean>(false)
  const [isNewModalOpen, setIsNewModalOpen] = useState<boolean>(false)

  const [isNewAnswareModalOpen, setIsNewAnswareModalOpen] = useState<boolean>(false)
  const [answareName, setAnswareName] = useState<string>('')
  const [templateToOpen, setTemplateToOpen] = useState<string>('')

  const [listMode, setListMode] = useState<'template' | 'inProgress'>('template')

  const [formName, setFormName] = useState<string>('')
  const [formDescription, setFormDescription] = useState<string>('')
  const [formInCharge, setFormInCharge] = useState<string>(user?.name ?? '')
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
    if (formName == '' || formInCharge == '') return

    resetFormConfigState()
    setNewForm({ ...newForm, config: { description: formDescription, in_charge: formInCharge, location: formLocation, name: formName, weather: formWeather, kind: -2 }, status: 'open' })
    // @ts-ignore
    navigate.navigate("FormCreate")
  }

  async function getForms() {
    try {
      console.log(user)
      const forms: any = await api.getForms({user_id: user?._id});
      if (forms) {
        setLoadedForms(forms)
        setFilteredTemplates(forms) // Inicializa filtro com tudo
      }

      const inProgressForms: any = await api.getUserAnswares({ uId: user?._id })
      if (inProgressForms && inProgressForms.forms) {
        setLoadedInProgressForms(inProgressForms.forms)
        setFilteredInProgress(inProgressForms.forms) // Inicializa filtro com tudo
      }

    } catch (error) {
      console.error('Error fetching forms:', error);
    }
  }

  // Carregamento Inicial dos Dados
  useFocusEffect(
    useCallback(() => {

      getForms();
    }, [listMode])
  );

  // Lógica de Filtro Inteligente
  useEffect(() => {
    const term = normalizeString(searchTerm);

    // Se não tiver termo, restaura as listas originais
    if (term === '') {
      setFilteredTemplates(loadedForms);
      setFilteredInProgress(loadedInProgressForms);
      return;
    }

    // 1. Filtra Templates (loadedForms)
    if (loadedForms) {
      const filteredT = loadedForms.filter((item: any) => {
        const name = normalizeString(item.config?.name || '');
        const desc = normalizeString(item.config?.description || '');
        const user = normalizeString(item.in_charge || ''); // Assumindo que in_charge está na raiz ou ajuste conforme o objeto

        // Tratamento de data seguro
        let date = '';
        if (item.created_at) {
          date = new Date(item.created_at).toLocaleDateString('pt-BR');
        }

        return name.includes(term) || desc.includes(term) || user.includes(term) || date.includes(term);
      });
      setFilteredTemplates(filteredT);
    }

    // 2. Filtra In Progress (loadedInProgressForms)
    if (loadedInProgressForms) {
      const filteredP = loadedInProgressForms.filter((item: any) => {
        const name = normalizeString(item.name || ''); // Nome do form respondido
        const templateName = normalizeString(item.config?.name || ''); // Nome do template original

        let date = '';
        if (item.created_at) {
          date = new Date(item.created_at).toLocaleDateString('pt-BR');
        }

        return name.includes(term) || templateName.includes(term) || date.includes(term);
      });
      setFilteredInProgress(filteredP);
    }

  }, [searchTerm, loadedForms, loadedInProgressForms]);


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

      {/* Componente Search atualizado com props de controle */}
      <Search
        placeholder="what do you want to search?"
        value={searchTerm}
        onChangeText={setSearchTerm}
      />

      {/* Listas usando os dados FILTRADOS */}
      {/* @ts-ignore */}
      {listMode == 'template' && (
        <FlatList
          contentContainerStyle={{ gap: 10, top: 10, paddingBottom: 100 }}
          data={filteredTemplates}
          keyExtractor={(item: any) => item._id || Math.random().toString()}
          renderItem={(item) => {
            return (
              <FormCard
                status={'open'}
                title={item.item.config.name}
                description={item.item.config.description}
                onPress={() => [setIsNewAnswareModalOpen(true), setTemplateToOpen(item.item._id)]}
                isAnsware={false}
              />
            )
          }}
        />
      )}

      {/* @ts-ignore */}
      {listMode == 'inProgress' && (
        <FlatList
          contentContainerStyle={{ gap: 10, top: 10, paddingBottom: 100 }}
          data={filteredInProgress}
          keyExtractor={(item: any) => item.answare_id || Math.random().toString()}
          renderItem={(item) => {

            return (
              <FormCard
                getForms={getForms}
                aId={item.item.answare_id}
                isAnsware
                status={item.item.status}
                title={item.item.name}
                description={`Template: ${item.item.config.name}`}
                // @ts-ignore
                onPress={() => navigate.navigate("FormViewer", { id: item.item.answare_id, isAnsware: true, aName: item.item.name })}
              />
            )
          }}
        />
      )}

      {/* <PrimaryButton label="New! +" onPress={() => setIsNewFormModalOpen(true)} style={{ position: 'absolute', bottom: 100, right: 10, width: 100, height: 40, borderRadius: 100 }} textStyle={{ fontSize: 20, color: 'white' }} /> */}
      {listMode == "template" && <PrimaryButton label="New! +" onPress={() => setIsNewModalOpen(true)} style={{ position: 'absolute', bottom: 100, right: 10, width: 100, height: 40, borderRadius: 100 }} textStyle={{ fontSize: 20, color: 'white' }} />}

      {isNewModalOpen && <AnimatedModal onClose={() => setIsNewAnswareModalOpen(false)} position={Dimensions.get('screen').height * 0.6} title="Choose an option">
        {({ closeModal }) =>
          <ScrollView style={{ height: '90%' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View style={{ gap: 10, width: "90%" }}>
              <PrimaryButton label="Create my own form" onPress={() => closeModal(() => [setIsNewModalOpen(false), setIsNewFormModalOpen(true)])} />
              {/* @ts-ignore */}
              <PrimaryButton label="Open Library" onPress={() => closeModal(() => [setIsNewModalOpen(false), navigate.navigate("Library")])} />
              <PrimaryButton style={{backgroundColor: colors.danger}} label="Cancel" onPress={() => closeModal(() => [setIsNewModalOpen(false)])} />
            </View>
          </ScrollView>
        }
      </AnimatedModal>}


      {/* MANTIVE SEUS MODAIS ORIGINAIS ABAIXO SEM ALTERAÇÕES */}
      {isNewAnswareModalOpen && <AnimatedModal onClose={() => setIsNewAnswareModalOpen(false)} position={Dimensions.get('screen').height * 0.6} title="Choose an option">
        {({ closeModal }) =>
          <ScrollView style={{ height: '90%' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View>
              <Image source={require('../assets/all2bsafe.png')} width={200} height={200} />
            </View>
            <View style={{ width: '100%', gap: 10 }}>
              <Text>Client / Site</Text>
              <PrimaryInput onChange={e => setAnswareName(e)} value={answareName} />

              {/* @ts-ignore */}
              <PrimaryButton label="Continue" onPress={() => closeModal(() => [navigate.navigate("FormViewer", { id: templateToOpen, aName: answareName }), setIsNewAnswareModalOpen(false), setAnswareName('')])} />
              <PrimaryButton label="Cancel" onPress={() => closeModal(() => [setIsNewAnswareModalOpen(false), resetFormConfigState(), setAnswareName('')])} />
            </View>
          </ScrollView>
        }
      </AnimatedModal>}
      {isNewFormModalOpen && <AnimatedModal onClose={() => setIsNewFormModalOpen(false)} position={Dimensions.get('screen').height * 0.9} title="Choose an option">
        {({ closeModal }) =>
          <ScrollView style={{ height: '90%' }} contentContainerStyle={{ alignItems: 'center' }}>
            <View>
              <Image source={require('../assets/all2bsafe.png')} width={200} height={200} />
            </View>
            <View style={{ width: '100%', gap: 10 }}>
              <Text>Client / Site</Text>
              <PrimaryInput onChange={e => setFormName(e)} value={formName} />

              <Text>Describe the inspection</Text>
              <PrimaryInput placeHolder="Brief inspection description" onChange={e => setFormDescription(e)} value={formDescription} />

              <Text>In charge of</Text>
              <PrimaryInput onChange={e => setFormInCharge(e)} value={formInCharge} />

              {/* @ts-ignore */}
              <PrimaryButton disabled={formName == "" || formInCharge == ""} label="Continue" onPress={() => closeModal(() => [navigate.navigate("FormCreate"), setIsNewFormModalOpen(false), handleContinue()])} />
              <PrimaryButton label="Cancel" onPress={() => closeModal(() => [setIsNewFormModalOpen(false), resetFormConfigState()])} style={{ backgroundColor: colors.danger }} />
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