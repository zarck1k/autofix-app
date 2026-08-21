import { createContext, useContext, useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";
import { CLAVE_TOKEN } from "../utils/constantes";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [usuario, setUsuario] = useState(null);

  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    restaurarSesion();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restaurarSesion = () => {
    const tokenGuardado = localStorage.getItem(CLAVE_TOKEN);

    if (!tokenGuardado) {
      setCargando(false);
      return;
    }

    try {
      const payload = jwtDecode(tokenGuardado);

      // "exp" en el JWT viene en segundos desde epoch; Date.now() da milisegundos.
      const yaExpiro = payload.exp * 1000 < Date.now();
      if (yaExpiro) {
        localStorage.removeItem(CLAVE_TOKEN);
        setCargando(false);
        return;
      }

      setToken(tokenGuardado);
      setUsuario(mapearPayload(payload));
    } catch {
      // Token corrupto o ilegible - se descarta en vez de dejar la app en
      // un estado a medias donde "hay token" pero "no hay usuario".
      localStorage.removeItem(CLAVE_TOKEN);
    } finally {
      setCargando(false);
    }
  };

  const login = (tokenNuevo) => {
    const payload = jwtDecode(tokenNuevo);
    localStorage.setItem(CLAVE_TOKEN, tokenNuevo);
    setToken(tokenNuevo);
    setUsuario(mapearPayload(payload));
  };

  const logout = () => {
    localStorage.removeItem(CLAVE_TOKEN);
    setToken(null);
    setUsuario(null);
  };

  const tienePermiso = (rolesPermitidos) => {
    if (!rolesPermitidos || rolesPermitidos.length === 0) return true;
    return usuario ? rolesPermitidos.includes(usuario.rol) : false;
  };

  const value = {
    usuario,
    token,
    cargando,
    estaAutenticado: !!token,
    login,
    logout,
    tienePermiso,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Único punto donde se traduce el payload del token a la forma que usa
// el resto de la app - si el backend agrega/renombra un claim, solo se
// ajusta aquí.
const mapearPayload = (payload) => {
  return {
    username: payload.sub,
    nombre: payload.nombre,
    tipo: payload.tipo,           // "EMPLEADO" o "CLIENTE"
    rol: payload.rol,
    empleadoId: payload.empleadoId,
    clienteId: payload.clienteId,
  };
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
}