import { TextInput, TextInputProps, View } from "react-native";
import { styles } from "./styles";
import { Ionicons } from '@expo/vector-icons';

export function Search({ ...rest }: TextInputProps) {
  return (
    <View style={styles.container}>
      <Ionicons name="search" size={20} color="#C3C5CB" />
      <TextInput 
          style={styles.input}
          placeholderTextColor="#C3C5CB"
          {...rest} 
      />
    </View>    
  )
}



/*
import { TextInput, TextInputProps, View } from "react-native";
import { styles } from "./styles";
import { Ionicons } from '@expo/vector-icons';

export function Search({ ...rest }: TextInputProps) {
  return (

    <View style={styles.container}>
    <Ionicons name="search" size={20} color="#C3C5CB" />
    <TextInput 
        style={styles.input}
        placeholder="what do you want to search?"
        placeholderTextColor="#C3C5CB"
    />
    </View>    
  )
}
*/