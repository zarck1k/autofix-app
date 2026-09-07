
const obtenerSeveridadPorStatus = (status) =>{
   if(status === 400 || status === 403 || status === 404 || status === 409) {
       return "warn";            
   }
   return "error";
};

export const mostrarErrorApi = 
    (toastRef, error, msjPorDefecto="Ocurrió un error inesperado") => {
    
    const status = error.response?.status;
    const message = error.response?.data?.message || msjPorDefecto;
    const severity = obtenerSeveridadPorStatus(status);
    
    //construimos el mensaje
    toastRef.current.show(
        {
            severity,
            sumary: severity === "warn" ? "Atención" : "Error",
            detail: message,
            life: severity === "warn" ? 4000 : 5000,
        });

};

export const mostrarExitoApi = (toastRef, msj) => {
    toastRef.current.show({
        severity: "success", sumary:"Éxito", detail: msj, life: 3000
    });
}