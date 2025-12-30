import { ActivityIndicator, Button, StyleProp, Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from "react-native";
import { colors } from "../Utils/colors";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PrimaryButtonInterface {
  label: string,
  onPress: () => void,
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
  isLoading?: boolean
}

export default function PrimaryButton({ isLoading = false, label, onPress, style, textStyle }: PrimaryButtonInterface) {
  return (
    <TouchableOpacity disabled={isLoading} onPress={onPress} style={[{ backgroundColor: colors.primary, height: 50, borderRadius: 10, justifyContent: 'center' }, style]}>
      {!isLoading ? <Text style={[{ textAlign: 'center', color: 'white', fontSize: 16 }, textStyle]}>
        {label}
      </Text> :
        <ActivityIndicator color={'#ffffff'} size={30} />
      }
    </TouchableOpacity>
  )
}