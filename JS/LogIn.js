// /JS/login.js
(() => {
  const API_URL = "https://localhost:7223/api/Auth/login"; // si el HTTPS te da problemas, prueba: "http://localhost:5049/api/Auth/login"
  const form = document.getElementById('loginForm');
  const msg = document.getElementById('loginMessage');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    msg.textContent = "";

    const correouser = document.getElementById('Usuario').value.trim();
    const contrasenauser = document.getElementById('Contrasena').value;

    if (!correouser || !contrasenauser) {
      msg.textContent = "Por favor completa ambos campos.";
      return;
    }

    const payload = { correouser, contrasenauser };

    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      // Si devuelve 200 -> usuario en JSON
      if (res.ok) {
        const usuario = await res.json();

        // Guardar info mínima en localStorage (no guardes contraseña)
        const userForStorage = {
          iduser: usuario.iduser,
          nombreuser: usuario.nombreuser,
          correouser: usuario.correouser,
          idrol: usuario.idrol
        };
        localStorage.setItem('ej_user', JSON.stringify(userForStorage));

        // Redirección según rol
        // Ajusta los nombres de archivos a los que tú uses:
        if (usuario.idrol === 1) {
          window.location.href = "Inicio.html";   // ejemplo: admin
        } else if (usuario.idrol === 2) {
          window.location.href = "Inicio.html"; // ejemplo: atención al cliente
        } else {
          // rol desconocido -> home genérico
          window.location.href = "/Inicio.html";
        }
      } else {
        // Respuesta no ok: leer mensaje del body si viene
        let data;
        try { data = await res.json(); } catch { data = null; }

        if (res.status === 401) {
          // Mensajes de autorización: Usuario o contraseña incorrectos / bloqueado / intentos restantes
          msg.textContent = data?.mensaje ?? "Usuario o contraseña incorrectos.";
          if (data?.intentos_restantes !== undefined) {
            msg.textContent += ` Intentos restantes: ${data.intentos_restantes}`;
          }
        } else if (res.status === 400) {
          msg.textContent = data?.mensaje ?? "Datos inválidos.";
        } else {
          msg.textContent = data?.mensaje ?? `Error del servidor (${res.status}).`;
        }
      }
    } catch (err) {
      console.error("Error fetch login:", err);
      msg.textContent = "No se pudo conectar con el servidor. Verifica que la API esté corriendo y que no haya bloqueos por certificado.";
    }
  });

})();
