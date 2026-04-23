import { ActivityIndicator, FlatList, Text, View } from "react-native"
import { colors } from "../Utils/colors"
import FormCard from "../Components/FormCard"
import { useCallback, useEffect, useState } from "react"
import api from "../Server/api"
import { router } from "expo-router"
import LoadingContainer from "../Components/LoadingContainer"
import { useAuth } from "../contexts/AuthContext"
import { useFocusEffect } from "@react-navigation/native"

export default function ArchivedAnswares() {

  const { user } = useAuth()

  const [archivedAnswares, setArchivedAnswares] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function getArchivedAnswares() {
    setIsLoading(true)
    try {
      const response = await api.getArchivedAnswares({ uId: user?._id })
      setArchivedAnswares(response)
    } catch (e) {
      console.error(e)
    } finally {
      setIsLoading(false)
    }
  }

  useFocusEffect(
    useCallback(() => {
      getArchivedAnswares();
    }, [])
  );

  return (
    <View style={{ flex: 1, backgroundColor: 'white' }}>
      <LoadingContainer condition={isLoading}>
        {archivedAnswares?.length > 0 ? <FlatList
          contentContainerStyle={{ gap: 10, top: 10, paddingBottom: 100 }}
          data={archivedAnswares}
          keyExtractor={(item: any) => item.answare_id || Math.random().toString()}
          renderItem={(item: any) => {
            console.log(item)
            return (
              <FormCard
                isAnsware
                aId={item.item.answare_id}
                getForms={getArchivedAnswares}
                title={item.item.name}
                description={`Template: ${item.item.config.name}`}
                status={item.item.status}
                onPress={() => router.push(`/AnswareDetails/${item.answare_id}`)}
              />
            )
          }}
        /> : <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text>No archived answares</Text>
        </View>
        }

      </LoadingContainer>
    </View>
  )
} 