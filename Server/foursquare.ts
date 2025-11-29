import axios from 'axios';
import axiosRetry from 'axios-retry';

const axiosIntancesFourSquare = {
  baseDomain: {
    instance: axios.create({
      // V2 api can be disabled soon
      baseURL: 'https://api.foursquare.com/v2',
      timeout: 15000
    })
  },
  setTimeout: 15000
};

axiosRetry(axiosIntancesFourSquare.baseDomain.instance, {
  retries: 3,
  retryCondition: () => true,
  onRetry: () => console.log('retry')
});
const defaultFields = 'categories,geocodes,location,name,fsq_id';

// Uses V3 of places API. Isn't in use yet
const fourSquareApiV3 = {
  // https://docs.foursquare.com/developer/reference/places-nearby
  getNearbyPlaces: {
    get: async (
      lat: string,
      long: string,
      radius: number,
      fields?: string,
      limit?: number,
      query?: string
    ) => {
      console.log('FourSquare Request', 'getNearbyPlaces');
      try {
        let baseUrl = `places/nearby?ll=${lat},${long}&hacc=${radius}`;
        if (fields) baseUrl = `${baseUrl}&fields=${fields}`;
        if (limit) baseUrl = `${baseUrl}&limit=${limit}`;
        if (query) baseUrl = `${baseUrl}&query=${query}`;

        const response = await axiosIntancesFourSquare.baseDomain.instance.get(baseUrl);
        return response.data;
      } catch (e) {
        console.error(e);
      }
    }
  },

  // https://docs.foursquare.com/developer/reference/place-details
  // !! DEPRECATED !!
  getPlaceDetails: {
    get: async (fsq_id: string, fields: string = defaultFields) => {
      console.log('FourSquare Request', 'getPlaceDetails');
      try {
        let baseUrl = `places/${fsq_id}`;
        const response = await axiosIntancesFourSquare.baseDomain.instance.get(baseUrl);
        return response.data;
      } catch (e) {
        console.error(e);
      }
    }
  }
};
const fourSquareApiV2 = {
  // https://docs.foursquare.com/developer/reference/search-for-nearby-venues
  getNearbyPlaces: {
    get: async (
      lat: string,
      long: string,
      radius: number,
      client_id: string,
      client_secret: string,
      fields?: string,
      limit?: number,
      categoryId?: string,
      query?: string
    ) => {
      console.log('FourSquareV2 Request', 'getNearbyPlaces');
      try {
        let baseUrl = `venues/search?ll=${lat},${long}&v=20130815&client_id=${client_id}&client_secret=${client_secret}&radius=${radius}&categoryId=${categoryId}`;
        if (fields) baseUrl = `${baseUrl}&fields=${fields}`;
        if (limit) baseUrl = `${baseUrl}&limit=${limit}`;
        if (query) baseUrl = `${baseUrl}&query=${query}`;
        const response = await axiosIntancesFourSquare.baseDomain.instance.get(baseUrl);
        return response.data.response.venues;
      } catch (e) {
        console.error(e);
      }
    }
  },

  // https://docs.foursquare.com/developer/reference/get-venue-details
  getPlaceDetails: {
    get: async (fsq_id: string, client_id: string, client_secret: string) => {
      console.log('FourSquareV2 Request', 'getPlaceDetails');
      try {
        let baseUrl = `venues/${fsq_id}?client_id=${client_id}&client_secret=${client_secret}&v=20130815`;
        const response = await axiosIntancesFourSquare.baseDomain.instance.get(baseUrl);
        return response.data.response.venue;
      } catch (e) {
        console.error(e);
      }
    }
  }
};

export default fourSquareApiV2;
