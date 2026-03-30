// ===== TARIFARIO DE IMPLANTES - script.js =====
// Los precios base se cargan desde datos.js (TARIFARIO_PRECIOS).
// El usuario puede editarlos en la app; los cambios se guardan en localStorage.

const STORAGE_KEY = 'TarifarioImplantes';
let tabActual = 'neodent';

// ---- Utilidades de formato ----
function formatearMoneda(valor) {
    if (isNaN(valor) || valor === 0) return '';
    return new Intl.NumberFormat('es-CL', {
        style: 'currency', currency: 'CLP', minimumFractionDigits: 0
    }).format(valor).replace('CLP', '').replace('$', '').trim();
}

function parsearMoneda(str) {
    if (!str) return 0;
    const num = parseInt(str.toString().replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
}

// ---- Cargar / Guardar datos ----
// Prioridad: localStorage (ediciones del usuario) > datos.js (precios base del repositorio)
function cargarDatos() {
    const guardado = localStorage.getItem(STORAGE_KEY);
    if (guardado) {
        try {
            const local = JSON.parse(guardado);
            // Verificar que tenga las 4 claves esperadas
            const claves = ['neodent', 'neobiotech', 'mis', 'universidad'];
            if (claves.every(k => Array.isArray(local[k]))) return local;
        } catch(e) { /* fallback a precios base */ }
    }
    // Usar precios base de datos.js (disponible como variable global TARIFARIO_PRECIOS)
    if (typeof TARIFARIO_PRECIOS !== 'undefined') {
        return JSON.parse(JSON.stringify(TARIFARIO_PRECIOS));
    }
    // Fallback mínimo si datos.js no cargó
    return { neodent: [], neobiotech: [], mis: [], universidad: [] };
}

function resetearADatosBase() {
    if (!confirm('¿Restaurar todos los precios a los valores del tarifario base? Se perderán los cambios guardados localmente.')) return;
    localStorage.removeItem(STORAGE_KEY);
    const datos = typeof TARIFARIO_PRECIOS !== 'undefined'
        ? JSON.parse(JSON.stringify(TARIFARIO_PRECIOS))
        : { neodent: [], neobiotech: [], mis: [], universidad: [] };
    ['neodent', 'neobiotech', 'mis', 'universidad'].forEach(marca => {
        renderizarTabla(marca, datos[marca]);
    });
    mostrarSnackbar('Precios restaurados desde el tarifario base');
}

function guardarDatos() {
    const datos = {};
    ['neodent', 'neobiotech', 'mis', 'universidad'].forEach(marca => {
        datos[marca] = leerFilasDOM(marca);
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(datos));
    mostrarSnackbar('Cambios guardados correctamente');
}

function leerFilasDOM(marca) {
    const filas = document.querySelectorAll(`#tabla-${marca} .fila-tarifario`);
    const resultado = [];
    filas.forEach(fila => {
        const nombre = fila.querySelector('.input-nombre-item').value.trim();
        const precio = parsearMoneda(fila.querySelector('.input-precio-tarifario').value);
        if (nombre) resultado.push({ nombre, precio });
    });
    return resultado;
}

// ---- Renderizar tabla ----
function renderizarTabla(marca, items) {
    const tbody = document.getElementById(`tabla-${marca}`);
    tbody.innerHTML = '';
    items.forEach((item, idx) => {
        agregarFilaConDatos(marca, item.nombre, item.precio);
    });
}

function agregarFilaConDatos(marca, nombre = '', precio = 0) {
    const tbody = document.getElementById(`tabla-${marca}`);
    const tr = document.createElement('tr');
    tr.className = 'fila-tarifario group';

    tr.innerHTML = `
        <td class="p-3">
            <input type="text" value="${nombre}" placeholder="Ej: Implante ⌀4.0mm"
                class="input-nombre-item"
                oninput="autoGuardar()">
        </td>
        <td class="p-3">
            <div class="relative flex items-center">
                <span class="absolute left-2.5 text-slate-400 text-sm font-bold pointer-events-none">$</span>
                <input type="text" value="${precio > 0 ? formatearMoneda(precio) : ''}"
                    placeholder="0"
                    class="input-precio-tarifario"
                    oninput="formatearInputPrecio(this); autoGuardar()">
            </div>
        </td>
        <td class="p-3 text-center">
            <button class="btn-eliminar-fila p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                onclick="eliminarFila(this)">
                <i class="fa-solid fa-trash text-xs"></i>
            </button>
        </td>
    `;
    tbody.appendChild(tr);
}

function agregarFila(marca) {
    agregarFilaConDatos(marca, '', 0);
    // Enfocar el nuevo input
    const tbody = document.getElementById(`tabla-${marca}`);
    const ultimaFila = tbody.querySelector('tr:last-child .input-nombre-item');
    if (ultimaFila) ultimaFila.focus();
    autoGuardar();
}

function eliminarFila(btn) {
    const tr = btn.closest('tr');
    tr.style.transition = 'opacity 0.2s, transform 0.2s';
    tr.style.opacity = '0';
    tr.style.transform = 'translateX(10px)';
    setTimeout(() => { tr.remove(); autoGuardar(); }, 200);
}

function formatearInputPrecio(input) {
    const val = parsearMoneda(input.value);
    input.value = val > 0 ? formatearMoneda(val) : '';
}

// ---- Tabs ----
function cambiarTab(marca) {
    tabActual = marca;
    // Ocultar todos los paneles
    document.querySelectorAll('.panel-marca').forEach(p => p.classList.add('hidden'));
    // Mostrar el seleccionado
    document.getElementById(`panel-${marca}`).classList.remove('hidden');
    // Actualizar tabs
    document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active-tab'));
    document.getElementById(`tab-${marca}`).classList.add('active-tab');
}

// ---- Auto-guardado con debounce ----
let debounceTimer = null;
function autoGuardar() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => { guardarDatos(); }, 800);
}

// ---- Snackbar ----
function mostrarSnackbar(msg = 'Guardado') {
    const sb = document.getElementById('snackbar');
    document.getElementById('snackbar-msg').textContent = msg;
    sb.classList.add('snackbar-show');
    setTimeout(() => sb.classList.remove('snackbar-show'), 2500);
}

// ---- Inicialización ----
document.addEventListener('DOMContentLoaded', () => {
    const datos = cargarDatos();
    ['neodent', 'neobiotech', 'mis', 'universidad'].forEach(marca => {
        const items = datos[marca] || DATOS_DEFECTO[marca];
        renderizarTabla(marca, items);
    });

    // Si viene con parámetro ?tab=xxx en la URL, abrir esa pestaña
    const params = new URLSearchParams(window.location.search);
    const tabParam = params.get('tab');
    if (tabParam && ['neodent', 'neobiotech', 'mis', 'universidad'].includes(tabParam)) {
        cambiarTab(tabParam);
    } else {
        cambiarTab('neodent');
    }
});
