import { ReactNode } from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { colors } from "../Utils/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface QuestionContainerProps {
  children: ReactNode;
  title: string
  id?: string
  canDelete?: boolean
  hasConfig?: boolean
  onDelete?: () => void
}

export default function QuestionContainer({ children, title, id = '0', canDelete = false, onDelete, hasConfig = false }: QuestionContainerProps) {
  return (
    <View style={{ backgroundColor: colors.primary + '25', paddingVertical: 10, paddingHorizontal: 10, gap: 10, borderRadius: 10 }}>
      <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between'}}>
        <Text style={{ fontSize: 17 }}>{id}- {title}</Text>
        {canDelete && <TouchableOpacity onPress={() => onDelete && onDelete()} style={{ backgroundColor: colors.danger, width: 20, height: 20, justifyContent: 'center', alignItems: 'center', borderRadius: 10 }}>
          <Text style={{ color: 'white' }}>X</Text>
        </TouchableOpacity>}
      </View>
      <View style={{ marginHorizontal: 20 }}>
        {children}
      </View>
      {hasConfig && <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20}}>
        <TouchableOpacity onPress={() => console.log('implement')}>
          <MaterialCommunityIcons name="image" size={20}/>
        </TouchableOpacity>
      </View>}
    </View>
  )
}