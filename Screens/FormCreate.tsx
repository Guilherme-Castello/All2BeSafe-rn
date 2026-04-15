import { Dimensions, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Select from "../Components/Select";
import { useCallback, useEffect, useMemo, useState } from "react";
import PrimaryInput from "../Components/PrimaryInput";
import AnimatedModal from "../Components/AnimatedModal";
import PrimaryButton from "../Components/PrimaryButton";
import { colors } from "../Utils/colors";
import { FormItem } from "../Types/FormStructure";
import RenderQuestion from "../Components/RenderQuestion";
import api from "../Server/api";
import RenderHTML from "react-native-render-html";
import { useAuth } from "../contexts/AuthContext";
import { useNavigation, useRouter } from "expo-router";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import RenderQuestionContainer from "../Components/RenderQuestionContainer";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import CheckBox from "../Components/CheckBox";
// @ts-ignore

export default function FormCreate() {

  const route = useRoute();

  // const { id } = route.params as { id: string | undefined};
  const { id } = (route.params ?? {}) as { id: string | undefined };

  const { newForm, setNewForm, user } = useAuth()
  const [newFormQuestions, setNewFormQuestions] = useState<FormItem[]>([])

  const [openEditModal, setOpenEditModal] = useState(false)
  const [questionToEdit, setQuestionToEdit] = useState<FormItem | undefined>()

  const [isUserEditingOption, setIsUserEditingOption] = useState<boolean>(false)

  const componentTypeOptions = ['text', 'select', 'input_date', 'input_time', 'check_boxes', 'weather', 'location', 'signature']

  // const sectionOptions = ['Section1', 'Section2', 'Section3']
  const [sectionOptions, setSectionOptions] = useState<string[]>([])
  const [openSectionModal, setOpenSectionModal] = useState<boolean>(false)
  const [newSectionName, setNewSectionName] = useState<string>('')

  const [formTitle, setFormTitle] = useState<string>('')
  const [templateAsMaster, setTemplateAsMaster] = useState(false)

  const [viewMode, setViewMode] = useState<'create' | 'preview'>('create')

  const [openConfigModal, setOpenConfigModal] = useState<boolean>(false)
  const [openPredefinedOptionsModal, setOpenPredefinedOptionsModal] = useState<boolean>(false)
  const [openFinishgModal, setOpenFinishModal] = useState<boolean>(false)

  const [selectedLabel, setSelectedLabel] = useState(componentTypeOptions[0])
  const [selectedSection, setSelectedSection] = useState('')

  const [questionTitle, setQuestionTitle] = useState<string>('')

  const [questionOptionalType, setQuestionOptionalType] = useState<string>('')
  const [optionList, setOptionList] = useState<string[]>([])
  const [optionName, setOptionName] = useState<string>('')

  const [isCreateFormloading, setIsCreateFormloading] = useState<boolean>(false)

  const navigate = useNavigation()

  function handleAddQuestion() {
    if (selectedLabel == 'check_boxes' || selectedLabel == 'select') {
      setOpenPredefinedOptionsModal(true)
      return
    } else {
      addQuestion()
    }
  }


  // Gera sempre um ID maior que qualquer ID existente.
  // Evita colisões ao remover questões e adicionar novas.
  function getNextQuestionId(): string {
    if (newFormQuestions.length === 0) return '0'
    const maxId = Math.max(...newFormQuestions.map(q => Number(q.id)))
    return String(maxId + 1)
  }

  function addQuestion() {

    if (questionTitle == '') {
      return
    }

    const value = selectedLabel == 'weather' ? '' : (selectedLabel == 'input_date' || selectedLabel == 'input_time') ? new Date() : ''
    const optionalOptions = optionList.map((option, idx) => selectedLabel == 'check_boxes' ? { id: idx, value: false, label: option } : option)

    const newQuestion = {
      id: getNextQuestionId(),
      kind: selectedLabel,
      title: questionTitle,
      value: value,
      section: selectedSection,
      [questionOptionalType]: optionalOptions,
    }

    setNewFormQuestions((prev: any) => {
      return [...prev, newQuestion]
    })

    setOptionList([])
    setOptionName('')
    setQuestionOptionalType('')
    setQuestionTitle('')
    setSelectedLabel(componentTypeOptions[0])
  }

  function removeFromList(itemIndex: number) {
    const newList = optionList.filter(prev => optionList.indexOf(prev) != itemIndex)
    setOptionList(newList)
  }

  function removeQuestion(itemIndex: number) {
    const updatedForm = newFormQuestions.filter(prev => prev.id != itemIndex)
    setNewFormQuestions(updatedForm as FormItem[])
  }

  function getQuestionToBeUpdated(questionId: any) {
    const toUpdate = newFormQuestions.find(prev => prev.id == questionId)
    setQuestionToEdit(toUpdate)
  }

  function updateQuestion(newSection?: string) {
    if (!questionToEdit) return

    const editQuestionIdx = newFormQuestions.findIndex(
      q => q.id === questionToEdit.id
    )
    if (editQuestionIdx === -1) return

    const updatedQuestions = [...newFormQuestions]

    updatedQuestions[editQuestionIdx] = questionToEdit

    if (questionToEdit.kind == "check_boxes") updatedQuestions[editQuestionIdx] = { ...questionToEdit, check_boxes: optionList.map((cb, idx) => ({ id: idx, label: cb, value: false })) }
    if (questionToEdit.kind == "select") updatedQuestions[editQuestionIdx] = { ...questionToEdit, options: optionList }
    updatedQuestions[editQuestionIdx] = { ...updatedQuestions[editQuestionIdx], section: newSection != undefined ? newSection : questionToEdit.section }
    setNewFormQuestions(updatedQuestions)
  }

  useEffect(() => {
    switch (selectedLabel) {
      case 'select':
        setQuestionOptionalType('options')
        break
      case 'check_boxes':
        setQuestionOptionalType('check_boxes')
        break
      default:
        setQuestionOptionalType('')
        break
    }
  }, [selectedLabel])

  async function handleSaveForm() {
    if (newForm == undefined || user == undefined) {
      return
    }

    const companyToAdd = templateAsMaster ? -1 : parseInt(user?.company)

    setNewForm({ ...newForm, questions: newFormQuestions, config: { ...newForm.config, kind: companyToAdd } })

    // let newFormCompleteStructure: any = {
    //   questions: newFormQuestions as FormItem[],
    //   title: formTitle,
    //   status: 'Open'
    // }

    try {
      setIsCreateFormloading(true)
      await api.createForm({ ...newForm, questions: newFormQuestions, config: { ...newForm.config, kind: companyToAdd } })
      setNewFormQuestions([])
      setNewForm(undefined)
      setFormTitle('')
      setSectionOptions([])
      setSelectedSection('')
      navigate.goBack()
    } catch (error) {
      console.error('Error creating form:', error);
    } finally {
      setIsCreateFormloading(false)
    }
  }

  const predefinedOptions = [
    {
      options: [
        "Yes",
        "No",
        "N/A"
      ],
      //color: colors.safe,
      color: colors.primary,
    },
    {
      options: [
        "Safe",
        "Not safe",
        "Unsure",
        "N/A"
      ],
      //color: colors.secondary,
      color: colors.primary,
    },
    {
      options: [
        "Forklift Class 5",
        "Forklift class 7",
        "Forklift calss 5 & 7",
        "E.W.P.",
        "Mobile Crane (0-8 ton)",
        "Industrial Crane",
        "Working at Heights",
        "WHMIS",
        "Worker Awareness",
        "Supervisor Awareness",
        "Scaffold (setup & use)",
        "Propane in Construction",
        "Propane in Roofing",
        "PPE",
        "Confined space",
        "First aid",
        "Traffic control",
        "First Aid/CPR",
        "Hoisting & Rigging",
        "Suspended Access Equipment",
        "Stilts",
        "Competent supervisor",
        "Skid steer x Mini excavator",
        "Fire extinguishers",
        "Lockout/Tagout",
        "Ground Disturbance",
        "Asbestos Awareness"
      ],
      color: colors.primary,
    }
  ]

  async function listSections() {
    const sectionsReturned = await api.listSections({})
    setSectionOptions(sectionsReturned.content.map((section: any) => section.name))
    setSelectedSection((sectionsReturned.content.map((section: any) => section.name))[0])
  }

  async function getTemplateById() {
    console.log(id)
    if(!id) {
      return
    }
    console.log("after validation")
    const templateBase = await api.getFormById(id)
    setNewFormQuestions(templateBase.questions)
    console.log(templateBase)
  }

  function handleSubmitOptionsModal() {
    if (isUserEditingOption) {
      if (!questionToEdit) return
      updateQuestion()
    } else {
      addQuestion()
    }
  }

  useFocusEffect(
    useCallback(() => {
      listSections()
      if (id && id != undefined && id != "") {
        getTemplateById()
      }

      return () => {

      }
    }, [id])
  )

  return (
    <>
      <SafeAreaView style={{ backgroundColor: 'white', flex: 1 }}>
        <View style={{ flexDirection: 'row', height: '7%' }}>
          <TouchableOpacity onPress={() => setViewMode('create')} style={[{ width: '50%', justifyContent: 'center', alignItems: 'center' }, viewMode == 'create' ? styles.activeViewButton : styles.inactiveViewButton]}>
            <Text>Create</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setViewMode('preview')} style={[{ width: '50%', justifyContent: 'center', alignItems: 'center' }, viewMode == 'preview' ? styles.activeViewButton : styles.inactiveViewButton]}>
            <Text>Preview</Text>
          </TouchableOpacity>
        </View>
        {viewMode == 'create' ? <View style={{ gap: 10 }}>
          <View style={{ gap: 10, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colors.primary, paddingHorizontal: 20, height: "32%" }}>
            <View style={{ gap: 5, flexDirection: 'row' }}>
              <View style={{ width: '50%' }}>
                <Text>Question kind: </Text>
                <Select position={600} containerHeight={400} options={componentTypeOptions} selectedOption={selectedLabel} setSelectedOption={setSelectedLabel} />
              </View>
              <View style={{ width: '50%' }}>
                <Text>Group: </Text>
                <PrimaryButton label={selectedSection || 'Choose a Section'} style={{ height: 40 }} onPress={() => setOpenSectionModal(true)} />
                {/* <Select position={600} containerHeight={400} options={sectionOptions} selectedOption={selectedSection} setSelectedOption={setSelectedSection} /> */}
              </View>
            </View>
            <View style={{ gap: 5 }}>
              <Text>Title: </Text>
              <PrimaryInput onChange={setQuestionTitle} value={questionTitle} />
            </View>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <View style={{ width: '48%' }}>
                <PrimaryButton onPress={() => handleAddQuestion()} label="Add Question" style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white' }} />
              </View>
              <View style={{ width: '48%' }}>
                <PrimaryButton onPress={() => setOpenFinishModal(true)} isLoading={isCreateFormloading} label="Finish" style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white' }} />
              </View>
            </View>
          </View>
          {newFormQuestions && newFormQuestions[0] != undefined &&
            <View style={{ height: "60%" }}>
              <RenderQuestionContainer
                formQuestions={newFormQuestions}
                onLongPress={(aId: string) => [setOpenEditModal(true), getQuestionToBeUpdated(aId)]}
                removeQuestion={removeQuestion}
                handleChangeCheckbox={() => { }}
                onChangeText={() => { }}
                canDelete
                hasConfig
              />
            </View>}
        </View> :
          <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center' }}>
            {/* <RenderHTML source={{ html: previewTemplate }} 
            contentWidth={100} 
          /> */}
            {newFormQuestions != undefined && <FlatList
              contentContainerStyle={{ gap: 12, paddingVertical: 40 }}
              data={newFormQuestions}
              keyExtractor={(item) => item?.id as any}
              ListFooterComponent={() => (
                <View>
                  <PrimaryButton label="Submit" onPress={() => console.log(true)} style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white' }} />

                </View>
              )}
              renderItem={(item) => {
                // @ts-ignore
                return <RenderQuestion question={item.item} index={item.index} onChangeText={() => console.log('')} handleChangeCheckbox={() => console.log()} />
              }}
            />}
          </View>}
      </SafeAreaView>
      {openConfigModal && <AnimatedModal onClose={() => [setOpenConfigModal(false), setOptionList([])]} position={700} title="Options">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <FlatList data={optionList} style={{ height: 350 }} renderItem={(option) => {
              return (
                <View style={{ height: 50, justifyContent: 'space-between', borderRadius: 20, flexDirection: 'row', marginHorizontal: 10, alignItems: 'center' }}>
                  <Text>{option.item}</Text>
                  <TouchableOpacity onPress={() => removeFromList(option.index)} style={{ backgroundColor: colors.danger, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
                    <Text style={{ color: 'white' }}>X</Text>
                  </TouchableOpacity>
                </View>
              )
            }} />
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <View style={{ width: '90%' }}>
                <PrimaryInput placeHolder="...or add your own option" onChange={setOptionName} value={optionName} />
              </View>
              <TouchableOpacity onPress={() => [setOptionList(prev => [...prev, optionName]), setOptionName('')]} style={{ width: '10%', justifyContent: 'center', alignContent: 'center', alignItems: 'center', borderRadius: 100 }}>
                <Text style={{ color: 'white', fontWeight: 700, fontSize: 25, backgroundColor: colors.primary, paddingHorizontal: 10, borderRadius: 100 }}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 5 }}>
              {/* @ts-ignore */}
              <PrimaryButton style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white', fontSize: 18 }} label="Submit" onPress={() => closeModal(() => [setOpenConfigModal(false), handleSubmitOptionsModal()])} />
              <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => [setOpenConfigModal(false), setOptionList([])])} />
            </View>
          </View>
        }
      </AnimatedModal>}

      {openSectionModal && <AnimatedModal onClose={() => setOpenSectionModal(false)} position={700} title="Section">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <FlatList data={sectionOptions} style={{ height: 350 }} renderItem={(option) => {
              return (
                <TouchableOpacity onPress={() => closeModal(() => [setOpenSectionModal(false), setSelectedSection(option.item), openEditModal && updateQuestion(option.item)])} style={{ height: 50, borderColor: colors.primary, borderTopWidth: 1, borderBottomWidth: 1, justifyContent: 'space-between', borderRadius: 20, flexDirection: 'row', marginHorizontal: 10, alignItems: 'center' }}>
                  <Text>{option.item}</Text>
                </TouchableOpacity>
              )
            }} />
            <View style={{ flexDirection: 'row', width: '100%' }}>
              <View style={{ width: '90%' }}>
                <PrimaryInput placeHolder="Create a new section" onChange={setNewSectionName} value={newSectionName} />
              </View>
              <TouchableOpacity onPress={() => [setSectionOptions(prev => [...prev, newSectionName]), setNewSectionName('')]} style={{ width: '10%', justifyContent: 'center', alignContent: 'center', alignItems: 'center', borderRadius: 100 }}>
                <Text style={{ color: 'white', fontWeight: 700, fontSize: 25, backgroundColor: colors.primary, paddingHorizontal: 10, borderRadius: 100 }}>+</Text>
              </TouchableOpacity>
            </View>
            <View style={{ gap: 5 }}>
              <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setOpenSectionModal(false))} />
            </View>
          </View>
        }
      </AnimatedModal>}

      {openPredefinedOptionsModal && <AnimatedModal onClose={() => setOpenPredefinedOptionsModal(false)} position={600} title="Options">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <FlatList
              data={predefinedOptions}
              contentContainerStyle={{ width: '100%', justifyContent: 'center', gap: 5 }}
              style={{ height: 300 }}
              renderItem={({ item }) => {
                return <TouchableOpacity style={{ borderColor: item.color, borderWidth: 0.9, width: '100%', height: 36, borderRadius: 15 }} onPress={() => closeModal(() => [setOptionList(prev => [...prev, ...item.options]), setOpenPredefinedOptionsModal(false), setOpenConfigModal(true)])}>
                  <FlatList
                    data={item.options}
                    style={{ flexDirection: 'row', width: '100%' }}
                    horizontal
                    ItemSeparatorComponent={() => <Text style={{ fontSize: 20, marginHorizontal: 5, color: item.color }}> | </Text>}
                    contentContainerStyle={{ justifyContent: 'space-between', paddingHorizontal: 10 }}
                    renderItem={({ item }) => {
                      return (
                        <Text style={{ fontSize: 20 }}>{item}</Text>

                      )
                    }}
                    keyExtractor={(item, index) => index.toString()}
                  />
                </TouchableOpacity>
              }}
              keyExtractor={(item, index) => index.toString()}
            />

            <View style={{ gap: 5 }}>
              <PrimaryButton style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white', fontSize: 18 }} label="Add manually" onPress={() => closeModal(() => [setOpenPredefinedOptionsModal(false), setOpenConfigModal(true)])} />
              <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setOpenPredefinedOptionsModal(false))} />
            </View>
          </View>
        }
      </AnimatedModal>}

      {openFinishgModal && <AnimatedModal onClose={() => setOpenFinishModal(false)} position={350} title="Save this form?">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <PrimaryButton style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white', fontSize: 18 }} label="Save" onPress={() => closeModal(() => [setOpenFinishModal(false), handleSaveForm()])} />
            <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setOpenFinishModal(false))} />
            {user?.company == "0" && parseInt(user.access_level) == 3 && <CheckBox isCheck={templateAsMaster} label="Set as master?" setIsCheck={() => setTemplateAsMaster(!templateAsMaster)} />}
          </View>
        }
      </AnimatedModal>}
      {openEditModal && <AnimatedModal onClose={() => setOpenEditModal(false)} position={550} title="Edit question">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            {/* @ts-ignore */}
            <PrimaryInput value={questionToEdit?.title || ""} onChange={(e) => setQuestionToEdit({ ...questionToEdit, title: e })} />
            <PrimaryButton label="Change Section" onPress={() => setOpenSectionModal(true)} />
            {/* @ts-ignore */}
            {questionToEdit?.kind == "select" && <PrimaryButton label="Edit Options" onPress={() => [setOpenConfigModal(true), setOptionList(questionToEdit.options), setIsUserEditingOption(true)]} />}
            {questionToEdit?.kind == "check_boxes" && <PrimaryButton label="Edit Boxes" onPress={() => [setOpenConfigModal(true), setOptionList(questionToEdit.check_boxes!.map(cb => cb.label)), setIsUserEditingOption(true)]} />}
            <PrimaryButton label="Update" onPress={() => closeModal(() => [setOpenEditModal(false), updateQuestion()])} />
            <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setOpenEditModal(false))} />
          </View>
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