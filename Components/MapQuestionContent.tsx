import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Dimensions, FlatList, Text, View } from "react-native";
import MapView, { Region } from "react-native-maps";
import PrimaryButton from "./PrimaryButton";
import { useEffect, useRef, useState } from "react";
import { colors } from "../Utils/colors";
import PrimaryInput from "./PrimaryInput";
import SearchAddressModal from "./Modals/SearchAddressModal";
import * as Location from 'expo-location';
import googleApi from "../Server/google";
import LocationAddressType from "../Types/LocationAddress";
import { FormItem } from "../Types/FormStructure";

export default function MapQuestionContent({ onChangeText, index, question, handleChangeCoords,autoSaveFn }: {autoSaveFn: (() => void) | undefined, handleChangeCoords: (receivedIndex: number, newCoord: {
    latitude: string;
    longitude: string;
}) => void, question: FormItem ,onChangeText: (index: number, value: string) => void, index: number}) {

  //@ts-ignore
  const mapRef = useRef<any>();

  const [openSearch, setOpenSearch] = useState<boolean>(false)

  const [isLocationLoading, setIsLocationLoading] = useState(false)

  const [coords, setCoords] = useState<Region>({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005
  })

  const fillInAddress = (componentType: string, addressSelected: object) => {
    for (const component of addressSelected as any) {
      if (
        componentType === component.types[0] ||
        componentType === component.types[1] ||
        componentType === component.types[2]
      ) {
        return component.long_name;
      }
    }
  };

  function handleFoursquareStreet(data: any) {
    if (data.formattedAddress) {
      return `${data.location.formattedAddress[0]}`
    } else if (data.location.address) {
      return data.location.address.split(',')[0]
    } else {
      return ''
    }
  }

  function createAddressFromResponse(
    data: any,
    provider: 'google' | 'foursquare' | 'here' = 'google'
  ) {
    if (provider == 'google') {
      let endereco: LocationAddressType = {
        street:
          fillInAddress('route', data?.address_components) ||
          (data.name && data.name.split(',')[0]),
        number:
          fillInAddress('street_number', data.address_components) ||
          (data.name && data.name.split(',')[1]) ||
          's/n',
        neighborhood: fillInAddress('sublocality_level_1', data.address_components),
        city: fillInAddress('administrative_area_level_2', data.address_components),
        state: fillInAddress('administrative_area_level_1', data.address_components),
        zipCode: fillInAddress('postal_code', data.address_components),
        country: fillInAddress('country', data.address_components),
        formatted_address: data.formatted_address,
        geolocation: {
          lat: data.geometry.location.lat,
          lng: data.geometry.location.lng
        },
        placeId: data.place_id,
        valid: false,
        provided_by: 'google',
        isEstabilishment: data.types.indexOf('establishment') == -1 ? false : true
      };
      endereco = {
        ...endereco,
        formatted_address: `${endereco.neighborhood ? endereco.neighborhood + ', ' : ''} ${endereco.city} - ${endereco.state}`
      };
      if (endereco.isEstabilishment) {
        endereco.title = data.name
      }
      return endereco;
    } else if (provider == 'foursquare') {
      const endereco: LocationAddressType = {
        street: handleFoursquareStreet(data),
        title: data.name,
        number: data.location.address ? data.location.address.split(',')[1] : 's/n',
        neighborhood: data.location.city,
        city: data.location.city,
        state: data.location.state,
        zipCode: data.location.postalCode,
        country: data.location.country,
        formatted_address: `${data.location.formattedAddress[0]}, ${data.location.formattedAddress[1] !== undefined ? data.location.formattedAddress[1] : ''}`,
        geolocation: {
          lat: data.location.lat,
          lng: data.location.lng
        },
        placeId: data.id,
        valid: false,
        provided_by: 'foursquare',
        isEstabilishment: true
      };
      return endereco;
    } else {
      let endereco: LocationAddressType = {
        street: data.address.street,
        number: data.address.houseNumber || 's/n',
        neighborhood: data.address.district,
        city: data.address.city,
        state: data.address.state,
        zipCode: data.address.postalCode,
        country: data.address.countryName,
        formatted_address: data.address.label,
        geolocation: {
          lat: data.position.lat,
          lng: data.position.lng
        },
        placeId: data.id,
        valid: false,
        provided_by: 'here',
        isEstabilishment: true
      };
      if (data.address.label != data.title) {
        endereco.title = data.title
      }
      return endereco;
    }
  }

  function animateMap(region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  }) {
    if (mapRef.current) {
      mapRef.current.animateToRegion(region, 500);
    }
  }

  async function fetchCurrentLocation() {
    console.log('a')
    try {
      setIsLocationLoading(true)
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      const region = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        latitudeDelta: 0.005,
        longitudeDelta: 0.005,
      };

      setCoords(region);
      animateMap(region);
    } catch (e) {
      console.error(e)
    } finally {
      setIsLocationLoading(false)
    }
  }



  useEffect(() => {
    console.log('q')
    console.log(question)
    if(question && question.coords && question?.coords?.latitude) {
      console.log('inside if')
      return
    } else {
      console.log('INSIDE ELSE')
      fetchCurrentLocation()
    }
  }, [question])

  function handleAddressName(data: LocationAddressType) {
    if (data?.source == 'deeplink') {
      return data?.formatted_address;
    }
    if (data?.isEstabilishment || data?.provided_by == 'foursquare' || data?.provided_by == 'here') {
      if (data.title) {
        return data.title;
      } else {
        return data.formatted_address
      }
    } else if (data?.street) {
      return data?.street.indexOf(',') == -1 ? `${data?.street}, ${data?.number}` : data?.street;
    } else if (data?.neighborhood) {
      return `${data?.neighborhood}`;
    } else if (data?.city) {
      return data?.city;
    } else if (data.state) {
      return data.state;
    }
    return data.country;
  }

  async function handleChangeMap(r: Region) {
    console.log('HANDLE CHANGE MAP')
    if(!r || !r.latitude || !r.longitude) return
    setCoords(r)
    handleChangeCoords(index, {latitude: r?.latitude?.toString(), longitude: r?.longitude?.toString()})
    const response = await googleApi.getAddressByCoordinate.get(r?.latitude?.toString(), r?.longitude?.toString(), 'AIzaSyAWOENgGdjyMam4FPZHs99OcIj3PCDNJqM')
    const address = createAddressFromResponse(response?.data?.results[0])
    setAddressName(handleAddressName(address))

    autoSaveFn && autoSaveFn()
  }

  function setAddressName(e: string){
    onChangeText(index, e)
  }

  return (
    <>
      <View style={{ position: 'relative', gap: 10 }}>
        <MaterialCommunityIcons name="pin" style={{ position: 'absolute', zIndex: 100, top: 220, left: 140 }} size={20} color={colors.primary} />
        <PrimaryInput onChange={setAddressName} value={question.value} />
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          <View style={{ width: '45%' }}>
            <PrimaryInput onChange={setAddressName} value={( question && question.coords && question?.coords.latitude ? Number(question?.coords.latitude).toFixed(4).toString() : coords.latitude.toFixed(4).toString())} />
          </View>
          <View style={{ width: '45%' }}>
            <PrimaryInput onChange={setAddressName} value={( question && question.coords && question?.coords.longitude ? Number(question?.coords.longitude).toFixed(4).toString() : coords.longitude.toFixed(4).toString())} />
          </View>
        </View>
        <MapView
          provider="google"
          ref={mapRef}
          initialRegion={{
            latitudeDelta: coords.latitudeDelta,
            longitudeDelta: coords.longitudeDelta,
            latitude: Number(question?.coords?.latitude) || coords.latitude,
            longitude: Number(question?.coords?.longitude) || coords.longitude,
          }}
          onRegionChangeComplete={r => handleChangeMap(r)}
          style={{ width: 300, height: 300 }}
        />
        <View style={{ flexDirection: 'row', width: '100%', justifyContent: 'space-between' }}>
          <PrimaryButton label="Search Address" style={{ width: '45%' }} onPress={() => setOpenSearch(true)} />
          <PrimaryButton isLoading={isLocationLoading} label="Current Location" style={{ width: '45%' }} onPress={async () => await fetchCurrentLocation()} />
        </View>
      </View>
      <SearchAddressModal animateMap={animateMap} createAddressFromResponse={createAddressFromResponse} coords={coords} setCoords={setCoords} setAddressName={setAddressName} openSearch={openSearch} setOpenSearch={setOpenSearch} />
    </>

  )
}