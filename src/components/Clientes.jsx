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

import { clienteService } from "../services/clienteService";

export default function Clientes() {
    //lógica del componente
    const emptyCliente = {
        id: null,
        nombre: "",
        email: "",
        telefono: ""
    };

    const NOMBRE_MIN = 3;
    const NOMBRE_MAX = 50;

    //definiendo los estados - Hooks de estado
    const [clientes, setClientes] = useState([]);
    const [cliente, setCliente] = useState(emptyCliente);
    const [dialog, setDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const toast = useRef(null);

    useEffect(() => {
        fetchClientes();
    }, []);

    //funciones para hacer peticiones al bk
    const fetchClientes = async () => {
        setLoading(true);

        try {
            const data = await clienteService.getAll();
            setClientes(data);
        } catch {
            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: "No se pudieron obtener los clientes",
            });
        } finally {
            setLoading(false);
        }
    };

    //función para abrir modal y agregar un cliente
    const openNew = () => {
        setCliente(emptyCliente);
        setSubmitted(false);
        setDialog(true);
    };

    //función para abrir modal, para editar un cliente
    const openEdit = (rowData) => {
        setCliente({ ...rowData });
        setSubmitted(false);
        setDialog(true);
    };

    const existeEmailDuplicado = (email) => {
        const emailNormalizado = email.trim().toLowerCase();

        return clientes.some(
            (c) =>
                c.id !== cliente.id &&
                c.email?.trim().toLowerCase() === emailNormalizado
        );
    };

    const existeTelefonoDuplicado = (telefono) => {
        const telefonoNormalizado = telefono.trim();

        return clientes.some(
            (c) =>
                c.id !== cliente.id &&
                c.telefono?.trim() === telefonoNormalizado
        );
    };

    //función para validar datos del formulario
    const validarFormulario = () => {
        const nombre = cliente.nombre?.trim() ?? "";
        const email = cliente.email?.trim() ?? "";
        const telefono = cliente.telefono?.trim() ?? "";

        if (!nombre) return `El nombre es requerido.`;
        if (nombre.length < NOMBRE_MIN) return `Nombre debe tener al menos ${NOMBRE_MIN} caracteres.`;
        if (nombre.length > NOMBRE_MAX) return `Nombre no puede superar los ${NOMBRE_MAX} caracteres.`;
        if (!email) return `El correo es requerido.`;
        if (!telefono) return `El teléfono es requerido.`;
        if (existeEmailDuplicado(email)) return `Ya existe un cliente registrado con el correo "${email}".`;
        if (existeTelefonoDuplicado(telefono)) return `Ya existe un cliente registrado con el teléfono "${telefono}".`;

        return null;
    };

    const errorValidacion = submitted ? validarFormulario() : null;

    const saveOrUpdate = async () => {
        setSubmitted(true);
        if (validarFormulario()) return;

        setGuardando(true);

        try {
            const datosLimpios = {
                ...cliente,
                nombre: cliente.nombre.trim(),
                email: cliente.email.trim(),
                telefono: cliente.telefono.trim()
            };

            const respuesta = cliente.id
                ? await clienteService.update(cliente.id, datosLimpios)
                : await clienteService.create(datosLimpios);

            toast.current.show({
                severity: "success",
                summary: "Éxito",
                detail: respuesta.message,
                life: 3000
            });

            setDialog(false);
            fetchClientes();
        } catch (error) {
            const msj = error.response?.data?.message || "Ocurrió un error al guardar el cliente";

            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: msj,
                life: 4000
            });
        } finally {
            setGuardando(false);
        }
    };

    const confirmDelete = (rowData) => {
        Swal.fire({
            title: "¿Eliminar cliente?",
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
                deleteCliente(rowData.id, rowData.nombre);
            }
        });
    };

    const deleteCliente = async (id, nombre) => {
        try {
            const respuesta = await clienteService.delete(id);

            toast.current.show({
                severity: "success",
                summary: "Éxito",
                detail: respuesta.message,
                life: 3000
            });

            fetchClientes();
        } catch (error) {
            const msj = error.response?.data?.message || `No se pudo eliminar "${nombre}"`;

            toast.current.show({
                severity: "error",
                summary: "Error",
                detail: msj,
                life: 4000
            });
        }
    };

    const templateAcciones = (rowData) => {
        return (
            <div className="flex gap-2 justify-center md:justify-start">
                <Button
                    icon="pi pi-pencil"
                    rounded
                    outlined
                    severity="success"
                    onClick={() => openEdit(rowData)}
                />
                <Button
                    icon="pi pi-trash"
                    rounded
                    outlined
                    severity="danger"
                    onClick={() => confirmDelete(rowData)}
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
            <h4 className="m-0 text-xl font-bold text-gray-700">
                Mantenimiento de Clientes
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
                <Toolbar
                    className="mb-4 bg-gray-50 border-none"
                    left={() => (
                        <Button
                            label="Nuevo Cliente"
                            icon="pi pi-plus"
                            severity="primary"
                            onClick={openNew}
                        />
                    )}
                />

                <DataTable
                    value={clientes}
                    loading={loading}
                    paginator
                    rows={10}
                    rowsPerPageOptions={[5, 10, 25, 50]}
                    header={header}
                    globalFilter={globalFilter}
                    responsiveLayout="stack"
                    breakpoint="768px"
                    className="p-datatable-sm"
                    emptyMessage="No se encontraron clientes"
                >
                    <Column
                        field="nombre"
                        header="Nombre"
                        sortable
                        className="font-semibold"
                    />
                    <Column field="email" header="Email" sortable />
                    <Column field="telefono" header="Teléfono" sortable />
                    <Column
                        header="Acciones"
                        body={templateAcciones}
                        exportable={false}
                        style={{ minWidth: "8rem" }}
                    />
                </DataTable>
            </div>

            {/* Inicio del dialog */}
            <Dialog
                visible={dialog}
                style={{ width: "32rem" }}
                breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                header={cliente.id ? "Actualizar Cliente" : "Registrar Cliente"}
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
                            label={cliente.id ? "Actualizar" : "Guardar"}
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
                        value={cliente.nombre}
                        onChange={(e) =>
                            setCliente({ ...cliente, nombre: e.target.value })
                        }
                        required
                        autoFocus
                        maxLength={NOMBRE_MAX}
                        className={classNames({
                            "p-invalid": errorValidacion
                        })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="email" className="font-bold block mb-2">
                        Email
                    </label>
                    <InputText
                        id="email"
                        type="email"
                        value={cliente.email}
                        onChange={(e) =>
                            setCliente({ ...cliente, email: e.target.value })
                        }
                        required
                        className={classNames({
                            "p-invalid": errorValidacion
                        })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="telefono" className="font-bold block mb-2">
                        Teléfono
                    </label>
                    <InputText
                        id="telefono"
                        value={cliente.telefono}
                        onChange={(e) =>
                            setCliente({ ...cliente, telefono: e.target.value })
                        }
                        required
                        className={classNames({
                            "p-invalid": errorValidacion
                        })}
                    />
                    {errorValidacion && (
                        <small className="p-error">{errorValidacion}</small>
                    )}
                </div>
            </Dialog>
            {/* Inicio del dialog */}
        </div>
    );
}