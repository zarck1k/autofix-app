import axiosClient from "./axiosClient";

export const reporteService = {
  descargarReporteOrdenes: async (fechaInicio, fechaFin) => {
    try {
      return await axiosClient.get("/reportes/ordenes-trabajo", {
        params: { fechaInicio, fechaFin },
        responseType: "blob",
      });
    } catch (error) {
      
      if (error.response?.data instanceof Blob) {
        const texto = await error.response.data.text();
        try {
          error.response.data = JSON.parse(texto);
        } catch {
          // el cuerpo no era JSON válido - se deja tal cual
        }
      }
      throw error;
    }
  },
};