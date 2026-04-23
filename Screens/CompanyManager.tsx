import { Dimensions, SafeAreaView, ScrollView, Text, View } from "react-native";
import PrimaryInput from "../Components/PrimaryInput";
import { useCallback, useState } from "react";
import api from "../Server/api";
import { useAuth } from "../contexts/AuthContext";
import PrimaryButton from "../Components/PrimaryButton";
import AnimatedModal from "../Components/AnimatedModal";
import { colors } from "../Utils/colors";
import { useFocusEffect } from "@react-navigation/native";
import CompaniesTable from "../Components/CompaniesTable";

export default function CompanyManager() {

  const { user } = useAuth()

  const [successMsg, setSuccessMsg] = useState("")
  const [error, setError] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

  const [name, setName] = useState("")
  const [inChargeName, setInChargeName] = useState("")

  const [companiesList, setCompaniesList] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(false)

  async function updateCompany(companyId: string, updatedCompany: any) {
    try {
      await api.updateCompany({ companyId, updatedCompany, requestingUserId: user?._id })
      await listCompanies()
      setSuccessMsg("Company updated")
    } catch (e) {
      setError("Something went wrong while updating company")
      console.error(e)
    }
  }

  async function deleteCompany(companyId: string) {
    try {
      await api.deleteCompany({ companyId })
      await listCompanies()
      setSuccessMsg("Company deleted")
    } catch (e) {
      setError("Something went wrong while deleting company")
      console.error(e)
    }
  }

  async function listCompanies() {
    try {
      const response = await api.getCompanies({})
      if (response?.content) {
        setCompaniesList(response.content)
      }
    } catch (e) {
      console.error(e)
    }
  }

  async function createCompany() {
    if (!user) return
    if (!name) return
    if (!inChargeName) return

    setIsLoading(true)
    try {
      const created = await api.registerCompany({
        name: name,
        in_charge: inChargeName,
      })

      if (!created.success) {
        setError(created.message)
        return
      }

      setSuccessMsg("Company created")
      await listCompanies()
    } catch (e) {
      setError("Something went wrong while creating company")
    } finally {
      setIsLoading(false)
    }
  }

  function resetForm() {
    setName("")
    setInChargeName("")
  }

  useFocusEffect(
    useCallback(() => {
      listCompanies()
      return () => {
        resetForm()
      }
    }, [])
  )

  return (
    <SafeAreaView style={{ paddingHorizontal: 15, paddingTop: 10, backgroundColor: "white" }}>
      <ScrollView style={{ height: '80%' }}>
        <View style={{ gap: 5, marginBottom: 10 }}>
          <CompaniesTable
            companiesList={companiesList}
            updateCompany={updateCompany}
            deleteCompany={deleteCompany}
            user={user}
          />
        </View>
      </ScrollView>

      <View>
        <PrimaryButton label="Create Company" onPress={() => setIsCreateModalOpen(true)} isLoading={isLoading} />
      </View>

      {isCreateModalOpen && (
        <AnimatedModal onClose={() => setIsCreateModalOpen(false)} position={Dimensions.get("screen").height * 0.6} title="Create new company">
          {({ closeModal }) => (
            <View style={{ gap: 20 }}>
              <ScrollView style={{ height: '90%' }}>
                <View style={{ gap: 5, marginBottom: 10 }}>
                  <Text>Company Name</Text>
                  <PrimaryInput onChange={setName} value={name} />

                  <Text>In Charge Name</Text>
                  <PrimaryInput onChange={setInChargeName} value={inChargeName} />
                </View>

                <View style={{ gap: 5 }}>
                  <PrimaryButton
                    label="Submit"
                    onPress={() => closeModal(() => [setIsCreateModalOpen(false), createCompany(), resetForm()])}
                    isLoading={isLoading}
                  />
                  <PrimaryButton
                    style={{ backgroundColor: colors.danger }}
                    textStyle={{ color: "white", fontSize: 18 }}
                    label="Close"
                    onPress={() => closeModal(() => [setIsCreateModalOpen(false), resetForm()])}
                  />
                </View>
              </ScrollView>
            </View>
          )}
        </AnimatedModal>
      )}

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
