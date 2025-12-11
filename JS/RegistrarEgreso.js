(() => {
    const API_BASE = "https://localhost:7223/api/Egresos";

    // Elementos
    const tblBody = document.getElementById('bodyEgresos');
    const msgEgresos = document.getElementById('msgEgresos');
    const modal = document.getElementById('modalCrear');
    const btnOpen = document.getElementById('btnOpenCrear');
    const btnCerrarModal = document.getElementById('btnCerrarModal');
    const btnCrear = document.getElementById('btnCrear');
    const msgModal = document.getElementById('msgModal');

    const inputDescripcion = document.getElementById('inputDescripcion');
    const inputTipo = document.getElementById('inputTipo');
    const inputMonto = document.getElementById('inputMonto');
    const inputFecha = document.getElementById('inputFecha');

    // Recuperar usuario logueado
    function getUsuario() {
        try {
            return JSON.parse(localStorage.getItem('ej_user'));
        } catch {
            return null;
        }
    }

    // Cargar lista de egresos 
    async function cargarEgresos() {
        tblBody.innerHTML = '';
        msgEgresos.textContent = 'Cargando...';

        try {
            const res = await fetch(`${API_BASE}/Listar`);
            if (!res.ok) {
                msgEgresos.textContent = `Error al cargar egresos (${res.status})`;
                return;
            }

            const lista = await res.json();

            if (!Array.isArray(lista) || lista.length === 0) {
                msgEgresos.textContent = 'No hay egresos registrados.';
                return;
            }

            msgEgresos.textContent = `Mostrando ${lista.length} egresos.`;

            // Rellenar tabla
            lista.forEach(e => {
                const tr = document.createElement('tr');

                const fecha = e.fechaegreso
                    ? new Date(e.fechaegreso).toLocaleDateString()
                    : '';

                tr.innerHTML = `
                    <td>${e.idegreso}</td>
                    <td>${escapeHtml(e.descripcionegreso)}</td>
                    <td>${escapeHtml(e.tipoproveedor)}</td>
                    <td>${Number(e.montoegreso).toFixed(2)}</td>
                    <td>${fecha}</td>
                    <td>
                        <button class="btn-eliminar" data-id="${e.idegreso}">
                            Eliminar
                        </button>
                    </td>
                `;

                tblBody.appendChild(tr);
            });

        } catch (err) {
            console.error(err);
            msgEgresos.textContent = 'No se pudo conectar al servidor para cargar egresos.';
        }
    }

    // Eliminar egreso
    async function eliminarEgreso(id) {
        const confirmar = confirm(`¿Seguro que deseas eliminar el egreso con ID ${id}?`);
        if (!confirmar) return;

        try {
            const respuesta = await fetch(`${API_BASE}/${id}`, {
                method: "DELETE"
            });

            if (!respuesta.ok) {
                let detalle = null;
                try { detalle = await respuesta.json(); } catch {}
                alert(detalle?.mensaje ?? `Error al eliminar (${respuesta.status})`);
                return;
            }

            alert("Egreso eliminado correctamente.");
            await cargarEgresos();

        } catch (error) {
            console.error("Error al conectar:", error);
            alert("Error de conexión. No se pudo eliminar el egreso.");
        }
    }

    // Hacer que los botones de eliminar funcionen
    tblBody.addEventListener("click", (e) => {
        if (e.target.classList.contains("btn-eliminar")) {
            const id = e.target.getAttribute("data-id");
            eliminarEgreso(id);
        }
    });

    // Helper XSS
    function escapeHtml(str) {
        if (!str && str !== 0) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    // Abrir modal
    btnOpen.addEventListener('click', () => {
        msgModal.textContent = '';
        inputDescripcion.value = '';
        inputTipo.value = '';
        inputMonto.value = '';

        const hoy = new Date();
        inputFecha.value = hoy.toISOString().slice(0, 10);

        modal.style.display = 'flex';
    });

    // Cerrar modal
    btnCerrarModal.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Crear egreso (POST /Crear)
    btnCrear.addEventListener('click', async () => {
        msgModal.textContent = '';

        const descripcion = inputDescripcion.value.trim();
        const tipo = inputTipo.value.trim();
        const montoStr = inputMonto.value;
        const fechaLocal = inputFecha.value;

        if (!descripcion || !tipo || !montoStr || !fechaLocal) {
            msgModal.textContent = 'Completa todos los campos.';
            return;
        }

        const monto = parseFloat(montoStr);
        if (isNaN(monto) || monto < 0) {
            msgModal.textContent = 'Monto inválido.';
            return;
        }

        const usuario = getUsuario();
        if (!usuario || !usuario.iduser) {
            msgModal.textContent = 'Usuario no identificado. Vuelve a iniciar sesión.';
            return;
        }

        const fechaISOutc = new Date(fechaLocal + 'T00:00:00Z').toISOString();

        const payload = {
            descripcionegreso: descripcion,
            tipoproveedor: tipo,
            montoegreso: monto,
            fechaegreso: fechaISOutc,
            iduser: usuario.iduser
        };

        try {
            btnCrear.disabled = true;
            btnCrear.textContent = 'Creando...';

            const res = await fetch(`${API_BASE}/Crear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (res.ok) {
                await res.json();
                modal.style.display = 'none';
                await cargarEgresos();
            } else {
                let data = null;
                try { data = await res.json(); } catch {}
                msgModal.textContent = data?.mensaje ?? `Error al crear egreso (${res.status})`;
            }

        } catch (err) {
            console.error(err);
            msgModal.textContent = 'Error de conexión al crear egreso.';
        } finally {
            btnCrear.disabled = false;
            btnCrear.textContent = 'Crear';
        }
    });

    // Inicializar
    cargarEgresos();

})();
