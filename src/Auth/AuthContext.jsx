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
  }, []);

  const restaurarSesion = () => {
    const tokenGuardado = localStorage.getItem(CLAVE_TOKEN);

    if (!tokenGuardado) {
      setCargando(false);
      return;
    }

    try {
      const payload = jwtDecode(tokenGuardado);
      const yaExpiro = payload.exp * 1000 < Date.now();
      if (yaExpiro) {
        localStorage.removeItem(CLAVE_TOKEN);
        setCargando(false);
        return;
      }

      setToken(tokenGuardado);
      setUsuario(mapearPayload(payload));
    } catch {
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

const mapearPayload = (payload) => {
  return {
    username: payload.sub,
    nombre: payload.nombre,
    tipo: payload.tipo,
    rol: payload.rol,
    empleadoId: payload.empleadoId,
    clienteId: payload.clienteId,
    debeCambiarPassword: payload.debeCambiarPassword,
  };
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de un AuthProvider");
  }
  return context;
};