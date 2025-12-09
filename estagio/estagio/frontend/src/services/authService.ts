import axios from 'axios';
import { LoginCredentials, LoginResponse } from '../types/auth';

// URL base da API - usar URL relativa para aproveitar rewrites do Next.js
// Requisições para /api vão ser reescritas para http://localhost:8080/api pelo next.config.ts
const API_URL = '/api';

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true,
});

console.log('✅ API_URL configurada para:', API_URL, '(reescrita para http://localhost:8080/api)');

// Adicionar token ao header se existir
api.interceptors.request.use((config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    // Não adicionar o header Authorization para endpoints de login/registro
    const skipAuthFor = ['/auth/login', '/estudantes/registro', '/empresas/registro'];
    if (config.url && skipAuthFor.some(path => config.url && config.url.includes(path))) {
        console.log('🔒 Skipping auth header for:', config.url);
        return config;
    }
    if (token && token !== 'undefined' && token !== 'null' && token.trim().length > 0) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log('📤 Token adicionado ao header');
    } else if (token) {
        console.warn('⚠️ Token inválido ou vazio no localStorage, removendo...');
        if (typeof window !== 'undefined') {
            localStorage.removeItem('token');
        }
    }
    console.log('📤 Enviando requisição para:', config.url);
    return config;
});

// Interceptor de resposta para debug
api.interceptors.response.use(
    (response) => {
        console.log('✅ Resposta recebida:', response.status, response.statusText);
        return response;
    },
    (error) => {
        console.error('❌ Erro na requisição:', {
            message: error.message,
            code: error.code,
            status: error.response?.status,
            statusText: error.response?.statusText,
            url: error.config?.url,
            data: error.response?.data,
        });
        return Promise.reject(error);
    }
);

export const login = async (credentials: LoginCredentials): Promise<LoginResponse> => {
    try {
        const response = await api.post('/auth/login', credentials);
        return {
            token: response.data.token,
            user: {
                id: response.data.id,
                nome: response.data.nome,
                role: response.data.role
            }
        };
    } catch (error) {
        console.error("Erro no serviço de login:", error);
        throw error;
    }
};

export const registerEstudante = async (data: any) => {
    try {
        console.log('Enviando registro de estudante para:', API_URL + '/estudantes/registro');
        console.log('Dados:', data);
        const response = await api.post('/estudantes/registro', data);
        console.log('✅ Resposta do servidor:', response.data);
        return response.data;
    } catch (error: any) {
        console.error("❌ Erro ao registrar estudante:");
        console.error("Mensagem:", error.message);
        console.error("Código:", error.code);
        console.error("Status HTTP:", error?.response?.status);
        console.error("Resposta do servidor:", error?.response?.data);
        console.error("Erro completo:", error);
        throw error;
    }
};

export const registerEmpresa = async (data: any) => {
    try {
        const response = await api.post('/empresas/registro', data);
        return response.data;
    } catch (error) {
        console.error("Erro ao registrar empresa:", error);
        throw error;
    }
};

export const getVagas = async () => {
    try {
        const response = await api.get('/vagas-estagio/abertas');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar vagas:", error);
        throw error;
    }
};

export const getVagasEstudante = async (areaIds: number[]) => {
    try {
        const response = await api.get('/vagas-estagio/por-areas', {
            params: { areaIds: areaIds.join(',') }
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar vagas por áreas:", error);
        throw error;
    }
};

export const inscreverVaga = async (estudanteId: number, vagaId: number) => {
    try {
        const response = await api.post('/inscricoes', {
            estudante: { id: estudanteId },
            vaga: { id: vagaId }
        });
        return response.data;
    } catch (error) {
        console.error("Erro ao se inscrever em vaga:", error);
        throw error;
    }
};

export const getInscricoesEstudante = async (estudanteId: number) => {
    try {
        const response = await api.get(`/inscricoes/estudante/${estudanteId}`);
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar inscrições:", error);
        throw error;
    }
};

export const getAreasInteresse = async () => {
    try {
        const response = await api.get('/areas-interesse');
        return response.data;
    } catch (error) {
        console.error("Erro ao buscar áreas de interesse:", error);
        throw error;
    }
};
