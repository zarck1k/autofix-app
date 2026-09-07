export const CLAVE_TOKEN = "autofix_token";

const IMAGENES_BASE_URL = import.meta.env.VITE_IMAGES_URL;

export const construirUrlImagen = (nombreArchivo) => {
  if (!nombreArchivo) return null;
  return `${IMAGENES_BASE_URL}/${nombreArchivo}`;
};