const Url = "https://localhost:7223/api/ConfigGanancias";

document.addEventListener("DOMContentLoaded", async function() {

    const form = document.getElementById("formConfig");
    const btnNuevo = document.getElementById("btnNuevo");
    const btnEliminar = document.getElementById("btnEliminar");
    const btnFiltrar = document.getElementById("btnFiltrar");
    const inputFiltrarID = document.getElementById("inputFiltrarID");
    const tblBody = document.querySelector("#tblConfigGanancias tbody");
    const btnGuardar = document.getElementById("btnGuardarGanancia");
    const btnCancelar = document.querySelector(".btnCancelar");

    const inputs = {
        idganancia: document.getElementById("idganancia"),
        porcentajeTaller: document.getElementById("porcentajeTaller"),
        porcentajeEmpleado: document.getElementById("porcentajeEmpleado"),
        fechaConfig: document.getElementById("fechaConfig"),
        estadoDistrib: document.getElementById("estadoDistrib"),
        iduser: document.getElementById("iduser")
    };

    let configs = [];
    let editarId = null;

    // Inicializar iduser desde localStorage
    const usuario = JSON.parse(localStorage.getItem("ej_user"));
    if (usuario && usuario.iduser) inputs.iduser.value = usuario.iduser;

    await cargarTabla();

    btnNuevo.addEventListener("click", async function() {
        form.style.display = form.style.display === "none" || form.style.display === "" ? "block" : "none";
        limpiarFormulario();
        editarId = null;

        try {
            if (!configs.length) await cargarTabla();
            const listaIds = configs.map(function(c){ return Number(c.idGanancia ?? 0); }).sort(function(a,b){ return a-b; });
            let nuevoId = 1;
            for (const id of listaIds) { if (id === nuevoId) nuevoId++; else break; }
            inputs.idganancia.value = nuevoId;
        } catch (e) {
            console.log("Error obteniendo próximo ID:", e);
        }
    });

    btnCancelar.addEventListener("click", function() {
        limpiarFormulario();
        form.style.display = "none";
        editarId = null;
    });

    function limpiarFormulario() {
        Object.keys(inputs).forEach(function(k){
            if (k === "estadoDistrib") {
                inputs[k].value = "true";
            } else if (k !== "iduser") {
                inputs[k].value = "";
            }
        });
    }

    async function cargarTabla() {
        try {
            const res = await fetch(Url);
            configs = await res.json();
            mostrarRegistros(configs);
        } catch (error) {
            alert("Error al cargar configuraciones: " + error);
        }
    }

    function mostrarRegistros(lista) {
        tblBody.innerHTML = "";
        lista.forEach(function(cfg) {
            const row = document.createElement("tr");
            row.innerHTML = `
                <td>${cfg.idGanancia}</td>
                <td>${cfg.porcentajeTaller}</td>
                <td>${cfg.porcentajeEmpleado}</td>
                <td>${cfg.fechaConfig ? new Date(cfg.fechaConfig).toLocaleDateString() : ""}</td>
                <td>${cfg.estadoDistribucion}</td>
                <td><button class="btnEditar" data-id="${cfg.idGanancia}">Editar</button></td>
            `;
            tblBody.appendChild(row);
            row.querySelector(".btnEditar").addEventListener("click", function() { editarConfig(cfg.idGanancia); });
        });
    }

    function editarConfig(id) {
        const cfg = configs.find(function(c){ return c.idGanancia == id; });
        if (!cfg) return;
        editarId = id;
        form.style.display = "block";

        inputs.idganancia.value = cfg.idGanancia;
        inputs.porcentajeTaller.value = cfg.porcentajeTaller;
        inputs.porcentajeEmpleado.value = cfg.porcentajeEmpleado;
        inputs.fechaConfig.value = cfg.fechaConfig ? cfg.fechaConfig.split("T")[0] : "";
        inputs.estadoDistrib.value = cfg.estadoDistribucion.toString();
    }

    btnGuardar.addEventListener("click", async function() {
        const idGanancia = parseInt(inputs.idganancia.value);
        const idUser = inputs.iduser.value;
        let porcentajeTaller = parseFloat(inputs.porcentajeTaller.value);
        let porcentajeEmpleado = parseFloat(inputs.porcentajeEmpleado.value);
        const fechaConfig = inputs.fechaConfig.value;
        const estadoDistrib = inputs.estadoDistrib.value === "true";

        // Validaciones
        if (isNaN(idGanancia) || idGanancia <= 0) { 
            alert("Ingrese un ID válido."); 
            return; 
        }

        if (!editarId && configs.some(function(c){ return c.idGanancia === idGanancia; })) {
            alert("El ID ingresado ya existe. Elija otro ID.");
            return;
        }

        if (!idUser) { 
            alert("Error: No se encontró ID del usuario."); 
            return; 
        }

        if (isNaN(porcentajeTaller) || isNaN(porcentajeEmpleado) || !fechaConfig) {
            alert("Complete todos los campos correctamente."); 
            return;
        }

        porcentajeTaller = Math.round(porcentajeTaller * 100) / 100;
        porcentajeEmpleado = Math.round(porcentajeEmpleado * 100) / 100;

        if (porcentajeTaller < 0 || porcentajeTaller > 100) {
            alert("Porcentaje Taller debe estar entre 0 y 100"); 
            return;
        }
        if (porcentajeEmpleado < 0 || porcentajeEmpleado > 100) {
            alert("Porcentaje Empleado debe estar entre 0 y 100"); 
            return;
        }
        if (porcentajeTaller + porcentajeEmpleado > 100) {
            alert("La suma de porcentaje Taller y Empleado no puede superar 100%"); 
            return;
        }

        const dto = {
            idGanancia: idGanancia,
            idUser: idUser,
            porcentajeTaller: porcentajeTaller,
            porcentajeEmpleado: porcentajeEmpleado,
            fechaConfig: new Date(fechaConfig).toISOString(),
            estadoDistribucion: estadoDistrib
        };

        try {
            const res = await fetch(Url, {
                method: editarId ? "PUT" : "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(dto)
            });

            if (res.ok) {
                alert(editarId ? "Configuración actualizada" : "Configuración creada");
                limpiarFormulario();
                form.style.display = "none";
                editarId = null;
                await cargarTabla();
            } else {
                const errorText = await res.text();
                alert("Error al guardar configuración: " + errorText);
            }
        } catch (error) {
            alert("Error de conexión: " + error);
        }
    });

    btnEliminar.addEventListener("click", async function() {
        const id = prompt("Ingrese el ID de la configuración a eliminar:");
        if (!id) return;
        if (!confirm("¿Está seguro de eliminar la configuración " + id + "?")) return;

        try {
            const res = await fetch(Url + "/" + id, { method: "DELETE" });
            if (res.ok) {
                alert("Configuración eliminada");
                await cargarTabla();
            } else {
                const error = await res.text();
                alert("Error: " + error);
            }
        } catch (error) {
            alert("Error de conexión: " + error);
        }
    });

    btnFiltrar.addEventListener("click", function() {
        const id = inputFiltrarID.value.trim();
        if (!id || isNaN(id)) { mostrarRegistros(configs); return; }
        const filtrado = configs.filter(function(c){ return c.idGanancia == id; });
        if (filtrado.length) mostrarRegistros(filtrado);
        else alert("No se encontró la configuración con ID " + id);
    });

});
