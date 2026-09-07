// src/reports/Reportes.jsx
import { useState } from "react";
import ReporteOrdenes from "./ReporteOrdenes";

const reportesDisponibles = [
    {
        id: "ordenes-trabajo",
        titulo: "Órdenes de Trabajo",
        descripcion: "Reporte de órdenes agrupado por estado, para un rango de fechas.",
        icono: "pi pi-file-pdf",
    },
];

export default function Reportes() {
    const [reporteActivo, setReporteActivo] = useState(null);

    return (
        <div className="p-2 md:p-4">
            <h4 className="text-xl font-bold text-gray-700 mb-4">Reportes</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {reportesDisponibles.map((reporte) => (
                    <button
                        key={reporte.id}
                        onClick={() => setReporteActivo(reporte.id)}
                        className="text-left bg-white shadow-md rounded-xl p-5 hover:shadow-lg transition-shadow border border-gray-100"
                    >
                        <i className={`${reporte.icono} text-3xl text-blue-600 mb-2 block`} />
                        <h5 className="font-bold text-gray-800">{reporte.titulo}</h5>
                        <p className="text-sm text-gray-500 mt-1">{reporte.descripcion}</p>
                    </button>
                ))}
            </div>

            {reporteActivo === "ordenes-trabajo" && (
                <ReporteOrdenes visible={true} onHide={() => setReporteActivo(null)} />
            )}
        </div>
    );
}