// src/services/ordenTrabajoService.js
import axiosClient from "./axiosClient";

const ENDPOINT = "/ordenes-trabajo";

export const ordenTrabajoService = {

    getAll: async (params = {}) => {
        const response = await axiosClient.get(ENDPOINT, {params});
        return response.data;
    },
    getById: async (id) =>{
        const response = await axiosClient.get(`${ENDPOINT}/${id}`);
        return response.data;
    },
    create: async(dto) => {
        const response = await axiosClient.post(ENDPOINT, dto);
        return response.data;
    },
    update: async (id, dto) => {
        const response = await axiosClient.put(`${ENDPOINT}/${id}`, dto);
        return response.data;
    },
    cambiarEstado: async (id, estado) => {
        const response = await axiosClient.patch(`${ENDPOINT}/${id}/estado`, {estado});
        return response.data;
    },
    delete: async (id) => {
        const response = await axiosClient.delete(`${ENDPOINT}/${id}`);
        return response.data;
    }

}