import { Dimensions, FlatList, Text, View } from "react-native";
import AnimatedModal from "../AnimatedModal";
import PrimaryInput from "../PrimaryInput";
import PrimaryButton from "../PrimaryButton";
import { useState } from "react";
import { colors } from "../../Utils/colors";

export default function SearchAddressModal({openSearch, setOpenSearch}: {openSearch: boolean, setOpenSearch: React.Dispatch<React.SetStateAction<boolean>>}) {
  
  const [searchAddressByName, setSearchAddressByName] = useState<string>('')

  return (
    <>
      {openSearch && <AnimatedModal position={Dimensions.get('screen').height * 0.9} title="Choose an option">
        {({ closeModal }) =>
          <View style={{ gap: 10 }}>
            <PrimaryInput value={searchAddressByName} onChange={setSearchAddressByName} />
            <FlatList
              style={{ height: '75%' }}
              data={['a', 'b', 'c', 'd']}
              renderItem={(list) => <Text>{list.item}</Text>}
            />
            <PrimaryButton label="close" onPress={() => closeModal(() => setOpenSearch(false))} style={{ backgroundColor: colors.danger }} />
          </View>
        }
      </AnimatedModal>}
    </>
  )
}