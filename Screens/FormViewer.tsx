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
import AsyncStorage from "@react-native-async-storage/async-storage";
import LoadingContainer from "../Components/LoadingContainer";
import RenderQuestionContainer from "../Components/RenderQuestionContainer";

export default function FormViewer() {

  const route = useRoute();

  const { id = undefined, isAnsware, aName } = route.params as { id: string | undefined, isAnsware: boolean, aName: string };
  const [currentQuestions, setCurrentQuestions] = useState<FormItem[]>()
  const [currentForm, setCurrentForm] = useState<Form>()
  const [downloadFormModal, setDownloadFormModal] = useState<string>('')
  const [feedbackModal, setFeedbackModal] = useState<string>('')

  const [isFormSubmitLoading, setIsFormSubmitLoading] = useState<boolean>(false)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  const [firstAnswareId, setFirstAnswareId] = useState()

  const [sectionPercentages, setSectionPercentages] = useState<{
    section_name: string;
    percentage: number;
  }[] | undefined>()

  const { user, setCurrentOpenForm } = useAuth()
  const [forcedSave, setForcedSave] = useState<number>(0)

  useEffect(() => {
    currentForm && setCurrentQuestions(currentForm.questions)
  }, [currentForm])

  useEffect(() => {
    autoSave()
  }, [forcedSave])

  // Sim, essa function está bem estranha rs

  // Basicamente, o autosave() nem sempre funciona quando precisamos que ele rode logo após a atualizaçao de alguma image, entao
  // criei um mecanismo que observa um estado externo (forcedSave). Toda vez que forceAutoSave() é chamado, ele atualiza o estado
  // forcedSave, que está sendo observado por um useEffect que roda a funçao autoSave()

  // Em caso de duvidas, pode me chamar
  function forceAutoSave() {
    setForcedSave(prev => prev + 1)
  }

  const handleChangeSignature = useCallback(async (receivedIndex: number, newText: string) => {
    setCurrentQuestions((prev) => {
      if (prev == undefined) return undefined
      const test = prev.map((item, index) => {
        if (index == receivedIndex) {
          return { ...item, value: newText }
        } else { return item }
      })
      return test
    });

    forceAutoSave()
  }, []);

  const handleChangeImage = useCallback(async (receivedIndex: number, newText: string) => {
    setCurrentQuestions((prev) => {
      if (prev == undefined) return undefined
      const test = prev.map((item, index) => {
        if (index == receivedIndex) {
          // @ts-ignore
          if (item.answare_images) {
            // @ts-ignore
            return { ...item, answare_images: [...item.answare_images, newText] }
          } else {
            // @ts-ignore
            return { ...item, answare_images: [newText] }
          }
        } else { return item }
      })
      return test
    });

    forceAutoSave()
  }, []);

  const handleChangeText = useCallback((receivedIndex: number, newText: string) => {
    setCurrentQuestions((prev) => {
      if (prev == undefined) return undefined
      const test = prev.map((item, index) => {
        if (index == receivedIndex) {
          return { ...item, value: newText }
        } else { return item }
      })
      return test
    });
  }, []);

  const handleChangeCoords = useCallback((receivedIndex: number, newCoord: { latitude: string, longitude: string }) => {
    setCurrentQuestions((prev) => {
      if (prev == undefined) return undefined
      const test = prev.map((item, index) => {
        if (index === receivedIndex) {
          return { ...item, coords: newCoord }
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
      setIsLoading(true)
      if (!isAnsware && id) {
        const selectedForm: Form | undefined = await api.getFormById(id);
        selectedForm && setCurrentForm(selectedForm);
      } else {
        const selectedForm: Form | undefined = await api.getAnswaredForm({ aId: id });
        selectedForm && setCurrentForm(selectedForm);
      }
      autoSave()
    } catch (error) {
      console.error('Error fetching form by ID:', error);
    } finally {
      setIsLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getSelectedForm()

      return () => {
        setFirstAnswareId(undefined)
        setCurrentOpenForm('')
        setSectionPercentages(undefined)
        setIsLoading(true)
      }
    }, [id])
  );

  useEffect(() => {
    if (!isLoading && currentForm?.config?.name) {
      if (isAnsware) {
        setCurrentOpenForm(aName)
      } else {
        setCurrentOpenForm(currentForm?.config?.name)
      }
    }
  }, [isLoading, currentForm])

  function formatAnsware(signature?: string, image?: string) {
    const answaredForm = {
      answares: currentQuestions?.map(q => {
        // const checkboxesAnsware = 
        // @ts-ignore
        return { question_id: q.id, answare_text: q.value, answare_checkboxes: q.check_boxes, answare_coords: q.coords, answare_images: q.answare_images }
      }),
      template_id: id,
      user_id: user?._id,
      name: aName,
      signature: signature
    }
    return answaredForm
  }

  async function submit() {
    try {
      setIsFormSubmitLoading(true)

      if (isAnsware || firstAnswareId != undefined) {
        const response = await api.updateAnsware({ aId: firstAnswareId || id, updatedAnware: formatAnsware() })

        setSectionPercentages(response.content.complete_percentage)
        if (response.err) {
          setFeedbackModal("There was an error")
          return
        }
        setFeedbackModal(response.content.message)
      } else {
        const response = await api.answare(formatAnsware())
        if (response.err) {
          setFeedbackModal("There was an error")
          return
        }

        setFeedbackModal(response.content.message)
      }
    } catch (e: any) {
      console.error(e)
      console.error(e.message)
    } finally {
      setIsFormSubmitLoading(false)
    }
  }

  async function downloadForm() {
    try {
      setIsFormSubmitLoading(true)
      const currentId = (firstAnswareId != undefined) ? firstAnswareId : id
      const response = await api.generateAnswaredPdf({ answare_id: currentId, userid: user?._id, formName: aName })
      if (response.success) {
        setDownloadFormModal('sucess')
      } else {
        setDownloadFormModal('error')
      }
    } catch (e) {
      console.error(e)
    } finally {
      setIsFormSubmitLoading(false)
    }
  }

  async function autoSave(imageUrl?: string) {
    try {
      if (isAnsware || firstAnswareId != undefined) {
        const response = await api.updateAnsware({ aId: firstAnswareId || id, updatedAnware: formatAnsware('', imageUrl) })

        setSectionPercentages(response.content.complete_percentage)
        if (response.err) {
          console.log('error')
        }
      } else {
        const response = await api.answare(formatAnsware('', imageUrl))

        setSectionPercentages(response.content.complete_percentage)
        setFirstAnswareId(response.content._id)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function uploadImage(uri: string, id: string) {
    const response = await api.uploadImage(uri)
    handleChangeImage(Number(id), response.fileName)
    // await autoSave(response.fileName)
  }

  return (
    <SafeAreaView style={{ backgroundColor: 'white', justifyContent: 'center' }}>
      <LoadingContainer condition={isLoading}>
        {currentQuestions && <RenderQuestionContainer
          aId={(firstAnswareId != undefined) ? firstAnswareId : id}
          sectionPercentage={sectionPercentages}
          handleChangeSignature={handleChangeSignature}
          uploadImage={uploadImage}
          formQuestions={currentQuestions}
          handleChangeCheckbox={handleChangeCheckbox}
          onChangeText={handleChangeText}
          handleChangeCoords={handleChangeCoords}
          hasFooterButton
          isFooterButtonLoading={isFormSubmitLoading}
          onSubmit={submit}
          autoSaveFn={autoSave}
        />}
      </LoadingContainer>

      {downloadFormModal && (
        <AnimatedModal onClose={() => setDownloadFormModal("")} position={400} title="Attention">
          {({ closeModal }) =>
            <View>
              <Text>{downloadFormModal == 'sucess' ? 'Your answare was downloaded successfuly' : 'There was an error while downloading your form'}</Text>
              <PrimaryButton label="Ok" onPress={() => closeModal(() => setDownloadFormModal(''))} />
            </View>
          }
        </AnimatedModal>)}

      {feedbackModal && (
        <AnimatedModal onClose={() => setFeedbackModal("")} position={400} title="Attention">
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
    </SafeAreaView>
  )
}