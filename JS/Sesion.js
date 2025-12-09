// Sesion.js - Manejo de sesión y control de acceso por rol
(() => {

    // Verificar sesión
    const usuario = JSON.parse(localStorage.getItem('ej_user'));

    if (!usuario) {
        window.location.href = "/Index.html";
    }

    // Validar rol si la página lo requiere
    const requiredRole = document.body.getAttribute("data-role");

    if (requiredRole && parseInt(requiredRole) !== usuario.idrol) {
        alert("No tienes permiso para acceder a esta sección.");
        window.location.href = "/Inicio.html";
    }

    // Cerrar sesión global
    window.cerrarSesion = function () {
        localStorage.removeItem('ej_user');
        window.location.href = "/Index.html";
    };

    // Control de visibilidad de navbar según rol
window.addEventListener("DOMContentLoaded", () => {
    const usuario = JSON.parse(localStorage.getItem('ej_user'));
    const rol = usuario.idrol;

    // Limpia todos (se ocultan inicialmente)
    const items = [
        "link-inicio",
        "link-ventas",
        "link-reparaciones",
        "link-ganancias",
        "link-egresos",
        "link-reportes",
        "link-transacciones",
        "link-usuarios",
        "link-productos",
        "Link-roles"
    ];

    items.forEach(id => {
        const el = document.getElementById(id);
        if (el) el.style.display = "none";
    });

    // ROL 1 - Admin (ve TODO)
    if (rol === 1) {
        items.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = "block";
        });
    }

    // ROL 2 - Atención al cliente
    if (rol === 2) {
        mostrar("link-inicio");
        mostrar("link-ventas");
        mostrar("link-reparaciones");
        mostrar("link-egresos");
        mostrar("link-productos");
        // NO ve usuarios
    }

    // Si en el futuro agregas más roles:
    // if (rol === 3) { ... }

});

// Función para mostrar cosas fácil
function mostrar(id) {
    const el = document.getElementById(id);
    if (el) el.style.display = "block";
}

})();
