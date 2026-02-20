import { Text, View } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { useEffect, useState } from "react";
import AnimatedModal from "./AnimatedModal";
import Signature from "react-native-signature-canvas";
import * as FileSystem from 'expo-file-system'
import { FormItem } from "../Types/FormStructure";
import api from "../Server/api";
import { Image } from "expo-image";

export default function SignatureQuestionContainer({
  onChangeText,
  index,
  question,
  handleChangeSignature,
  hasConfig,
  autoSaveFn }: {
    hasConfig?: boolean
    autoSaveFn: (() => void) | undefined,
    handleChangeSignature: (receivedIndex: number, uri: string) => void,
    question: FormItem,
    onChangeText: (index: number, value: string) => void,
    index: number
  }) {

  const [url, setUrl] = useState()
  const [isOpen, setIsOpen] = useState(false)
  console.log(question)
  async function base64ToFile(base64: string) {
    // remove header se existir
    const cleanBase64 = base64.replace(/^data:image\/\w+;base64,/, '')

    const fileUri = `${FileSystem.cacheDirectory}signature.png`

    await FileSystem.writeAsStringAsync(
      fileUri,
      cleanBase64,
      { encoding: FileSystem.EncodingType.Base64 }
    )

    return fileUri
  }

  async function submit(signature: string) {
    const uri = await base64ToFile(signature)
    const uploadedImage = await api.uploadImage(uri)
    console.log(uploadedImage)
    handleChangeSignature(index, uploadedImage.fileName)
  }

  async function getUrl(image: string) {
    if(image == "") return
    
    console.log('CALLING');
    setUrl(undefined)
    const url = await api.getImageUrl({ fileName: image })
    setUrl(url);
  }

  useEffect(() => {
    if(!question || hasConfig) return
    getUrl(question.value)
  }, [question])

  return (
    <>
      <View style={{alignItems: 'center', gap: 16}}>
        <PrimaryButton style={{width: '100%'}} label="Asign" onPress={() => [hasConfig ? () => console.warn('disabled on create form screen') : setIsOpen(true)]} />
        {url && <Image
          source={url}
          key={index}
          style={{ width: 200, height: 200, borderRadius: 10, backgroundColor: 'white' }}
          contentFit="cover"
          cachePolicy="memory-disk"
        />}
      </View>
      {isOpen && (
        <AnimatedModal position={700} title="Attention">
          {({ closeModal }) =>
            <View>
              <Text>Insert your sign</Text>
              <View style={{ gap: 10, flex: 1 }}>
                <View style={{ height: 600, backgroundColor: 'red' }}>
                  <Signature
                    onOK={(signature) => [submit(signature), closeModal(() => setIsOpen(false))]}
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
                <PrimaryButton label="Cancel" onPress={() => closeModal(() => setIsOpen(false))} />
              </View>
            </View>
          }
        </AnimatedModal>)}
    </>
  )
}