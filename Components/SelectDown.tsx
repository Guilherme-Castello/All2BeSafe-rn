import { FlatList, Text, TouchableOpacity, View } from "react-native";
import AnimatedModal from "./AnimatedModal";
import PrimaryButton from "./PrimaryButton";
import { useCallback, useEffect, useRef, useState } from "react";
import { colors } from "../Utils/colors";
import { useFocusEffect } from "@react-navigation/native";

interface SelectInterface {
  setSelectedOption: (option: string) => void,
  options: string[],
  selectedOption: string,
  position?: number,
  containerHeight?: number,
  autoSave?: () => void
}

export default function SelectDown({selectedOption, options, setSelectedOption, autoSave}: SelectInterface) {

  const [renderCount, setRenderCount] = useState(0)

  useFocusEffect(
      useCallback(() => {
  
        return () => {
          setRenderCount(0)
        }
      }, [])
    );

  useEffect(() => {
    setRenderCount(prev => prev+1)
    if(renderCount < 1) return
    

    autoSave && autoSave()

  }, [selectedOption])

  function SelectItem({ option }: { option: string }) {
    return (
      <TouchableOpacity onPress={() => setSelectedOption(option)} style={[{ height: 50, justifyContent: 'center', borderRadius: 20 }, option == selectedOption ? { backgroundColor: colors.warning } : { borderColor: colors.primary, borderWidth: 0.7 }]}>
        <Text style={[{ fontSize: 18, textAlign: 'center' }, option == selectedOption && { color: 'white' }]}>{option}</Text>
      </TouchableOpacity>
    )
  }
  return (
    <FlatList data={options} renderItem={(a) => <SelectItem option={a.item} />} style={{ gap: 10, borderColor: colors.primary }} contentContainerStyle={{ gap: 10 }} />
  )
}