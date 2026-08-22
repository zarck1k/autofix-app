
import axiosClient from "./axiosClient";

const catalogoService = (endpoint) => ({

    //función para obtener todos los registros - para un DropDown o dt
    getAll: async () => {
        const response = await axiosClient.get(endpoint);
        return response.data;
    },
    //obtener un registro por id
    getById: async (id) => {
        const response = await axiosClient.get(`${endpoint}/${id}`);
        return response.data;
    },

    //crear un registro
    create: async (dto) => {
        const response = await axiosClient.post(endpoint,dto);
        return response.data;
    },
    //actualizar un registro
    update: async (id,dto) => {
        const response = await axiosClient.put(`${endpoint}/${id}`,dto);
        return response.data;
    },
    delete: async (id) => {
        const response = await axiosClient.delete(`${endpoint}/${id}`);
        return response.data;
    },

});

export default catalogoService;