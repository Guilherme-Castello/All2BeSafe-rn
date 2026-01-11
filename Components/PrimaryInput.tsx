import { MaterialCommunityIcons } from "@expo/vector-icons";
import { StyleProp, TextInput, View, ViewStyle } from "react-native";

interface PrimaryInputInterface {
  onChange: (option: string) => void,
  value: string,
  placeHolder?: string
  style?: StyleProp<ViewStyle>
  icon?: string
  onBlur?: () => void
}

export default function PrimaryInput({ onBlur, onChange, value, placeHolder = 'Type your answare', style, icon }: PrimaryInputInterface) {
  return (
    <View style={{borderRadius: 10, borderColor: 'black', borderWidth: 0.5, backgroundColor: 'white', flexDirection: 'row', alignContent: 'center', alignItems: 'center', paddingLeft: 10}}>
      {icon && <MaterialCommunityIcons name={icon as any} size={16}/>}
      <TextInput onBlur={onBlur} value={value} placeholder={placeHolder} onChangeText={onChange} style={[style, { height: 40, justifyContent: 'center', padding: 10, width: '100%' }]} />
    </View>
  )
}