// src/services/repuestoServicioService.js
import axiosClient from "./axiosClient";

const ENDPOINT = "/repuestos-servicios";

const construirFormData = (dto, archivoImagen) => {
  const formData = new FormData();

  // Blob explícito con type "application/json": sin esto, FormData trata
  // un string plano como "text/plain", y el backend fallaría al deserializarlo.
  formData.append("dto", new Blob([JSON.stringify(dto)], { type: "application/json" }));

  if (archivoImagen) {
    formData.append("imagen", archivoImagen);
  }

  return formData;
};

export const repuestoServicioService = {
  getAll: async () => {
    const response = await axiosClient.get(ENDPOINT);
    return response.data;
  },

  getById: async (id) => {
    const response = await axiosClient.get(`${ENDPOINT}/${id}`);
    return response.data;
  },

  create: async (dto, archivoImagen) => {
    const formData = construirFormData(dto, archivoImagen);
    const response = await axiosClient.post(ENDPOINT, formData);
    return response.data;
  },

  update: async (id, dto, archivoImagen) => {
    const formData = construirFormData(dto, archivoImagen);
    const response = await axiosClient.put(`${ENDPOINT}/${id}`, formData);
    return response.data;
  },

  delete: async (id) => {
    const response = await axiosClient.delete(`${ENDPOINT}/${id}`);
    return response.data;
  },
};