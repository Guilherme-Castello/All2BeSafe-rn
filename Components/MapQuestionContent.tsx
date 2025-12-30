import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dimensions, FlatList, Text, View } from "react-native";
import MapView from "react-native-maps";
import PrimaryButton from "./PrimaryButton";
import { useState } from "react";
import { colors } from "../Utils/colors";
import AnimatedModal from "./AnimatedModal";
import PrimaryInput from "./PrimaryInput";
import SearchAddressModal from "./Modals/SearchAddressModal";

export default function MapQuestionContent() {

  const [openSearch, setOpenSearch] = useState<boolean>(false)


  return (
    <>
      <View style={{ position: 'relative', gap: 10 }}>
        <MaterialCommunityIcons name="pin" style={{ position: 'absolute', zIndex: 100, top: 150, left: 150 }} size={20} color={colors.primary} />
        <MapView
          provider="google"
          region={{
            latitude: -23.964779907216927,
            longitude: -46.39218581538934,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005
          }}
          style={{
            width: 300,
            height: 300,
          }}>
        </MapView>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <PrimaryButton label="Search Address" style={{ width: '45%' }} onPress={() => setOpenSearch(true)} />
          <PrimaryButton label="Current Location" style={{ width: '45%' }} onPress={() => setOpenSearch(true)} />
        </View>
      </View>
      <SearchAddressModal openSearch={openSearch} setOpenSearch={setOpenSearch}/>      
    </>

  )
}