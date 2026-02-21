import { FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import PrimaryButton from "../Components/PrimaryButton";
import { useCallback, useState } from "react";
import api from "../Server/api";
import { useFocusEffect } from "@react-navigation/native";
import PrimaryInput from "../Components/PrimaryInput";
import { colors } from "../Utils/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import AnimatedModal from "../Components/AnimatedModal";

export default function SectionManager() {

  const [sections, setSections] = useState<any[]>([])
  const [newSectionName, setNewSectionName] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  async function submitNewSection() {
    if (!newSectionName || newSectionName == "") return
    const createdSection = await api.newSection({ sectionName: newSectionName.toUpperCase() })
    if(createdSection && !createdSection.sucess) {
      setErrorMsg(createdSection.message ?? "Something went wrong")
    }
    console.log(createdSection)
    await listSections()
  }

  async function deleteSection(sectionId: string) {
    const deleted = await api.deleteSection({ id: sectionId })
    await listSections()
  }

  async function listSections() {
    const sectionsReturned = await api.listSections({})
    setSections(sectionsReturned.content)
  }

  useFocusEffect(
    useCallback(() => {
      listSections()
      return () => {

      }
    }, [])
  )

  return (
    <SafeAreaView style={{ paddingHorizontal: 15, paddingTop: 10, backgroundColor: "white", gap: 10, height: "100%" }}>
      <Text>New section name</Text>
      <PrimaryInput onChange={setNewSectionName} value={newSectionName} />
      <PrimaryButton label="Submit" onPress={() => submitNewSection()} isLoading={false} />
      <FlatList
        data={sections}
        renderItem={item => {
          return (
            <View style={{ height: 50, justifyContent: 'space-between', flexDirection: "row", alignItems: "center" }}>
              <Text>{item.item.name}</Text>
              <TouchableOpacity onPress={() => deleteSection(item.item._id)}>
                <MaterialCommunityIcons name="trash-can" size={21} color={colors.danger} />
              </TouchableOpacity>
            </View>
          )
        }}
      />
      {errorMsg !== "" && (
        <AnimatedModal position={300} title="Attention!">
          {({ closeModal }) => (
            <View style={{ gap: 20 }}>
              <Text>{errorMsg}</Text>
              <PrimaryButton
                style={{ backgroundColor: colors.danger }}
                textStyle={{ color: "white", fontSize: 18 }}
                label="Close"
                onPress={() => closeModal(() => setErrorMsg(""))}
              />
            </View>
          )}
        </AnimatedModal>
      )}
    </SafeAreaView>
  )
}