import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../Utils/colors";
import { useState } from "react";
import AnimatedModal from "./AnimatedModal";
import PrimaryInput from "./PrimaryInput";
import PrimaryButton from "./PrimaryButton";

interface CompaniesTableProps {
  companiesList: any[];
  updateCompany: (companyId: string, updatedCompany: any) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
}

export default function CompaniesTable({ companiesList, updateCompany, deleteCompany }: CompaniesTableProps) {

  const [isEditOpen, setIsEditOpen]     = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [newName, setNewName]           = useState("")
  const [newInCharge, setNewInCharge]   = useState("")

  function handleOpenEditModal(item: any) {
    setSelectedCompanyId(item._id)
    setNewName(item.name)
    setNewInCharge(item.in_charge ?? "")
    setIsEditOpen(true)
  }

  return (
    <>
      <View style={styles.container}>
        <View style={[styles.row, styles.header]}>
          <Text style={[styles.cell, styles.nameCol]}>Company</Text>
          <Text style={[styles.cell, styles.chargeCol]}>In Charge</Text>
          <Text style={[styles.cell, styles.actionCol]}></Text>
        </View>

        {companiesList.length > 0 && companiesList.map((item, idx) => (
          <View key={idx} style={styles.row}>
            <View style={styles.nameCol}>
              <Text style={[styles.cell, { fontWeight: '600' }]}>{item.name}</Text>
            </View>
            <View style={styles.chargeCol}>
              <Text style={styles.cell}>{item.in_charge ?? '-'}</Text>
            </View>
            <View style={styles.actionCol}>
              <TouchableOpacity
                onPress={() => handleOpenEditModal(item)}
                style={{ backgroundColor: colors.primary, height: 28, paddingHorizontal: 8, justifyContent: "center", alignItems: "center", borderRadius: 14 }}
              >
                <MaterialCommunityIcons name="cog" color={"white"} size={16} />
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {companiesList.length === 0 && (
          <View style={styles.emptyRow}>
            <Text style={styles.emptyText}>No companies registered yet.</Text>
          </View>
        )}
      </View>

      {isEditOpen && (
        <AnimatedModal onClose={() => setIsEditOpen(false)} position={450} title="Edit company">
          {({ closeModal }) => (
            <View style={{ gap: 20 }}>
              <PrimaryInput label="Company Name" onChange={setNewName} value={newName} />
              <PrimaryInput label="In Charge" onChange={setNewInCharge} value={newInCharge} />

              <PrimaryButton
                label="Save"
                onPress={() => closeModal(() => [
                  setIsEditOpen(false),
                  updateCompany(selectedCompanyId, { name: newName, in_charge: newInCharge })
                ])}
              />

              <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
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
        <AnimatedModal onClose={() => setIsDeleteOpen(false)} position={320} title="Delete company">
          {({ closeModal }) => (
            <View style={{ gap: 20 }}>
              <Text style={{ textAlign: "center", fontSize: 17 }}>
                {`Are you sure you want to delete "${companiesList.find(c => c._id === selectedCompanyId)?.name}"?`}
              </Text>
              <PrimaryButton
                style={{ backgroundColor: colors.danger }}
                textStyle={{ color: "white", fontSize: 18 }}
                label="Confirm"
                onPress={() => closeModal(() => [setIsDeleteOpen(false), deleteCompany(selectedCompanyId)])}
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
  nameCol: {
    flex: 3,
    paddingRight: 6,
  },
  chargeCol: {
    flex: 2,
    paddingRight: 6,
  },
  actionCol: {
    width: 44,
    alignItems: "center",
  },
  emptyRow: {
    padding: 20,
    alignItems: "center",
  },
  emptyText: {
    color: "gray",
    fontSize: 13,
  },
});
