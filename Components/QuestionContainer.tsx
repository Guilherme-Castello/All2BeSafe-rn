import { ReactNode, useEffect, useState } from "react";
import { Alert, Text, TouchableOpacity, View } from "react-native";
import { colors } from "../Utils/colors";
import { Image } from 'expo-image';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import * as ImagePicker from 'expo-image-picker';
import api from "../Server/api";
import { ScrollView } from "react-native-gesture-handler";
import AnimatedModal from "./AnimatedModal";
import PrimaryButton from "./PrimaryButton";
import PrimaryInput from "./PrimaryInput";

interface QuestionContainerProps {
  children: ReactNode;
  title: string
  id?: string
  canDelete?: boolean
  hasConfig?: boolean
  hasPhoto?: boolean
  onDelete?: () => void
  aId?: string
  answareNote?: string,
  uploadImage?: (uri: string, id: string) => void
  deleteImage?: (filename: string, questionIndex: number) => void
  images?: string[]
  onLongPress?: (a: string) => void,
  qId: string
  required_answare?: boolean
}


export default function QuestionContainer({ qId, onLongPress, answareNote, images, children, title, aId = "0", id = '0', canDelete = false, onDelete, hasConfig = true, hasPhoto = false, uploadImage, deleteImage, required_answare = false }: QuestionContainerProps) {

  const [urlList, setUrlList] = useState<string[]>([])
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
  const [isImageViewOpen, setIsImageViewOpen] = useState(false)
  const [selectedImageIdx, setSelectedImageIdx] = useState<number>(0)
  const [newNote, setNewNote] = useState("")

  async function handlePickFromGallery() {
    setIsMediaModalOpen(false)
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result || result.canceled || !uploadImage) return
    // @ts-ignore
    uploadImage(result.assets[0].uri, parseInt(id) - 1)
  }

  async function handleTakePhoto() {
    setIsMediaModalOpen(false)
    const { status } = await ImagePicker.requestCameraPermissionsAsync()
    if (status !== 'granted') return
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });
    if (!result || result.canceled || !uploadImage) return
    // @ts-ignore
    uploadImage(result.assets[0].uri, parseInt(id) - 1)
  }

  async function handleAddNote() {
    try {
      if (!aId || !id) return
      const result = await api.addNote({ aId: aId, qId: String(parseInt(id) - 1), aNote: newNote })
    } catch (e) {

    }
  }

  async function getUrl(images: string[]) {
    setUrlList([])
    const urls = await Promise.all(
      images.map(image => api.getImageUrl({ fileName: image }))
    );
    setUrlList(urls.map(url => url.content));
  }

  function handleOpenImageView(index: number) {
    setSelectedImageIdx(index)
    setIsImageViewOpen(true)
  }

  // Lógica de exclusão:
  // 1. Exibe Alert de confirmação nativo (bloqueante, sobre qualquer modal)
  // 2. No confirm: chama API para deletar o arquivo do GCS (fire-and-forget)
  // 3. Remove a URL da urlList local → thumbnail desaparece imediatamente
  // 4. Notifica o FormViewer via `deleteImage` para remover o filename do estado
  //    da questão e disparar o auto-save, persistindo a remoção no banco
  function handleDeleteImage(
    idx: number,
    closeModal: (cb: () => void) => void
  ) {
    Alert.alert(
      'Delete Image',
      'Are you sure you want to delete this image?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const filename = images?.[idx]
            if (!filename) return

            closeModal(() => {
              setIsImageViewOpen(false)
              // Remove do GCS (assíncrono, não bloqueia a UI)
              api.deleteImage({ fileName: filename }).catch(console.error)
              // Remove da lista local de URLs imediatamente
              setUrlList(prev => prev.filter((_, i) => i !== idx))
              // Notifica o FormViewer para atualizar o estado e auto-salvar
              deleteImage && deleteImage(filename, parseInt(id) - 1)
            })
          }
        }
      ]
    )
  }


  useEffect(() => {
    if(!answareNote) return

    setNewNote(answareNote)
  }, [answareNote])

  useEffect(() => {
    if (!hasPhoto) return
    if (!images) return
    if (images && images?.length <= 0) return
    getUrl(images)
  }, [images])
  
  return (
    <TouchableOpacity onLongPress={() => onLongPress && onLongPress(qId)} style={{ backgroundColor: colors.primary + '25', paddingVertical: 10, paddingHorizontal: 10, gap: 10, borderRadius: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 17 }}>{title}</Text>
          {required_answare && (
            <Text style={{ fontSize: 11, color: colors.danger, fontWeight: '600' }}>* Required</Text>
          )}
        </View>
        {canDelete && <TouchableOpacity onPress={() => onDelete && onDelete()} style={{ backgroundColor: colors.danger, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
          <Text style={{ color: 'white' }}>X</Text>
        </TouchableOpacity>}
      </View>
      <View style={{ marginHorizontal: 20 }}>
        {children}
      </View>

      {/*
        Fazer a Logica se tem foto hasPhoto pelo menos uma aparecer os slots
        caso clicar na foto abrir ampliada num modal com a opção de excluir foto

        icones https://pictogrammers.com/library/mdi/
      */}
      {hasPhoto && (
        <ScrollView horizontal>
          <View style={{ flexDirection: 'row', marginHorizontal: 20, gap: 5 }}>
            {urlList.map((url, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => handleOpenImageView(index)}
                activeOpacity={0.8}
              >
                <Image
                  source={url}
                  style={{ width: 70, height: 70, borderRadius: 10 }}
                  contentFit="cover"
                  cachePolicy="memory-disk"
                />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      )}

      {hasConfig && <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20 }}>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setIsNoteModalOpen(true)}>
          <MaterialCommunityIcons name="book-edit" size={20} />
          <Text style={{ marginLeft: 6, fontSize: 14 }}>Add Note</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => setIsMediaModalOpen(true)}>
          <MaterialCommunityIcons name="camera-plus" size={20} />
          <Text style={{ marginLeft: 6, fontSize: 14 }}>Media</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }} onPress={() => console.log('implement')}>
          <MaterialCommunityIcons name="account-hard-hat" size={20} />
          <Text style={{ marginLeft: 6, fontSize: 14 }}>Action</Text>
        </TouchableOpacity>
      </View>}
      {isNoteModalOpen && (
        <AnimatedModal onClose={() => setIsNoteModalOpen(false)} position={500} title="Insert your note">
          {({ closeModal }) => (
            <View style={{ gap: 20 }}>
              <PrimaryInput label="Note:" multiline numberOfLines={5} onChange={setNewNote} value={newNote} inputStyle={{ minHeight: 120 }} />
              <PrimaryButton
                textStyle={{ color: "white", fontSize: 18 }}
                label="Send"
                onPress={() => closeModal(() => [setIsNoteModalOpen(false), handleAddNote()])}
              />
              <PrimaryButton
                style={{ backgroundColor: colors.danger }}
                textStyle={{ color: "white", fontSize: 18 }}
                label="Close"
                onPress={() => closeModal(() => setIsNoteModalOpen(false))}
              />
            </View>
          )}
        </AnimatedModal>
      )}

      {isImageViewOpen && urlList[selectedImageIdx] && (
        <AnimatedModal onClose={() => setIsImageViewOpen(false)} position={600} title="Image">
          {({ closeModal }) => (
            <View style={{ gap: 14 }}>
              <Image
                source={urlList[selectedImageIdx]}
                style={{ width: '100%', height: 300, borderRadius: 10 }}
                contentFit="contain"
                cachePolicy="memory-disk"
              />
              <PrimaryButton
                label="Close"
                onPress={() => closeModal(() => setIsImageViewOpen(false))}
              />
              <PrimaryButton
                style={{ backgroundColor: colors.danger }}
                textStyle={{ color: 'white', fontSize: 16 }}
                label="Delete Image"
                onPress={() => handleDeleteImage(selectedImageIdx, closeModal)}
              />
            </View>
          )}
        </AnimatedModal>
      )}

      {isMediaModalOpen && (
        <AnimatedModal onClose={() => setIsMediaModalOpen(false)} position={400} title="Add Media">
          {({ closeModal }) => (
            <View style={{ gap: 14 }}>
              <TouchableOpacity
                onPress={() => closeModal(handlePickFromGallery)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.primary + '20', borderRadius: 12, padding: 16 }}
              >
                <MaterialCommunityIcons name="image-multiple" size={28} color={colors.primary} />
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>Gallery</Text>
                  <Text style={{ fontSize: 13, color: 'gray' }}>Choose an existing photo</Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => closeModal(handleTakePhoto)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 14, backgroundColor: colors.primary + '20', borderRadius: 12, padding: 16 }}
              >
                <MaterialCommunityIcons name="camera" size={28} color={colors.primary} />
                <View>
                  <Text style={{ fontSize: 16, fontWeight: '600' }}>Camera</Text>
                  <Text style={{ fontSize: 13, color: 'gray' }}>Take a photo now</Text>
                </View>
              </TouchableOpacity>

              <PrimaryButton
                style={{ backgroundColor: colors.danger }}
                textStyle={{ color: 'white', fontSize: 16 }}
                label="Cancel"
                onPress={() => closeModal(() => setIsMediaModalOpen(false))}
              />
            </View>
          )}
        </AnimatedModal>
      )}
    </TouchableOpacity>
  )
}