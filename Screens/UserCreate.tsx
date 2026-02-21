import { SafeAreaView, ScrollView, Text, View } from "react-native";
import PrimaryInput from "../Components/PrimaryInput";
import { useCallback, useState } from "react";
import Select from "../Components/Select";
import api from "../Server/api";
import { useAuth } from "../contexts/AuthContext";
import PrimaryButton from "../Components/PrimaryButton";
import AnimatedModal from "../Components/AnimatedModal";
import { colors } from "../Utils/colors";
import { useFocusEffect } from "@react-navigation/native";
import PermissionTable from "../Components/PermissionTable";

export default function UserCreate() {

  const { user } = useAuth()

  const [successMsg, setSuccessMsg] = useState("")
  const [error, setError] = useState("")

  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [repassword, setRePassword] = useState("")
  const [accessLevel, setAccessLevel] = useState("0")

  const [companies, setCompanies] = useState<any>()
  const [selectedCompany, setSelectedCompany] = useState<any>()
  const [choosedCompany, setChoosedCompany] = useState<any>()


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


    } catch (e) {

    } finally {
      setIsLoading(false)
    }
  }

  async function getCompanies() {
    const companies = await api.getCompanies({})
    console.log(companies.content[0])
    setCompanies(companies.content)
  }

  function getCompanyByName(name: string) {
    if (!companies) return
    const foundCompany = companies.find((company: any) => company.name == name)
    setSelectedCompany(name)
    setChoosedCompany(foundCompany)
    console.log(foundCompany)
  }

  useFocusEffect(
    useCallback(() => {
      getCompanies()

      return () => {
        setName("")
        setEmail("")
        setPassword("")
        setRePassword("")
        setAccessLevel("0")
        setSelectedCompany(undefined)
        setChoosedCompany(undefined)
      }
    }, [])
  )

  return (
    <SafeAreaView style={{ paddingHorizontal: 15, paddingTop: 10, backgroundColor: "white" }}>
      <ScrollView style={{ height: '80%' }}>
        <View style={{ gap: 5, marginBottom: 10 }}>
          <Text>Name</Text>
          <PrimaryInput onChange={setName} value={name} />

          <Text>Email</Text>
          <PrimaryInput onChange={setEmail} value={email} />

          <Text>Password</Text>
          <PrimaryInput isPassword onChange={setPassword} value={password} />

          <Text>Repeat Password</Text>
          <PrimaryInput isPassword onChange={setRePassword} value={repassword} />

          {user && user.access_level == "3" && <View>
            <Text>Company</Text>
            {companies && <Select options={companies.map((company: any) => company.name)} selectedOption={selectedCompany} setSelectedOption={(e: string) => getCompanyByName(e)} />}
          </View>}

          <Text>Access Level</Text>
          {/* <PrimaryInput onChange={setAccessLevel} value={accessLevel}/> */}
          <Select options={["0", "1", "2"]} selectedOption={accessLevel} setSelectedOption={e => setAccessLevel(e)} />
          <PermissionTable userAccessLevel={user?.access_level}/>
        </View>
      </ScrollView>
      <View>
        <PrimaryButton label="Submit" onPress={() => createUser()} isLoading={isLoading} />
      </View>
      {error !== "" && (
        <AnimatedModal position={300} title="Attention!">
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
        <AnimatedModal position={300} title="Attention!">
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