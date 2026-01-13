import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dimensions, FlatList, Text, View } from "react-native";
import MapView from "react-native-maps";
import PrimaryButton from "./PrimaryButton";
import { useEffect, useRef, useState } from "react";
import { colors } from "../Utils/colors";
import AnimatedModal from "./AnimatedModal";
import PrimaryInput from "./PrimaryInput";
import SearchAddressModal from "./Modals/SearchAddressModal";
import { v4 as uuidv4 } from 'uuid';
import googleApi from "../Server/google";
import * as Location from 'expo-location';



export default function MapQuestionContent() {

  //@ts-ignore
  const mapRef = useRef<any>();

  const [openSearch, setOpenSearch] = useState<boolean>(false)
  const [addressName, setAddressName] = useState('')

  const [coords, setCoords] = useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005
  })

  async function getUserCoords() {
    let coordss
    try {
      const { status } = await Location.getForegroundPermissionsAsync()
      let locationData: any = await Location.getLastKnownPositionAsync({});
      if (status == "granted" && locationData && locationData.coords) {
        coordss = locationData.coords
      } else {
        coordss = {
          latitude: -23.5489,
          longitude: -46.6388
        }
      }
    } catch (e) {
      coordss = {
        latitude: -23.5489,
        longitude: -46.6388
      }
      console.error(e);
    }
    setCoords(coordss);
    console.log(coordss)
  }

  async function fetchCurrentLocation(){
    // let locationData: any = await Location.getLastKnownPositionAsync({});
    mapRef != null && mapRef.current.animateToRegion({latitude: 0, longitude: 0}, 500);
  }

  useEffect(() => {
    getUserCoords()
  }, [])

  return (
    <>
      <View style={{ position: 'relative', gap: 10 }}>
        <MaterialCommunityIcons name="pin" style={{ position: 'absolute', zIndex: 100, top: 150, left: 150 }} size={20} color={colors.primary} />
        <PrimaryInput onChange={setAddressName} value={addressName}/>
        <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
          <View style={{width: '45%'}}>
            <PrimaryInput onChange={setAddressName} value={coords.latitude.toString()}/>
          </View>
          <View style={{width: '45%'}}>
            <PrimaryInput onChange={setAddressName} value={coords.longitude.toString()}/>
          </View>
        </View>
        <MapView
          provider="google"
          ref={mapRef}
          region={{
            latitude: coords.latitude,
            longitude: coords.longitude,
            latitudeDelta: 0.01,
            longitudeDelta: 0.01
          }}
          style={{
            width: 300,
            height: 300,
          }}>
        </MapView>
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <PrimaryButton label="Search Address" style={{ width: '45%' }} onPress={() => setOpenSearch(true)} />
          <PrimaryButton label="Current Location" style={{ width: '45%' }} onPress={async () => await fetchCurrentLocation()} />
        </View>
      </View>
      <SearchAddressModal coords={coords} setCoords={setCoords} openSearch={openSearch} setOpenSearch={setOpenSearch} />
    </>

  )
}