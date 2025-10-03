import AsyncStorage from "@react-native-async-storage/async-storage";
import { useCallback, useEffect, useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { Form } from "../Types/FormStructure";
import { colors } from "../Utils/colors";
import PrimaryButton from "../Components/PrimaryButton";
import { useNavigation } from "@react-navigation/native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../Server/api";

function FormCard({ title, status, onPress }: { onPress: () => void, title: string, status: string }) {
  return (
    <TouchableOpacity onPress={onPress} style={{ backgroundColor: colors.secondary, justifyContent: 'space-around', flexDirection: 'row', marginHorizontal: 20, paddingVertical: 20, alignItems: 'center', borderRadius: 20 }}>
      <Text>{title}</Text>
      <Text>{status}</Text>
    </TouchableOpacity>
  )
}

export default function FormList() {

  const [loadedForms, setLoadedForms] = useState<Form[]>()

  const navigate = useNavigation()

  useEffect(() => {
    console.log(loadedForms?.[0])
  }, [loadedForms])

  useFocusEffect(
    useCallback(() => {
      console.log('FormList focused')

      async function getForms() {
        // const forms = await AsyncStorage.getItem('forms')
        try {
          const forms: any = await api.getForms();
          forms && setLoadedForms(forms)
        } catch (error) {
          console.error('Error fetching forms from AsyncStorage:', error);
        }
      }
      getForms();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      {/* @ts-ignore */}
      <FlatList contentContainerStyle={{ gap: 10, top: 10 }} data={loadedForms} renderItem={(item) => <FormCard status={item.item.status} title={item.item.title} onPress={() => navigate.navigate("FormViewer", { id: item.item._id })} />} />
    </View>
  )
}