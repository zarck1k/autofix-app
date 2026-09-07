// src/reports/ReporteOrdenes.jsx
import { useState, useRef } from "react";
import { Dialog } from "primereact/dialog";
import { Calendar } from "primereact/calendar";
import { Button } from "primereact/button";
import { Toast } from "primereact/toast";

import { reporteService } from "../../services/ReporteService";
import { ordenTrabajoService } from "../../services/ordenTrabajoService";
import { mostrarErrorApi } from "../../utils/alertasApi";

const formatearFechaParaBackend = (fecha) => {
    if (!fecha) return null;
    const year = fecha.getFullYear();
    const month = String(fecha.getMonth() + 1).padStart(2, "0");
    const day = String(fecha.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
};

export default function ReporteOrdenes({ visible, onHide }) {
    const [fechaInicio, setFechaInicio] = useState(null);
    const [fechaFin, setFechaFin] = useState(null);
    const [generando, setGenerando] = useState(false);

    const toast = useRef(null);

    const generarReporte = async () => {
        if (!fechaInicio || !fechaFin) {
            toast.current.show({ severity: "warn", summary: "Atención", detail: "Seleccione ambas fechas" });
            return;
        }
        if (fechaInicio > fechaFin) {
            toast.current.show({
                severity: "warn",
                summary: "Atención",
                detail: "La fecha de inicio no puede ser posterior a la fecha fin",
            });
            return;
        }

        const fechaInicioStr = formatearFechaParaBackend(fechaInicio);
        const fechaFinStr = formatearFechaParaBackend(fechaFin);

        //abrir una nueva pestaña en el navegador
        const nuevaPestana = window.open("", "_blank");
        if (nuevaPestana) {
            nuevaPestana.document.write("Generando el reporte...");
        }

        setGenerando(true);
        try {
            const ordenesEnRango = await ordenTrabajoService.getAll({
                fechaInicio: fechaInicioStr,
                fechaFin: fechaFinStr,
            });

            if (ordenesEnRango.length === 0) {
                //no hay nada que mostrar se cierra la pestaña
                if (nuevaPestana) nuevaPestana.close();
                toast.current.show({
                    severity: "warn",
                    summary: "Atención",
                    detail: "No se encontraron órdenes de trabajo en el rango seleccionado.",
                    life: 4000,
                });
                return;
            }

            const respuesta = await reporteService.descargarReporteOrdenes(fechaInicioStr, fechaFinStr);

            const blobUrl = window.URL.createObjectURL(new Blob([respuesta.data], { type: "application/pdf" }));

            if (nuevaPestana) {
                nuevaPestana.location.href = blobUrl;
            } else {
                toast.current.show({
                    severity: "warn",
                    summary: "Atención",
                    detail: "El navegador bloqueó la ventana emergente. Habilite las ventanas emergentes para este sitio.",
                    life: 6000,
                });
            }

            onHide();
        } catch (error) {
            if (nuevaPestana) nuevaPestana.close();
            mostrarErrorApi(toast, error, "No se pudo generar el reporte");
        } finally {
            setGenerando(false);
        }
    };

    return (
        <Dialog
            visible={visible}
            style={{ width: "28rem" }}
            header="Reporte de Órdenes de Trabajo"
            modal
            onHide={onHide}
            footer={
                <div className="flex justify-end gap-2">
                    <Button label="Cancelar" icon="pi pi-times" outlined onClick={onHide} disabled={generando} />
                    <Button label="Generar Reporte" icon="pi pi-file-pdf" onClick={generarReporte} loading={generando} />
                </div>
            }
        >
            <Toast ref={toast} />

            <div className="field">
                <label className="font-bold block mb-2">Fecha inicio</label>
                <Calendar
                    value={fechaInicio}
                    onChange={(e) => setFechaInicio(e.value)}
                    dateFormat="dd/mm/yy"
                    className="w-full"
                    showIcon
                />
            </div>

            <div className="field">
                <label className="font-bold block mb-2">Fecha fin</label>
                <Calendar
                    value={fechaFin}
                    onChange={(e) => setFechaFin(e.value)}
                    dateFormat="dd/mm/yy"
                    className="w-full"
                    showIcon
                />
            </div>
        </Dialog>
    );
}