// assets/js/main.js

function prepararSesion() {
    const operador = document.getElementById('operador').value;
    const paciente = document.getElementById('paciente-id').value;
    const rut = document.getElementById('paciente-rut')?.value || '';

    if (!paciente) {
        alert("Por favor, ingrese al menos el nombre del paciente.");
        return;
    }

    // Preservar datos ya existentes (alergias, enfermedades, etc.) de la ficha clínica
    const sesionExistente = JSON.parse(localStorage.getItem('SesionClinica')) || {};
    
    const sesion = {
        ...sesionExistente,
        operador: operador || sesionExistente.operador,
        paciente: paciente, // aquí sí forzamos el valor actual del input
        rut: rut,
        fecha: sesionExistente.fecha || new Date().toLocaleDateString(),
        id_sesion: sesionExistente.id_sesion || Date.now()
    };

    // Guardamos la sesión activa
    localStorage.setItem('SesionClinica', JSON.stringify(sesion));
}

function guardarSilencioso() {
    const operador = document.getElementById('operador')?.value || '';
    const paciente = document.getElementById('paciente-id')?.value || '';
    const rut = document.getElementById('paciente-rut')?.value || '';

    if (!paciente && !rut && !operador) return;

    const sesionExistente = JSON.parse(localStorage.getItem('SesionClinica')) || {};
    
    // Solo actualizamos si hay cambios
    const sesion = {
        ...sesionExistente,
        operador: operador || sesionExistente.operador,
        paciente: paciente || sesionExistente.paciente,
        rut: rut || sesionExistente.rut,
        fecha: sesionExistente.fecha || new Date().toLocaleDateString(),
        id_sesion: sesionExistente.id_sesion || Date.now()
    };

    localStorage.setItem('SesionClinica', JSON.stringify(sesion));
}

// FUNCIÓN PARA GENERAR EL REPORTE
function generarReporteConsolidado() {
    const sesion = JSON.parse(localStorage.getItem('SesionClinica'));
    const historial = JSON.parse(localStorage.getItem('HistorialClinico')) || [];

    if (!sesion || !sesion.paciente) {
        alert("Primero debe ingresar los datos del paciente en el portal.");
        return;
    }

    const ventanaReporte = window.open('', '_blank');
    
    // Aquí definimos el diseño profesional del PDF/Informe
    ventanaReporte.document.write(`
        <html>
        <head>
            <title>Informe - ${sesion.paciente}</title>
            <script src="https://cdn.tailwindcss.com"></script>
            <style>
                @media print { .no-print { display: none; } }
                body { background-color: white; padding: 2cm; }
            </style>
        </head>
        <body>
            <div class="max-w-4xl mx-auto border-2 border-slate-100 p-10 rounded-3xl">
                <div class="flex justify-between items-start border-b pb-8 mb-8">
                    <div>
                        <h1 class="text-2xl font-black text-slate-900 uppercase">Informe Dental Digital</h1>
                        <p class="text-blue-600 font-bold text-xs uppercase tracking-widest">Ecosistema DentalSuite</p>
                    </div>
                    <div class="text-right text-xs text-slate-400 font-mono">
                        <p>ID: ${sesion.id_sesion}</p>
                        <p>Fecha: ${sesion.fecha}</p>
                    </div>
                </div>

                <div class="bg-slate-50 p-6 rounded-2xl grid grid-cols-2 gap-4 mb-8">
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">Paciente</p>
                        <p class="text-lg font-bold text-slate-800">${sesion.paciente}</p>
                        <p class="text-sm text-slate-500">RUT: ${sesion.rut || 'No especificado'}</p>
                    </div>
                    <div>
                        <p class="text-[10px] font-bold text-slate-400 uppercase">Operador</p>
                        <p class="text-lg font-bold text-slate-800">${sesion.operador || 'No especificado'}</p>
                    </div>
                </div>

                <h3 class="text-sm font-black text-slate-900 uppercase mb-4 tracking-tighter">Resumen de Hallazgos</h3>
                <table class="w-full mb-10 border-collapse">
                    <thead>
                        <tr class="bg-slate-900 text-white text-[10px] uppercase">
                            <th class="p-3 text-left">Especialidad</th>
                            <th class="p-3 text-left">Pieza</th>
                            <th class="p-3 text-left">Hallazgo Detectado</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${historial.length > 0 ? historial.map(h => `
                            <tr class="border-b border-slate-100 text-sm">
                                <td class="p-3 font-bold text-blue-600">${h.tipo_app}</td>
                                <td class="p-3 font-mono">${h.diente}</td>
                                <td class="p-3 text-slate-600">${h.detalle}</td>
                            </tr>
                        `).join('') : '<tr><td colspan="3" class="p-10 text-center text-slate-300 italic">No hay registros para mostrar</td></tr>'}
                    </tbody>
                </table>

                <div class="flex justify-between items-center mt-20 pt-10 border-t border-dashed">
                    <p class="text-[9px] text-slate-400 uppercase">Documento generado digitalmente vía Reconocimiento de Voz</p>
                    <button onclick="window.print()" class="no-print bg-slate-900 text-white px-6 py-2 rounded-xl font-bold text-sm hover:bg-blue-600 transition">Imprimir Informe</button>
                </div>
            </div>
        </body>
        </html>
    `);
    ventanaReporte.document.close();
}
// Función para verificar si hay datos frescos de la ficha clínica
window.addEventListener('DOMContentLoaded', () => {
    // Intentamos leer si la app "Ficha Clínica" guardó datos nuevos
    const fichaReciente = JSON.parse(localStorage.getItem('SesionClinica'));
    
    if (fichaReciente) {
        // Rellenamos los campos del portal automáticamente si están vacíos
        const inputOperador = document.getElementById('operador');
        const inputPaciente = document.getElementById('paciente-id');
        const inputRut = document.getElementById('paciente-rut');

        if (inputPaciente && !inputPaciente.value) inputPaciente.value = fichaReciente.paciente || '';
        if (inputRut && !inputRut.value) inputRut.value = fichaReciente.rut || '';
        if (inputOperador && !inputOperador.value) inputOperador.value = fichaReciente.operador || '';
    }
    
    cargarListaPacientes();
});

// --- GESTIÓN DE PACIENTES MULTIPLES ---

function cargarListaPacientes() {
    const lista = JSON.parse(localStorage.getItem('PacientesGuardados')) || [];
    const select = document.getElementById('select-paciente-guardado');
    if(!select) return;
    
    select.innerHTML = '<option value="">-- Seleccionar Paciente Guardado --</option>';
    lista.forEach((p, index) => {
        const option = document.createElement('option');
        option.value = index;
        option.text = `${p.sesion.paciente} ${p.sesion.rut ? '('+p.sesion.rut+')' : ''} - Act. ${p.sesion.fecha}`;
        select.appendChild(option);
    });
}

function guardarPacienteActual() {
    const sesion = JSON.parse(localStorage.getItem('SesionClinica'));
    const historial = JSON.parse(localStorage.getItem('HistorialClinico')) || [];
    
    if (!sesion || !sesion.paciente) {
        alert("No hay un paciente activo con nombre para guardar.");
        return;
    }

    let lista = JSON.parse(localStorage.getItem('PacientesGuardados')) || [];
    
    // Asignar id de sesión si no tiene
    if(!sesion.id_sesion) sesion.id_sesion = Date.now();
    // Actualizar fecha
    sesion.fecha = new Date().toLocaleDateString();
    
    // Actualizar en localStorage para que el objeto tenga el id
    localStorage.setItem('SesionClinica', JSON.stringify(sesion));
    
    // Buscar si ya existe por id_sesion
    const index = lista.findIndex(p => p.sesion.id_sesion === sesion.id_sesion);
    
    const paquetePaciente = {
        sesion: sesion,
        historial: historial
    };

    if (index >= 0) {
        lista[index] = paquetePaciente; // Actualiza existente
    } else {
        lista.push(paquetePaciente); // Agrega nuevo
    }

    localStorage.setItem('PacientesGuardados', JSON.stringify(lista));
    cargarListaPacientes();
    
    // Mostrar feedback visual
    const btn = document.getElementById('btn-guardar-paciente');
    if(btn) {
        const originalText = btn.innerHTML;
        btn.innerHTML = '<i class="fa-solid fa-check mr-1"></i> Guardado';
        btn.classList.add('bg-emerald-600', 'text-white', 'border-transparent');
        btn.classList.remove('bg-slate-100', 'text-slate-600');
        setTimeout(() => {
            btn.innerHTML = originalText;
            btn.classList.remove('bg-emerald-600', 'text-white', 'border-transparent');
            btn.classList.add('bg-slate-100', 'text-slate-600');
        }, 2000);
    }
}

function cargarPacienteSeleccionado() {
    const select = document.getElementById('select-paciente-guardado');
    const index = select.value;
    
    if (index === "") {
        alert("Por favor, selecciona un paciente de la lista.");
        return;
    }

    const lista = JSON.parse(localStorage.getItem('PacientesGuardados')) || [];
    const pacienteData = lista[index];
    
    if (pacienteData) {
        localStorage.setItem('SesionClinica', JSON.stringify(pacienteData.sesion));
        localStorage.setItem('HistorialClinico', JSON.stringify(pacienteData.historial));
        
        // Recargar campos visuales
        document.getElementById('paciente-id').value = pacienteData.sesion.paciente || '';
        document.getElementById('paciente-rut').value = pacienteData.sesion.rut || '';
        if(pacienteData.sesion.operador) document.getElementById('operador').value = pacienteData.sesion.operador;
        
        // Actualizar Banners si existe la función en version.js o recargar página para asimilar todo
        window.location.reload(); 
    }
}

function iniciarNuevoPaciente() {
    if(confirm("¿Estás seguro de iniciar un paciente nuevo en blanco?\nSi no has Guardado al paciente actual, perderás su Odontograma e Historial flotante.")) {
        const operadorActual = document.getElementById('operador')?.value || '';
        
        localStorage.removeItem('SesionClinica');
        localStorage.removeItem('HistorialClinico');
        
        document.getElementById('paciente-id').value = '';
        document.getElementById('paciente-rut').value = '';
        
        if(operadorActual) {
            localStorage.setItem('SesionClinica', JSON.stringify({ operador: operadorActual, id_sesion: Date.now() }));
        }
        
        // Refrescar para limpiar banners
        window.location.reload();
    }
}
