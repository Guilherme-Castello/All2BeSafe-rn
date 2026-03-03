//const OPEN_WEATHER_API_KEY = "8b2371dd3cc2ed5c4a2bf71a13f5d904";
const WEATHER_API_GOOGLE_KEY = "AIzaSyBlazjumTpwjY9OP56YDYxyYHGLIcIzDEg";

export async function getWeather(lat: number, lon: number) {
  try {
    
    const url = `https://weather.googleapis.com/v1/currentConditions:lookup?location.latitude=${lat}&location.longitude=${lon}&key=${WEATHER_API_GOOGLE_KEY}&languageCode=en-CA`;
    const response = await fetch(url);
    const data = await response.json();
    return data;

  } catch (error) {
    console.error("Error while getWeather: ", error);
  }
}

/*variaveis de retorno da api weather google 

{
  "currentTime": "2026-02-03T01:29:35.144109086Z",
  "timeZone": {
    "id": "America/Sao_Paulo"
  },
  "isDaytime": false,
  "weatherCondition": {
    "iconBaseUri": "https://maps.gstatic.com/weather/v1/cloudy",
    "description": {
      "text": "Nublado",
      "languageCode": "pt-BR"
    },
    "type": "CLOUDY"
  },
  "temperature": {
    "degrees": 20.9,
    "unit": "CELSIUS"
  },
  "feelsLikeTemperature": {
    "degrees": 24.1,
    "unit": "CELSIUS"
  },
  "dewPoint": {
    "degrees": 19.8,
    "unit": "CELSIUS"
  },
  "heatIndex": {
    "degrees": 24.1,
    "unit": "CELSIUS"
  },
  "windChill": {
    "degrees": 20.9,
    "unit": "CELSIUS"
  },
  "relativeHumidity": 93,
  "uvIndex": 0,
  "precipitation": {
    "probability": {
      "percent": 10,
      "type": "RAIN"
    },
    "snowQpf": {
      "quantity": 0,
      "unit": "MILLIMETERS"
    },
    "qpf": {
      "quantity": 0.1118,
      "unit": "MILLIMETERS"
    }
  },
  "thunderstormProbability": 0,
  "airPressure": {
    "meanSeaLevelMillibars": 1011.54
  },
  "wind": {
    "direction": {
      "degrees": 0,
      "cardinal": "NORTH"
    },
    "speed": {
      "value": 6,
      "unit": "KILOMETERS_PER_HOUR"
    },
    "gust": {
      "value": 12,
      "unit": "KILOMETERS_PER_HOUR"
    }
  },
  "visibility": {
    "distance": 12,
    "unit": "KILOMETERS"
  },
  "cloudCover": 100,
  "currentConditionsHistory": {
    "temperatureChange": {
      "degrees": 0.3,
      "unit": "CELSIUS"
    },
    "maxTemperature": {
      "degrees": 27.4,
      "unit": "CELSIUS"
    },
    "minTemperature": {
      "degrees": 20.1,
      "unit": "CELSIUS"
    },
    "snowQpf": {
      "quantity": 0,
      "unit": "MILLIMETERS"
    },
    "qpf": {
      "quantity": 4.6914,
      "unit": "MILLIMETERS"
    }
  }
}



*/

/*
temperature          -	Temperatura atual (geralmente em Celsius por padrão).
conditionDescription -	Texto amigável (ex: "Céu limpo", "Chuva leve").
humidity	           - Porcentagem de umidade relativa.
wind	               - Velocidade e direção do vento.
visibility	         - Distância de visibilidade em metros.

*/



/*
export async function getWeather(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${OPEN_WEATHER_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
}*/

