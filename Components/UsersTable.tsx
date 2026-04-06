import { View, Text, StyleSheet, Touchable, TouchableOpacity } from "react-native";
import PrimaryButton from "./PrimaryButton";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../Utils/colors";
import { useAuth } from "../contexts/AuthContext";
import { useState } from "react";
import AnimatedModal from "./AnimatedModal";
import PrimaryInput from "./PrimaryInput";
import SelectWithoutCallback from "./SelectWithoutCallback";

export default function UsersTable({ usersList, deleteUser, updateUser }: { usersList: any[], deleteUser: (id: string) => Promise<void>, updateUser: (userId: string, updatedUser: any) => Promise<void> }) {
  const { user } = useAuth()

  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [newName, setNewName] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newAccessLvl, setNewAccessLvl] = useState("")

  const [selectedUserId, setSelectedUserId] = useState("")

  function handleOpenEditUserModal(id: any) {
    const selectedUser = usersList.find(user => user._id == id)

    setNewAccessLvl(selectedUser.access_level)
    setNewName(selectedUser.name)
    setNewEmail(selectedUser.email)
    setSelectedUserId(selectedUser._id)

    setIsEditOpen(true)
  }

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, styles.nameEmail]}>User</Text>
          <Text style={[styles.cell, styles.accessLvl]}>Level</Text>
          <Text style={[styles.cell, styles.company]}>Company</Text>
          <Text style={[styles.cell, styles.action]}></Text>
        </View>

        {usersList.length > 0 && usersList.map((item, idx) => {
          return (
            <View key={idx + 5} style={styles.row}>
              <View style={styles.nameEmail}>
                <Text style={[styles.cell, { fontWeight: '600' }]}>{item.name}</Text>
                <Text style={styles.emailText}>{item.email}</Text>
              </View>
              <View style={styles.accessLvl}><Text style={styles.cell}>{item.access_level}</Text></View>
              <View style={styles.company}><Text style={styles.cell}>{item.company}</Text></View>
              <View style={styles.action}>
                <TouchableOpacity onPress={() => handleOpenEditUserModal(item._id)} style={{ backgroundColor: colors.primary, height: 28, paddingHorizontal: 8, justifyContent: "center", alignItems: "center", borderRadius: 14 }}>
                  <MaterialCommunityIcons name="cog" color={"white"} size={16} />
                </TouchableOpacity>
              </View>
            </View>
          )
        })}
      </View>
      {isEditOpen && (
        <AnimatedModal onClose={() => setIsEditOpen(false)} position={500} title="Edit user">
          {({ closeModal }) => (
            <View style={{ gap: 20 }}>
              <PrimaryInput label="Name" onChange={setNewName} value={newName} />

              <PrimaryInput label="Email" onChange={setNewEmail} value={newEmail} />

              <View>

                <Text>Access Level</Text>
                <SelectWithoutCallback options={["0", "1", "2"]} selectedOption={newAccessLvl} setSelectedOption={e => setNewAccessLvl(e)} />
              </View>

              <PrimaryButton
                textStyle={{ color: "white", fontSize: 18 }}
                label="Save"
                onPress={() => closeModal(() => [setIsEditOpen(false), updateUser(selectedUserId, { name: newName, email: newEmail, access_level: newAccessLvl })])}
              />
              <View style={{ flexDirection: "row", justifyContent: "space-between", width: "100%" }}>
                <PrimaryButton
                  style={{ backgroundColor: colors.danger, width: "47%" }}
                  textStyle={{ color: "white", fontSize: 18 }}
                  label="Close"
                  onPress={() => closeModal(() => setIsEditOpen(false))}
                />
                <PrimaryButton
                  style={{ backgroundColor: colors.danger, width: "47%" }}
                  textStyle={{ color: "white", fontSize: 18 }}
                  label="Delete"
                  onPress={() => closeModal(() => [setIsEditOpen(false), setIsDeleteOpen(true)])}
                />
              </View>
            </View>
          )}
        </AnimatedModal>
      )}
      {isDeleteOpen && (
        <AnimatedModal onClose={() => setIsDeleteOpen(false)} position={350} title="Delete user">
          {({ closeModal }) => (
            <View style={{ gap: 20 }}>
              <Text style={{ textAlign: "center", fontSize: 17 }}>{`Are u sure about delete ${usersList.find(user => user._id == selectedUserId).name}?`}</Text>
              <PrimaryButton
                style={{ backgroundColor: colors.danger }}
                textStyle={{ color: "white", fontSize: 18 }}
                label="Confirm"
                onPress={() => closeModal(() => [setIsDeleteOpen(false), deleteUser(selectedUserId)])}
              />
              <PrimaryButton
                style={{ backgroundColor: colors.primary }}
                textStyle={{ color: "white", fontSize: 18 }}
                label="Cancel"
                onPress={() => closeModal(() => setIsDeleteOpen(false))}
              />

            </View>
          )}
        </AnimatedModal>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 6,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: "center",
  },
  header: {
    backgroundColor: "#f5f5f5",
  },
  cell: {
    fontSize: 14,
    color: "#333",
  },
  nameEmail: {
    flex: 3,
    paddingRight: 6,
  },
  emailText: {
    fontSize: 12,
    color: "gray",
    marginTop: 2,
  },
  company: {
    width: 70,
    fontWeight: "600",
  },
  accessLvl: {
    width: 44,
    fontWeight: "600",
  },
  action: {
    width: 44,
    alignItems: 'center',
  },
});