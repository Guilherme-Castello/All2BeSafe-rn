import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { colors } from "../Utils/colors";

interface CompaniesTableProps {
  companiesList: any[];
}

export default function CompaniesTable({ companiesList }: CompaniesTableProps) {
  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.header]}>
        <Text style={[styles.cell, styles.nameCol]}>Company</Text>
        <Text style={[styles.cell, styles.codeCol]}>Code</Text>
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
              disabled
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
  codeCol: {
    width: 48,
    fontWeight: "600",
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
