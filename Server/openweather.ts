const OPEN_WEATHER_API_KEY = "8b2371dd3cc2ed5c4a2bf71a13f5d904";

export async function getWeather(lat: number, lon: number) {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&lang=pt_br&appid=${OPEN_WEATHER_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();
  return data;
}
