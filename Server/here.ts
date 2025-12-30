import axios from 'axios';
import axiosRetry from 'axios-retry';
let verbose = true;

export const axiosinstancesHereAutoSuggest = {
  baseDomain: {
    instance: axios.create({
      baseURL: '',
      timeout: 15000
    })
  },
  setTimeout: 15000
};

axiosRetry(axiosinstancesHereAutoSuggest.baseDomain.instance, {
  retries: 3,
  retryCondition: () => true,
  onRetry: () => console.log('retry')
});

const hereApiAutoSuggest = {
  getAddress: {
    get: async (lat: string, long: string, api: string, query: string) => {
      verbose && console.log('Here Request', 'getAddress');
      try {
        const baseUrl = 'https://autosuggest.search.hereapi.com/v1/autosuggest';
        let params = `?at=${lat},${long}&apiKey=${api}&limit=10&show=details&lang=pt-BR&q=${query}`;
        console.log(params)
        const response = await axiosinstancesHereAutoSuggest.baseDomain.instance.get(baseUrl + params);
        return response.data.items;
      } catch (e) {
        console.error('HERE ERROR', 'getAddress: ', e);
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

export default hereApiAutoSuggest;
