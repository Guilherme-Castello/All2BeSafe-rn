import axios from 'axios';
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

const serverInstance = axios.create({
  baseURL: 'https://9dfac2baf3bb.ngrok-free.app/api', // On debug environment, remember to use ngrok to access your local server [Remember to config .env]
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

const api = {
  createForm: async (formData: any) => {
    try {
      const response = await serverInstance.post('/formularios', formData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating form:', error.message);
      throw error;
    }
  },

  getForms: async () => {
    try {
      const response = await serverInstance.get('/formularios');
      return response.data;
    } catch (error: any) {
      console.error('Error fetching forms:', error.message);
      throw error;
    }
  },

  getFormById: async (id: string) => {
    try {
      const response = await serverInstance.get(`/formularios/${id}`);
      return response.data;
    } catch (error: any) {
      console.error('Error fetching forms:', error.message);
      throw error;
    }
  },

  login: async (loginData: any) => {
    try {
      const response: any = await serverInstance.post(`/users/login`, loginData);
      if (response?.data?.error) throw new Error(response.data.error)
      return response.data;
    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      throw error;
    }
  },

  answare: async (data: any) => {
    console.log('a', data)
    try {
      const response: any = await serverInstance.post('/formularios/answare', data)
      if (response?.data?.error) throw new Error(response.data.error)
      return response.data;

    } catch (error: any) {
      console.error('Error fetching user:', error.message);
      throw error;
    }
  },

  generatePdf: async (data: any) => {
    try{
      console.log('response')
      const response: any = await serverInstance.post('/formularios/generateFormPDFHTML', data, {responseType: "arraybuffer"})
      if (response?.data?.error) throw new Error(response.data.error)

      const base64Data = Buffer.from(response.data, "binary").toString("base64");
      const fileUri = FileSystem.documentDirectory + "formulario.pdf";

      await FileSystem.writeAsStringAsync(fileUri, base64Data, {
        encoding: FileSystem.EncodingType.Base64,
      });

      console.log("PDF salvo em:", fileUri);
      return {success: true}
    } catch(e) {
      console.error(e)
      return {success: false}
    }
  },

  generateAnswaredPdf: async (data: any) => {
  try {
    console.log("response");

    // faz a requisição para gerar o PDF
    const response: any = await serverInstance.post(
      "/formularios/generateFormAnswaredPDFHTML",
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
}
}

export default api;