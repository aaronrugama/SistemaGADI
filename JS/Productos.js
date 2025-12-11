// Configuración
const API_URL = 'https://localhost:7223/api';
let productoEditando = null;

// Inicializar cuando cargue la página
document.addEventListener('DOMContentLoaded', function() {
    console.log('Iniciando módulo de Productos...');
    cargarProductos();
    configurarEventos();
});

// Cargar productos y mostrar en tabla
async function cargarProductos() {
    try {
        const respuesta = await fetch(`${API_URL}/productos`);
        
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        
        const productos = await respuesta.json();
        mostrarProductosEnTabla(productos);
        
    } catch (error) {
        console.error('Error cargando productos:', error);
        mostrarMensaje('No se pudieron cargar los productos. Verifica la conexión.', 'error');
    }
}

// Mostrar productos en la tabla HTML
function mostrarProductosEnTabla(productos) {
    const tbody = document.querySelector('#tablaProductos tbody');
    const contador = document.getElementById('contadorProductos');
    
    if (!tbody || !contador) return;
    
    // Limpiar tabla
    tbody.innerHTML = '';
    
    if (productos.length === 0) {
        tbody.innerHTML = `
            <tr>
                <td colspan="7" style="text-align:center; padding: 30px;">
                    No hay productos registrados
                </td>
            </tr>
        `;
        contador.textContent = '0 productos encontrados';
        return;
    }
    
    // Llenar tabla con productos
    productos.forEach(producto => {
        const fila = document.createElement('tr');
        
        fila.innerHTML = `
            <td>${producto.idproducto || ''}</td>
            <td>${producto.nombreprod || ''}</td>
            <td>${producto.descripcionprod || ''}</td>
            <td>$${parseFloat(producto.precioprod || 0).toFixed(2)}</td>
            <td>${producto.tipoprod || ''}</td>
            <td>${producto.estadoprod || ''}</td>
            <td>
                <button class="btn-editar" data-id="${producto.idproducto}">
                    Editar
                </button>
                <button class="btn-eliminar" data-id="${producto.idproducto}">
                    Eliminar
                </button>
            </td>
        `;
        
        tbody.appendChild(fila);
    });
    
    // Actualizar contador
    contador.textContent = `${productos.length} productos encontrados`;
    
    // Agregar eventos a los botones de acciones
    agregarEventosAcciones();
}

// Configurar eventos del formulario
function configurarEventos() {
    const btnGuardar = document.getElementById('btnGuardar');
    const btnCancelar = document.getElementById('btnCancelar');
    
    if (btnGuardar) {
        btnGuardar.addEventListener('click', guardarProducto);
    }
    
    if (btnCancelar) {
        btnCancelar.addEventListener('click', cancelarEdicion);
    }
}

// Agregar eventos a los botones Editar/Eliminar de la tabla
function agregarEventosAcciones() {
    // Botones Editar
    document.querySelectorAll('.btn-editar').forEach(btn => {
        btn.addEventListener('click', function() {
            const productoId = this.getAttribute('data-id');
            editarProducto(productoId);
        });
    });
    
    // Botones Eliminar
    document.querySelectorAll('.btn-eliminar').forEach(btn => {
        btn.addEventListener('click', function() {
            const productoId = this.getAttribute('data-id');
            eliminarProducto(productoId);
        });
    });
}

// Cargar producto para editar
async function editarProducto(id) {
    try {
        const respuesta = await fetch(`${API_URL}/productos/${id}`);
        
        if (!respuesta.ok) {
            throw new Error(`Error ${respuesta.status}: ${respuesta.statusText}`);
        }
        
        const producto = await respuesta.json();
        
        // Llenar formulario con datos del producto
        document.getElementById('nombreProd').value = producto.nombreprod || '';
        document.getElementById('descripcionProd').value = producto.descripcionprod || '';
        document.getElementById('precioProd').value = producto.precioprod || '';
        document.getElementById('tipoProd').value = producto.tipoprod || 'Electrónico';
        document.getElementById('estadoProd').value = producto.estadoprod || 'Disponible';
        
        // Guardar ID del producto que se está editando
        productoEditando = id;
        
        // Cambiar título y mostrar botón cancelar
        document.getElementById('formTitulo').textContent = 'Editar Producto';
        document.getElementById('btnCancelar').style.display = 'inline-block';
        
    } catch (error) {
        console.error('Error cargando producto para editar:', error);
        mostrarMensaje('No se pudo cargar el producto para editar', 'error');
    }
}

// Guardar producto (POST para nuevo, PUT para editar)
async function guardarProducto() {
    // Obtener datos del formulario
    const nombre = document.getElementById('nombreProd').value.trim();
    const precio = document.getElementById('precioProd').value;
    const descripcion = document.getElementById('descripcionProd').value.trim();
    const tipo = document.getElementById('tipoProd').value;
    const estado = document.getElementById('estadoProd').value;
    
    // Validaciones básicas
    if (!nombre) {
        mostrarMensaje('El nombre del producto es requerido', 'error');
        return;
    }
    
    if (!precio || parseFloat(precio) <= 0) {
        mostrarMensaje('El precio debe ser mayor a 0', 'error');
        return;
    }
    
    try {
        let datosProducto;
        let respuesta;
        let url;
        
        if (productoEditando) {
            // PUT: Actualizar producto existente
            datosProducto = {
                idproducto: productoEditando,
                nombreprod: nombre,
                descripcionprod: descripcion,
                precioprod: parseFloat(precio),
                tipoprod: tipo,
                estadoprod: estado
            };
            
            url = `${API_URL}/productos/${productoEditando}`;
            respuesta = await fetch(url, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosProducto)
            });
            
        } else {
            // POST: Crear nuevo producto
            datosProducto = {
                nombreprod: nombre,
                descripcionprod: descripcion,
                precioprod: parseFloat(precio),
                tipoprod: tipo,
                estadoprod: estado
            };
            
            url = `${API_URL}/productos`;
            respuesta = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(datosProducto)
            });
        }
        
        if (respuesta.ok) {
            const accion = productoEditando ? 'actualizado' : 'creado';
            mostrarMensaje(`Producto ${accion} exitosamente`, 'success');
            
            // Limpiar formulario y recargar tabla
            limpiarFormulario();
            cargarProductos();
            
        } else {
            const error = await respuesta.text();
            throw new Error(error);
        }
        
    } catch (error) {
        console.error('Error guardando producto:', error);
        mostrarMensaje(`Error al guardar producto: ${error.message}`, 'error');
    }
}

// Eliminar producto
async function eliminarProducto(id) {
    if (!confirm('¿Está seguro de eliminar este producto?')) {
        return;
    }
    
    try {
        const respuesta = await fetch(`${API_URL}/productos/${id}`, {
            method: 'DELETE'
        });
        
        if (respuesta.ok) {
            mostrarMensaje('Producto eliminado exitosamente', 'success');
            cargarProductos();
        } else {
            const error = await respuesta.text();
            throw new Error(error);
        }
        
    } catch (error) {
        console.error('Error eliminando producto:', error);
        mostrarMensaje(`Error al eliminar producto: ${error.message}`, 'error');
    }
}

// Cancelar edición
function cancelarEdicion() {
    productoEditando = null;
    limpiarFormulario();
    document.getElementById('formTitulo').textContent = 'Agregar Nuevo Producto';
    document.getElementById('btnCancelar').style.display = 'none';
}

// Limpiar formulario
function limpiarFormulario() {
    document.getElementById('nombreProd').value = '';
    document.getElementById('descripcionProd').value = '';
    document.getElementById('precioProd').value = '';
    document.getElementById('tipoProd').value = 'Electrónico';
    document.getElementById('estadoProd').value = 'Disponible';
}

// Mostrar mensaje
function mostrarMensaje(mensaje, tipo) {
    alert(tipo === 'error' ? `${mensaje}` : `${mensaje}`);
}