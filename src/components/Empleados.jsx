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

import { empleadoService } from "../services/empleadoService"; // ✅ CAMBIADO
import { mostrarErrorApi, mostrarExitoApi } from "../utils/alertasApi";
import { useAuth } from "../auth/AuthContext";

const emptyEmpleado = {
    id: null,
    username: "",
    password: "",
    nombre: "",
    email: "",
    telefono: "",
    rol: ""
};

const ROLES_OPCIONES = [
    { label: "Administrador", value: "ADMIN" },
    { label: "Recepcionista", value: "RECEPCIONISTA" },
    { label: "Mecánico", value: "MECANICO" }
];

export default function Empleados() {
    const [empleados, setEmpleados] = useState([]);
    const [empleado, setEmpleado] = useState(emptyEmpleado);
    const [dialog, setDialog] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [globalFilter, setGlobalFilter] = useState(null);
    const [loading, setLoading] = useState(false);
    const [guardando, setGuardando] = useState(false);

    const toast = useRef(null);
    const { tienePermiso } = useAuth();
    const esAdmin = tienePermiso(["ADMIN"]);

    useEffect(() => {
        if (esAdmin) fetchEmpleados();
    }, [esAdmin]);

    const fetchEmpleados = async () => {
        setLoading(true);
        try {
            const data = await empleadoService.listarConUsuario(); // ✅ CAMBIADO
            setEmpleados(data);
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudieron obtener los empleados");
        } finally {
            setLoading(false);
        }
    };

    const openNew = () => {
        setEmpleado(emptyEmpleado);
        setSubmitted(false);
        setDialog(true);
    };

    const openEdit = (rowData) => {
        setEmpleado({
            id: rowData.id,
            username: rowData.username || "",
            password: "",
            nombre: rowData.nombre || "",
            email: rowData.email || "",
            telefono: rowData.telefono || "",
            rol: rowData.rol || ""
        });
        setSubmitted(false);
        setDialog(true);
    };

    const validarFormulario = () => {
        const username = empleado.username?.trim() ?? "";
        const password = empleado.password?.trim() ?? "";
        const nombre = empleado.nombre?.trim() ?? "";
        const email = empleado.email?.trim() ?? "";
        const telefono = empleado.telefono?.trim() ?? "";
        const rol = empleado.rol;

        if (!empleado.id && !password) {
            return "La contraseña es obligatoria para un nuevo empleado";
        }
        if (password && password.length < 6) {
            return "La contraseña debe tener al menos 6 caracteres";
        }
        if (!username) return "El nombre de usuario es obligatorio";
        if (username.length < 3) return "El usuario debe tener al menos 3 caracteres";
        if (!nombre) return "El nombre es obligatorio";
        if (nombre.length < 3) return "El nombre debe tener al menos 3 caracteres";
        if (!email) return "El email es obligatorio";
        if (!email.includes("@")) return "El email no es válido";
        if (!telefono) return "El teléfono es obligatorio";
        if (telefono.length < 8) return "El teléfono debe tener al menos 8 dígitos";
        if (!rol) return "Debe seleccionar un rol";

        return null;
    };

    const errorValidacion = submitted ? validarFormulario() : null;

    const saveOrUpdate = async () => {
        setSubmitted(true);
        if (validarFormulario()) return;

        setGuardando(true);
        try {
            const datosLimpios = {
                username: empleado.username.trim().toLowerCase(),
                nombre: empleado.nombre.trim(),
                email: empleado.email.trim().toLowerCase(),
                telefono: empleado.telefono.trim(),
                rol: empleado.rol
            };

            if (empleado.password) {
                datosLimpios.password = empleado.password;
            }

            let respuesta;
            if (empleado.id) {
                respuesta = await empleadoService.editarConUsuario(empleado.id, datosLimpios); // ✅ CAMBIADO
            } else {
                respuesta = await empleadoService.registrarConUsuario(datosLimpios); // ✅ CAMBIADO
            }

            mostrarExitoApi(toast, respuesta.message || "Empleado guardado correctamente");
            setDialog(false);
            fetchEmpleados();
        } catch (error) {
            mostrarErrorApi(toast, error, "Ocurrió un error al guardar el empleado");
        } finally {
            setGuardando(false);
        }
    };

    const confirmDelete = (rowData) => {
        Swal.fire({
            title: "¿Eliminar empleado?",
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
                deleteEmpleado(rowData.id);
            }
        });
    };

    const deleteEmpleado = async (id) => {
        try {
            await empleadoService.cambiarEstado(id, false); // ✅ CAMBIADO
            mostrarExitoApi(toast, "Empleado desactivado correctamente");
            fetchEmpleados();
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudo eliminar el empleado");
        }
    };

    const confirmResetPassword = (rowData) => {
        Swal.fire({
            title: "¿Resetear contraseña?",
            html: `Se generará una contraseña temporal para <b>${rowData.nombre}</b>.`,
            icon: "question",
            showCancelButton: true,
            confirmButtonText: "Sí, resetear",
            cancelButtonText: "Cancelar",
            confirmButtonColor: "#2563eb",
            cancelButtonColor: "#6b7280",
            reverseButtons: true,
        }).then((resultado) => {
            if (resultado.isConfirmed) {
                resetearPassword(rowData.id);
            }
        });
    };

    const resetearPassword = async (id) => {
        try {
            const respuesta = await empleadoService.resetearPassword(id); // ✅ CAMBIADO
            mostrarExitoApi(toast, `Contraseña restablecida. Temporal: ${respuesta.passwordTemporal}`);
            fetchEmpleados();
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudo resetear la contraseña");
        }
    };

    const toggleEstado = async (rowData) => {
        try {
            await empleadoService.cambiarEstado(rowData.id, !rowData.activo); // ✅ CAMBIADO
            mostrarExitoApi(toast, `Empleado ${rowData.activo ? 'desactivado' : 'activado'} correctamente`);
            fetchEmpleados();
        } catch (error) {
            mostrarErrorApi(toast, error, "No se pudo cambiar el estado");
        }
    };

    const templateRol = (rowData) => {
        const colores = {
            ADMIN: "text-red-600",
            RECEPCIONISTA: "text-blue-600",
            MECANICO: "text-green-600"
        };
        return <span className={`font-bold ${colores[rowData.rol] || ""}`}>{rowData.rol || "—"}</span>;
    };

    const templateActivo = (rowData) => {
        return (
            <span className={rowData.activo ? "text-green-600 font-bold" : "text-red-600 font-bold"}>
                {rowData.activo ? "Sí" : "No"}
            </span>
        );
    };

    const templateAcciones = (rowData) => {
        return (
            <div className="flex gap-2 justify-center flex-wrap">
                <Button icon="pi pi-pencil" rounded outlined severity="success" onClick={() => openEdit(rowData)} />
                <Button icon="pi pi-key" rounded outlined severity="warning" onClick={() => confirmResetPassword(rowData)} />
                <Button icon="pi pi-trash" rounded outlined severity="danger" onClick={() => confirmDelete(rowData)} />
                <Button 
                    icon={rowData.activo ? "pi pi-times-circle" : "pi pi-check-circle"} 
                    rounded outlined 
                    severity={rowData.activo ? "danger" : "success"} 
                    onClick={() => toggleEstado(rowData)} 
                />
            </div>
        );
    };

    const header = (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-1">
            <h4 className="m-0 text-xl font-bold text-gray-700">Gestión de Empleados</h4>
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

    if (!esAdmin) {
        return (
            <div className="p-4">
                <div className="card shadow-md rounded-xl bg-white p-8 text-center">
                    <i className="pi pi-lock text-6xl text-red-500 mb-4" />
                    <h2 className="text-2xl font-bold text-gray-700">Acceso Denegado</h2>
                    <p className="text-gray-500">No tienes permisos para ver esta página.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-2 md:p-4">
            <Toast ref={toast} />

            <div className="card shadow-md rounded-xl bg-white">
                <Toolbar
                    className="mb-4 bg-gray-50 border-none"
                    start={() => (
                        <Button label="Nuevo Empleado" icon="pi pi-plus" severity="primary" onClick={openNew} />
                    )}
                />

                <div className="overflow-x-auto">
                    <DataTable
                        value={empleados}
                        loading={loading}
                        paginator
                        rows={10}
                        rowsPerPageOptions={[5, 10, 25, 50]}
                        header={header}
                        globalFilter={globalFilter}
                        globalFilterFields={["nombre", "email", "username"]}
                        className="p-datatable-sm"
                        emptyMessage="No se encontraron empleados"
                    >
                        <Column field="username" header="Usuario" sortable className="font-semibold" />
                        <Column field="nombre" header="Nombre" sortable />
                        <Column field="email" header="Correo" sortable />
                        <Column field="telefono" header="Teléfono" sortable />
                        <Column header="Rol" body={templateRol} sortable />
                        <Column header="Activo" body={templateActivo} sortable style={{ width: "8rem" }} />
                        <Column header="Acciones" body={templateAcciones} exportable={false} style={{ minWidth: "12rem" }} />
                    </DataTable>
                </div>
            </div>

            {/* Dialog para crear/editar */}
            <Dialog
                visible={dialog}
                style={{ width: "40rem" }}
                breakpoints={{ "960px": "75vw", "641px": "90vw" }}
                header={empleado.id ? "Actualizar Empleado" : "Registrar Empleado"}
                modal
                className="p-fluid"
                onHide={() => setDialog(false)}
                footer={
                    <div className="flex justify-end gap-2">
                        <Button label="Cancelar" icon="pi pi-times" outlined onClick={() => setDialog(false)} disabled={guardando} />
                        <Button
                            label={empleado.id ? "Actualizar" : "Guardar"}
                            icon="pi pi-save"
                            onClick={saveOrUpdate}
                            loading={guardando}
                        />
                    </div>
                }
            >
                <div className="field">
                    <label htmlFor="username" className="font-bold block mb-2">Usuario *</label>
                    <InputText
                        id="username"
                        value={empleado.username}
                        onChange={(e) => setEmpleado({ ...empleado, username: e.target.value })}
                        maxLength={20}
                        autoFocus
                        className={classNames("w-full", { "p-invalid": errorValidacion && !empleado.username?.trim() })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="password" className="font-bold block mb-2">
                        {empleado.id ? "Nueva Contraseña (opcional)" : "Contraseña *"}
                    </label>
                    <InputText
                        id="password"
                        type="password"
                        value={empleado.password}
                        onChange={(e) => setEmpleado({ ...empleado, password: e.target.value })}
                        placeholder={empleado.id ? "Dejar vacío para no cambiar" : "Mínimo 6 caracteres"}
                        className={classNames("w-full", { "p-invalid": errorValidacion && !empleado.password && !empleado.id })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="rol" className="font-bold block mb-2">Rol *</label>
                    <Dropdown
                        id="rol"
                        value={empleado.rol}
                        options={ROLES_OPCIONES}
                        optionLabel="label"
                        optionValue="value"
                        placeholder="Seleccione un rol"
                        onChange={(e) => setEmpleado({ ...empleado, rol: e.value })}
                        className={classNames("w-full", { "p-invalid": errorValidacion && !empleado.rol })}
                    />
                </div>

                <hr className="my-4" />

                <div className="field">
                    <label htmlFor="nombre" className="font-bold block mb-2">Nombre completo *</label>
                    <InputText
                        id="nombre"
                        value={empleado.nombre}
                        onChange={(e) => setEmpleado({ ...empleado, nombre: e.target.value })}
                        maxLength={50}
                        className={classNames("w-full", { "p-invalid": errorValidacion && !empleado.nombre?.trim() })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="email" className="font-bold block mb-2">Correo Electrónico *</label>
                    <InputText
                        id="email"
                        type="email"
                        value={empleado.email}
                        onChange={(e) => setEmpleado({ ...empleado, email: e.target.value })}
                        className={classNames("w-full", { "p-invalid": errorValidacion && !empleado.email?.trim() })}
                    />
                </div>

                <div className="field">
                    <label htmlFor="telefono" className="font-bold block mb-2">Teléfono *</label>
                    <InputText
                        id="telefono"
                        value={empleado.telefono}
                        onChange={(e) => setEmpleado({ ...empleado, telefono: e.target.value })}
                        maxLength={15}
                        className={classNames("w-full", { "p-invalid": errorValidacion && !empleado.telefono?.trim() })}
                    />
                </div>

                {errorValidacion && (
                    <small className="p-error block mt-1">{errorValidacion}</small>
                )}
            </Dialog>
        </div>
    );
}