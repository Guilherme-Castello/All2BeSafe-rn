import { Dimensions, FlatList, Text, Touchable, TouchableOpacity, View } from "react-native";
import AnimatedModal from "../AnimatedModal";
import PrimaryInput from "../PrimaryInput";
import PrimaryButton from "../PrimaryButton";
import { useEffect, useState } from "react";
import { colors } from "../../Utils/colors";
import googleApi from "../../Server/google";
import LocationAddressType from "../../Types/LocationAddress";

export default function SearchAddressModal({openSearch, setOpenSearch, setCoords, coords, createAddressFromResponse, setAddressName, animateMap}: {openSearch: boolean, setOpenSearch: React.Dispatch<React.SetStateAction<boolean>>, setCoords: React.Dispatch<React.SetStateAction<{
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}>>, coords: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}, createAddressFromResponse(data: any, provider?: "google" | "foursquare" | "here"): LocationAddressType,
   setAddressName(e: string): void,
   animateMap(region: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
}): void
}) {
  
  const [searchAddressByName, setSearchAddressByName] = useState<string>('')
  const [googleUUID, setGoogleUUID] = useState()
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [suggestions, setSuggestions] = useState<any[]>([])

  const [debouncedValue, setDebouncedValue] = useState('')
  

  async function fetchAddress(value: any) {
    if (value && value.length > 3 && coords != undefined) {
      try {
        setIsLoading(true);
        if (googleUUID == '') {
          // @ts-ignore
          setGoogleUUID(uuidv4());
        }
        const response: any = await googleApi.getAddress.get(
          value,
          'AIzaSyAWOENgGdjyMam4FPZHs99OcIj3PCDNJqM',
          coords.latitude.toString(),
          coords.longitude.toString(),
          googleUUID
        );
        console.log(response.data.predictions)
        setSuggestions(response.data.predictions);
      } catch (error) {
        console.error('Error fetching the API', error);
      } finally {
        setIsLoading(false);
      }
    }
  }

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchAddressByName);
    }, 1000);

    return () => {
      clearTimeout(handler);
    };
  }, [searchAddressByName]);

  useEffect(() => {
    if (debouncedValue) {
      fetchAddress(debouncedValue);
    }
  }, [debouncedValue]);

  async function handleSelectGoogle(placeId: string) {
    const suggestionDetails = await googleApi.getAddressDetail.get(
      placeId,
      'AIzaSyAWOENgGdjyMam4FPZHs99OcIj3PCDNJqM',
      googleUUID
    );
    const formattedAddress = createAddressFromResponse(suggestionDetails?.data.result);
    console.log(formattedAddress)
    // setAddressName(handleAddressName(formattedAddress))
    setCoords({...coords, latitude: formattedAddress.geolocation.lat, longitude: formattedAddress.geolocation.lng})
    animateMap({...coords, latitude: formattedAddress.geolocation.lat, longitude: formattedAddress.geolocation.lng})
  }


  function AddressItem({item, closeFn}: {item: any, closeFn: () => void}){

    function getFirstField(){
      return item.structured_formatting.main_text
    }
    function getSecondField(){
      return item.structured_formatting.secondary_text
    }
    console.log(item)
    return (
      <TouchableOpacity style={{paddingVertical: 10}} onPress={() => [handleSelectGoogle(item.place_id), closeFn()]}>
        <Text style={{fontSize: 16, fontWeight: 700}}>{getFirstField()}</Text>
        <Text style={{fontSize: 15}}>{getSecondField()}</Text>
      </TouchableOpacity>
    )
  }

  return (
    <>
      {openSearch && <AnimatedModal position={Dimensions.get('screen').height * 0.7} title="Choose an option">
        {({ closeModal }) =>
          <View style={{ gap: 10 }}>
            <PrimaryInput value={searchAddressByName} onChange={setSearchAddressByName} />
            <FlatList
              style={{ height: '75%' }}
              data={suggestions}
              renderItem={(list) => {
                console.log(list.item)
                return <AddressItem item={list.item} closeFn={() => closeModal(() => setOpenSearch(false))}/>
              }}
            />
            <PrimaryButton label="close" onPress={() => closeModal(() => setOpenSearch(false))} style={{ backgroundColor: colors.danger }} />
          </View>
        }
      </AnimatedModal>}
    </>
  )
}