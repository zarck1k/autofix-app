// src/services/axiosClient.js
import axios from "axios";
import { CLAVE_TOKEN } from "../utils/constantes";

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
});

// Request: agrega el token a CADA petición automáticamente - ningún
// componente tiene que acordarse de hacerlo por su cuenta.

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem(CLAVE_TOKEN);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response: si el backend responde 401 (token vencido o inválido), se
// limpia la sesión y se manda a /login. Esto vive fuera de un componente
// React (es un interceptor de axios), por eso usa window.location en vez
// de useNavigate - no hay contexto de React disponible aquí.
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem(CLAVE_TOKEN);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default axiosClient;