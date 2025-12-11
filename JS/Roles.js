const API_URL = "https://localhost:7223/api/Roles";

const rolesLista = document.getElementById("roles-lista");
const btnAgregarRol = document.getElementById("btnAgregarRol");
const modalRol = document.getElementById("modalRol");
const overlay = document.getElementById("overlay");
const modalTitulo = document.getElementById("modalTitulo");
const nombreRolInput = document.getElementById("nombreRolInput");
const btnGuardarRol = document.getElementById("btnGuardarRol");
const btnCerrarModal = document.getElementById("btnCerrarModal");
const mensajeError = document.getElementById("mensajeError");

let editarId = null;

// ---------- MODAL ----------
function abrirModal(editar = false, rol = null) {
    modalRol.classList.remove("oculto");
    overlay.classList.remove("oculto");

    mensajeError.classList.add("oculto");

    if (editar) {
        modalTitulo.textContent = "Editar Rol";
        nombreRolInput.value = rol.nombrerol;
        editarId = rol.idrol;
    } else {
        modalTitulo.textContent = "Agregar Rol";
        nombreRolInput.value = "";
        editarId = null;
    }
}

function cerrarModal() {
    modalRol.classList.add("oculto");
    overlay.classList.add("oculto");
    nombreRolInput.value = "";
    mensajeError.classList.add("oculto");
}

// ---------- CARGAR ROLES ----------
async function cargarRoles() {
    rolesLista.innerHTML = "";

    try {
        const res = await fetch(API_URL);

        if (!res.ok) {
            console.error("Error al cargar los roles");
            return;
        }

        const data = await res.json();

        if (!Array.isArray(data)) {
            console.error("La API no devolvió una lista de roles");
            return;
        }

        data.forEach(rol => {
            const div = document.createElement("div");
            div.className = "rol-card";

            div.innerHTML = `
                <div>${rol.idrol}</div>
                <div>${rol.nombrerol}</div>
                <div class="col-accionesRol">
                    <button class="btn-opciones-rol" onclick='abrirModal(true, ${JSON.stringify(rol)})'>
                        <span class="material-symbols-outlined">edit</span>
                    </button>
                    <button class="btn-opciones-rol" onclick='eliminarRol(${rol.idrol})'>
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;

            rolesLista.appendChild(div);
        });

    } catch (err) {
        console.error("Error cargando roles:", err);
    }
}

// ---------- GUARDAR / EDITAR ----------
btnGuardarRol.addEventListener("click", async () => {
    const nombre = nombreRolInput.value.trim();

    if (!nombre) {
        mensajeError.textContent = "El nombre del rol no puede estar vacío";
        mensajeError.classList.remove("oculto");
        return;
    }

    try {
        let res;

        if (editarId) {
            // EDITAR
            res = await fetch(`${API_URL}/${editarId}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ idrol: editarId, nombrerol: nombre })
            });
        } else {
            // AGREGAR
            res = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ nombrerol: nombre })
            });
        }

        if (!res.ok) {
            const error = await res.text();
            alert("Error: " + error);
            return;
        }

        cargarRoles();
        cerrarModal();

    } catch (err) {
        console.error("Error guardando rol:", err);
    }
});

// ---------- ELIMINAR ----------
async function eliminarRol(id) {
    if (!confirm("¿Seguro que quieres eliminar este rol?")) return;

    try {
        const res = await fetch(`${API_URL}/${id}`, { method: "DELETE" });

        if (!res.ok) {
            const error = await res.text();
            alert("Error: " + error);
            return;
        }

        cargarRoles();

    } catch (err) {
        console.error("Error eliminando rol:", err);
    }
}

// ---------- EVENTOS ----------
btnAgregarRol.addEventListener("click", () => abrirModal());
btnCerrarModal.addEventListener("click", cerrarModal);
overlay.addEventListener("click", cerrarModal);

// ---------- INICIAL ----------
cargarRoles();

// ---------- BUSCAR ROL EN TIEMPO REAL ----------
const inputBuscarRol = document.getElementById("buscarRol");

inputBuscarRol.addEventListener("input", () => {
    const query = inputBuscarRol.value.toLowerCase();

    // Obtener todos los divs de roles cargados
    const rolCards = document.querySelectorAll(".rol-card");

    rolCards.forEach(card => {
        const nombre = card.children[1].textContent.toLowerCase();
        if (nombre.includes(query)) {
            card.style.display = "grid"; // mostrar
        } else {
            card.style.display = "none"; // ocultar
        }
    });
});
