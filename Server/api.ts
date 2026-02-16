import axios from 'axios';
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

const baseAPIUrl = 'https://28cb-2804-14d-8e86-9cfc-55ab-9223-e25c-5e32.ngrok-free.app'

const serverInstance = axios.create({
  baseURL: baseAPIUrl+'/api', // On debug environment, remember to use ngrok to access your local server [Remember to set up .env]
  // To start ngrok, use: ngrok http 5000. I'll connect to your localhost:5000 and permit u to access your local API from the app
  timeout: 900000,
  maxBodyLength: Infinity,
  maxContentLength: Infinity,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = {
  createForm: async (formData: any) => {
    try {
      const response = await serverInstance.post('/templates', formData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating form:', error.message);
      throw error;
    }
  },

  getForms: async () => {
    try {
      const response = await serverInstance.get('/templates');
      return response.data.content;
    } catch (error: any) {
      console.error('Error fetching forms:', error.message);
      throw error;
    }
  },

  getFormById: async (id: string) => {
    try {
      const response = await serverInstance.get(`/templates/${id}`);
      console.log(response.data)
      return response.data.content;
    } catch (error: any) {
      console.error('Error fetching forms:', error.message);
      throw error;
    }
  },

  login: async (loginData: any) => {
    try {
      const response: any = await serverInstance.post(`/users/login`, loginData);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      return error;
    }
  },

  registerUser: async (registerData: any) => {
    try {
      const response: any = await serverInstance.post(`/users/register`, registerData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  },

  answare: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/answares/answare', data)
      if (response?.data?.error) throw new Error(response.data.error)
      return response.data;

    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      throw error;
    }
  },
  updateAnsware: async (data: any) => {
    try {

      const response: any = await serverInstance.post('/answares/updateAnsware', data)
      console.log("RECEIVED RESPONSE")
      console.log(response)
      if (response?.data?.error) throw new Error(response.data.error)
      return response.data;

    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      throw error;
    }
  },

  generateAnswaredPdf: async (data: any) => {
    try {

      // faz a requisição para gerar o PDF
      const response: any = await serverInstance.post(
        "/templates/generateFormAnswaredPDFHTML",
        data,
        { responseType: "arraybuffer" }
      );

      if (response?.data?.error) throw new Error(response.data.error);

      // pede permissão para escolher o diretório
      const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

      if (!permissions.granted) {
        console.log("Permissão negada para salvar arquivo");
        return { success: false, error: "Permission denied" };
      }

      // converte o PDF recebido em base64
      const base64Data = Buffer.from(response.data, "binary").toString("base64");

      // cria o arquivo dentro da pasta escolhida pelo usuário
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        "formulario.pdf",
        "application/pdf"
      );

      // escreve o conteúdo no arquivo criado
      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("PDF salvo em:", fileUri);
      return { success: true, fileUri };
    } catch (e: any) {
      console.error(e);
      return { success: false, error: e.message };
    }
  },
  getUserAnswares: async (data: any) => {
    try {

      const response: any = await serverInstance.post('/answares/getUserAnswares', data)
      if (response?.data?.error) throw new Error(response.data.error)
      return { success: true, forms: response.data.content }
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },
  getAnswaredForm: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/answares/getAnswaredTemplate', data)
      return response.data.content
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },
  uploadImage: async (data: any) => {
    try {
      console.log(data)
      const formData = new FormData()
      formData.append('file', {
        uri: data,
        name: 'photo.jpg',
        type: 'image/jpeg',
      } as any);
      // await serverInstance.post('/images/uploadImage', null);
      const response = await fetch(
        baseAPIUrl+'/api/images/uploadImage',
        {
          method: 'POST',
          body: formData,
        }
      );
      const responseJson = await response.json()
      console.log('request > ok')
      return responseJson
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },
  getImageUrl: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/images/getImageUrl', data)
      return response.data.content
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },
}

export default api;