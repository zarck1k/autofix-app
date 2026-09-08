import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import axiosClient from "../services/axiosClient";

export default function CambiarPassword() {
  const [nuevaPassword, setNuevaPassword] = useState("");
  const [confirmarPassword, setConfirmarPassword] = useState("");
  const [enviando, setEnviando] = useState(false);
  const navigate = useNavigate();

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
      const respuesta = await axiosClient.post("/auth/cambiar-password", { nuevaPassword });
      
      
      if (respuesta.data.token) {
        localStorage.setItem("token", respuesta.data.token);
      }

      Swal.fire({
        icon: "success",
        title: "Contraseña cambiada",
        text: "Tu contraseña ha sido actualizada correctamente.",
        confirmButtonText: "Continuar"
      }).then(() => {
        navigate("/", { replace: true });
      });

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
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold text-slate-900">Cambiar Contraseña</h1>
          <p className="text-sm text-gray-600">Debes cambiar tu contraseña temporal</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-slate-700 mb-1">Nueva Contraseña</label>
          <input
            type="password"
            value={nuevaPassword}
            onChange={(e) => setNuevaPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
            minLength="6"
            autoFocus
          />
        </div>

        <div className="mb-6">
          <label className="block text-sm font-medium text-slate-700 mb-1">Confirmar Contraseña</label>
          <input
            type="password"
            value={confirmarPassword}
            onChange={(e) => setConfirmarPassword(e.target.value)}
            className="w-full border border-slate-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

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