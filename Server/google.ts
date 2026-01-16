import axios from 'axios';
import axiosRetry from 'axios-retry';
let verbose = true;

const axiosIntancesGoogleMaps = {
  baseDomain: {
    instance: axios.create({
      baseURL: 'https://maps.googleapis.com/maps/api',
      timeout: 15000
    })
  },
  setTimeout: 15000
};

axiosRetry(axiosIntancesGoogleMaps.baseDomain.instance, {
  retries: 3,
  retryCondition: () => true,
  onRetry: () => console.log('retry')
});

const googleApi = {
  getNearbyPlaces: {
    get: async (
      lat: string,
      long: string,
      radius: number,
      api?: string,
      type?: string | null | undefined,
      keyword?: string | null | undefined
    ) => {
      verbose && console.log('Google Request', 'getNearbyPlaces');

      try {
        let baseUrl = `place/nearbysearch/json?location=${lat},${long}&radius=${radius}&key=${api}`;
        if (type) {
          baseUrl += `&type=${type}`;
        }
        if (keyword) {
          baseUrl += `&keyword=${keyword}`;
        }
        const response = await axiosIntancesGoogleMaps.baseDomain.instance.get(baseUrl);
        return response;
      } catch (e) {
        console.error(e);
        handleError(e)
      }
    }
  },
  getAddressByCoordinate: {
    get: async (lat: string, long: string, api: string) => {
      verbose && console.log('Google Request', 'getAddressByCoordinate');

      try {
        const response = await axiosIntancesGoogleMaps.baseDomain.instance.get(
          `/geocode/json?latlng=${lat},${long}&key=${api}`
        );
        return response;
      } catch (e) {
        console.error(e);
        handleError(e)
      }
    }
  },
  getAddress: {
    get: async (
      address: string,
      api: string,
      latitude: string,
      longitude: string,
      sessionUUID?: string
    ) => {
      verbose && console.log('Google Request', 'getAddress');

      try {
        const response = await axiosIntancesGoogleMaps.baseDomain.instance.get(
          `/place/autocomplete/json?input=${address}&key=${api}&lang=pt&location=${latitude},${longitude}&radius=50000&components=country:br&language=pt-BR&sessiontoken=${sessionUUID}`
        );
        return response;
      } catch (e) {
        console.error(e);
        handleError(e)
      }
    }
  },
  getAddressDetail: {
    get: async (place_id: string, api: string, sessionUUID?: string) => {
      verbose && console.log('Google Request', 'getAddressDetail');

      try {
        const response = await axiosIntancesGoogleMaps.baseDomain.instance.get(
          `/place/details/json?place_id=${place_id}&key=${api}&language=pt-BR&sessiontoken=${sessionUUID}`
        );
        return response;
      } catch (e) {
        console.error(e);
        handleError(e)
      }
    }
  }
};

async function handleError(e: any) {
  let parsedErrorMessage = 'Erro desconhecido';
  if (e?.response?.data?.error) {
    console.log('Error: ', e.response.data.error);
    parsedErrorMessage = e.response.data.error;
  } else if (e instanceof Error) {
    if (e.message.includes('AxiosError') || e.message.includes('Request failed with status code 500') || e.message.includes('Network') || e.message.includes('this must be a')) {
      parsedErrorMessage = 'Houve um problema ao conectar-se ao servidor...';
    } else {
      parsedErrorMessage = e.message;
    }
  }
  console.log('Handle: ', parsedErrorMessage)
  return { success: false, e: parsedErrorMessage };
}

export default googleApi;
