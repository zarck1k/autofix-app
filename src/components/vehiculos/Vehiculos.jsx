import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { InputNumber } from "primereact/inputnumber";
import { InputTextarea } from "primereact/inputtextarea";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { classNames } from "primereact/utils";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";

import { vehiculoService } from "../../services/vehiculoService";
import { modeloService } from "../../services/modeloService";
import { clienteService } from "../../services/clienteService";
import { mostrarErrorApi, mostrarExitoApi } from "../../utils/alertasApi";
import { useAuth } from "../../Auth/AuthContext";

const emptyVehiculo = { id: null, placa: "", anio: null, caracteristicas: "", modeloId: null, clienteId: null };
const PLACA_MIN = 4;
const PLACA_MAX = 20;
const CARACTERISTICAS_MAX = 200;
const ANIO_MINIMO = 1980;

export default function Vehiculos() {
    const [vehiculos, setVehiculos] = useState([]);
    const [modelos, setModelos] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [vehiculo, setVehiculo] = useState(emptyVehiculo);
    const [dialog, setDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const toast = useRef(null);
    const { tienePermiso } = useAuth();

    const puedeEditar = tienePermiso(["ADMIN", "RECEPCIONISTA"]);
    const puedeEliminar = tienePermiso(["ADMIN"]);

    useEffect(() => {
        fetchVehiculos();
        fetchModelos();
        fetchClientes();
    }, []);

    const fetchVehiculos = async () => {
        setLoading(true);
        try {
            const data = await vehiculoService.getAll();
            setVehiculos(data);
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudieron obtener los vehículos");
        } finally {
            setLoading(false);
        }
    };

    const fetchModelos = async () => {
        try {
            const data = await modeloService.getAll();
            setModelos(data);
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudieron obtener los modelos");
        }
    };

    const fetchClientes = async () => {
        try {
            const data = await clienteService.getAll();
            setClientes(data);
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudieron obtener los clientes");
        }
    };

    const modelosOpciones = modelos.map((m) => ({
        ...m,
        etiqueta: [m.marca?.nombre, m.nombre].filter(Boolean).join(" "),
    }));

    const clientesOpciones = clientes.map((c) => ({
        ...c,
        etiqueta: [c.nombre, c.telefono].filter(Boolean).join(" - "),
    }));

    const openNew = () => {
        setVehiculo(emptyVehiculo);
        setSubmitted(false);
        setDialog(true);
    };

    const openEdit = (rowData) => {
        setVehiculo({
            id: rowData.id,
            placa: rowData.placa,
            anio: rowData.anio,
            caracteristicas: rowData.caracteristicas ?? "",
            modeloId: rowData.modeloId,
            clienteId: rowData.clienteId,
        });
        setSubmitted(false);
        setDialog(true);
    };

    const validarFormulario = () => {
        const placa = vehiculo.placa?.trim() ?? "";
        if (!placa) return "La placa es obligatoria.";
        if (placa.length < PLACA_MIN) return `La placa debe tener al menos ${PLACA_MIN} caracteres.`;
        if (placa.length > PLACA_MAX) return `La placa no puede superar los ${PLACA_MAX} caracteres.`;

        const anioActual = new Date().getFullYear();
        if (!vehiculo.anio) return "El año es obligatorio.";
        if (vehiculo.anio < ANIO_MINIMO || vehiculo.anio > anioActual + 1) {
            return `El año debe estar entre ${ANIO_MINIMO} y ${anioActual + 1}.`;
        }

        if (!vehiculo.modeloId) return "Debe seleccionar el modelo.";
        if (!vehiculo.clienteId) return "Debe seleccionar el cliente.";

        if (vehiculo.caracteristicas && vehiculo.caracteristicas.length > CARACTERISTICAS_MAX) {
            return `Las características no pueden superar los ${CARACTERISTICAS_MAX} caracteres.`;
        }

        return null;
    };

    const errorValidacion = submitted ? validarFormulario() : null;

    const saveOrUpdate = async () => {
        setSubmitted(true);
        if (validarFormulario()) return;

        setGuardando(true);
        try {
            const datosLimpios = {
                ...vehiculo,
                placa: vehiculo.placa.trim().toUpperCase(),
                caracteristicas: vehiculo.caracteristicas?.trim() || null,
            };

            const respuesta = vehiculo.id
                ? await vehiculoService.update(vehiculo.id, datosLimpios)
                : await vehiculoService.create(datosLimpios);

            
            const vehiculoGuardado = respuesta.vehiculo;

            if (vehiculo.id) {
                setVehiculos((prev) => {
                    const indice = prev.findIndex((v) => v.id === vehiculoGuardado.id);
                    if (indice === -1) return prev; 
                    const copia = [...prev];
                    copia[indice] = vehiculoGuardado;
                    return copia;
                });
            } else {
                setVehiculos((prev) => [vehiculoGuardado, ...prev]);
            }

            mostrarExitoApi(toast, respuesta.message);
            setDialog(false);
        } catch (error) {
            mostrarErrorApi(toast, error, "Ocurrió un error al guardar el vehículo");
        } finally {
            setGuardando(false);
        }
    };

    const confirmDelete = (rowData) => {
        Swal.fire({
            title: "¿Eliminar vehículo?",
            html: `Esta acción no se puede deshacer.<br/>Se eliminará el vehículo con placa <b>${rowData.placa}</b>.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                deleteVehiculo(rowData.id, rowData.placa);
            }
        });
    };

    const deleteVehiculo = async (id, placa) => {
        try {
            const respuesta = await vehiculoService.delete(id);
            setVehiculos((prev) => prev.filter((v) => v.id !== id));
            mostrarExitoApi(toast, respuesta.message);
        } catch (error) {
            mostrarErrorApi(toast, error, `No se pudo eliminar el vehículo con placa "${placa}"`);
        }
    };

    const templateModelo = (rowData) => {
        const marcaNombre = rowData.modelo?.marca?.nombre ?? "";
        const modeloNombre = rowData.modelo?.nombre ?? "";
        return <span>{[marcaNombre, modeloNombre].filter(Boolean).join(" ") || "—"}</span>;
    };

    const templateCliente = (rowData) => <span>{rowData.cliente?.nombre ?? "—"}</span>;

    const templateAcciones = (rowData) => {
        if (!puedeEditar && !puedeEliminar) return null;

        return (
            <div className="flex gap-2 justify-center md:justify-start">
                {puedeEditar && (
                    <Button icon="pi pi-pencil" rounded outlined severity="success" onClick={() => openEdit(rowData)} />
                )}
                {puedeEliminar && (
                    <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} />
                )}
            </div>
        );
    };

    const header = (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
            <h4 className="m-0 text-xl font-bold text-gray-700">Catálogo de Vehículos Registrados</h4>

            <div className="w-full md:w-72">
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Buscar por placa..."
                        className="w-full p-inputtext-sm"
                    />
                </IconField>
            </div>
        </div>
    );

    return (
        <div className="p-2 md:p-4">
            <Toast ref={toast} />

            <div className="card shadow-md rounded-xl bg-white">
                {puedeEditar && (
                    <Toolbar
                        className="mb-4 bg-gray-50 border-none"
                        start={() => (
                            <Button label="Nuevo Vehículo" icon="pi pi-plus" severity="primary" onClick={openNew} />
                        )}
                    />
                )}

                {/* responsiveLayout="stack" quedó deprecado desde PrimeReact 9.2
                    y fue removido en la versión 10 - en su lugar, se envuelve
                    la tabla en un contenedor con scroll horizontal. */}
                <div className="overflow-x-auto">
                    <DataTable
                        value={vehiculos}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        header={header}
                        globalFilter={globalFilter}
                        globalFilterFields={["placa"]}
                        className="p-datatable-sm"
                        emptyMessage="No se encontraron vehículos."
                    >
                        <Column field="placa" header="Placa" sortable className="font-semibold" />
                        <Column field="anio" header="Año" sortable />
                        <Column header="Modelo" body={templateModelo} />
                        <Column header="Cliente" body={templateCliente} />
                        {(puedeEditar || puedeEliminar) && (
                            <Column header="Acciones" body={templateAcciones} exportable={false} style={{ minWidth: "8rem" }} />
                        )}
                    </DataTable>
                </div>
            </div>

            <Dialog
                visible={dialog}
                style={{ width: "36rem" }}
                breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                header={vehiculo.id ? "Actualizar Vehículo" : "Registrar Vehículo"}
                modal
                className="p-fluid"
                onHide={() => setDialog(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setDialog(false)} disabled={guardando} />
                        <Button
                            label={vehiculo.id ? "Actualizar" : "Guardar"}
                            icon="pi pi-save"
                            onClick={saveOrUpdate}
                            loading={guardando}
                        />
                    </div>
                }
            >
                <div className="field">
                    <label htmlFor="placa" className="font-bold block mb-2">Placa</label>
                    <InputText
                        id="placa"
                        value={vehiculo.placa}
                        onChange={(e) => setVehiculo({ ...vehiculo, placa: e.target.value })}
                        maxLength={PLACA_MAX}
                        autoFocus
                        className={classNames({ "p-invalid": errorValidacion && !vehiculo.placa?.trim() })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="anio" className="font-bold block mb-2">Año</label>
                    <InputNumber
                        id="anio"
                        value={vehiculo.anio}
                        onValueChange={(e) => setVehiculo({ ...vehiculo, anio: e.value })}
                        useGrouping={false}
                        className={classNames({ "p-invalid": errorValidacion && !vehiculo.anio })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="modelo" className="font-bold block mb-2">Modelo</label>
                    <Dropdown
                        id="modelo"
                        value={vehiculo.modeloId}
                        options={modelosOpciones}
                        optionLabel="etiqueta"
                        optionValue="id"
                        placeholder="Seleccione un modelo"
                        filter
                        onChange={(e) => setVehiculo({ ...vehiculo, modeloId: e.value })}
                        className={classNames({ "p-invalid": errorValidacion && !vehiculo.modeloId })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="cliente" className="font-bold block mb-2">Cliente</label>
                    <Dropdown
                        id="cliente"
                        value={vehiculo.clienteId}
                        options={clientesOpciones}
                        optionLabel="etiqueta"
                        optionValue="id"
                        placeholder="Seleccione un cliente"
                        filter
                        onChange={(e) => setVehiculo({ ...vehiculo, clienteId: e.value })}
                        className={classNames({ "p-invalid": errorValidacion && !vehiculo.clienteId })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="caracteristicas" className="font-bold block mb-2">Características (opcional)</label>
                    <InputTextarea
                        id="caracteristicas"
                        value={vehiculo.caracteristicas}
                        onChange={(e) => setVehiculo({ ...vehiculo, caracteristicas: e.target.value })}
                        rows={3}
                        maxLength={CARACTERISTICAS_MAX}
                        autoResize
                    />
                </div>

                {errorValidacion && <small className="p-error block mt-1">{errorValidacion}</small>}
            </Dialog>
        </div>
    );
}