import { View, Text, StyleSheet } from "react-native";

export default function PermissionTable({userAccessLevel}: {userAccessLevel?: string}) {

  const PERMISSIONS = [
    {
      level: 0,
      name: "Form Respondent",
      description: "Can only fill out and submit forms.",
    },
    {
      level: 1,
      name: "Form Creator",
      description: "Can create, edit, and submit forms.",
    },
    {
      level: 2,
      name: "Company Admin",
      description: "Can manage forms and users within their company.",
    },
    {
      level: 3,
      name: "Super Admin",
      description: "Full access: manage all users, companies, and settings.",
    },
  ];

  return (
    <View style={styles.container}>
      <View style={[styles.row, styles.header]}>
        <Text style={[styles.cell, styles.level]}>Level</Text>
        <Text style={[styles.cell, styles.name]}>Suggested Name</Text>
        <Text style={[styles.cell, styles.description]}>
          Short Description (Tooltips/Subtitles)
        </Text>
      </View>

      {PERMISSIONS.map((item) => {
        if(userAccessLevel && Number(userAccessLevel) < 3 && item.level == 3) return
        return (
          <View key={item.level} style={styles.row}>
            <Text style={[styles.cell, styles.level]}>{item.level}</Text>
            <Text style={[styles.cell, styles.name]}>{item.name}</Text>
            <Text style={[styles.cell, styles.description]}>
              {item.description}
            </Text>
          </View>
        )
      })}
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
  level: {
    width: 50,
    fontWeight: "bold",
  },
  name: {
    width: 140,
    fontWeight: "600",
  },
  description: {
    flex: 1,
  },
});