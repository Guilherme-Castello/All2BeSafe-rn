import axios from 'axios';
import { Platform } from 'react-native';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Buffer } from 'buffer';

const baseAPIUrl = 'https://api-formularios-render.onrender.com'
// const baseAPIUrl = 'https://f7a0-2804-14d-8e86-9cfc-9240-6012-cc3e-a5c3.ngrok-free.app'
                    
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

// ─────────────────────────────────────────────────────────────────────────────
// PDF helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Sanitiza o nome do formulário e retorna "NomeForm_YYYY-MM-DD.pdf" */
function buildPdfFileName(formName?: string): string {
  const today = new Date().toLocaleDateString('en-CA'); // YYYY-MM-DD
  const safeName = (formName ?? '')
    .trim()
    .replace(/[^a-zA-Z0-9À-ÿ _-]/g, '')
    .replace(/\s+/g, '_')
    || 'Form';
  return `${safeName}_${today}.pdf`;
}

/**
 * iOS — escreve o PDF num ficheiro temporário e abre o Share Sheet nativo.
 * O utilizador pode escolher "Salvar em Arquivos", enviar por WhatsApp, etc.
 */
async function savePdfIos(
  base64Data: string,
  fileName: string
): Promise<{ success: boolean; fileUri?: string; error?: string }> {
  const sharingAvailable = await Sharing.isAvailableAsync();
  if (!sharingAvailable) {
    return { success: false, error: 'Compartilhamento não disponível neste dispositivo' };
  }

  // Grava num diretório temporário (cache) — não requer permissão
  const tempUri = `${FileSystem.cacheDirectory}${fileName}`;
  await FileSystem.writeAsStringAsync(tempUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  // Abre o Share Sheet do iOS
  await Sharing.shareAsync(tempUri, {
    mimeType: 'application/pdf',
    dialogTitle: 'Salvar ou compartilhar PDF',
    UTI: 'com.adobe.pdf',
  });

  // Remove o arquivo temporário após o share (best-effort)
  FileSystem.deleteAsync(tempUri, { idempotent: true }).catch(() => {});

  return { success: true, fileUri: tempUri };
}

/**
 * Android — solicita permissão ao SAF para o usuário escolher a pasta de destino
 * e salva o arquivo diretamente lá. Comportamento original mantido.
 */
async function savePdfAndroid(
  base64Data: string,
  fileName: string
): Promise<{ success: boolean; fileUri?: string; error?: string }> {
  const permissions =
    await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();

  if (!permissions.granted) {
    return { success: false, error: 'Permissão negada para salvar arquivo' };
  }

  const fileUri = await FileSystem.StorageAccessFramework.createFileAsync(
    permissions.directoryUri,
    fileName,
    'application/pdf'
  );

  await FileSystem.writeAsStringAsync(fileUri, base64Data, {
    encoding: FileSystem.EncodingType.Base64,
  });

  console.log('[savePdfAndroid] PDF salvo em:', fileUri);
  return { success: true, fileUri };
}

// ─────────────────────────────────────────────────────────────────────────────

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
      // ── 1. Busca o PDF na API ──────────────────────────────────────────────
      const response: any = await serverInstance.post(
        '/templates/generateAnswarePDF',
        data,
        { responseType: 'arraybuffer' }
      );

      if (response?.data?.error) throw new Error(response.data.error);

      // ── 2. Converte arraybuffer → base64 ──────────────────────────────────
      const base64Data = Buffer.from(response.data, 'binary').toString('base64');
      if (!base64Data) throw new Error('Conversão base64 inválida');

      // ── 3. Monta nome do arquivo: "NomeForm_YYYY-MM-DD.pdf" ───────────────
      const fileName = buildPdfFileName(data.formName);

      // ── 4. Delega para o fluxo da plataforma ─────────────────────────────
      if (Platform.OS === 'ios') {
        return await savePdfIos(base64Data, fileName);
      }
      return await savePdfAndroid(base64Data, fileName);

    } catch (e: any) {
      console.error('[generateAnswaredPdf]', e);
      return { success: false, error: e.message ?? 'Erro desconhecido' };
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