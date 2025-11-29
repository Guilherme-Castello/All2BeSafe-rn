import axios from 'axios';
import axiosRetry from 'axios-retry';
let verbose = true;

export const axiosinstancesHere = {
  baseDomain: {
    instance: axios.create({
      baseURL: '',
      timeout: 15000
    })
  },
  setTimeout: 15000
};

axiosRetry(axiosinstancesHere.baseDomain.instance, {
  retries: 3,
  retryCondition: () => true,
  onRetry: () => console.log('retry')
});

const hereApi = {
  getAddressByCoordinate: {
    get: async (lat: string, long: string, api: string) => {
      verbose && console.log('Here Request', 'getAddressByCoordinate');
      try {
        const baseUrl = 'https://revgeocode.search.hereapi.com/v1/revgeocode';
        let params = `?at=${lat},${long}&apiKey=${api}&types=address&lang=pt-BR&limit=1`;
        const response = await axiosinstancesHere.baseDomain.instance.get(baseUrl + params);
        return response.data.items[0];
      } catch (e) {
        console.error('HERE ERROR', 'getAddressByCoordinate: ', e);
        handleError(e)
      }
    }
  },
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

export default hereApi;
