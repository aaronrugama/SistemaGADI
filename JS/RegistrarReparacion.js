document.addEventListener("DOMContentLoaded", function () {

    const form = document.getElementById("formReparacion");
    const btnNuevo = document.getElementById("btnNuevo");
    const btnEliminar = document.getElementById("btnEliminar");
    const btnFiltrar = document.getElementById("btnFiltrar");
    const inputFiltrarID = document.getElementById("inputFiltrarID");
    const tblBody = document.querySelector("#tblReparaciones tbody");
    const btnGuardar = document.getElementById("btnGuardarReparacion");
    const btnCancelar = document.querySelector(".btnCancelar");

    const nombrecliente = document.getElementById("nombrecliente");
    const telcliente = document.getElementById("telcliente");
    const marcaequipo = document.getElementById("marcaequipo");
    const fechadiagnostico = document.getElementById("fechadiagnostico");
    const fechaaprobacion = document.getElementById("fechaaprobacion");
    const fechaentrega = document.getElementById("fechaentrega");
    const chkAprobacion = document.getElementById("chk_aprobacion");
    const chkEntrega = document.getElementById("chk_entrega");
    const estadoreparacion = document.getElementById("estadoreparacion");
    const costorevision = document.getElementById("costorevision");
    const costoreparacion = document.getElementById("costoreparacion");
    const iduser = document.getElementById("iduser");

    let reparaciones = [];
    let editarId = null;
    let editarIdIngreso = null;

    // Mostrar/Ocultar formulario
    btnNuevo.addEventListener("click", () => {
        form.style.display = form.style.display === "none" ? "block" : "none";
    });

    // Cancelar y limpiar formulario
    btnCancelar.addEventListener("click", () => {
        limpiarFormulario();
        form.style.display = "none";
    });

    function limpiarFormulario() {
        nombrecliente.value = "";
        telcliente.value = "";
        marcaequipo.value = "";
        fechadiagnostico.value = "";
        fechaaprobacion.value = "";
        fechaentrega.value = "";
        chkAprobacion.checked = false;
        chkEntrega.checked = false;
        estadoreparacion.value = "";
        costorevision.value = 0;
        costoreparacion.value = 0;
        editarId = null;
        editarIdIngreso = null;
    }

    // Cargar tabla
    async function cargarTabla() {
        try {
            const res = await fetch("https://localhost:7223/api/Reparaciones");
            reparaciones = await res.json();
            mostrarRegistros(reparaciones);
        } catch (error) {
            alert("Error al cargar reparaciones: " + error);
        }
    }

    function mostrarRegistros(lista) {
        tblBody.innerHTML = "";
        lista.forEach(rep => {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${rep.idreparacion}</td>
                <td>${rep.nombrecliente}</td>
                <td>${rep.telcliente}</td>
                <td>${rep.marcaequipo}</td>
                <td>${rep.fechadiagnostico ? new Date(rep.fechadiagnostico).toLocaleDateString() : ""}</td>
                <td>${rep.fechaaprobacion ? new Date(rep.fechaaprobacion).toLocaleDateString() : ""}</td>
                <td>${rep.fechaentrega ? new Date(rep.fechaentrega).toLocaleDateString() : ""}</td>
                <td>${rep.estadoreparacion}</td>
                <td>${rep.costorevision}</td>
                <td>${rep.costoreparacion}</td>
                <td>
                    <button class="btnEditar" data-id="${rep.idreparacion}">Editar</button>
                </td>
            `;
            tblBody.appendChild(row);

            row.querySelector(".btnEditar").addEventListener("click", () => {
                editarId = rep.idreparacion;
                editarIdIngreso = rep.idingreso;
                form.style.display = "block";

                nombrecliente.value = rep.nombrecliente;
                telcliente.value = rep.telcliente;
                marcaequipo.value = rep.marcaequipo;
                fechadiagnostico.value = rep.fechadiagnostico ? rep.fechadiagnostico.split("T")[0] : "";
                fechaaprobacion.value = rep.fechaaprobacion ? rep.fechaaprobacion.split("T")[0] : "";
                fechaentrega.value = rep.fechaentrega ? rep.fechaentrega.split("T")[0] : "";
                estadoreparacion.value = rep.estadoreparacion;
                costorevision.value = rep.costorevision;
                costoreparacion.value = rep.costoreparacion;
            });
        });
    }

    // Guardar reparación
    btnGuardar.addEventListener("click", async () => {

        if (!nombrecliente.value.trim() || !telcliente.value.trim() || !marcaequipo.value.trim() ||
            !fechadiagnostico.value || !estadoreparacion.value) {
            alert("Complete todos los campos obligatorios.");
            return;
        }

        // Validación de valores negativos
        if ((parseFloat(costorevision.value) || 0) < 0 || (parseFloat(costoreparacion.value) || 0) < 0) {
            alert("Los valores de costo no pueden ser negativos.");
            return;
        }

        try {
            let res;
            if (editarId) {
                // Actualizar reparación existente
                const repActualizar = {
                    idreparacion: editarId,
                    idingreso: editarIdIngreso,
                    nombrecliente: nombrecliente.value.trim(),
                    telcliente: telcliente.value.trim(),
                    marcaequipo: marcaequipo.value.trim(),
                    fechadiagnostico: new Date(fechadiagnostico.value),
                    fechaaprobacion: fechaaprobacion.value ? new Date(fechaaprobacion.value) : null,
                    fechaentrega: fechaentrega.value ? new Date(fechaentrega.value) : null,
                    estadoreparacion: estadoreparacion.value,
                    costorevision: parseFloat(costorevision.value) || 0,
                    costoreparacion: parseFloat(costoreparacion.value) || 0
                };

                res = await fetch(`https://localhost:7223/api/Reparaciones/${editarId}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(repActualizar)
                });

            } else {
                // Crear nueva reparación
                const dto = {
                    nombrecliente: nombrecliente.value.trim(),
                    telcliente: telcliente.value.trim(),
                    marcaequipo: marcaequipo.value.trim(),
                    fechadiagnostico: new Date(fechadiagnostico.value),
                    fechaaprobacion: fechaaprobacion.value ? new Date(fechaaprobacion.value) : null,
                    fechaentrega: fechaentrega.value ? new Date(fechaentrega.value) : null,
                    estadoreparacion: estadoreparacion.value,
                    costorevision: parseFloat(costorevision.value) || 0,
                    costoreparacion: parseFloat(costoreparacion.value) || 0,
                    iduser: iduser.value
                };

                res = await fetch("https://localhost:7223/api/Reparaciones", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(dto)
                });
            }

            if (res.ok) {
                const data = await res.json();
                alert(editarId ? "Reparación actualizada correctamente" : `Reparación registrada con éxito. Código: ${data.reparacion?.idreparacion || data.idreparacion}`);
                limpiarFormulario();
                form.style.display = "none";
                cargarTabla();
            } else {
                const error = await res.text();
                alert("Error al guardar: " + error);
            }

        } catch (error) {
            alert("Error de conexión con la API: " + error);
        }
    });

    // Eliminar reparación
    btnEliminar.addEventListener("click", async () => {
        const id = prompt("Ingrese el ID de la reparación a eliminar:");
        if (!id) return;
        if (!confirm("¿Está seguro de eliminar la reparación " + id + "?")) return;

        try {
            const res = await fetch(`https://localhost:7223/api/Reparaciones/${id}`, { method: "DELETE" });
            if (res.ok) {
                alert("Reparación eliminada");
                cargarTabla();
            } else {
                const error = await res.text();
                alert("Error: " + error);
            }
        } catch (error) {
            alert("Error de conexión: " + error);
        }
    });

    // Filtrar por ID
    btnFiltrar.addEventListener("click", async () => {
        const id = inputFiltrarID.value.trim();
        if (!id) {
            cargarTabla();
            return;
        }

        try {
            const res = await fetch(`https://localhost:7223/api/Reparaciones/${id}`);
            if (res.ok) {
                const rep = await res.json();
                mostrarRegistros([rep]);
            } else {
                alert("No se encontró la reparación con ID " + id);
            }
        } catch (error) {
            alert("Error de conexión: " + error);
        }
    });

    cargarTabla();
});
