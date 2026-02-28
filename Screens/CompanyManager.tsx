import { SafeAreaView, ScrollView, Text, View } from "react-native";
import PrimaryInput from "../Components/PrimaryInput";
import { useState } from "react";
import api from "../Server/api";
import { useAuth } from "../contexts/AuthContext";
import PrimaryButton from "../Components/PrimaryButton";
import AnimatedModal from "../Components/AnimatedModal";
import { colors } from "../Utils/colors";

export default function CompanyManager() {

  const { user } = useAuth()

  const [successMsg, setSuccessMsg] = useState("")
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [inChargeName, setInChargeName] = useState("")

  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function createCompany() {
    if (!user) return
    if (!inChargeName) return
    if (!name) return

    setIsLoading(true)
    try {
      const createdCompany = await api.registerCompany({
        name: name,
        in_charge: inChargeName
      })

      if(!createdCompany.success){
        setError(createdCompany.message)
        return
      }
      setSuccessMsg("Company created")
    } catch (e) {

    } finally {
      setIsLoading(false)
    }
  }

  return (
    <SafeAreaView style={{ paddingHorizontal: 15, paddingTop: 10, backgroundColor: "white" }}>
      <ScrollView style={{ height: '80%' }}>
        <View style={{ gap: 5 }}>
          <Text>Company Name</Text>
          <PrimaryInput onChange={setName} value={name} />
          <Text>In Charge Name</Text>
          <PrimaryInput onChange={setInChargeName} value={inChargeName} />
        </View>
      </ScrollView>
      <View>
        <PrimaryButton label="Submit" onPress={() => createCompany()} isLoading={isLoading} />
      </View>
      {error !== "" && (
        <AnimatedModal onClose={() => setError("")} position={300} title="Attention!">
          {({ closeModal }) => (
            <View style={{ gap: 20 }}>
              <Text>{error}</Text>
              <PrimaryButton
                style={{ backgroundColor: colors.danger }}
                textStyle={{ color: "white", fontSize: 18 }}
                label="Close"
                onPress={() => closeModal(() => setError(""))}
              />
            </View>
          )}
        </AnimatedModal>
      )}
      {successMsg !== "" && (
        <AnimatedModal onClose={() => setSuccessMsg("")} position={300} title="Attention!">
          {({ closeModal }) => (
            <View style={{ gap: 20 }}>
              <Text>{successMsg}</Text>
              <PrimaryButton
                style={{ backgroundColor: colors.danger }}
                textStyle={{ color: "white", fontSize: 18 }}
                label="Close"
                onPress={() => closeModal(() => setSuccessMsg(""))}
              />
            </View>
          )}
        </AnimatedModal>
      )}
    </SafeAreaView>
  )
}