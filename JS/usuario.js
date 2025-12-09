document.addEventListener("click", (e) => {
    // Si hace clic en el botón
    if (e.target.closest(".btn-opciones")) {
        const card = e.target.closest(".usuario-card");
        const menu = card.querySelector(".menu-opciones");
        menu.classList.toggle("oculto");
        return;
    }

    // Cerrar todos si hace clic fuera
    document.querySelectorAll(".menu-opciones").forEach(m => m.classList.add("oculto"));
});

const btnAbrir = document.getElementById("RegistrarU");
const modal = document.getElementById("modalUsuario");
const overlay = document.getElementById("overlay");

// ABRIR MODAL
btnAbrir.addEventListener("click", () => {
    modal.classList.remove("oculto");
    overlay.classList.remove("oculto");
});

// CERRAR MODAL AL DAR CLICK EN EL FONDO
overlay.addEventListener("click", () => {
    modal.classList.add("oculto");
    overlay.classList.add("oculto");
});
