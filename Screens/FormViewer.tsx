import { FlatList, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { Form, FormItem } from "../Types/FormStructure";
import RenderQuestion from "../Components/RenderQuestion";
import { useFocusEffect, useRoute } from "@react-navigation/native";
import api from "../Server/api";
import PrimaryButton from "../Components/PrimaryButton";
import { colors } from "../Utils/colors";
import { useAuth } from "../contexts/AuthContext";
import AnimatedModal from "../Components/AnimatedModal";
import Signature from "react-native-signature-canvas";

export default function FormViewer() {

  const route = useRoute();

  const { id } = route.params as { id: string };
  const [currentQuestions, setCurrentQuestions] = useState<FormItem[]>()
  const [currentForm, setCurrentForm] = useState<Form>()
  const [downloadFormModal, setDownloadFormModal] = useState<string>('')
  const [feedbackModal, setFeedbackModal] = useState<string>('')

  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState<boolean>(false)

  const { user } = useAuth()

  useEffect(() => {
    currentForm && setCurrentQuestions(currentForm.questions)
  }, [currentForm])

  const handleChangeText = useCallback((receivedIndex: number, newText: string) => {
    setCurrentQuestions((prev) => {
      if (prev == undefined) return undefined
      const test = prev.map((item, index) => {
        if (index === receivedIndex) {
          return { ...item, value: newText }
        } else { return item }
      })
      return test
    });
  }, []);

  const handleChangeCheckbox = useCallback((receivedIndex: number, check: boolean, boxid: number) => {
    setCurrentQuestions((prev) => {
      if (prev == undefined) return undefined
      return prev.map((item, index) => {
        return index === receivedIndex ? {
          ...item, check_boxes: item.check_boxes!.map(box => {
            if (box.id == boxid) {
              console.log("VALUE: ", typeof box.value)
              return { ...box, value: typeof box.value == 'string' ? true : !box.value }
            }
            return { ...box, value: typeof box.value == 'string' ? false : box.value }
          })
        } : item
      })
    });
  }, []);

  async function getSelectedForm() {
    try {
      const selectedForm: Form | undefined = await api.getFormById(id);
      selectedForm && setCurrentForm(selectedForm);
    } catch (error) {
      console.error('Error fetching form by ID:', error);
    }
  }

  useFocusEffect(
    useCallback(() => {
      getSelectedForm()
    }, [id])
  );

  function formatAnsware(signature: string) {
    const answaredForm = {
      answares: currentQuestions?.map(q => {
        console.log('Q: ', q)
        // const checkboxesAnsware = 
        return { question_id: q.id, answare_text: q.value, answare_checkboxes: q.check_boxes }
      }),
      form_id: id,
      user_id: user?._id,
      signature: signature
    }
    console.log(answaredForm)
    return answaredForm
  }

  async function submit(signature: string) {
    console.log(signature)
    try{
      setIsFormSubmitLoading(true)
      const response = await api.answare(formatAnsware(signature))
      if (response.err) {
        setFeedbackModal("There was an error")
        return
      }
      setFeedbackModal(response.message)
    } catch(e: any){
      console.error(e)
      console.error(e.message)
    } finally{
      setIsFormSubmitLoading(false)
    }
  }

  async function downloadForm() {
    try{
      console.log('ok')
      setIsFormSubmitLoading(true)
      const response = await api.generateAnswaredPdf({ formid: id, userid: user?._id })
      if (response.success) {
        setDownloadFormModal('sucess')
      } else {
        setDownloadFormModal('error')
      }
    } catch(e){
      console.error(e)
    } finally{
      setIsFormSubmitLoading(false)
    }
  }
  const [signModal, setSignModal] = useState(false)
  console.log(id)
  return (
    <SafeAreaView style={{ backgroundColor: 'white', paddingHorizontal: 20, justifyContent: 'center' }}>
      <FlatList
        contentContainerStyle={{ gap: 12, paddingVertical: 40 }}
        data={currentQuestions}
        keyExtractor={(item) => item.id as any}
        ListFooterComponent={() => (
          <View>
            <PrimaryButton isLoading={isFormSubmitLoading} label="Submit" onPress={() => setSignModal(true)} style={{ backgroundColor: colors.primary }} textStyle={{ color: 'white' }} />

          </View>
        )}
        renderItem={(item) => {
          return <RenderQuestion question={item.item} index={item.index} onChangeText={handleChangeText} handleChangeCheckbox={handleChangeCheckbox} />
        }}
      />

      {downloadFormModal && (
        <AnimatedModal position={400} title="Attention">
          {({ closeModal }) =>
            <View>
              <Text>{downloadFormModal == 'sucess' ? 'Your answare was downloaded successfuly' : 'There was an error while downloading your form'}</Text>
              <PrimaryButton label="Ok" onPress={() => closeModal(() => setDownloadFormModal(''))} />
            </View>
          }
        </AnimatedModal>)}

      {feedbackModal && (
        <AnimatedModal position={400} title="Attention">
          {({ closeModal }) =>
            <View>
              <Text>{feedbackModal}</Text>
              <View style={{ gap: 10 }}>
                <PrimaryButton label="Ok" onPress={() => closeModal(() => setFeedbackModal(''))} />
                {feedbackModal != "There was an error" && <PrimaryButton label="Download" onPress={() => closeModal(() => [setFeedbackModal(''), downloadForm()])} />}
              </View>
            </View>
          }
        </AnimatedModal>)}

      {signModal && (
        <AnimatedModal position={700} title="Attention">
          {({ closeModal }) =>
            <View>
              <Text>{feedbackModal}</Text>
              <View style={{ gap: 10, flex: 1 }}>
                <View style={{ height: 600, backgroundColor: 'red' }}>
                  <Signature
                    onOK={(signature) => [submit(signature), closeModal(() => setSignModal(false))]}
                    descriptionText="Assine aqui"
                    clearText="Limpar"
                    confirmText="Salvar"
                    webStyle={`
                  .m-signature-pad {box-shadow: none; border: none;}
                  .m-signature-pad--footer {}
                `}
                  />
                </View>
                {/* <PrimaryButton label="Ok" onPress={() => closeModal(() => [setSignModal(false), submit()])}/> */}
                <PrimaryButton label="Cancel" onPress={() => closeModal(() => setSignModal(false))} />
              </View>
            </View>
          }
        </AnimatedModal>)}
    </SafeAreaView>
  )
}