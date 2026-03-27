const APP_NAME = "Presupuesto_Dental";

document.addEventListener('DOMContentLoaded', () => {
    cargarDatosOdontograma();
    
    document.getElementById('btn-agregar-manual').addEventListener('click', agregarFilaManual);
    document.getElementById('btn-recalcular').addEventListener('click', cargarDatosOdontograma);
    document.getElementById('btn-imprimir').addEventListener('click', () => {
        window.print();
    });
});

function formatearMoneda(valor) {
    if (isNaN(valor)) return 0;
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', minimumFractionDigits: 0 }).format(valor).replace('$', '');
}

function parsearMoneda(str) {
    if (!str) return 0;
    const num = parseInt(str.toString().replace(/\D/g, ''), 10);
    return isNaN(num) ? 0 : num;
}

function calcularTotal() {
    let total = 0;
    const inputs = document.querySelectorAll('.precio-item');
    inputs.forEach(input => {
        total += parsearMoneda(input.value);
    });
    
    const inputTotal = document.getElementById('total-presupuesto');
    inputTotal.value = formatearMoneda(total);
}

function crearFila(diente, hallazgo, sugerencia, precioSugerido = 0, isManual = false) {
    const tbody = document.getElementById('lista-tratamientos');
    const tr = document.createElement('tr');
    tr.className = "hover:bg-slate-50 transition-colors item-row group";
    
    // Si es manual, permitimos editar el nombre del diente y del tratamiento
    let tdDiente = `<td class="p-4 font-bold text-slate-700">${diente}</td>`;
    let tdHallazgo = `<td class="p-4 text-slate-600 text-sm">${hallazgo}</td>`;
    let tdTratamiento = `<td class="p-4 text-slate-800 font-medium">${sugerencia}</td>`;
    
    if (isManual) {
        tdDiente = `<td class="p-4"><input type="text" placeholder="Ej: 16" class="w-16 p-2 rounded bg-white border border-slate-200 focus:border-amber-400 outline-none text-sm font-bold text-slate-700"></td>`;
        tdHallazgo = `<td class="p-4"><input type="text" placeholder="Ej: Observación" class="w-full p-2 rounded bg-white border border-slate-200 focus:border-amber-400 outline-none text-sm text-slate-600"></td>`;
        tdTratamiento = `<td class="p-4"><input type="text" placeholder="Ej: Limpieza General" class="w-full p-2 rounded bg-white border border-slate-200 focus:border-amber-400 outline-none font-medium text-slate-800"></td>`;
    }

    tr.innerHTML = `
        ${tdDiente}
        ${tdHallazgo}
        ${tdTratamiento}
        <td class="p-4">
            <div class="relative flex items-center">
                <span class="absolute left-3 text-slate-400 text-sm font-bold">$</span>
                <input type="text" value="${precioSugerido > 0 ? formatearMoneda(precioSugerido) : ''}" placeholder="0" 
                    class="precio-item w-full pl-7 pr-3 py-2 rounded bg-white border border-slate-200 focus:border-amber-500 outline-none transition text-right font-medium text-slate-700">
            </div>
        </td>
        <td class="p-4 text-center">
            <button class="btn-eliminar p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100 outline-none">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    `;

    // Lógica para input de precio con formato en tiempo real
    const inputPrecio = tr.querySelector('.precio-item');
    inputPrecio.addEventListener('input', (e) => {
        let val = parsearMoneda(e.target.value);
        e.target.value = val > 0 ? formatearMoneda(val) : '';
        calcularTotal();
    });

    // Lógica para eliminar fila
    const btnEliminar = tr.querySelector('.btn-eliminar');
    btnEliminar.addEventListener('click', () => {
        tr.remove();
        calcularTotal();
    });

    tbody.appendChild(tr);
    calcularTotal();
}

function agregarFilaManual() {
    crearFila('', '', '', 0, true);
}

function sugerirTratamiento(tipo, cara) {
    if (tipo === 'caries') {
        return "Restauración Simple/Compuesta (Clínica/Laboratorio)";
    } else if (tipo === 'restauracion_defectuosa') {
        return "Recambio de Restauración";
    } else if (tipo === 'ausencia') {
        return "Implante Dental / Prótesis";
    }
    return "Evaluación Adicional";
}

function cargarDatosOdontograma() {
    const tbody = document.getElementById('lista-tratamientos');
    tbody.innerHTML = '';
    
    const histStr = localStorage.getItem('HistorialClinico');
    if (!histStr) {
        crearFila('-', 'Sin datos', 'No se ha detectado historial dental.', 0, false);
        return;
    }

    const hist = JSON.parse(histStr);
    
    // Filtrar sólo eventos de Odontograma Digital que requieran tratamiento
    const odontogramaEventos = hist.filter(item => item.tipo_app === 'Odontograma_Digital' && ['caries', 'restauracion_defectuosa', 'ausencia'].includes(item.type));
    
    if (odontogramaEventos.length === 0) {
         crearFila('N/A', 'Paciente Sano / Evaluado', 'Control preventivo', 0, false);
         return;
    }

    // Agrupar por diente para no repetir ausencias si están duplicadas,
    // o agrupar múltiples caries en el mismo diente
    const tratamientosAgrupados = {};

    odontogramaEventos.forEach(ev => {
        const key = `${ev.diente}-${ev.type}`;
        if (!tratamientosAgrupados[key]) {
            tratamientosAgrupados[key] = {
                diente: ev.diente,
                tipo: ev.type,
                hallazgo: ev.detalle,
                caras: ev.face ? [ev.face] : []
            };
        } else {
            if (ev.face && !tratamientosAgrupados[key].caras.includes(ev.face)) {
                tratamientosAgrupados[key].caras.push(ev.face);
                tratamientosAgrupados[key].hallazgo += `, ${ev.detalle.replace('Caries en ', '')}`;
            }
        }
    });

    // Crear filas en base a los datos agrupados
    Object.values(tratamientosAgrupados).forEach(item => {
        const sugerencia = sugerirTratamiento(item.tipo, item.caras);
        
        let precioBase = 0; // Tarifario sugerido en blanco o en 0, para que el Dr lo llene.
        
        crearFila(item.diente, item.hallazgo, sugerencia, precioBase);
    });

}
