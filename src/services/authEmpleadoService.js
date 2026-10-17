import axiosClient from "./axiosClient";

const BASE_URL = "/auth";

export const authEmpleadoService = {

    listar: async () => {
        const response = await axiosClient.get(`${BASE_URL}/empleados`);
        return response.data;
    },

   
    registrar: async (data) => {
        const response = await axiosClient.post(`${BASE_URL}/registro-empleado`, data);
        return response.data;
    },


    editar: async (id, data) => {
        const response = await axiosClient.put(`${BASE_URL}/empleados/${id}`, data);
        return response.data;
    },

    cambiarEstado: async (id, activo) => {
        const response = await axiosClient.patch(`${BASE_URL}/empleados/${id}/estado?activo=${activo}`);
        return response.data;
    },

    resetearPassword: async (id) => {
        const response = await axiosClient.post(`${BASE_URL}/empleados/${id}/reset-password`);
        return response.data;
    },

    cambiarPassword: async (nuevaPassword) => {
        const response = await axiosClient.post(`${BASE_URL}/cambiar-password`, { nuevaPassword });
        return response.data;
    },


    eliminar: async (id) => {
        const response = await axiosClient.delete(`/empleados/${id}`);
        return response.data;
    }
};