import axios from 'axios';
import * as FileSystem from "expo-file-system";
import { Buffer } from "buffer";

const baseAPIUrl = 'https://api-formularios-render.onrender.com'
// const baseAPIUrl = 'https://7130-2804-14d-8e86-9cfc-3dca-82be-390-4d2f.ngrok-free.app'
                    
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

  getForms: async (formData: any) => {
    try {
      const response = await serverInstance.post('/templates/getAll', formData);
      return response.data.content;
    } catch (error: any) {
      console.error('Error fetching forms:', error.message);
      throw error;
    }
  },

  getFormById: async (id: string) => {
    try {
      const response = await serverInstance.get(`/templates/${id}`);
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

  registerCompany: async (registerData: any) => {
    try {
      const response: any = await serverInstance.post(`/companies/register`, registerData);
      return response.data;
    } catch (error: any) {
      console.error('Error creating user:', error.message);
      throw error;
    }
  },

  getCompanies: async (data: any) => {
    try {
      const response: any = await serverInstance.post(`/companies/companyList`, data);
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
        "/templates/generateAnswarePDF",
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

      // monta o nome do arquivo: "NomeForm_2026-04-12.pdf"
      const today = new Date().toLocaleDateString('en-CA'); // formato YYYY-MM-DD
      const safeName = (data.formName as string | undefined)
        ?.trim()
        .replace(/[^a-zA-Z0-9À-ÿ _-]/g, '')  // remove caracteres inválidos em nomes de arquivo
        .replace(/\s+/g, '_')
        ?? 'Form';
      const fileName = `${safeName}_${today}.pdf`;

      // cria o arquivo dentro da pasta escolhida pelo usuário
      const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
        permissions.directoryUri,
        fileName,
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

  addNote: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/answares/addNote', data)
      return response.data.content
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },

  listSections: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/sections/listSections', data)
      return response.data
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },

  newSection: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/sections/newSection', data)
      return response.data
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },

  deleteSection: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/sections/deleteSection', data)
      return response.data
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },

  setAsDone: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/answares/setAsDone', data)
      return response.data
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },

  uploadImage: async (data: any) => {
    try {
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
      return responseJson
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },
  getImageUrl: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/images/getImageUrl', data)
      return response.data
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },
  deleteImage: async (data: { fileName: string }) => {
    try {
      const response: any = await serverInstance.post('/images/deleteImage', data)
      return response.data
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },
  listUsers: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/users/list', data)
      return response.data.content
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },
  deleteUser: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/users/delete', data)
      return response.data.content
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  },
  updateUser: async (data: any) => {
    try {
      const response: any = await serverInstance.post('/users/update', data)
      return response.data.content
    } catch (e) {
      console.error(e)
      return { success: false }
    }
  }
}

export default api;