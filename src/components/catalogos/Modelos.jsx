// src/pages/Modelos/Modelos.jsx
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { classNames } from "primereact/utils";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";

import { modeloService } from "../../services/modeloService";
import { marcaService } from "../../services/marcaService";
import { mostrarErrorApi, mostrarExitoApi } from "../../utils/alertasApi";
import { useAuth } from "../../Auth/AuthContext";

const emptyModelo = { 
    id: null, 
    nombre: "", 
    marcaId: null 
};

const NOMBRE_MIN = 3;
const NOMBRE_MAX = 50;

export default function Modelos() {
    // Estados
    const [modelos, setModelos] = useState([]);
    const [marcas, setMarcas] = useState([]);
    const [modelo, setModelo] = useState(emptyModelo);
    const [dialog, setDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const toast = useRef(null);
    const { tienePermiso } = useAuth();

    const puedeEditar = tienePermiso(["ADMIN", "RECEPCIONISTA"]);
    const puedeEliminar = tienePermiso(["ADMIN"]);

    // Cargar datos al montar el componente
    useEffect(() => {
        fetchModelos();
        fetchMarcas();
    }, []);

    // Obtener modelos
    const fetchModelos = async () => {
        setLoading(true);
        try {
            const data = await modeloService.getAll();
            setModelos(data);
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudieron obtener los modelos");
        } finally {
            setLoading(false);
        }
    };

    // Obtener marcas para el dropdown
    const fetchMarcas = async () => {
        try {
            const data = await marcaService.getAll();
            setMarcas(data);
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudieron obtener las marcas");
        }
    };

    // Opciones para el dropdown de marcas
    const marcasOpciones = marcas.map((m) => ({
        ...m,
        etiqueta: m.nombre
    }));

    // Abrir modal para crear
    const openNew = () => {
        setModelo(emptyModelo);
        setSubmitted(false);
        setDialog(true);
    };

    // Abrir modal para editar
    const openEdit = (rowData) => {
        setModelo({
            id: rowData.id,
            nombre: rowData.nombre,
            marcaId: rowData.marca?.id || null
        });
        setSubmitted(false);
        setDialog(true);
    };

    // Validar formulario
    const validarFormulario = () => {
        const nombre = modelo.nombre?.trim() ?? "";
        
        if (!nombre) return "El nombre es obligatorio.";
        if (nombre.length < NOMBRE_MIN) 
            return `El nombre debe tener al menos ${NOMBRE_MIN} caracteres.`;
        if (nombre.length > NOMBRE_MAX) 
            return `El nombre no puede superar los ${NOMBRE_MAX} caracteres.`;
        if (!modelo.marcaId) 
            return "Debe seleccionar una marca.";

        // Verificar duplicados
        const nombreNormalizado = nombre.trim().toLowerCase();
        const existeDuplicado = modelos.some(
            (m) => m.id !== modelo.id && 
                   m.nombre.trim().toLowerCase() === nombreNormalizado
        );
        if (existeDuplicado) 
            return `Ya existe un modelo con el nombre "${nombre}".`;

        return null;
    };

    const errorValidacion = submitted ? validarFormulario() : null;

    // Guardar o actualizar
    const saveOrUpdate = async () => {
        setSubmitted(true);
        if (validarFormulario()) return;

        setGuardando(true);
        try {
            const datosLimpios = {
                ...modelo,
                nombre: modelo.nombre.trim()
            };

            const respuesta = modelo.id
                ? await modeloService.update(modelo.id, datosLimpios)
                : await modeloService.create(datosLimpios);

            mostrarExitoApi(toast, respuesta.message);
            setDialog(false);
            fetchModelos(); // Recargar la tabla
        } catch (error) {
            mostrarErrorApi(toast, error, "Ocurrió un error al guardar el modelo");
        } finally {
            setGuardando(false);
        }
    };

    // Confirmar eliminación
    const confirmDelete = (rowData) => {
        Swal.fire({
            title: "¿Eliminar modelo?",
            html: `Esta acción no se puede deshacer.<br/>Se eliminará <b>${rowData.nombre}</b>.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, eliminar",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#dc2626",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                deleteModelo(rowData.id, rowData.nombre);
            }
        });
    };

    // Eliminar modelo
    const deleteModelo = async (id, nombre) => {
        try {
            const respuesta = await modeloService.delete(id);
            mostrarExitoApi(toast, respuesta.message);
            fetchModelos();
        } catch (error) {
            mostrarErrorApi(toast, error, `No se pudo eliminar "${nombre}"`);
        }
    };

    // Template para mostrar la marca en la tabla
    const templateMarca = (rowData) => {
        return <span>{rowData.marca?.nombre || "—"}</span>;
    };

    // Template de acciones
    const templateAcciones = (rowData) => {
        if (!puedeEditar && !puedeEliminar) return null;

        return (
            <div className="flex gap-2 justify-center md:justify-start">
                {puedeEditar && (
                    <Button 
                        icon="pi pi-pencil" 
                        rounded outlined 
                        severity="success" 
                        onClick={() => openEdit(rowData)} 
                    />
                )}
                {puedeEliminar && (
                    <Button 
                        icon="pi pi-trash" 
                        rounded outlined 
                        severity="danger" 
                        onClick={() => confirmDelete(rowData)} 
                    />
                )}
            </div>
        );
    };

    // Header de la tabla
    const header = (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
            <h4 className="m-0 text-xl font-bold text-gray-700">
                Mantenimiento de Modelos
            </h4>

            <div className="w-full md:w-72">
                <IconField iconPosition="left">
                    <InputIcon className="pi pi-search" />
                    <InputText
                        type="search"
                        onInput={(e) => setGlobalFilter(e.target.value)}
                        placeholder="Buscar por nombre..."
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
                            <Button 
                                label="Nuevo Modelo" 
                                icon="pi pi-plus" 
                                severity="primary" 
                                onClick={openNew} 
                            />
                        )}
                    />
                )}

                <div className="overflow-x-auto">
                    <DataTable
                        value={modelos}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        header={header}
                        globalFilter={globalFilter}
                        globalFilterFields={["nombre"]}
                        className="p-datatable-sm"
                        emptyMessage="No se encontraron modelos"
                    >
                        <Column 
                            field="nombre" 
                            header="Modelo" 
                            sortable 
                            className="font-semibold" 
                        />
                        <Column 
                            header="Marca" 
                            body={templateMarca} 
                            sortable 
                            sortField="marca.nombre"
                        />
                        {(puedeEditar || puedeEliminar) && (
                            <Column 
                                header="Acciones" 
                                body={templateAcciones} 
                                exportable={false} 
                                style={{ minWidth: "8rem" }} 
                            />
                        )}
                    </DataTable>
                </div>
            </div>

            {/* Dialog para crear/editar */}
            <Dialog
                visible={dialog}
                style={{ width: "36rem" }}
                breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                header={modelo.id ? "Actualizar Modelo" : "Registrar Modelo"}
                modal
                className="p-fluid"
                onHide={() => setDialog(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button 
                            label="Cancelar" 
                            icon="pi pi-times" 
                            outlined 
                            onClick={() => setDialog(false)} 
                            disabled={guardando} 
                        />
                        <Button
                            label={modelo.id ? "Actualizar" : "Guardar"}
                            icon="pi pi-save"
                            onClick={saveOrUpdate}
                            loading={guardando}
                        />
                    </div>
                }
            >
                <div className="field">
                    <label htmlFor="nombre" className="font-bold block mb-2">
                        Nombre del Modelo
                    </label>
                    <InputText
                        id="nombre"
                        value={modelo.nombre}
                        onChange={(e) => setModelo({ ...modelo, nombre: e.target.value })}
                        required
                        autoFocus
                        maxLength={NOMBRE_MAX}
                        className={classNames({ 
                            "p-invalid": errorValidacion && !modelo.nombre?.trim() 
                        })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="marca" className="font-bold block mb-2">
                        Marca
                    </label>
                    <Dropdown
                        id="marca"
                        value={modelo.marcaId}
                        options={marcasOpciones}
                        optionLabel="etiqueta"
                        optionValue="id"
                        placeholder="Seleccione una marca"
                        filter
                        onChange={(e) => setModelo({ ...modelo, marcaId: e.value })}
                        className={classNames({ 
                            "p-invalid": errorValidacion && !modelo.marcaId 
                        })}
                    />
                </div>

                {errorValidacion && (
                    <small className="p-error block mt-1">{errorValidacion}</small>
                )}
            </Dialog>
        </div>
    );
}