const API = "https://localhost:7223/api/Reportes";

document.addEventListener("DOMContentLoaded", () => {
    cargarReportes();

    document.getElementById("btnAbrirModal").addEventListener("click", abrirModal);
    document.getElementById("btnCerrarModal").addEventListener("click", cerrarModal);
    document.getElementById("btnCrearReporte").addEventListener("click", crearReporte);
});

function abrirModal() {
    document.getElementById("modalReporte").style.display = "flex";
}

function cerrarModal() {
    document.getElementById("modalReporte").style.display = "none";
}

/* =====================
   CARGAR TODOS LOS REPORTES 
===================== */

async function cargarReportes() {
    try {
        const res = await fetch(`${API}/listar`);
        const data = await res.json();

        const tbody = document.getElementById("tbodyReportes");
        tbody.innerHTML = "";

        data.forEach(rep => {
            const fila = document.createElement("tr");
            fila.classList.add("fila-reporte");

            // Formatear fechas para mostrar solo la parte de fecha
            const fechaReporte = rep.fechareporte ? rep.fechareporte.split("T")[0] : "N/A";
            const fechaInicio = rep.fechainicio ? rep.fechainicio.split("T")[0] : "N/A";
            const fechaFin = rep.fechafin ? rep.fechafin.split("T")[0] : "N/A";
            const fechaCreacion = rep.fechacreacion ? 
                new Date(rep.fechacreacion).toLocaleDateString() + " " + 
                new Date(rep.fechacreacion).toLocaleTimeString().substring(0, 5) : "N/A";

            fila.innerHTML = `
                <td>${rep.idreporte}</td>
                <td>${rep.iduser || "N/A"}</td>
                <td>${fechaReporte}</td>
                <td>${fechaInicio}</td>
                <td>${fechaFin}</td>
                <td>$${(rep.totalingreso || 0).toFixed(2)}</td>
                <td>$${(rep.totalegreso || 0).toFixed(2)}</td>
                <td>$${(rep.gananciataller || 0).toFixed(2)}</td>
                <td>$${(rep.gananciaempleado || 0).toFixed(2)}</td>
                <td>${fechaCreacion}</td>
                <td><button class="btnEliminar" onclick="eliminarReporte(${rep.idreporte})">Eliminar</button></td>
            `;

            tbody.appendChild(fila);
        });

    } catch (err) {
        console.error("Error cargando reportes", err);
        document.getElementById("tbodyReportes").innerHTML = 
            `<tr><td colspan="11" style="text-align:center;color:red;">Error al cargar reportes: ${err.message}</td></tr>`;
    }
}

/* =====================
    CREAR REPORTE
===================== */

async function crearReporte() {
    const fechaInicio = document.getElementById("fechaInicio").value;
    const fechaFin = document.getElementById("fechaFin").value;

    if (!fechaInicio || !fechaFin) {
        alert("Debes ingresar ambas fechas");
        return;
    }

    let usuario = null;
    try {
        const userData = localStorage.getItem('ej_user');
        if (!userData) throw new Error("No hay usuario en sesión");
        usuario = JSON.parse(userData);
    } catch (err) {
        console.error("Error obteniendo usuario:", err);
        alert("No se encontró información de usuario. Inicie sesión nuevamente.");
        return;
    }

    if (!usuario || !usuario.iduser) {
        alert("Usuario no válido. Falta el campo iduser.");
        return;
    }

    if (fechaInicio > fechaFin) {
        alert("La fecha de inicio no puede ser mayor que la fecha final");
        return;
    }

    const body = {
        idUser: usuario.iduser,
        fechaInicio: fechaInicio + "T00:00:00.000Z",
        fechaFin: fechaFin + "T23:59:59.999Z"
    };

    console.log("Body enviado a API (con UTC):", JSON.stringify(body));

    try {
        const btn = document.getElementById("btnCrearReporte");
        btn.textContent = "Creando...";
        btn.disabled = true;

        const res = await fetch(`${API}/Crear`, {
            method: "POST",
            headers: { 
                "Content-Type": "application/json" 
            },
            body: JSON.stringify(body)
        });

        console.log("Respuesta HTTP:", res.status);

        let data = null;
        try {
            data = await res.json();
            console.log("Respuesta JSON completa:", data);
            console.log("Fecha inicio en respuesta:", data.data?.fechainicio);
            console.log("Fecha fin en respuesta:", data.data?.fechafin);
        } catch (parseError) {
            const text = await res.text();
            throw new Error(`La API no devolvió JSON válido: ${text.substring(0, 100)}`);
        }

        if (!res.ok) {
            throw new Error(data?.message || `Error ${res.status}`);
        }

        if (data.ok === false) {
            throw new Error(data.message || "Error desconocido");
        }

        alert(data.message || "Reporte creado exitosamente");
        cerrarModal();
        document.getElementById("fechaInicio").value = "";
        document.getElementById("fechaFin").value = "";
        cargarReportes();
        
    } catch (err) {
        console.error("Error en crearReporte:", err);
        alert("Error: " + err.message);
    } finally {
        const btn = document.getElementById("btnCrearReporte");
        if (btn) {
            btn.textContent = "Crear";
            btn.disabled = false;
        }
    }
}

/* =====================
   ELIMINAR REPORTE
===================== */

async function eliminarReporte(id) {
    if (!confirm("¿Seguro que deseas eliminar este reporte?")) return;

    try {
        const res = await fetch(`${API}/Eliminar/${id}`, {
            method: "DELETE"
        });

        let data = null;
        try { 
            data = await res.json(); 
        } catch {}

        if (!res.ok) {
            alert(data?.message || `Error ${res.status} eliminando reporte`);
            return;
        }

        if (data && data.ok === false) {
            alert(data.message || "Error eliminando reporte");
            return;
        }

        alert("Reporte eliminado exitosamente");
        cargarReportes();

    } catch (err) {
        console.error("Error eliminando reporte", err);
        alert("Error de conexión al eliminar reporte");
    }
}