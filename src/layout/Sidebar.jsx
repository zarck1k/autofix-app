import { useState } from "react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../Auth/AuthContext";

const opcionesMenu = [
  { etiqueta: "Inicio", icono: "pi pi-home", ruta: "/" },
  {
    etiqueta: "Catálogos",
    icono: "pi pi-box",
    submenu: [
      { etiqueta: "Marcas", ruta: "/catalogos/marcas" },
      { etiqueta: "Modelos", ruta: "/catalogos/modelos" },
      { etiqueta: "Repuestos y Servicios", ruta: "/catalogos/repuestos-servicios" },
    ],
  },
  { etiqueta: "Clientes", icono: "pi pi-users", ruta: "/clientes" },
  { etiqueta: "Gestión de Órdenes", icono: "pi pi-clipboard", ruta: "/ordenes-trabajo" },
  { etiqueta: "Reportes", icono: "pi pi-chart-bar", ruta: "/reportes" },
  // rolesPermitidos: si se define, la opción solo aparece para esos roles -
  // mismo criterio que ya aplicamos con @PreAuthorize del lado del backend.
  { etiqueta: "Gestión de Usuarios", icono: "pi pi-user-edit", ruta: "/usuarios", rolesPermitidos: ["ADMIN"] },
];

export default function Sidebar ({ isOpen }) {
  const { usuario, tienePermiso } = useAuth();
  const [submenuAbierto, setSubmenuAbierto] = useState(null);

  const opcionesVisibles = opcionesMenu.filter(
    (opcion) => !opcion.rolesPermitidos || tienePermiso(opcion.rolesPermitidos)
  );

  return (
    <aside
      className={`
        bg-slate-900 text-slate-100 flex flex-col shrink-0
        fixed md:static inset-y-0 left-0 z-30 h-full
        transition-all duration-300 ease-in-out
        ${isOpen
          ? "w-64 translate-x-0"
          : "w-64 -translate-x-full md:w-0 md:translate-x-0 md:overflow-hidden"}
      `}
    >
      <div className="h-16 flex items-center px-4 border-b border-slate-700 shrink-0">
        <span className="font-bold text-lg whitespace-nowrap">AutoFix</span>
      </div>

      <nav className="flex-1 overflow-y-auto py-2">
        {opcionesVisibles.map((opcion) => (
          <div key={opcion.etiqueta}>
            {opcion.submenu ? (
              <SubmenuItem
                opcion={opcion}
                abierto={submenuAbierto === opcion.etiqueta}
                onToggle={() =>
                  setSubmenuAbierto(submenuAbierto === opcion.etiqueta ? null : opcion.etiqueta)
                }
              />
            ) : (
              <EnlaceMenu opcion={opcion} />
            )}
          </div>
        ))}
      </nav>

      <div className="px-4 py-3 border-t border-slate-700 text-xs text-slate-400 shrink-0 truncate">
        {usuario?.nombre}
      </div>
    </aside>
  );
}

const EnlaceMenu = ({ opcion }) => {
  return (
    <NavLink
      to={opcion.ruta}
      end={opcion.ruta === "/"}   // sin "end", "/" quedaría "activo" en cualquier ruta
      className={({ isActive }) =>
        `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
          isActive ? "bg-blue-600 text-white" : "hover:bg-slate-800"
        }`
      }
    >
      <i className={`${opcion.icono} text-base`} />
      {opcion.etiqueta}
    </NavLink>
  );
}

const SubmenuItem = ({ opcion, abierto, onToggle }) => {
  return (
    <>
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between gap-3 px-4 py-3 text-sm hover:bg-slate-800 transition-colors"
      >
        <span className="flex items-center gap-3">
          <i className={`${opcion.icono} text-base`} />
          {opcion.etiqueta}
        </span>
        <i className={`pi pi-chevron-${abierto ? "up" : "down"} text-xs`} />
      </button>

      {abierto && (
        <div className="bg-slate-950">
          {opcion.submenu.map((sub) => (
            <NavLink
              key={sub.ruta}
              to={sub.ruta}
              className={({ isActive }) =>
                `block pl-12 pr-4 py-2 text-sm transition-colors ${
                  isActive ? "bg-blue-600 text-white" : "text-slate-300 hover:bg-slate-800"
                }`
              }
            >
              {sub.etiqueta}
            </NavLink>
          ))}
        </div>
      )}
    </>
  );
}