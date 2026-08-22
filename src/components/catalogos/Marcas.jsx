//importaciones necesarias
import { useState, useEffect, useRef } from "react";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { Button } from "primereact/button";
import { Toolbar } from "primereact/toolbar";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { IconField } from "primereact/iconfield";
import { InputIcon } from "primereact/inputicon";
import { classNames } from "primereact/utils";
import { Toast } from "primereact/toast";
import Swal from "sweetalert2";

import { marcaService } from "../../services/marcaService";

export default function Marcas() {
    //lógica del componente
    const emptyMarca = { id: null, nombre: "" };
    const NOMBRE_MIN = 3;
    const NOMBRE_MAX = 50;

    //definiendo los estados - Hooks de estado
    const [marcas, setMarcas] = useState([]);
    const [marca, setMarca] = useState(emptyMarca);
    const [dialog, setDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false); // evita doble clic en Guardar mientras la petición está en curso

    const toast = useRef(null);

    useEffect(() => {
        fetchMarcas();
    }, []);

    //funciones para hacer peticiones al bk
    const fetchMarcas = async () => {
        setLoading(true);
        try {
            const data = await marcaService.getAll();
            setMarcas(data);
        } catch {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudo obtener las marcas",
            });
        } finally {
            setLoading(false);
        }
    };

    //función para abrir modal y agregar una marca
    const openNew = () => {
        setMarca(emptyMarca);
        setSubmitted(false);
        setDialog(true);
    };

    //función para abrir modal, para editar una marca
    const openEdit = (rowData) => {
        setMarca({ ...rowData });
        setSubmitted(false);
        setDialog(true);
    };

    
    const existeNombreDuplicado = (nombre) => {
        const nombreNormalizado = nombre.trim().toLowerCase();
        return marcas.some(
            (m) => m.id !== marca.id && m.nombre.trim().toLowerCase() === nombreNormalizado
        );
    };

    //función para validar datos del formulario
    const validarFormulario = () => {
        const nombre = marca.nombre?.trim() ?? "";
        if (!nombre) return `El nombre es requerido.`;
        if (nombre.length < NOMBRE_MIN) return `Nombre debe tener al menos ${NOMBRE_MIN} caracteres.`;
        if (nombre.length > NOMBRE_MAX) return `Nombre no puede superar los ${NOMBRE_MAX} caracteres.`;
        if (existeNombreDuplicado(nombre)) return `Ya existe una marca registrada con el nombre "${nombre}".`;

        return null;
    };

    const errorValidacion = submitted ? validarFormulario() : null;

    
    const saveOrUpdate = async () => {
        setSubmitted(true);
        if (validarFormulario()) return; 

        setGuardando(true);
        try {
            const datosLimpios = { ...marca, nombre: marca.nombre.trim() };

            const respuesta = marca.id
                ? await marcaService.update(marca.id, datosLimpios)
                : await marcaService.create(datosLimpios);

            toast.current.show({ severity: "success", summary: "Éxito", detail: respuesta.message, life: 3000 });
            setDialog(false);
            fetchMarcas();
        } catch (error) {
            const msj = error.response?.data?.message || "Ocurrió un error al guardar la marca";
            toast.current.show({ severity: "error", summary: "Error", detail: msj, life: 4000 });
        } finally {
            setGuardando(false);
        }
    };

    
    const confirmDelete = (rowData) => {
        Swal.fire({
            title: "¿Eliminar marca?",
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
                deleteMarca(rowData.id, rowData.nombre);
            }
        });
    };

    const deleteMarca = async (id, nombre) => {
        try {
            const respuesta = await marcaService.delete(id);
            toast.current.show({ severity: "success", summary: "Éxito", detail: respuesta.message, life: 3000 });
            fetchMarcas();
        } catch (error) {
            const msj = error.response?.data?.message || `No se pudo eliminar "${nombre}"`;
            toast.current.show({ severity: "error", summary: "Error", detail: msj, life: 4000 });
        }
    };

    const templateAcciones = (rowData) => {
        return (
            <div className="flex gap-2 justify-center md:justify-start">
                <Button icon="pi pi-pencil" rounded outlined severity="success" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} />
            </div>
        );
    };

    const header = (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
            <h4 className="m-0 text-xl font-bold text-gray-700">Mantenimiento de Marcas</h4>

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
                <Toolbar
                    className="mb-4 bg-gray-50 border-none"
                    left={() => (
                        <Button label="Nueva Marca" icon="pi pi-plus" severity="primary" onClick={openNew} />
                    )}
                />
                <DataTable
                    value={marcas}
                    loading={loading}
                    paginator
                    rows={10}
                     rowsPerPageOptions={[5, 10, 25, 50]} 
                    header={header}
                    globalFilter={globalFilter}
                    responsiveLayout="stack"
                    breakpoint="768px"
                    className="p-datatable-sm"
                    emptyMessage="No se encontraron marcas"
                >
                    <Column field="nombre" header="Marca" sortable className="font-semibold" />
                    <Column header="Acciones" body={templateAcciones} exportable={false} style={{ minWidth: "8rem" }} />
                </DataTable>
            </div>

            {/* Inicio del dialog */}
            <Dialog
                visible={dialog}
                style={{ width: "32rem" }}
                breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                header={marca.id ? "Actualizar Marca" : "Registrar Marca"}
                modal
                className="p-fluid"
                onHide={() => setDialog(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setDialog(false)} disabled={guardando} />
                        <Button
                            label={marca.id ? "Actualizar" : "Guardar"}
                            icon="pi pi-save"
                            onClick={saveOrUpdate}
                            loading={guardando}
                        />
                    </div>
                }
            >
                <div className="field">
                    <label htmlFor="nombre" className="font-bold block mb-2">
                        Nombre
                    </label>
                    <InputText
                        id="nombre"
                        value={marca.nombre}
                        onChange={(e) => setMarca({ ...marca, nombre: e.target.value })}
                        required
                        autoFocus
                        maxLength={NOMBRE_MAX}
                        className={classNames({ "p-invalid": errorValidacion })}
                    />
                    {errorValidacion && <small className="p-error">{errorValidacion}</small>}
                </div>
            </Dialog>
            {/* Inicio del dialog */}
        </div>
    );
}