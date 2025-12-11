const API_URL = "https://localhost:7223/api/Usuarios";


// ---------- CARGA AUTOMÁTICA AL ENTRAR A LA PÁGINA-------
document.addEventListener("DOMContentLoaded", () => {
    cargarUsuarios();
});

// --------GET para obtener usarios------
async function cargarUsuarios() {
    try {
        const respuesta = await fetch(API_URL);

        if (!respuesta.ok) {
            throw new Error("Error al obtener usuarios: " + respuesta.status);
        }

        const data = await respuesta.json();
        mostrarUsuarios(data);

    } catch (error) {
        console.error("ERROR EN GET:", error);
    }
}

// --------MOSTRAR USARIOS----------
function mostrarUsuarios(usuarios) {
    const contenedor = document.getElementById("usuarios-lista");
    contenedor.innerHTML = ""; // Limpia antes de cargar

    usuarios.forEach(usuario => {
        const card = document.createElement("div");
        card.classList.add("usuario-card");

        card.innerHTML = `
            <!-- NOMBRE + FOTO -->
            <div class="col-nombre">
                <img src="https://i.pravatar.cc/60" class="usuario-img">
                <div>
                    <h3 class="usuario-nombre">${usuario.nombreuser}</h3>
                </div>
            </div>

            <!-- CÉDULA -->
            <div class="col-cedula">${usuario.cedulauser}</div>

            <!-- CORREO -->
            <div class="col-correo">${usuario.correouser}</div>

            <!-- ESTADO -->
            <div class="col-estado">
                <select class="estado-select">
                    <option value="activo" ${usuario.estado === "activo" ? "selected" : ""}>Activo</option>
                    <option value="inactivo" ${usuario.estado === "inactivo" ? "selected" : ""}>Inactivo</option>
                </select>
            </div>

            <!-- ACCIONES -->
            <div class="col-acciones">
                <button class="btn-opciones">
                    <span class="material-symbols-outlined">more_vert</span>
                </button>

                <div class="menu-opciones oculto">
                    <p class="opcion editar" data-id="${usuario.iduser}">
                        <span class="material-symbols-outlined">edit</span> Editar
                    </p>
                    <p class="opcion eliminar" data-id="${usuario.iduser}">
                        <span class="material-symbols-outlined">delete</span> Eliminar
                    </p>
                    <p class="opcion ver" data-id="${usuario.iduser}">
                        <span class="material-symbols-outlined">visibility</span> Ver
                    </p>
                </div>
            </div>
        `;

        contenedor.appendChild(card);
    });
}

// ----------EL MENU ----------
document.addEventListener("click", (e) => {

    // Abrir menú
    if (e.target.closest(".btn-opciones")) {
        const card = e.target.closest(".usuario-card");
        const menu = card.querySelector(".menu-opciones");

        // Cerrar otros menús
        document.querySelectorAll(".menu-opciones").forEach(m => {
            if (m !== menu) m.classList.add("oculto");
        });

        menu.classList.toggle("oculto");
        return;
    }

    // Cerrar si hace clic fuera
    document.querySelectorAll(".menu-opciones").forEach(m => {
        m.classList.add("oculto");
    });
});

// ------ABRIR O CERRAR MODAL----------
const btnAbrir = document.getElementById("RegistrarU");
const modal = document.getElementById("modalUsuario");
const overlay = document.getElementById("overlay");

// Abrir modal
btnAbrir.addEventListener("click", () => {
    modal.classList.remove("oculto");
    overlay.classList.remove("oculto");
});

// Cerrar modal al hacer clic fuera
overlay.addEventListener("click", () => {
    modal.classList.add("oculto");
    overlay.classList.add("oculto");
});

// ---------- GET por ID----------
async function verUsuarioPorId(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("Usuario no encontrado");

        const usuario = await res.json();
        const rolActual = document.body.dataset.role; // 1=admin, 2=cliente

        // Campos visibles para todos
        document.getElementById("verNombre").textContent = usuario.nombreuser;
        document.getElementById("verCedula").textContent = usuario.cedulauser;
        document.getElementById("verDireccion").textContent = usuario.direccionuser || "-";
        document.getElementById("verCorreo").textContent = usuario.correouser;
        document.getElementById("verIntentos").textContent = usuario.intentosuser;
        document.getElementById("verEstado").textContent = usuario.estadouser ? "Activo" : "Inactivo";
        document.getElementById("verIdRol").textContent = usuario.idrol;

        // Contraseña: solo admins pueden ver/mostrar
        const verContrasena = document.getElementById("verContrasena");
        const btnMostrar = document.getElementById("btnMostrarContrasena");

        if (rolActual === "1") { // Administrador
            verContrasena.textContent = "***"; //contraseña oculta
            btnMostrar.style.display = "inline-block";

            btnMostrar.onclick = () => {
                if (verContrasena.textContent === "***") {
                    verContrasena.textContent = usuario.contrasenauser;
                    btnMostrar.textContent = "Ocultar";
                } else {
                    verContrasena.textContent = "***";
                    btnMostrar.textContent = "Mostrar";
                }
            };
        } else { // Cliente u otro rol
            verContrasena.textContent = "*****"; // nunca mostrar
            btnMostrar.style.display = "none";
        }

        // Abrir modal
        document.getElementById("modalVerUsuario").classList.remove("oculto");
        overlay.classList.remove("oculto");

    } catch (error) {
        console.error(error);
        alert("No se pudo cargar el usuario");
    }
}


// -------CLICK EN "VER" PARA MOSTRAR MODAL DE USUARIO----------
document.addEventListener("click", (e) => {
    const botonVer = e.target.closest(".ver");
    if (botonVer) {
        const id = botonVer.dataset.id; // obtiene el ID del usuario
        verUsuarioPorId(id);           // llama a tu función que abre el modal
    }
});


// ------  CERRAR MODAL DE VER USUARIO----------
const btnCerrarVerUsuario = document.getElementById("btnCerrarVerUsuario");

btnCerrarVerUsuario.addEventListener("click", () => {
    document.getElementById("modalVerUsuario").classList.add("oculto");
    document.getElementById("overlay").classList.add("oculto");
});


// ------Buscar USARIOS ESPECIFICOS ----------
const inputBuscar = document.getElementById("MontoP");
inputBuscar.addEventListener("input", () => {
    const texto = inputBuscar.value.toLowerCase(); // convierte a minúsculas para comparar

    // Recorre todos los usuarios cargados
    const tarjetas = document.querySelectorAll(".usuario-card");
    tarjetas.forEach(card => {
        const nombre = card.querySelector(".usuario-nombre").textContent.toLowerCase();
        const cedula = card.querySelector(".col-cedula").textContent.toLowerCase();

        // Si coincide con nombre o cédula, se muestra, si no, se oculta
        if (nombre.includes(texto) || cedula.includes(texto)) {
            card.style.display = "flex"; // o block según tu CSS
        } else {
            card.style.display = "none";
        }
    });
});


// -----POST – AGREGAR USUARIO----------

function generarIdUsuario() {
    const random = Math.floor(Math.random() * 1000);
    return "US" + random.toString().padStart(5, "0"); // Ej: US00001
}

function mostrarError(mensaje) {
    const mensajeDiv = document.getElementById("mensajeError");
    mensajeDiv.textContent = mensaje;
    mensajeDiv.classList.remove("oculto");

    setTimeout(() => {
        mensajeDiv.classList.add("oculto");
    }, 3000);
}

function crearObjetoUsuario() {
    const nombreInput = document.getElementById("nombreInput");
    const apellidoInput = document.getElementById("apellidoInput");
    const cedulaInput = document.getElementById("cedulaInput");
    const correoInput = document.getElementById("correoInput");
    const rolInput = document.getElementById("rolInput");
    const direccionInput = document.getElementById("direccionInput");

    return {
        iduser: generarIdUsuario(),
        nombreuser: nombreInput.value.trim() + " " + apellidoInput.value.trim(),
        cedulauser: cedulaInput.value.trim(),
        correouser: correoInput.value.trim(),
        contrasenauser: "pass123",
        direccionuser: direccionInput.value.trim() || "No registrada",
        intentosuser: 0,
        estadouser: true,
        idrol: parseInt(rolInput.value)
    };
}

async function agregarUsuario() {
    const nuevoUsuario = crearObjetoUsuario();

    // Validaciones básicas
    if (!nuevoUsuario.nombreuser || !nuevoUsuario.cedulauser || !nuevoUsuario.correouser || !nuevoUsuario.idrol) {
        mostrarError("Todos los campos son obligatorios");
        return;
    }

    if (![1, 2].includes(nuevoUsuario.idrol)) {
        mostrarError("Rol inválido. Solo se permiten 1 o 2");
        return;
    }

    try {
        const res = await fetch(API_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(nuevoUsuario)
        });

        if (!res.ok) {
            const error = await res.json();
            mostrarError(error.message || "No se pudo agregar el usuario");
            return;
        }

        // Usuario agregado correctamente
        const usuarioCreado = await res.json();
        mostrarError("Usuario agregado correctamente!");
        document.getElementById("modalUsuario").classList.add("oculto");
        document.getElementById("overlay").classList.add("oculto");

        // Recargar lista
        cargarUsuarios();

        // Limpiar inputs
        ["nombreInput","apellidoInput","cedulaInput","correoInput","rolInput","direccionInput"].forEach(id => {
            document.getElementById(id).value = "";
        });

    } catch (error) {
        console.error(error);
        mostrarError("Error al conectar con el servidor");
    }
}

// Evento del botón
document.getElementById("btnGuardarUsuario").addEventListener("click", agregarUsuario);


// -----PUT – EDITAR USUARIO----------
// Función para abrir modal y llenar datos desde la API
async function abrirModalEditarPorId(id) {
    try {
        const res = await fetch(`${API_URL}/${id}`);
        if (!res.ok) throw new Error("No se pudo obtener el usuario");
        const usuario = await res.json();

        // Llenar inputs del modal
        document.getElementById('editarNombre').value = usuario.nombreuser;
        document.getElementById('editarCedula').value = usuario.cedulauser;
        document.getElementById('editarCorreo').value = usuario.correouser;
        document.getElementById('editarDireccion').value = usuario.direccionuser || '';
        document.getElementById('editarRol').value = usuario.idrol;
        document.getElementById('editarEstado').value = usuario.estadouser ? 'activo' : 'inactivo';

        // Guardar ID para el PUT
        document.getElementById('btnActualizarUsuario').dataset.id = usuario.iduser;

        // Mostrar modal
        document.getElementById('modalEditarUsuario').classList.remove('oculto');
        document.getElementById('overlay').classList.remove('oculto');

    } catch (error) {
        console.error(error);
        alert("Error al cargar usuario para editar");
    }
}

// Evento para abrir modal al hacer clic en "Editar"
document.addEventListener("click", (e) => {
    const btnEditar = e.target.closest(".editar");
    if (btnEditar) {
        const id = btnEditar.dataset.id; // obtiene el id del usuario
        abrirModalEditarPorId(id);
    }
});

// Cerrar modal
document.getElementById('btnCerrarEditar').addEventListener('click', () => {
    document.getElementById('modalEditarUsuario').classList.add('oculto');
    document.getElementById('overlay').classList.add('oculto');
});

// Guardar cambios (PUT)
document.getElementById('btnActualizarUsuario').addEventListener('click', async () => {
    const id = document.getElementById('btnActualizarUsuario').dataset.id;

    // estado true/false
    const estadoInput = document.getElementById('editarEstado').value;
    const estadoBoolean = estadoInput.toLowerCase() === 'activo';

    
    const usuarioActualizado = {
    iduser: id, 
    nombreuser: document.getElementById('editarNombre').value,
    cedulauser: document.getElementById('editarCedula').value,
    correouser: document.getElementById('editarCorreo').value,
    direccionuser: document.getElementById('editarDireccion').value,
    contrasenauser: "pass123", 
    intentosuser: 0, 
    idrol: parseInt(document.getElementById('editarRol').value),
    estadouser: estadoBoolean
};


    try {
        const res = await fetch(`${API_URL}/${id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(usuarioActualizado)
        });

        if (res.ok) {
            alert('Usuario actualizado correctamente');
            document.getElementById('modalEditarUsuario').classList.add('oculto');
            cargarUsuarios(); // refresca la lista sin recargar toda la página
        } else {
            // Mostrar mensajes claros según el código HTTP
            let mensajeError = '';
            const errorText = await res.text(); // mensaje que envía la API

            switch (res.status) {
                case 400:
                    mensajeError = "Error 400: Datos incorrectos o faltan campos. " + errorText;
                    break;
                case 404:
                    mensajeError = "Error 404: Usuario no encontrado. " + errorText;
                    break;
                case 500:
                    mensajeError = "Error 500: Problema en el servidor. " + errorText;
                    break;
                default:
                    mensajeError = `Error ${res.status}: ${errorText}`;
            }

            console.error("PUT ERROR:", mensajeError);
            alert(mensajeError);
        }
    } catch (err) {
        console.error("Error de conexión:", err);
        alert('Error de conexión con la API: ' + err.message);
    }
});


// ---- DELETE – ELIMINAR USUARIO----------
document.addEventListener("click", async (e) => {
    const btnEliminar = e.target.closest(".eliminar");
    if (btnEliminar) {
        const id = btnEliminar.dataset.id; // obtiene el id del usuario
        const confirmacion = confirm("¿Seguro que deseas eliminar este usuario?");
        if (!confirmacion) return;

        try {
            const res = await fetch(`${API_URL}/${id}`, {
                method: "DELETE"
            });

            if (res.ok) {
                alert("Usuario eliminado correctamente");
                cargarUsuarios(); // recarga la lista de usuarios
            } else {
                const errorText = await res.text();
                alert(`Error al eliminar usuario: ${errorText}`);
            }
        } catch (err) {
            console.error("Error de conexión:", err);
            alert("Error al conectar con la API: " + err.message);
        }
    }
});