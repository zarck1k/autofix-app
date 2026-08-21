import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import LoginPage from "../Auth/Login";
import RutaProtegida from "../Auth/RutaProtegida";

export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          element={
            <RutaProtegida>
              <AppLayout />
            </RutaProtegida>
          }
        >
          <Route path="/" element={<div>Inicio</div>} />
          <Route path="/catalogos/marcas" element={<div>Marcas</div>} />
          <Route path="/catalogos/modelos" element={<div>Modelos</div>} />
          <Route path="/catalogos/repuestos-servicios" element={<div>Repuestos y Servicios</div>} />
          <Route path="/clientes" element={<div>Clientes</div>} />
          <Route path="/ordenes-trabajo" element={<div>Gestión de Órdenes</div>} />
          <Route path="/reportes" element={<div>Reportes</div>} />

          <Route
            path="/usuarios"
            element={
              <RutaProtegida rolesPermitidos={["ADMIN"]}>
                <div>Gestión de Usuarios</div>
              </RutaProtegida>
            }
          />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}