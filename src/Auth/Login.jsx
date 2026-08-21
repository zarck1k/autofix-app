import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../services/axiosClient";
import { useAuth } from "./AuthContext";

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [enviando, setEnviando] = useState(false);

  const { login, estaAutenticado } = useAuth();
  const navigate = useNavigate();

  // Si ya hay sesión activa, lo mandamos directo al panel en vez de
  // mostrar el formulario.
  if (estaAutenticado) {
    navigate("/", { replace: true });
    return null;
  }

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setEnviando(true);

    try {
      const respuesta = await axiosClient.post("/auth/login", { username, password });
      login(respuesta.data.auth.token);
      navigate("/", { replace: true });
    } catch (error) {
        console.log(error)
      const mensaje = error.response?.data?.message || "No se pudo iniciar sesión";
      Swal.fire({ icon: "error", title: "Error", text: mensaje });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form onSubmit={manejarEnvio} className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">AutoFix</h1>

        <label className="block text-sm font-medium text-slate-700 mb-1">Usuario</label>
        <input
          type="text"
          value={username}
          onChange={(evento) => setUsername(evento.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          autoFocus
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Contraseña</label>
        <input
          type="password"
          value={password}
          onChange={(evento) => setPassword(evento.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-md transition-colors"
        >
          {enviando ? "Ingresando..." : "Ingresar"}
        </button>
      </form>
    </div>
  );
}