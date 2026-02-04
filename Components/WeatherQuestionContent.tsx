import { View } from "react-native"
import PrimaryInput from "./PrimaryInput"
import PrimaryButton from "./PrimaryButton"
import { FormItem } from "../Types/FormStructure"
import { getWeather } from "../Server/openweather"
import * as Location from 'expo-location';

export default function WeatherQuestionContent({onChangeText, question, index}: {onChangeText: (index: number, value: string) => void, question: FormItem, index: number}){
  
  const region = {
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0.005,
    longitudeDelta: 0.005,
  };



  async function fetchWeather() {

    console.log('Vai buscar clima');

    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Low,
      });

      region.latitude = location.coords.latitude;
      region.longitude = location.coords.longitude;

      console.log('Longitude: '+region.longitude);

    } catch (e) {
      console.error(e)
    } finally {
      //
    }


    //const response =  await getWeather(-23.7175631, -46.5543779)
    const response =  await getWeather(region.latitude, region.longitude)
    formatWeather(response)
  }

  function formatWeather(weather: any){    
    onChangeText(index, `MIN.${weather.currentConditionsHistory.maxTemperature.degrees}° - MAX.${weather.currentConditionsHistory.minTemperature.degrees}° - ${weather.weatherCondition.description.text} -  ${weather.temperature.degrees}°C - ${weather.relativeHumidity}g/m³`)       
  }

  
  return(
    <View style={{gap: 16}}>
      <PrimaryInput
        onChange={(text) => onChangeText(index, text)}
        value={question.value}
        icon="sun-compass"
      />
      <PrimaryButton label="Refetch" onPress={() => fetchWeather()}/>

    </View>
  )
}


