import { ReactNode, useEffect, useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
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
  images?: string[]
}


export default function QuestionContainer({ answareNote, images, children, title, aId = "0", id = '0', canDelete = false, onDelete, hasConfig = true, hasPhoto = false, uploadImage }: QuestionContainerProps) {

  const [urlList, setUrlList] = useState<string[]>([])
  const [isNoteModalOpen, setIsNoteModalOpen] = useState(false)
  const [isMediaModalOpen, setIsMediaModalOpen] = useState(false)
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
      images.map(image =>
        api.getImageUrl({ fileName: image })
      )
    );
    setUrlList(urls.map(url => url.content));
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
    <View style={{ backgroundColor: colors.primary + '25', paddingVertical: 10, paddingHorizontal: 10, gap: 10, borderRadius: 10 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
        <Text style={{ fontSize: 17 }}>{id}- {title}</Text>
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
      {hasPhoto && <ScrollView horizontal>
        <View style={{ flexDirection: 'row', marginHorizontal: 20, gap: 5 }}>
          {urlList.map((url, index) => {
            return <Image
              source={url}
              key={index}
              style={{ width: 70, height: 70, borderRadius: 10 }}
              contentFit="cover"
              cachePolicy="memory-disk"
            />
          })}
        </View>
      </ScrollView>}

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

      {isMediaModalOpen && (
        <AnimatedModal onClose={() => setIsMediaModalOpen(false)} position={230} title="Add Media">
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
    </View>
  )
}