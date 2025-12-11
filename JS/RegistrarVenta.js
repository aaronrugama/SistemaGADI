// Configuración
const API_URL = 'https://localhost:7223/api';
let cantidad = 1;
let productosCache = [];

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    // Establecer fecha actual
    const fechaElemento = document.getElementById('fecha');
    if (fechaElemento) {
        const hoy = new Date();
        fechaElemento.textContent = hoy.toLocaleDateString('es-ES');
    }
    
    cargarProductos();
    configurarEventos();
});

// Cargar productos desde API
async function cargarProductos() {
    const selectProductos = document.getElementById('Productos');
    if (!selectProductos) return;
    
    try {
        const respuesta = await fetch(`${API_URL}/productos`);
        if (!respuesta.ok) throw new Error(`Error ${respuesta.status}`);
        
        productosCache = await respuesta.json();
        
        // Limpiar opciones excepto la primera
        while (selectProductos.options.length > 1) {
            selectProductos.remove(1);
        }
        
        // Agregar productos al select
        productosCache.forEach(producto => {
            const opcion = document.createElement('option');
            opcion.value = producto.idproducto;
            opcion.textContent = producto.nombreprod;
            opcion.dataset.precio = producto.precioprod;
            selectProductos.appendChild(opcion);
        });
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        alert('No se pudieron cargar los productos');
    }
}

// Configurar todos los eventos
function configurarEventos() {
    const selectProductos = document.getElementById('Productos');
    if (selectProductos) {
        selectProductos.addEventListener('change', manejarCambioProducto);
    }
    
    const btnSumar = document.getElementById('sumar');
    if (btnSumar) {
        btnSumar.addEventListener('click', () => cambiarCantidad(1));
    }
    
    const btnRestar = document.getElementById('restar');
    if (btnRestar) {
        btnRestar.addEventListener('click', () => cambiarCantidad(-1));
    }
    
    const inputMonto = document.getElementById('MontoP');
    if (inputMonto) {
        inputMonto.readOnly = true;
        inputMonto.style.backgroundColor = '#f0f0f0';
    }
    
    const btnRegistrar = document.getElementById('RegistraVProducto');
    if (btnRegistrar) {
        btnRegistrar.addEventListener('click', registrarVenta);
    }
    
    const btnCancelar = document.getElementById('CancelarVProducto');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', confirmarCancelar);
    }
}

function manejarCambioProducto() {
    const select = this;
    const productoId = select.value;
    
    if (!productoId) {
        actualizarVisualizacionMonto(0);
        return;
    }
    
    const producto = productosCache.find(p => p.idproducto === productoId);
    if (producto) {
        const precio = parseFloat(producto.precioprod);
        const monto = precio * cantidad;
        actualizarVisualizacionMonto(monto);
    }
}

function cambiarCantidad(cambio) {
    const nuevaCantidad = cantidad + cambio;
    if (nuevaCantidad < 1) return;
    
    cantidad = nuevaCantidad;
    document.getElementById('cantidad').textContent = cantidad;
    
    const selectProductos = document.getElementById('Productos');
    if (selectProductos && selectProductos.value) {
        manejarCambioProducto.call(selectProductos);
    }
}

function actualizarVisualizacionMonto(monto) {
    const inputMonto = document.getElementById('MontoP');
    const elementoItbms = document.querySelector('.itbms');
    
    if (!inputMonto || !elementoItbms) return;
    
    const itbms = monto * 0.07;
    const total = monto + itbms;
    
    inputMonto.value = monto.toFixed(2);
    elementoItbms.innerHTML = `ITBMS: $${itbms.toFixed(2)}<br><strong>Total: $${total.toFixed(2)}</strong>`;
}

async function registrarVenta() {
    const productoSelect = document.getElementById('Productos');
    const descripcionInput = document.getElementById('Descripcion');
    
    if (!descripcionInput.value.trim()) {
        alert('Ingrese una descripción de la venta');
        return;
    }
    
    if (!productoSelect.value) {
        alert('Seleccione un producto');
        return;
    }
    
    let iduser = 'US00001';
    try {
        const userData = JSON.parse(localStorage.getItem('ej_user') || '{}');
        iduser = userData.iduser || 'US00001';
    } catch (e) {
        console.warn('Error obteniendo usuario:', e);
    }
    
    const producto = productosCache.find(p => p.idproducto === productoSelect.value);
    if (!producto) {
        alert('Producto no encontrado');
        return;
    }
    
    const datosVenta = {
        detalleingreso: descripcionInput.value.trim(),
        iduser: iduser,
        detalles: [{
            idproducto: productoSelect.value,
            cantidad: cantidad
        }]
    };
    
    try {
        const respuesta = await fetch(`${API_URL}/ventas`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(datosVenta)
        });
        
        if (respuesta.ok) {
            alert('Venta registrada exitosamente');
            limpiarFormulario();

            cargarHistorialVentas(); // Actualizar tabla

        } else {
            const error = await respuesta.text();
            alert(`Error: ${error}`);
        }
        
    } catch (error) {
        console.error('Error registrando venta:', error);
        alert('Error de conexión con la API');
    }
}

function confirmarCancelar() {
    if (confirm('¿Está seguro de cancelar esta venta?')) {
        limpiarFormulario();
    }
}

function limpiarFormulario() {
    const descripcionInput = document.getElementById('Descripcion');
    if (descripcionInput) descripcionInput.value = '';
    
    const selectProductos = document.getElementById('Productos');
    if (selectProductos) selectProductos.selectedIndex = 0;
    
    cantidad = 1;
    document.getElementById('cantidad').textContent = '1';
    
    const inputMonto = document.getElementById('MontoP');
    if (inputMonto) inputMonto.value = '0.00';
    
    const elementoItbms = document.querySelector('.itbms');
    if (elementoItbms) elementoItbms.innerHTML = 'ITBMS: $0.00<br><strong>Total: $0.00</strong>';
}
// Historial de Ventas - Mostrar datos completos
let ventasCache = [];

async function cargarHistorialVentas() {
    try {
        const response = await fetch(`${API_URL}/ventas`);
        if (!response.ok) return;
        
        ventasCache = await response.json();
        mostrarVentasCompletas(ventasCache);
    } catch (error) {
        console.error('Error:', error);
    }
}

function mostrarVentasCompletas(ventas) {
    const tbody = document.querySelector('#tablaVentas tbody');
    const contador = document.getElementById('contadorVentas');
    
    if (!tbody || !contador) return;
    
    tbody.innerHTML = '';
    
    if (!ventas || ventas.length === 0) {
        tbody.innerHTML = '<tr><td colspan="8">No hay ventas</td></tr>';
        contador.textContent = '0 ventas';
        return;
    }
    
    ventas.forEach(venta => {
        const fila = document.createElement('tr');
        
        // Extraer datos de la estructura anidada
        const ingreso = venta.ingreso || {};
        const detalle = venta.detalleVentas?.[0] || {};
        const producto = detalle.producto || {};
        
        fila.innerHTML = `
            <td>${venta.idventa || ''}</td>
            <td>${formatearFecha(ingreso.fechaingreso)}</td>
            <td>${ingreso.detalleingreso || ''}</td>
            <td>${producto.nombreprod || detalle.idproducto || ''}</td>
            <td>${detalle.cantidad || ''}</td>
            <td>$${ingreso.montoingreso || 0}</td>
            <td>${ingreso.iduser || ''}</td>
            <td>
                <button class="btn-eliminar-venta" data-id="${venta.idventa}">
                    Eliminar
                </button>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
    
    contador.textContent = `${ventas.length} ventas`;
    
    document.querySelectorAll('.btn-eliminar-venta').forEach(btn => {
        btn.addEventListener('click', function() {
            const id = this.getAttribute('data-id');
            eliminarVentaCompleta(id);
        });
    });
}

function formatearFecha(fechaString) {
    if (!fechaString) return '';
    
    try {
        const fecha = new Date(fechaString);
        return fecha.toLocaleDateString('es-ES');
    } catch (e) {
        return fechaString;
    }
}

async function eliminarVentaCompleta(id) {
    if (!confirm('Eliminar esta venta?')) return;
    
    try {
        const response = await fetch(`${API_URL}/ventas/${id}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            alert('Venta eliminada');
            cargarHistorialVentas();
        } else {
            const error = await response.text();
            alert(`Error: ${error}`);
        }
        
    } catch (error) {
        console.error('Error eliminando:', error);
        alert('Error de conexion');
    }
}

// Iniciar
setTimeout(() => {
    if (document.getElementById('tablaVentas')) {
        cargarHistorialVentas();
    }
}, 1000);