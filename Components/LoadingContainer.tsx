import { ActivityIndicator, Dimensions, Text, View } from "react-native"
import { colors } from "../Utils/colors"

export default function LoadingContainer({ children, condition }: {children: React.ReactNode, condition: boolean}){
  if(condition){
    return (<View style={{ height: Dimensions.get('screen').height, justifyContent: 'center' }}>
      <ActivityIndicator color={colors.primary} size={60} />
    </View>)
  } else {
    return children
  }
}