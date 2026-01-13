import { MaterialIcons } from "@expo/vector-icons";
import { Text, TouchableOpacity } from "react-native";
import { colors } from "../Utils/colors";
import React from "react";

interface CheckBoxInterface {
  isCheck: boolean
  setIsCheck: (value: boolean) => void
  label: string
  autoSave?: () => void
}

const CheckBox = React.memo(({ isCheck, label, setIsCheck, autoSave }: CheckBoxInterface) => {
  return (
    <TouchableOpacity onPress={() => [setIsCheck(!isCheck), autoSave && autoSave()]} style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
      <MaterialIcons name={`check-box${isCheck ? "" : "-outline-blank"}`} size={20} color={isCheck ? colors.primary : 'black'}/>
      <Text style={{ fontSize: 17 }}>{label}</Text>
    </TouchableOpacity>
  );
});

export default CheckBox
// export default function CheckBoxx({isCheck, setIsCheck, label}: CheckBoxInterface){
//   return(
//     <TouchableOpacity onPress={() => setIsCheck(!isCheck)} style={{flexDirection: 'row', gap: 10, alignItems: 'center'}}>
//       <MaterialIcons name={`check-box${isCheck ? "" : "-outline-blank"}`} size={20} color={isCheck ? colors.primary : 'black'}/>
//       <Text style={{ fontSize: 17 }}>{label}</Text>
//     </TouchableOpacity>  
//   )
// }