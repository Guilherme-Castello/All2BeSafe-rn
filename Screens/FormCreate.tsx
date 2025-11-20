import { Dimensions, FlatList, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import Select from "../Components/Select";
import { useEffect, useState } from "react";
import PrimaryInput from "../Components/PrimaryInput";
import AnimatedModal from "../Components/AnimatedModal";
import PrimaryButton from "../Components/PrimaryButton";
import { colors } from "../Utils/colors";
import { FormItem } from "../Types/FormStructure";
import RenderQuestion from "../Components/RenderQuestion";
import api from "../Server/api";
import RenderHTML from "react-native-render-html";
import { useAuth } from "../contexts/AuthContext";
// @ts-ignore

export default function FormCreate() {

  const { newForm, setNewForm } = useAuth()
  const [ newFormQuestions, setNewFormQuestions] = useState<FormItem[]>([])

  const componentTypeOptions = ['text', 'select', 'input_date', 'input_time', 'check_boxes', 'weather', 'location']

  const [formTitle, setFormTitle] = useState<string>('')

  const [viewMode, setViewMode] = useState<'create' | 'preview'>('create')
  const [previewTemplate, setPreviewTemplate] = useState('')

  const [openConfigModal, setOpenConfigModal] = useState<boolean>(false)
  const [openFinishgModal, setOpenFinishModal] = useState<boolean>(false)

  const [selectedLabel, setSelectedLabel] = useState(componentTypeOptions[0])

  const [questionTitle, setQuestionTitle] = useState<string>('')

  const [questionOptionalType, setQuestionOptionalType] = useState<string>('')
  const [optionList, setOptionList] = useState<string[]>([])
  const [optionName, setOptionName] = useState<string>('')


  function handleAddQuestion() {
    if (selectedLabel == 'check_boxes' || selectedLabel == 'select') {
      setOpenConfigModal(true)
      return
    } else {
      addQuestion()
    }
  }


  function addQuestion() {

    if (questionTitle == '') {
      return
    }

    const value = selectedLabel == 'weather' ? 'Sunny with a high of 24°C and a low of 20°C' : (selectedLabel == 'input_date' || selectedLabel == 'input_time') ? new Date() : ''
    const optionalOptions = optionList.map((option, idx) => selectedLabel == 'check_boxes' ? { id: idx, value: false, label: option } : option)

    const newQuestion = {
      id: newFormQuestions.length,
      kind: selectedLabel,
      title: questionTitle,
      value: value,
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
    const updatedForm = newFormQuestions.filter(prev => newFormQuestions.indexOf(prev as never) != itemIndex)
    setNewFormQuestions(updatedForm as FormItem[])
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
    if (newForm == undefined) {
      return
    }
    console.log({...newForm, questions: newFormQuestions})
    setNewForm({...newForm, questions: newFormQuestions})

    // let newFormCompleteStructure: any = {
    //   questions: newFormQuestions as FormItem[],
    //   title: formTitle,
    //   status: 'Open'
    // }

    try {
      console.log(newForm)
      await api.createForm({...newForm, questions: newFormQuestions})
      setNewFormQuestions([])
      setNewForm(undefined)
      setFormTitle('')
    } catch (error) {
      console.error('Error creating form:', error);
    }
  }

  useEffect(() => {

    async function getPreview(){
      const html = await api.getPreviewForm({form: newFormQuestions})
      console.log(html.template)
      setPreviewTemplate(html as any)
    }
    console.log(newFormQuestions)
    getPreview()
  }, [viewMode])

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
        {viewMode == 'create' ? <View>
          <View style={{ gap: 10, paddingVertical: 10, borderBottomWidth: 0.5, borderBottomColor: colors.primary, paddingHorizontal: 20 }}>
            <View style={{ gap: 5 }}>
              <Text>Question kind: </Text>
              <Select options={componentTypeOptions} selectedOption={selectedLabel} setSelectedOption={setSelectedLabel} />
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
                <PrimaryButton onPress={() => setOpenFinishModal(true)} label="Finish" style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white' }} />
              </View>
            </View>
          </View>
          {newFormQuestions && newFormQuestions[0] != undefined && <FlatList
            contentContainerStyle={{ gap: 12, paddingBottom: 40, backgroundColor: 'white' }}
            data={newFormQuestions}
            style={{ height: '50%' }}
            keyExtractor={(item) => item!.id.toString()}
            renderItem={(item) => {
              return <RenderQuestion hasConfig={true} canDelete={true} onDelete={() => removeQuestion(item.index)} question={item.item as FormItem} index={item.index} onChangeText={() => console.log('')} handleChangeCheckbox={() => console.log('')} />
            }}
          />}
        </View> : 
        <View style={{ flex: 1, paddingHorizontal: 20, justifyContent: 'center'}}>
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
      {openConfigModal && <AnimatedModal position={500} title="Choose an option">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <FlatList data={optionList} style={{ height: 150 }} renderItem={(option) => {
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
                <PrimaryInput onChange={setOptionName} value={optionName} style={{ backgroundColor: 'blue' }} />
              </View>
              <TouchableOpacity onPress={() => [setOptionList(prev => [...prev, optionName]), setOptionName('')]} style={{ width: '10%', justifyContent: 'center', alignContent: 'center', alignItems: 'center', borderRadius: 100 }}>
                <Text style={{ color: 'white', fontWeight: 700, fontSize: 25, backgroundColor: colors.primary, paddingHorizontal: 10, borderRadius: 100 }}>+</Text>
              </TouchableOpacity>
            </View>
            <PrimaryButton style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white', fontSize: 18 }} label="Submit" onPress={() => closeModal(() => [setOpenConfigModal(false), addQuestion()])} />
            <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setOpenConfigModal(false))} />
          </View>
        }
      </AnimatedModal>}

      {openFinishgModal && <AnimatedModal position={300} title="Save this form?">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <PrimaryButton style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white', fontSize: 18 }} label="Save" onPress={() => closeModal(() => [setOpenFinishModal(false), handleSaveForm()])} />
            <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setOpenFinishModal(false))} />
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