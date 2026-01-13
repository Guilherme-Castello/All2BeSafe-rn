import { FlatList, Text, TouchableOpacity, View } from "react-native";
import AnimatedModal from "./AnimatedModal";
import PrimaryButton from "./PrimaryButton";
import { useState } from "react";
import { colors } from "../Utils/colors";

interface SelectInterface {
  setSelectedOption: (option: string) => void,
  options: string[],
  selectedOption: string,
  position?: number,
  containerHeight?: number,
  autoSave?: () => void
}

export default function Select({selectedOption, options, setSelectedOption, position = 400, containerHeight = 180, autoSave}: SelectInterface) {

  const [isSelectOpen, setIsSelectOpen] = useState<boolean>(false)
  
  function translateOption(op: string){
    switch(op){
      case 'text':
        return 'Text'
      case 'select':
        return 'Choose One'
      case 'check_boxes':
        return 'Multiple Selection'
      case 'input_date':
        return 'Date'
      case 'input_time':
        return 'Time'
      case 'weather':
        return 'Weather'
      case 'location':
        return 'Location'
      default:
        return op
    }
  }

  function SelectItem({ option, closeModal }: { option: string, closeModal: (callBack: () => void) => void }) {
    return (
      <TouchableOpacity onPress={() => closeModal(() => [setIsSelectOpen(false), setSelectedOption(option), autoSave && autoSave()])} style={[{ height: 50, justifyContent: 'center', borderRadius: 20 }, option == selectedOption && { backgroundColor: colors.primary }]}>
        <Text style={[{ fontSize: 18, textAlign: 'center' }, option == selectedOption && { color: 'white' }]}>{translateOption(option)}</Text>
      </TouchableOpacity>
    )
  }
  return (
    <>
      <View>
        <TouchableOpacity onPress={() => setIsSelectOpen(true)} style={{ height: 40, borderRadius: 10, borderColor: 'black', borderWidth: 0.5, justifyContent: 'center', padding: 10, backgroundColor: 'white' }}>
          <Text>{translateOption(selectedOption)}</Text>
        </TouchableOpacity>
      </View>
      {isSelectOpen && <AnimatedModal position={position} title="Choose an option">
        {({ closeModal }) =>
          <View style={{ gap: 20 }}>
            <FlatList data={options} renderItem={(a) => <SelectItem option={a.item} closeModal={closeModal} />} style={{ maxHeight: containerHeight, borderBottomWidth: 0.5, borderColor: colors.primary }} contentContainerStyle={{ gap: 2 }} />
            <PrimaryButton style={{ backgroundColor: colors.danger }} textStyle={{ color: 'white', fontSize: 18 }} label="Close" onPress={() => closeModal(() => setIsSelectOpen(false))} />
          </View>
        }
      </AnimatedModal>}
    </>
  )
}