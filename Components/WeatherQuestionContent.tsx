import { View } from "react-native"
import PrimaryInput from "./PrimaryInput"
import PrimaryButton from "./PrimaryButton"
import { FormItem } from "../Types/FormStructure"
import { getWeather } from "../Server/openweather"

export default function WeatherQuestionContent({onChangeText, question, index}: {onChangeText: (index: number, value: string) => void, question: FormItem, index: number}){
  
  async function fetchWeather() {
    const response =  await getWeather(0, 0)
    formatWeather(response)
  }

  function formatWeather(weather: any){
    onChangeText(index, `${weather.weather[0].description}, ${weather.main.temp}°C, ${weather.main.humidity}g/m³`)
    // return `${weather.weather.description}`
  }

  
  return(
    <View>
      <PrimaryInput
        onChange={(text) => onChangeText(index, text)}
        value={question.value}
        icon="sun-compass"
      />
      <PrimaryButton label="Refetch" onPress={() => fetchWeather()}/>

    </View>
  )
}
