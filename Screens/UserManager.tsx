import { Dimensions, SafeAreaView, ScrollView, Text, View } from "react-native";
import PrimaryInput from "../Components/PrimaryInput";
import { useCallback, useEffect, useState } from "react";
import api from "../Server/api";
import { useAuth } from "../contexts/AuthContext";
import PrimaryButton from "../Components/PrimaryButton";
import AnimatedModal from "../Components/AnimatedModal";
import { colors } from "../Utils/colors";
import { useFocusEffect } from "@react-navigation/native";
import PermissionTable from "../Components/PermissionTable";
import AdaptableTable from "../Components/UsersTable";
import SelectWithoutCallback from "../Components/SelectWithoutCallback";

export default function UserManager() {

  const { user } = useAuth()

  const [successMsg, setSuccessMsg] = useState("")
  const [error, setError] = useState("")
  const [isCreateUserModalOpen, setIsCreateUserModalOpen] = useState(false)

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repassword, setRePassword] = useState("")
  const [accessLevel, setAccessLevel] = useState("0")

  const [companies, setCompanies] = useState<any>()
  const [selectedCompany, setSelectedCompany] = useState<any>()
  const [choosedCompany, setChoosedCompany] = useState<any>()

  const [usersList, setUsersList] = useState<any[]>([])

  const [isLoading, setIsLoading] = useState<boolean>(false)


  async function createUser() {
    if (!user) return
    if (password != repassword) return
    if (user.access_level == "3" && !choosedCompany) return

    setIsLoading(true)
    try {
      const createdUser = await api.registerUser({
        name: name,
        email: email,
        password: password,
        access_level: accessLevel,
        company: user.access_level == "3" ? choosedCompany.code : user.company
      })

      if (!createdUser.success) {
        setError(createdUser.message)
        return
      }
      setSuccessMsg("User created")
      await listUsers()

    } catch (e) {

    } finally {
      setIsLoading(false)
    }
  }

  async function listUsers() {
    try {
      const list = await api.listUsers({ userId: user?._id })
      setUsersList(list)
    } catch (e) {
      console.error(e)
    }
  }

  async function updateUser(userId: string, updatedUser: any) {
    try {
      const updated = await api.updateUser({ userId: userId, updatedUser: updatedUser })
      listUsers()
    } catch (e) {
      console.error(e)
    }
  }

  async function getCompanies() {
    const companies = await api.getCompanies({})
    setCompanies(companies.content)
  }

  function getCompanyByName(name: string) {
    if (!companies) return
    const foundCompany = companies.find((company: any) => company.name == name)
    setSelectedCompany(name)
    setChoosedCompany(foundCompany)
  }

  async function deleteUser(id: string) {
    try {
      await api.deleteUser({ userId: id })
      listUsers()
      setSuccessMsg("User deleted")
    } catch (e) {
      setError("Something went wrong while deleting user")
      console.error(e)
    }
  }

  function resetNewUserState() {
    setName("")
    setEmail("")
    setPassword("")
    setRePassword("")
    setAccessLevel("0")
    setSelectedCompany(undefined)
    setChoosedCompany(undefined)
  }

  useEffect(() => {
    listUsers()
  }, [])

  useFocusEffect(
    useCallback(() => {
      getCompanies()
      listUsers()

      return () => {
        resetNewUserState()
      }
    }, [])
  )

  return (
    <SafeAreaView style={{ paddingHorizontal: 15, paddingTop: 10, backgroundColor: "white" }}>
      <ScrollView style={{ height: '80%' }}>
        <View style={{ gap: 5, marginBottom: 10 }}>
          <AdaptableTable updateUser={updateUser} usersList={usersList} deleteUser={deleteUser} />
        </View>
      </ScrollView>
      <View>
        <PrimaryButton label="Create User" onPress={() => setIsCreateUserModalOpen(true)} isLoading={isLoading} />
      </View>
      {isCreateUserModalOpen && (
        <AnimatedModal onClose={() => setIsCreateUserModalOpen(false)} position={Dimensions.get("screen").height * 0.7} title="Create new user">
          {({ closeModal }) => (
            <View style={{ flex: 1 }}>
              <ScrollView style={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
                <View style={{ gap: 5, marginBottom: 10 }}>
                  <Text>Name</Text>
                  <PrimaryInput onChange={setName} value={name} />

                  <Text>Email</Text>
                  <PrimaryInput autoCapitalize="none" onChange={setEmail} value={email} />

                  <Text>Password</Text>
                  <PrimaryInput isPassword onChange={setPassword} value={password} />

                  <Text>Repeat Password</Text>
                  <PrimaryInput isPassword onChange={setRePassword} value={repassword} />

                  {user && user.access_level == "3" && <View>
                    <Text>Company</Text>
                    {companies && <SelectWithoutCallback options={companies.map((company: any) => company.name)} selectedOption={selectedCompany} setSelectedOption={(e: string) => getCompanyByName(e)} />}
                  </View>}

                  <Text>Access Level</Text>
                  <SelectWithoutCallback options={["0", "1", "2"]} selectedOption={accessLevel} setSelectedOption={e => setAccessLevel(e)} />
                  <PermissionTable userAccessLevel={user?.access_level} />
                </View>

                <View style={{ gap: 5 }}>

                  <PrimaryButton label="Submit" onPress={() => closeModal(() => [setIsCreateUserModalOpen(false), createUser(), resetNewUserState()])} isLoading={isLoading} />

                  <PrimaryButton
                    style={{ backgroundColor: colors.danger }}
                    textStyle={{ color: "white", fontSize: 18 }}
                    label="Close"
                    onPress={() => closeModal(() => [setIsCreateUserModalOpen(false), resetNewUserState()])}
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