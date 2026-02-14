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
  hasPhoto?: boolean
  onDelete?: () => void
  uploadImage?: () => void
}

export default function QuestionContainer({ children, title, id = '0', canDelete = false, onDelete, hasConfig = true , hasPhoto = false, uploadImage }: QuestionContainerProps) {
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

      {/*
        Fazer a Logica se tem foto hasPhoto pelo menos uma aparecer os slots
        caso clicar na foto abrir ampliada num modal com a opção de excluir foto

        icones https://pictogrammers.com/library/mdi/
      */}

      {hasPhoto && <View style={{flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10, marginHorizontal: 20}}>
        <View style={{ width: 70, height: 70, borderRadius: 10, backgroundColor: "#dde3ec"}} />
        <View style={{ width: 70, height: 70, borderRadius: 10, backgroundColor: "#dde3ec"}} />
        <View style={{ width: 70, height: 70, borderRadius: 10, backgroundColor: "#dde3ec"}} />
      </View>}  

      {hasConfig && <View style={{flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20}}>
        
        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => console.log('implement')}>
          <MaterialCommunityIcons name="book-edit" size={20} />
          <Text style={{ marginLeft: 6, fontSize: 14 }}>Add Note</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => uploadImage && uploadImage()}>
          <MaterialCommunityIcons name="camera-plus" size={20} /> 
          <Text style={{ marginLeft: 6, fontSize: 14 }}>Media</Text>
        </TouchableOpacity>

        <TouchableOpacity style={{flexDirection: 'row', alignItems: 'center'}} onPress={() => console.log('implement')}>
          <MaterialCommunityIcons name="account-hard-hat" size={20} />
          <Text style={{ marginLeft: 6, fontSize: 14 }}>Action</Text>          
        </TouchableOpacity>                
      </View>}
    </View>
  )
}