import { Button, StyleProp, Text, TextStyle, TouchableOpacity, TouchableOpacityProps, ViewStyle } from "react-native";
import { colors } from "../Utils/colors";

interface PrimaryButtonInterface {
  label: string,
  onPress: () => void,
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

export default function PrimaryButton({label, onPress, style, textStyle}: PrimaryButtonInterface) {
  return (
    <TouchableOpacity onPress={onPress} style={[{backgroundColor: colors.primary, height: 50, borderRadius: 10, justifyContent: 'center'}, style]}>
      <Text style={[{textAlign: 'center', color: 'white', fontSize: 16}, textStyle]}>
        {label}
      </Text>
    </TouchableOpacity>
  )
}