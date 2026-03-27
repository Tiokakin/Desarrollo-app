/**
 * OdontoVoice Pro - v0.0500 (Renderer SVG Bi-Arcada con Tracking)
 * Motor de Dictado y Visualización Vectorial
 */

const APP_NAME = "Odontograma_Digital";
const arcSup = [18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28];
const arcInf = [48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38];
const todas = [...arcSup, ...arcInf];

let piezasEvaluadas = new Set();
let dientesAusentes = [];

document.addEventListener('DOMContentLoaded', () => {
    inicializarSesion();
    configurarMicrofono();
    
    // Novedad: Botón de Reinicio
    const btnReiniciar = document.getElementById('btn-reiniciar');
    if(btnReiniciar) {
        btnReiniciar.addEventListener('click', () => {
            const afirmacion = confirm("⚠️ ¿Estás seguro de que deseas reiniciar tu progreso en el Odontograma?\n\nEsto borrará permanentemente TODAS las caries, ausencias y restauraciones guardadas en esta sesión y limpiará el modelo SVG 3D virtual.\n\nEsta acción no se puede deshacer.");
            if(afirmacion) {
                // Borrar solo elementos de Odontograma_Digital de la base local
                let hist = JSON.parse(localStorage.getItem('HistorialClinico')) || [];
                hist = hist.filter(item => item.tipo_app !== APP_NAME);
                localStorage.setItem('HistorialClinico', JSON.stringify(hist));
                
                // Limpiar memoria viva
                piezasEvaluadas.clear();
                dientesAusentes = [];
                
                // Renderizar arcadas desde cero
                generarArcadas();
                actualizarTracker();
                logEvento("🗑️ Odontograma reiniciado por el usuario. Historial en blanco.", "alerta");
            }
        });
    }
});

// --- 1. RENDERIZADO DEL MAPA SVG ---
function generarArcadas() {
    const contSup = document.getElementById('arcada-superior');
    const contInf = document.getElementById('arcada-inferior');
    if(!contSup || !contInf) return;

    contSup.innerHTML = '';
    contInf.innerHTML = '';

    const crearDiente = (num) => {
        // En arcada superior, Vestibular(v) está arriba, Palatino(p) abajo
        // En arcada inferior, Vestibular(v) está abajo, Lingual(p) arriba
        let polyTop = `d-${num}-v`, polyBot = `d-${num}-p`;
        if (num >= 30) { 
            polyTop = `d-${num}-p`; 
            polyBot = `d-${num}-v`; 
        }
        
        // Mesial / Distal: 
        // Cuadrantes 1 y 4 (derecha del paciente, izquierda de la pantalla): Mesial es la derecha (>), Distal izquierda (<)
        // Cuadrantes 2 y 3 (izquierda del paciente, derecha de la pantalla): Mesial es la izquierda (<), Distal derecha (>)
        let polyLeft = `d-${num}-m`, polyRight = `d-${num}-d`;
        if ((num >= 11 && num <= 18) || (num >= 41 && num <= 48)) {
            polyLeft = `d-${num}-d`; 
            polyRight = `d-${num}-m`;
        }
        
        const div = document.createElement('div');
        div.className = "flex flex-col items-center gap-1 transition-all duration-300 transform hover:scale-105";
        div.id = `contenedor-diente-${num}`;
        div.innerHTML = `
            <span class="text-[10px] font-bold text-slate-500">${num}</span>
            <svg viewBox="0 0 50 50" width="34" height="34" class="overflow-visible drop-shadow-sm cursor-pointer">
                <g fill="#f8fafc" stroke="#94a3b8" stroke-width="1.5">
                    <polygon id="${polyTop}" points="0,0 50,0 35,15 15,15" class="transition-colors hover:fill-indigo-100 face-poly"/>
                    <polygon id="${polyBot}" points="0,50 50,50 35,35 15,35" class="transition-colors hover:fill-indigo-100 face-poly"/>
                    <polygon id="${polyLeft}" points="0,0 15,15 15,35 0,50" class="transition-colors hover:fill-indigo-100 face-poly"/>
                    <polygon id="${polyRight}" points="50,0 35,15 35,35 50,50" class="transition-colors hover:fill-indigo-100 face-poly"/>
                    <polygon id="d-${num}-o" points="15,15 35,15 35,35 15,35" class="transition-colors hover:fill-indigo-100 face-poly"/>
                </g>
            </svg>
        `;
        return div;
    };

    arcSup.forEach(n => contSup.appendChild(crearDiente(n)));
    arcInf.forEach(n => contInf.appendChild(crearDiente(n)));
}

// --- 2. SISTEMA DE TRACKING Y LOGGEO ---
function actualizarTracker() {
    const tracker = document.getElementById('tracker-piezas');
    if(!tracker) return;
    tracker.innerHTML = '';
    
    todas.forEach(p => {
        const div = document.createElement('div');
        if (dientesAusentes.includes(p)) {
            div.className = "p-1.5 border rounded opacity-30 bg-slate-100 text-slate-400 line-through";
        } else if (piezasEvaluadas.has(p)) {
            div.className = "p-1.5 border rounded bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm";
        } else {
            div.className = "p-1.5 border rounded border-slate-200 text-slate-500 bg-white";
        }
        div.innerText = p;
        tracker.appendChild(div);
    });
    
    const count = document.getElementById('piezas-count');
    if(count) count.innerText = `${piezasEvaluadas.size}/32`;
}

function logEvento(mensaje, tipo="normal") {
    const logContenedor = document.getElementById('log-dictado');
    if(!logContenedor) return;
    const div = document.createElement('div');
    const hora = new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
    div.innerHTML = `<span class="text-slate-500 mr-2">[${hora}]</span> ${mensaje}`;
    if (tipo === "exito") div.classList.add("text-emerald-400", "font-bold");
    else if (tipo === "alerta") div.classList.add("text-amber-400");
    else if (tipo === "error") div.classList.add("text-red-400", "font-bold");
    else div.classList.add("text-indigo-200");
    logContenedor.prepend(div);
}

// --- 3. ACCIONES VISUALES (PINTAR CARAS) ---
function letraCara(c) {
    if(c==='o') return 'Oclusal';
    if(c==='m') return 'Mesial';
    if(c==='d') return 'Distal';
    if(c==='v') return 'Vestibular';
    if(c==='p') return 'Palatino/Lingual';
    return c;
}

function registrarAusencia(num, callLog=true) {
    const d = document.getElementById(`contenedor-diente-${num}`);
    if(d) {
        d.classList.add('opacity-20', 'grayscale');
        if(callLog) logEvento(`✅ Pieza ${num} marcada como AUSENTE`, "exito");
        if(callLog) guardarHistorial(num, "Pieza ausente", "ausencia");
        if(!dientesAusentes.includes(num)) dientesAusentes.push(num);
    }
}

function registrarCaries(num, cara, callLog=true) {
    const poly = document.getElementById(`d-${num}-${cara}`);
    if(poly) {
        // Remover clase sano si existe y pintar rojo estricto
        poly.style.fill = '#ef4444'; // Red 500
        if(callLog) logEvento(`✅ Caries detectada en pieza ${num} (Cara: ${letraCara(cara)})`, "error");
        if(callLog) guardarHistorial(num, `Caries en ${letraCara(cara)}`, "caries", cara);
    }
}

function registrarRestauracion(num, cara, defectuosa=false, callLog=true) {
    const poly = document.getElementById(`d-${num}-${cara}`);
    if(poly) {
        poly.style.fill = defectuosa ? '#a855f7' : '#3b82f6'; // Purple 500 or Blue 500
        const nombreRes = defectuosa ? "Restauración Defectuosa" : "Restauración/Resina";
        if(callLog) logEvento(`✅ ${nombreRes} en pieza ${num} (Cara: ${letraCara(cara)})`, "exito");
        if(callLog) guardarHistorial(num, `${nombreRes} en ${letraCara(cara)}`, defectuosa ? "restauracion_defectuosa" : "restauracion", cara);
    }
}

function registrarRadicular(num, callLog=true) {
    const d = document.getElementById(`contenedor-diente-${num}`);
    if(d) d.classList.remove('opacity-20', 'grayscale');
    
    dientesAusentes = dientesAusentes.filter(x => x !== num);
    
    ['v','p','m','d','o'].forEach(c => {
        const poly = document.getElementById(`d-${num}-${c}`);
        if(poly) poly.style.fill = '#0f172a'; // Black/Slate 900
    });
    
    if(callLog) logEvento(`✅ Pieza ${num} marcada en Estado Radicular`, "error");
    if(callLog) guardarHistorial(num, "Estado Radicular", "radicular");
}

function registrarAbrasion(num, cara, callLog=true) {
    const poly = document.getElementById(`d-${num}-${cara}`);
    if(poly) {
        poly.style.fill = '#eab308'; // Yellow 500
        if(callLog) logEvento(`✅ Abfracción/Abrasión en pieza ${num} (Cara: ${letraCara(cara)})`, "alerta");
        if(callLog) guardarHistorial(num, `Abfracción/Abrasión en ${letraCara(cara)}`, "abrasion", cara);
    }
}

function registrarSano(num, callLog=true) {
    const d = document.getElementById(`contenedor-diente-${num}`);
    if(d) d.classList.remove('opacity-20', 'grayscale');
    
    // Remover del arrego de ausentes si por error se marcó
    dientesAusentes = dientesAusentes.filter(x => x !== num);
    
    ['v','p','m','d','o'].forEach(c => {
        const p = document.getElementById(`d-${num}-${c}`);
        if(p) p.style.fill = '#f8fafc';
    });
    if(callLog) logEvento(`✅ Pieza ${num} declarada SANA / Limpia`, "exito");
    if(callLog) guardarHistorial(num, "Sano", "sano");
}

function guardarHistorial(diente, detalle, type, face = null) {
    let hist = JSON.parse(localStorage.getItem('HistorialClinico')) || [];
    hist.push({
        tipo_app: APP_NAME,
        diente,
        detalle,
        type,
        face,
        fecha: new Date().toLocaleString()
    });
    localStorage.setItem('HistorialClinico', JSON.stringify(hist));
}

// --- 4. PERSISTENCIA DE SESIÓN ---
function inicializarSesion() {
    const sesion = JSON.parse(localStorage.getItem('SesionClinica'));
    if (sesion) {
    // (El banner con Dr y Paciente se carga globalmente a través de version.js)
    }
    
    generarArcadas();

    // Replay the history on the UI
    const histStr = localStorage.getItem('HistorialClinico');
    if (histStr) {
        const hist = JSON.parse(histStr);
        hist.forEach(item => {
            if (item.tipo_app === APP_NAME) {
                piezasEvaluadas.add(item.diente);
                if (item.type === 'ausencia') registrarAusencia(item.diente, false);
                else if (item.type === 'caries') registrarCaries(item.diente, item.face, false);
                else if (item.type === 'restauracion') registrarRestauracion(item.diente, item.face, false, false);
                else if (item.type === 'restauracion_defectuosa') registrarRestauracion(item.diente, item.face, true, false);
                else if (item.type === 'sano') registrarSano(item.diente, false);
                else if (item.type === 'radicular') registrarRadicular(item.diente, false);
                else if (item.type === 'abrasion') registrarAbrasion(item.diente, item.face, false);
            }
        });
        if(piezasEvaluadas.size > 0) logEvento(`Datos históricos cargados: ${piezasEvaluadas.size} piezas en memoria.`);
    }
    
    actualizarTracker();
}

// --- 5. RECONOCIMIENTO DE VOZ ---
function interpretarComandoVoz(textoBase) {
    const texto = textoBase.toLowerCase()
        .replace(/uno/g,'1').replace(/dos/g,'2').replace(/tres/g,'3')
        .replace(/cuatro/g,'4').replace(/cinco/g,'5').replace(/seis/g,'6')
        .replace(/siete/g,'7').replace(/ocho/g,'8').replace(/nueve/g,'9')
        .replace(/ y /g,' ')
        .replace(/ e /g,' ')
        .replace(/, /g,' ');
        
    // Busca múltiples números dentales ej. "1.6", "1 6", "16", "2.8"
    const coincidencias = texto.match(/\b([1-4][\.\s]?[1-8])\b/g);
    
    if (!coincidencias || coincidencias.length === 0) {
        // No hay números de diente o están mal pronunciados
        return;
    }

    // Filtrar válidos y eliminar duplicados
    let dientesReconocidos = coincidencias.map(x => parseInt(x.replace(/[\.\s]/g, '')));
    dientesReconocidos = [...new Set(dientesReconocidos)].filter(n => todas.includes(n));
    
    if (dientesReconocidos.length === 0) {
        logEvento(`⚠️ Los números mencionados no existen en la nomenclatura dental humana.`, "alerta");
        return;
    }

    let hallazgoEncontrado = false;

    // Aplicar los hallazgos de la frase a TODOS los dientes mencionados
    dientesReconocidos.forEach(numVal => {
        if (texto.includes("ausente") || texto.includes("ausentes") || texto.includes("extraída") || texto.includes("extraida") || texto.includes("extraídas") || texto.includes("extraidas") || texto.includes("perdida") || texto.includes("perdidas")) {
            registrarAusencia(numVal);
            hallazgoEncontrado = true;
        } 
        else if (texto.includes("caries") || texto.includes("cavidad") || texto.includes("lesión") || texto.includes("lesion")) {
            const caras = [];
            if (texto.includes("oclusal") || texto.includes("centro") || texto.includes("medio")) caras.push("o");
            if (texto.includes("mesial")) caras.push("m");
            if (texto.includes("distal")) caras.push("d");
            if (texto.includes("vestibular")) caras.push("v");
            if (texto.includes("palatino") || texto.includes("lingual")) caras.push("p");
            
            if (caras.length > 0) {
                caras.forEach(c => registrarCaries(numVal, c));
                hallazgoEncontrado = true;
            } else {
                logEvento(`⚠️ Especifica la cara de la Caries en Pieza ${numVal}`, "alerta");
            }
        } 
        else if (texto.includes("resina") || texto.includes("resinas") || texto.includes("obturación") || texto.includes("obturaciones") || texto.includes("obturacion") || texto.includes("tapadura") || texto.includes("tapaduras") || texto.includes("restauración") || texto.includes("restauraciones") || texto.includes("restauracion")) {
            const defectuosa = texto.includes("defectuosa") || texto.includes("defectuosas") || texto.includes("recambio") || texto.includes("mala") || texto.includes("malas") || texto.includes("filtrada") || texto.includes("filtradas");
            const caras = [];
            if (texto.includes("oclusal") || texto.includes("centro") || texto.includes("medio")) caras.push("o");
            if (texto.includes("mesial")) caras.push("m");
            if (texto.includes("distal")) caras.push("d");
            if (texto.includes("vestibular")) caras.push("v");
            if (texto.includes("palatino") || texto.includes("lingual")) caras.push("p");
            
            if (caras.length > 0) {
                caras.forEach(c => registrarRestauracion(numVal, c, defectuosa));
                hallazgoEncontrado = true;
            } else {
                logEvento(`⚠️ Especifica la cara de la Resina/Restauración de Pieza ${numVal}`, "alerta");
            }
        } 
        else if (texto.includes("radicular") || texto.includes("raíz") || texto.includes("raiz") || texto.includes("restos")) {
            registrarRadicular(numVal);
            hallazgoEncontrado = true;
        }
        else if (texto.includes("abfracción") || texto.includes("abfraccion") || texto.includes("abrasión") || texto.includes("abrasion") || texto.includes("desgaste") || texto.includes("afracción") || texto.includes("afraccion") || texto.includes("a fracción") || texto.includes("a fraccion")) {
            const caras = [];
            if (texto.includes("oclusal") || texto.includes("centro") || texto.includes("medio")) caras.push("o");
            if (texto.includes("mesial")) caras.push("m");
            if (texto.includes("distal")) caras.push("d");
            if (texto.includes("vestibular")) caras.push("v");
            if (texto.includes("palatino") || texto.includes("lingual")) caras.push("p");
            
            if (caras.length > 0) {
                caras.forEach(c => registrarAbrasion(numVal, c));
                hallazgoEncontrado = true;
            } else {
                logEvento(`⚠️ Especifica la cara clínica de la Abfracción/Abrasión en Pieza ${numVal} (ej: V)`, "alerta");
            }
        }
        else if (texto.includes("sano") || texto.includes("sanos") || texto.includes("limpio") || texto.includes("limpios") || texto.includes("blanco") || texto.includes("blancos")) {
            registrarSano(numVal);
            hallazgoEncontrado = true;
        }
    });

    if(hallazgoEncontrado) {
        dientesReconocidos.forEach(n => piezasEvaluadas.add(n));
        actualizarTracker();
    } else {
        const dStr = dientesReconocidos.join(', ');
        logEvento(`⚠️ Para piezas [${dStr}], no se indicó hallazgo o cara clínica correcta.`, "alerta");
    }
}

let isListening = false;

function configurarMicrofono() {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
        logEvento("❌ Navegador no compatible con dictado.", "error");
        return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'es-CL';
    recognition.continuous = true;

    const btnVoz = document.getElementById('btn-voz');
    const statusText = document.getElementById('estado-mic');
    
    btnVoz.onclick = () => {
        if(isListening) {
            isListening = false;
            recognition.stop();
            logEvento(`⏸️ Dictado pausado manualmente por el usuario.`, "normal");
            statusText.innerHTML = "Microfono Pausado (Click para Reanudar)";
            btnVoz.className = "w-full max-w-md bg-slate-600 hover:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 text-center flex justify-center items-center gap-2";
        } else {
            try { recognition.start(); } catch(err) {}
        }
    };

    recognition.onstart = () => {
        isListening = true;
        statusText.innerHTML = "Escuchando... (Di 'Pausar Dictado' para detener)";
        btnVoz.className = "w-full max-w-md bg-red-600 hover:bg-red-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 text-center flex justify-center items-center gap-2 animate-pulse";
    };

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
        
        const uiStatus = document.getElementById('status');
        uiStatus.classList.remove('hidden');
        uiStatus.innerText = `Micro: "${transcript}"`;
        uiStatus.className = "mt-4 text-[10px] font-bold text-slate-400 text-center uppercase tracking-widest";
        
        if (transcript.includes("pausar dictado") || transcript.includes("terminar dictado") || transcript.includes("detener dictado")) {
            isListening = false;
            recognition.stop();
            logEvento(`⏸️ Reconocimiento de voz en PAUSA.`, "alerta");
            statusText.innerHTML = "Microfono Pausado (Click para Reanudar)";
            btnVoz.className = "w-full max-w-md bg-slate-600 hover:bg-slate-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 text-center flex justify-center items-center gap-2";
            return;
        }
        
        interpretarComandoVoz(transcript);
    };

    recognition.onend = () => {
        if (isListening) {
            // El motor se apagó solo (silencio prolongado detectado por el OS). Reiniciamos.
            try { recognition.start(); } catch(err) {}
        } else {
            statusText.innerHTML = "Iniciar Mapeo Especializado";
            btnVoz.className = "w-full max-w-md bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-95 text-center flex justify-center items-center gap-2";
        }
    };
    
    recognition.onerror = (e) => {
        if(e.error === 'not-allowed') {
            isListening = false;
            logEvento(`❌ Permiso de micrófono denegado.`, "error");
        }
    };
}
