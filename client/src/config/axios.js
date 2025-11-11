import axios from 'axios';
import { localStorageDocuments } from '../services/localStorageDocuments';

const API_URL = import.meta.env.VITE_API_URL || '';

axios.defaults.baseURL = API_URL;

let fallbackMode = false;

const enableFallbackMode = () => {
  if (!fallbackMode) {
    fallbackMode = true;
    console.log('📦 localStorage fallback mode enabled - Using mock documents');
  }
};

axios.interceptors.response.use(
  (response) => response,
  async (error) => {
    const { config, response } = error;
    
    if (!response || response.status === 404 || response.status === 500 || error.code === 'ERR_NETWORK') {
      enableFallbackMode();
      
      const url = config.url;
      const method = config.method.toUpperCase();
      
      try {
        if (url.startsWith('/api/documents')) {
          if (method === 'GET') {
            if (url.match(/\/api\/documents\/\d+$/)) {
              const id = url.split('/').pop();
              const data = localStorageDocuments.getDocument(id);
              return { data, status: 200, statusText: 'OK (localStorage)' };
            } else if (url.includes('?')) {
              const params = new URLSearchParams(url.split('?')[1]);
              const queryParams = {};
              for (const [key, value] of params) {
                queryParams[key] = value;
              }
              const data = localStorageDocuments.getDocuments(queryParams);
              return { data, status: 200, statusText: 'OK (localStorage)' };
            } else {
              const data = localStorageDocuments.getDocuments();
              return { data, status: 200, statusText: 'OK (localStorage)' };
            }
          } else if (method === 'POST' && !url.includes('/submit')) {
            const data = localStorageDocuments.createDocument(JSON.parse(config.data));
            return { data, status: 201, statusText: 'Created (localStorage)' };
          } else if (method === 'POST' && url.includes('/submit')) {
            const id = url.split('/')[3];
            const data = localStorageDocuments.submitDocument(id);
            return { data, status: 200, statusText: 'OK (localStorage)' };
          } else if (method === 'PUT') {
            const id = url.split('/')[3];
            const data = localStorageDocuments.updateDocument(id, JSON.parse(config.data));
            return { data, status: 200, statusText: 'OK (localStorage)' };
          }
        }
        
        if (url.startsWith('/api/review') && method === 'POST') {
          if (url.includes('/comment')) {
            const id = url.split('/')[3];
            const { comment } = JSON.parse(config.data);
            const data = localStorageDocuments.addComment(id, comment);
            return { data, status: 200, statusText: 'OK (localStorage)' };
          } else if (url.includes('/review')) {
            const id = url.split('/')[3];
            const { action, notes } = JSON.parse(config.data);
            const data = localStorageDocuments.reviewDocument(id, action, notes);
            return { data, status: 200, statusText: 'OK (localStorage)' };
          }
        }
        
        if (url.startsWith('/api/approve') && method === 'POST') {
          const id = url.split('/')[3];
          const { action, notes } = JSON.parse(config.data);
          const data = localStorageDocuments.approveDocument(id, action, notes);
          return { data, status: 200, statusText: 'OK (localStorage)' };
        }
        
        if (url.startsWith('/api/sign') && method === 'POST') {
          const id = url.split('/')[3];
          const data = localStorageDocuments.signDocument(id, JSON.parse(config.data));
          return { data, status: 200, statusText: 'OK (localStorage)' };
        }
        
        if (url.startsWith('/api/attachments') && method === 'POST') {
          const id = url.split('/')[3];
          const formData = config.data;
          const file = formData.get('file');
          if (file) {
            const data = localStorageDocuments.uploadAttachment(id, file);
            return { data, status: 200, statusText: 'OK (localStorage)' };
          }
        }
        
        if (url.startsWith('/api/archive')) {
          const params = url.includes('?') ? new URLSearchParams(url.split('?')[1]) : new URLSearchParams();
          const queryParams = { status: 'archived' };
          for (const [key, value] of params) {
            queryParams[key] = value;
          }
          const data = localStorageDocuments.getDocuments(queryParams);
          return { data, status: 200, statusText: 'OK (localStorage)' };
        }
      } catch (fallbackError) {
        console.error('localStorage fallback error:', fallbackError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default axios;
export { fallbackMode };
