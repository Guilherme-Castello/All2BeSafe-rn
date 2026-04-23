import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../Utils/colors";
import { useState } from "react";
import AnimatedModal from "./AnimatedModal";
import PrimaryInput from "./PrimaryInput";
import PrimaryButton from "./PrimaryButton";
import CheckBox from "./CheckBox";
import { User } from "../Types/UserStructure";

interface CompaniesTableProps {
  companiesList: any[];
  updateCompany: (companyId: string, updatedCompany: any) => Promise<void>;
  deleteCompany: (companyId: string) => Promise<void>;
  user?: User;
}

const PLAN_OPTIONS    = ['trial', 'starter', 'professional', 'enterprise']
const STATUS_OPTIONS  = ['trialing', 'active', 'past_due', 'canceled', 'unpaid']

export default function CompaniesTable({ companiesList, updateCompany, deleteCompany, user }: CompaniesTableProps) {

  const isAdmin = user && (String(user.access_level) === '3' || String(user.company) === '0')

  const [isEditOpen, setIsEditOpen]     = useState(false)
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)

  const [selectedCompanyId, setSelectedCompanyId] = useState("")
  const [newName, setNewName]         = useState("")
  const [newInCharge, setNewInCharge] = useState("")

  // Campos de licença (apenas admin)
  const [planName, setPlanName]               = useState("trial")
  const [planSeats, setPlanSeats]             = useState("5")
  const [subStatus, setSubStatus]             = useState("trialing")
  const [subEnd, setSubEnd]                   = useState("")   // YYYY-MM-DD ou vazio
  const [licenseActive, setLicenseActive]     = useState(true)
  const [licenseNotes, setLicenseNotes]       = useState("")

  function handleOpenEditModal(item: any) {
    setSelectedCompanyId(item._id)
    setNewName(item.name)
    setNewInCharge(item.in_charge ?? "")
    // Licença
    setPlanName(item.plan_name ?? "trial")
    setPlanSeats(String(item.plan_seats ?? 5))
    setSubStatus(item.subscription_status ?? "trialing")
    setSubEnd(item.subscription_end ? item.subscription_end.slice(0, 10) : "")
    setLicenseActive(item.is_active !== false)
    setLicenseNotes(item.notes ?? "")
    setIsEditOpen(true)
  }

  function buildUpdatePayload() {
    const base = { name: newName, in_charge: newInCharge }
    if (!isAdmin) return base
    return {
      ...base,
      plan_name:           planName,
      plan_seats:          Number(planSeats) || 5,
      subscription_status: subStatus,
      subscription_end:    subEnd ? new Date(subEnd).toISOString() : null,
      is_active:           licenseActive,
      notes:               licenseNotes,
    }
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
              {/* Badge de status visível para admin */}
              {isAdmin && (
                <Text style={[styles.statusBadge, item.is_active === false && styles.inactiveBadge]}>
                  {item.subscription_status ?? 'trialing'}{item.is_active === false ? ' · inactive' : ''}
                </Text>
              )}
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
        <AnimatedModal onClose={() => setIsEditOpen(false)} position={isAdmin ? 700 : 450} title="Edit company">
          {({ closeModal }) => (
            <ScrollView style={{ maxHeight: 520 }} contentContainerStyle={{ gap: 14, paddingBottom: 20 }}>

              {/* ── Informações básicas ────────────────────────────── */}
              <PrimaryInput label="Company Name" onChange={setNewName} value={newName} />
              <PrimaryInput label="In Charge" onChange={setNewInCharge} value={newInCharge} />

              {/* ── Seção de Licença (somente admin) ──────────────── */}
              {isAdmin && (
                <View style={styles.licenseSection}>
                  <Text style={styles.licenseSectionTitle}>License Management</Text>

                  <Text style={styles.fieldLabel}>
                    Plan  <Text style={styles.hint}>({PLAN_OPTIONS.join(' · ')})</Text>
                  </Text>
                  <PrimaryInput onChange={setPlanName} value={planName} />

                  <Text style={styles.fieldLabel}>Max Seats (users)</Text>
                  <PrimaryInput onChange={setPlanSeats} value={planSeats} keyboardType="numeric" />

                  <Text style={styles.fieldLabel}>
                    Subscription Status  <Text style={styles.hint}>({STATUS_OPTIONS.join(' · ')})</Text>
                  </Text>
                  <PrimaryInput onChange={setSubStatus} value={subStatus} />

                  <Text style={styles.fieldLabel}>Subscription End  <Text style={styles.hint}>(YYYY-MM-DD, leave blank for no expiry)</Text></Text>
                  <PrimaryInput onChange={setSubEnd} value={subEnd} placeHolder="2026-12-31" />

                  <CheckBox
                    isCheck={licenseActive}
                    label="Account Active"
                    setIsCheck={setLicenseActive}
                  />

                  <Text style={styles.fieldLabel}>Internal Notes</Text>
                  <PrimaryInput
                    onChange={setLicenseNotes}
                    value={licenseNotes}
                    multiline
                    numberOfLines={3}
                    inputStyle={{ minHeight: 70 }}
                    placeHolder="Ex: negotiated discount, special plan..."
                  />
                </View>
              )}

              <PrimaryButton
                label="Save"
                onPress={() => closeModal(() => [
                  setIsEditOpen(false),
                  updateCompany(selectedCompanyId, buildUpdatePayload())
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
            </ScrollView>
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
  statusBadge: {
    fontSize: 11,
    color: colors.primary,
    marginTop: 2,
  },
  inactiveBadge: {
    color: colors.danger,
  },
  licenseSection: {
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    paddingTop: 12,
    gap: 8,
  },
  licenseSectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: 4,
  },
  fieldLabel: {
    fontSize: 13,
    color: "#444",
    marginTop: 4,
  },
  hint: {
    fontSize: 11,
    color: "gray",
    fontWeight: '400',
  },
});
