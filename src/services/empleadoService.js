import createCatalogoService from "./catalogoService";
import axiosClient from "./axiosClient"; 

const baseService = createCatalogoService("/empleados");

export const empleadoService = {
    
    getAll: baseService.getAll,
    getById: baseService.getById,
    create: baseService.create,
    update: baseService.update,
    delete: baseService.delete,

    
    listarConUsuario: async () => {
        const response = await axiosClient.get("/auth/empleados");
        return response.data;
    },


    cambiarEstado: async (id, activo) => {
        const response = await axiosClient.patch(`/auth/empleados/${id}/estado?activo=${activo}`);
        return response.data;
    },


    resetearPassword: async (id) => {
        const response = await axiosClient.post(`/auth/empleados/${id}/reset-password`);
        return response.data;
    },

  
    registrarConUsuario: async (data) => {
        const response = await axiosClient.post("/auth/registro-empleado", data);
        return response.data;
    },

    
    editarConUsuario: async (id, data) => {
        const response = await axiosClient.put(`/auth/empleados/${id}`, data);
        return response.data;
    }
};