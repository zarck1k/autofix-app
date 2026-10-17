import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AppLayout from "./AppLayout";
import LoginPage from "../Auth/Login";
import RutaProtegida from "../Auth/RutaProtegida";
import Marcas from "../components/catalogos/Marcas";
import Clientes from "../components/Clientes";
import Vehiculos from "../components/vehiculos/Vehiculos";
import RepuestosServicios from "../components/catalogos/RepuestoServicios";
import OrdenesTrabajo from "../components/ordenes-trabajo/OrdenesTrabajo";
import Reporte from "../components/reports/Reportes";
import Dashboard from "../components/Dashboard";
import Modelos from "../components/catalogos/Modelos";
import Empleados from "../components/Empleados";
import CambiarClave from "../Auth/CambiarPassword";



export default function Router() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/cambiar-password" element={<CambiarClave />} />

        <Route
          element={
            <RutaProtegida>
              <AppLayout />
            </RutaProtegida>
          }
        >
          <Route path="/catalogos/modelos" element={<Modelos />} />
          <Route path="/catalogos/marcas" element={<Marcas />} />
          <Route path="/clientes" element={<Clientes />} />
          <Route path="/ordenes-trabajo" element={<OrdenesTrabajo />}></Route>
          <Route path="/cambiar-password" element={<CambiarPassword />} />

          <Route
            path="/ordenes-trabajo"
            element={<div>Gestión de Órdenes</div>}
          />
          <Route path="/vehiculos" element={<Vehiculos />} />
          <Route
            path="/catalogos/repuestos-servicios"
            element={<RepuestosServicios />}
          />

          <Route
            path="/usuarios"
            element={
              <RutaProtegida rolesPermitidos={["ADMIN"]}>
                <div>Gestión de Usuarios</div>
              </RutaProtegida>
            }
          />
          <Route
            path="/reportes"
            element={
              <RutaProtegida rolesPermisos={["ADMIN", "RECEPCIONISTA"]}>
                <Reporte />
              </RutaProtegida>
            }
          />

          <Route
            path="/empleados"
            element={
              <RutaProtegida rolesPermisos={["ADMIN"]}>
                <Empleados />
              </RutaProtegida>
            }
          />

          <Route
            path="/"
            element={
              <RutaProtegida
                rolesPermisos={["ADMIN", "RECEPCIONISTA", "MECANICO"]}
              >
                <Dashboard />
              </RutaProtegida>
            }
          />
<<<<<<< HEAD
=======

          <Route
            path="/empleado"
            element={
              <RutaProtegida
                rolesPermisos={["ADMIN"]}
              >
                <Empleados />
              </RutaProtegida>
            }
          />

        

>>>>>>> 6652674029b07fc0da2e4360e53167e893e7c08b
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
