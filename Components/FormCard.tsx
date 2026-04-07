import { useState } from "react"
import api from "../Server/api"
import { colors } from "../Utils/colors"
import { Text, TouchableOpacity, View } from "react-native"
import { Image } from "expo-image"
import { MaterialIcons } from "@expo/vector-icons"
import AnimatedModal from "./AnimatedModal"
import PrimaryButton from "./PrimaryButton"

export default function FormCard({ getForms, aId, description, title, status, onPress, isAnsware = false }: { getForms?: () => Promise<void>, aId?: string, isAnsware: boolean, onPress: () => void, title: string, status: string, description: string }) {
  const [optionsAnswareModalOpen, setAnswareOptionsModalOpen] = useState<boolean>(false)
  const [optionsTemplateModalOpen, setTemplateOptionsModalOpen] = useState<boolean>(false)

  async function setAsDone() {
    await api.setAsDone({ aId })
    getForms && await getForms()
  }

  function getStatusColor() {
    switch (status) {
      case 'open':
        return colors.primary
      case 'in_progress':
        return colors.secondary
      case 'done':
        return colors.safe
      default:
        return colors.primary
    }
  }

  function translateStatus() {
    switch (status) {
      case 'open': return 'Open'
      case 'in_progress': return 'In Progress'
      case 'done': return 'Done'
      default: return status
    }
  }

  return (
    <>
      <TouchableOpacity onLongPress={() => isAnsware ? setAnswareOptionsModalOpen(true) : setTemplateOptionsModalOpen(true)} onPress={onPress} style={{ backgroundColor: colors.primary + '50', flexDirection: 'row', justifyContent: 'space-around', marginHorizontal: 10, paddingVertical: 20, alignItems: 'center', borderRadius: 20 }}>
        <View style={{ width: '15%' }}>
          <Image source={require('../assets/all2bsafe.png')} style={{ width: 50, height: 50, borderRadius: 10 }} />
        </View>
        <View style={{ width: '80%' }}>
          <View style={{ width: '100%', flexDirection: 'row', justifyContent: 'space-between' }}>
            <Text style={{ fontSize: 16, fontWeight: '700', maxWidth: '75%' }}>{title}</Text>
            <Text style={[{ backgroundColor: getStatusColor(), color: 'white', paddingHorizontal: 4, paddingVertical: 2, maxHeight: 27, borderRadius: 8 }]}>{translateStatus()}</Text>
          </View>
          <View style={{ width: '100%' }}>
            <Text>{description}</Text>
            {!isAnsware && <View style={{ flexDirection: 'row', alignContent: 'center', alignItems: 'center', gap: 5 }}>
              <MaterialIcons name="person" size={15} />
              <Text>All 2B Safe (office)</Text>
            </View>}
          </View>
        </View>
      </TouchableOpacity>
      {optionsAnswareModalOpen && <AnimatedModal onClose={() => setAnswareOptionsModalOpen(false)} position={700} title="Choose an option">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <TouchableOpacity onPress={() => closeModal(() => [setAsDone(), setAnswareOptionsModalOpen(false)])} style={{ borderTopWidth: 0.5, borderTopColor: colors.primary, borderBottomWidth: 0.5, borderBottomColor: colors.primary, height: 60, justifyContent: "center", alignContent: "center", alignItems: "center" }}><Text style={{ fontSize: 18 }}>Set as "done"</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => closeModal(() => [setAnswareOptionsModalOpen(false)])} style={{ borderTopWidth: 0.5, borderTopColor: colors.primary, borderBottomWidth: 0.5, borderBottomColor: colors.primary, height: 60, justifyContent: "center", alignContent: "center", alignItems: "center" }}><Text style={{ fontSize: 18, color: "lightgray" }}>Details</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => closeModal(() => [setAnswareOptionsModalOpen(false)])} style={{ borderTopWidth: 0.5, borderTopColor: colors.primary, borderBottomWidth: 0.5, borderBottomColor: colors.primary, height: 60, justifyContent: "center", alignContent: "center", alignItems: "center" }}><Text style={{ fontSize: 18, color: "lightgray" }}>View</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => closeModal(() => [setAnswareOptionsModalOpen(false)])} style={{ borderTopWidth: 0.5, borderTopColor: colors.primary, borderBottomWidth: 0.5, borderBottomColor: colors.primary, height: 60, justifyContent: "center", alignContent: "center", alignItems: "center" }}><Text style={{ fontSize: 18, color: "lightgray" }}>Export Report</Text></TouchableOpacity>
            <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setAnswareOptionsModalOpen(false))} />
          </View>
        }
      </AnimatedModal>}

      {optionsTemplateModalOpen && <AnimatedModal onClose={() => setTemplateOptionsModalOpen(false)} position={300} title="Choose an option">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <TouchableOpacity onPress={() => closeModal(() => [setTemplateOptionsModalOpen(false)])} style={{ borderTopWidth: 0.5, borderTopColor: colors.primary, borderBottomWidth: 0.5, borderBottomColor: colors.primary, height: 60, justifyContent: "center", alignContent: "center", alignItems: "center" }}><Text style={{ fontSize: 18 }}>Edit</Text></TouchableOpacity>
            <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setTemplateOptionsModalOpen(false))} />
          </View>
        }
      </AnimatedModal>}

    </>
  )
}