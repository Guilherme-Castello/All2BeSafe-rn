import { FlatList, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import PrimaryButton from "../Components/PrimaryButton";
import { useCallback, useState } from "react";
import api from "../Server/api";
import { useFocusEffect } from "@react-navigation/native";
import PrimaryInput from "../Components/PrimaryInput";
import { colors } from "../Utils/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function SectionManager() {

  const [sections, setSections] = useState<any[]>([])
  const [newSectionName, setNewSectionName] = useState("")


  async function submitNewSection() {
    if(!newSectionName || newSectionName == "") return
    
    const createdSection = await api.newSection({sectionName: newSectionName.toUpperCase()})
    console.log(createdSection)
    await listSections()
  }

  async function deleteSection(sectionId: string) {
    const deleted = await api.deleteSection({id: sectionId})
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
    <SafeAreaView style={{ marginHorizontal: 15, marginTop: 10, gap: 10 }}>
      <Text>New section name</Text>
      <PrimaryInput onChange={setNewSectionName} value={newSectionName}/>
      <PrimaryButton label="Submit" onPress={() => submitNewSection()} isLoading={false} />
      <FlatList
        data={sections}
        renderItem={item => {
          return (
            <View style={{height: 50, justifyContent: 'space-between', flexDirection: "row", alignItems: "center"}}>
              <Text>{item.item.name}</Text>
              <TouchableOpacity onPress={() => deleteSection(item.item._id)}>
                <MaterialCommunityIcons name="trash-can" size={21} color={colors.danger}/>
              </TouchableOpacity>
            </View>
        )
        }}
      />
      
    </SafeAreaView>
  )
}