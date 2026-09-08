import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../services/axiosClient";
import { useAuth } from "../Auth/AuthContext";

export default function CambiarPassword() {  
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();
  const { logout } = useAuth();

  const manejarEnvio = async (evento) => {
    evento.preventDefault();
    setEnviando(true);

    if (nuevaPassword.length < 6) {
      Swal.fire({ icon: "warning", title: "Error", text: "La contraseña debe tener al menos 6 caracteres" });
      setEnviando(false);
      return;
    }

    if (nuevaPassword !== confirmarPassword) {
      Swal.fire({ icon: "warning", title: "Error", text: "Las contraseñas no coinciden" });
      setEnviando(false);
      return;
    }

    try {
      await axiosClient.post("/auth/cambiar-password", { nuevaPassword });
      Swal.fire({ icon: "success", title: "Éxito", text: "Contraseña cambiada correctamente" });
      logout();
      navigate("/login", { replace: true });
    } catch (error) {
      const mensaje = error.response?.data?.message || "No se pudo cambiar la contraseña";
      Swal.fire({ icon: "error", title: "Error", text: mensaje });
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
      <form onSubmit={manejarEnvio} className="bg-white shadow-md rounded-lg p-8 w-full max-w-sm">
        <h1 className="text-2xl font-bold text-slate-900 mb-2 text-center">Cambiar Contraseña</h1>
        <p className="text-sm text-gray-600 mb-6 text-center">Debes cambiar tu contraseña temporal</p>

        <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
        <input
          type="password"
          value={nuevaPassword}
          onChange={(evento) => setNuevaPassword(evento.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
          minLength="6"
          autoFocus
        />

        <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
        <input
          type="password"
          value={confirmarPassword}
          onChange={(evento) => setConfirmarPassword(evento.target.value)}
          className="w-full border border-slate-300 rounded-md px-3 py-2 mb-6 focus:outline-none focus:ring-2 focus:ring-blue-500"
          required
        />

        <button
          type="submit"
          disabled={enviando}
          className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-medium py-2 rounded-md transition-colors"
        >
          {enviando ? "Cambiando..." : "Cambiar Contraseña"}
        </button>
      </form>
    </div>
  );
}