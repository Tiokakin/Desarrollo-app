/**
 * PeriodontoVoice Pro - v0.0401 (Persistencia de Memoria Local)
 * MÓDULO DE PERIO COMPLETAMENTE SINCRONIZADO
 */
document.addEventListener('DOMContentLoaded', () => {
    const btnVoz = document.getElementById('btn-voz');
    const status = document.getElementById('status');
    const dienteLabel = document.getElementById('diente-actual');
    
    // Novedades Visuales
    const trackerContenedor = document.getElementById('tracker-piezas');
    const logContenedor = document.getElementById('log-dictado');
    const TODAS_LAS_PIEZAS = [
        18, 17, 16, 15, 14, 13, 12, 11, 21, 22, 23, 24, 25, 26, 27, 28,
        48, 47, 46, 45, 44, 43, 42, 41, 31, 32, 33, 34, 35, 36, 37, 38
    ];
    let piezasTrabajadas = new Set();
    
    let dientesAusentes = [];
    let dienteActivo = null;

    // --- REINICIAR REGISTRO ---
    const btnReiniciarPerio = document.getElementById('btn-reiniciar-perio');
    if(btnReiniciarPerio) {
        btnReiniciarPerio.addEventListener('click', () => {
            const afirmacion = confirm("⚠️ ¿Estás seguro de que deseas vaciar el Periodontograma?\n\nEsto eliminará permanentemente la tabla de medidas (NIC, PS, Sangrado) de TODAS las piezas trabajadas en esta sesión.\n\nEsta acción no se puede deshacer.");
            if(afirmacion) {
                // Remove Periodonto keys
                piezasTrabajadas.forEach(p => localStorage.removeItem(`Periodonto_Diente_${p}`));
                localStorage.removeItem('PeriodontoPiezasTrabajadas');
                
                // Clear state
                piezasTrabajadas.clear();
                dienteActivo = null;
                dienteLabel.innerText = "Diente: ---";
                limpiarCampos();
                actualizarTracker();
                logEvento("🗑️ Periodontograma reiniciado por el usuario.", "alerta");
            }
        });
    }

    // --- 0. FUNCIONES DE INTERFAZ GRÁFICA (TRACKER & LOG) ---
    const actualizarTracker = () => {
        if(!trackerContenedor) return;
        trackerContenedor.innerHTML = '';
        TODAS_LAS_PIEZAS.forEach(p => {
            const div = document.createElement('div');
            if (dientesAusentes.includes(p)) {
                div.className = "p-1 border rounded opacity-40 bg-slate-100 text-slate-400 font-normal line-through";
            } else if (piezasTrabajadas.has(p)) {
                div.className = "p-1 border rounded bg-emerald-50 border-emerald-300 text-emerald-700 shadow-sm";
            } else if (dienteActivo === p) {
                div.className = "p-1 border-2 rounded bg-indigo-50 border-indigo-500 text-indigo-700 shadow-md transform scale-110";
            } else {
                div.className = "p-1 border rounded border-slate-200 text-slate-500 bg-white hover:bg-slate-50 transition";
            }
            div.innerText = p;
            trackerContenedor.appendChild(div);
        });
        
        // Actualizar header ratio (0/32)
        const ratioText = document.getElementById('piezas-count');
        if(ratioText) {
             const activas = TODAS_LAS_PIEZAS.length - dientesAusentes.length;
             ratioText.innerText = `${piezasTrabajadas.size}/${activas}`;
        }
    };

    const logEvento = (mensaje, tipo="normal") => {
        if(!logContenedor) return;
        const div = document.createElement('div');
        const hora = new Date().toLocaleTimeString('es-CL',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
        div.innerHTML = `<span class="text-slate-500 mr-2">[${hora}]</span> ${mensaje}`;
        if (tipo === "exito") div.classList.add("text-emerald-400", "font-bold");
        else if (tipo === "alerta") div.classList.add("text-amber-400");
        else if (tipo === "error") div.classList.add("text-red-400", "font-bold");
        else div.classList.add("text-indigo-200");
        logContenedor.prepend(div);
    };

    // --- 0.5 PERSISTENCIA DE LOCALSTORAGE (NOVEDAD) ---
    function guardarTablaActual() {
        if (!dienteActivo) return;
        const data = {};
        document.querySelectorAll('#cuerpo-tabla input[type="number"]').forEach(input => {
            data[input.id] = input.value;
        });
        document.querySelectorAll('#cuerpo-tabla input[type="checkbox"]').forEach(input => {
            data[input.id] = input.checked;
        });
        // Guardamos las celdas directamente a la memoria persistente del navegador
        localStorage.setItem(`Periodonto_Diente_${dienteActivo}`, JSON.stringify(data));
        
        // Mantener track global de que esta pieza tiene registros de periodonto guardados
        piezasTrabajadas.add(dienteActivo);
        localStorage.setItem('PeriodontoPiezasTrabajadas', JSON.stringify(Array.from(piezasTrabajadas)));
    }

    function cargarTablaDiente(diente) {
        limpiarCampos();
        const infoStr = localStorage.getItem(`Periodonto_Diente_${diente}`);
        if(infoStr) {
            const data = JSON.parse(infoStr);
            for(let key in data) {
                const input = document.getElementById(key);
                if(input) {
                    if (input.type === 'checkbox') input.checked = data[key];
                    else input.value = data[key];
                }
            }
            // Auto-recalcular columna de NIC Visual
            const caras = ['v-d','v-m','v-mes','p-d','p-m','p-mes'];
            caras.forEach(c => {
                 const mg = parseInt(document.getElementById(`${c}-mg`).value) || 0;
                 const ps = parseInt(document.getElementById(`${c}-ps`).value) || 0;
                 const tdNic = document.getElementById(`${c}-nic`);
                 if(tdNic) tdNic.innerText = ps - mg; // Revertido: El usuario usa MG positivo para hiperplasia
            });
            logEvento(`[RECUPERADO] Historial local de Pieza ${diente} restaurado.`, "normal");
        }
    }

    // --- 1. CARGA DE SESIÓN Y SINCRONIZACIÓN ---
    const inicializarSesion = () => {
        // La info del paciente y operador ahora la carga version.js globalmente

        // Sincronización del Odontograma (Piezas que faltan)
        try {
            const historialStr = localStorage.getItem('HistorialClinico');
            const historial = historialStr ? JSON.parse(historialStr) : [];
            dientesAusentes = historial
                .filter(item => item.detalle === 'Pieza ausente')
                .map(item => parseInt(item.diente));
        } catch(e) { 
            dientesAusentes = []; 
        }

        // Recuperar Piezas Periodontales Previas de la sesión
        try {
            const guardadas = localStorage.getItem('PeriodontoPiezasTrabajadas');
            if(guardadas) {
                const mapPiezas = JSON.parse(guardadas);
                piezasTrabajadas = new Set(mapPiezas);
            }
        } catch(e) {}

        // Suscribir eventos manuales para que si escriben o hacen check, guarde auto
        document.querySelectorAll('#cuerpo-tabla input').forEach(inp => {
            inp.addEventListener('change', () => {
                // Si cambiaron mg o ps, recalcular NIC de esa fila
                if (inp.id.includes('-mg') || inp.id.includes('-ps')) {
                    const baseId = inp.id.replace('-mg','').replace('-ps','');
                    const m = parseInt(document.getElementById(`${baseId}-mg`).value) || 0;
                    const p = parseInt(document.getElementById(`${baseId}-ps`).value) || 0;
                    const nicEl = document.getElementById(`${baseId}-nic`);
                    if(nicEl) nicEl.innerText = p - m;
                }
                guardarTablaActual();
            });
        });

        actualizarTracker();
        logEvento("Sesión cargada " + (dientesAusentes.length > 0 ? "con exclusiones del Odontograma." : ""), "normal");
    };

    // --- 2. AYUDANTES DE VOZ ---
    const mapNumeros = {'cero':'0','uno':'1','dos':'2','tres':'3','cuatro':'4','cinco':'5','seis':'6','siete':'7','ocho':'8','nueve':'9','diez':'10'};
    function aNumeros(texto) {
        let t = texto.toLowerCase();
        t = t.replace(/\bmenos\s+/g, '-');
        for(let p in mapNumeros) t = t.replace(new RegExp('\\b'+p+'\\b', 'g'), mapNumeros[p]);
        return t;
    }

    // --- 3. LÓGICA PRINCIPAL DEL DICTADO ---
    function procesarComando(textoOriginal) {
        const texto = aNumeros(textoOriginal);
        
        // A) DETECTAR CAMBIO DE DIENTE (ej. "diente 16", "pieza 1.6")
        const matchDiente = texto.match(/(?:diente|pieza|número|numero)\s*(\d[.]?\s?\d)/);
        if (matchDiente) {
            const numVal = parseInt(matchDiente[1].replace(/[\.\s]/g, ''));
            dienteActivo = numVal;
            dienteLabel.innerText = "Diente: " + numVal;
            
            if (dientesAusentes.includes(numVal)) {
                status.innerHTML = `⚠️ <span class="text-red-600 animate-pulse font-bold">PIEZA ${numVal} AUSENTE</span>`;
                logEvento(`Intento de selección de Pieza ${numVal} (Ausente)`, "error");
                limpiarCampos();
                dienteActivo = null; // Bloquear ingreso para este diente
                actualizarTracker();
                return;
            } else {
                status.innerText = `Pieza ${numVal} Seleccionada`;
                status.className = "text-[10px] font-bold text-blue-600 uppercase";
                logEvento(`Abierta carpeta clínica para el diente ${numVal}`, "normal");
                cargarTablaDiente(numVal); 
                actualizarTracker();
            }
        }

        // Si no hay diente activo no registramos tablas
        if (!dienteActivo) return; 

        // B) DETECTAR VALORES ("vestibular 1 2 3, 1 2 3" o "palatino 1 2 3, 1 2 3")
        const esVestibular = texto.includes("vestibular");
        const esPalatino = texto.includes("palatino") || texto.includes("lingual");
        
        if (esVestibular || esPalatino) {
            const delimitador = esVestibular ? "vestibular" : (texto.includes("palatino") ? "palatino" : "lingual");
            const fraccionTexto = texto.split(delimitador)[1];
            
            if (fraccionTexto) {
                const rawNums = fraccionTexto.match(/-?\d+/g);
                if (rawNums) {
                    let nums = [];
                    // Dividir números agrupados como "333" a [3, 3, 3] excluyendo >15 si los dictaron rápido
                    rawNums.forEach(n => {
                        if (Math.abs(parseInt(n)) > 15) {
                            let isNeg = n.startsWith('-');
                            let s = n.replace('-','');
                            s.split('').forEach((d, i) => nums.push((i===0 && isNeg) ? '-'+d : d));
                        } else {
                            nums.push(n);
                        }
                    });

                    if (nums.length >= 6) {
                        const prefijo = esVestibular ? 'v' : 'p';
                        asignarValores(prefijo, 'd', nums[0], nums[3]);   
                        asignarValores(prefijo, 'm', nums[1], nums[4]);   
                        asignarValores(prefijo, 'mes', nums[2], nums[5]); 
                        
                        guardarTablaActual(); // GUARDA PERSISTENTEMENTE TODOS LOS INPUTS
                        
                        status.innerText = `✅ Registro guardado en cara ${esVestibular ? 'Vestibular' : 'Palatino/Lingual'}`;
                        status.className = "text-[10px] font-bold text-green-600 uppercase";
                        logEvento(`[Diente ${dienteActivo}] Grabado cara ${esVestibular ? 'Vestibular' : 'Palatino/Lingual'}: ${nums.slice(0,6).join('-')}`, "exito");
                        actualizarTracker();
                    } else {
                        status.innerText = `⚠️ Incompleto: escuché ${nums.length} números para la cara ${delimitador}`;
                        status.className = "text-[10px] font-bold text-amber-600 uppercase";
                        logEvento(`[Diente ${dienteActivo}] Audición incompleta (${nums.length}/6) en cara ${delimitador}`, "alerta");
                    }
                }
            }
        }

        // C) COMANDOS EXTRA ("Siguiente", "Limpiar")
        if (texto.includes("siguiente") || texto.includes("limpiar")) {
            dienteActivo = null;
            dienteLabel.innerText = "Diente: ---";
            status.innerText = "Listo para nueva pieza";
            status.className = "text-[10px] font-bold text-indigo-600 uppercase";
            limpiarCampos();
            actualizarTracker();
        }
    }

    // --- 4. ASIGNACIÓN EN TABLA ---
    function asignarValores(cara, punto, mg, ps) {
        const idMg = `${cara}-${punto}-mg`;
        const idPs = `${cara}-${punto}-ps`;
        const idNic = `${cara}-${punto}-nic`;

        const inputMg = document.getElementById(idMg);
        const inputPs = document.getElementById(idPs);
        const cellNic = document.getElementById(idNic);

        if (inputMg && inputPs && cellNic) {
            inputMg.value = mg;
            inputPs.value = ps;            
            cellNic.innerText = parseInt(ps) - parseInt(mg); // NIC = PS - MG
        }
    }

    function limpiarCampos() {
        document.querySelectorAll('#cuerpo-tabla input[type="number"]').forEach(input => input.value = "0");
        document.querySelectorAll('#cuerpo-tabla td[id$="-nic"]').forEach(td => td.innerText = "0");
        document.querySelectorAll('#cuerpo-tabla input[type="checkbox"]').forEach(check => check.checked = false);
    }

    // --- 5. INICIO DE VOZ ---
    let isListening = false;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'es-CL';
        recognition.continuous = true;

        btnVoz.onclick = () => {
            if(isListening) {
                isListening = false;
                recognition.stop();
                logEvento(`⏸️ Dictado pausado manualmente por el usuario.`, "normal");
                btnVoz.innerHTML = '<i class="fas fa-microphone mr-2"></i> Micrófono Pausado (Clic para Reanudar)';
                
                if(btnVoz.classList.contains('bg-red-600')) {
                    btnVoz.classList.replace('bg-red-600', 'bg-slate-600');
                    btnVoz.classList.replace('hover:bg-red-700', 'hover:bg-slate-700');
                }
            } else {
                try { recognition.start(); } catch(err) {}
            }
        };

        recognition.onstart = () => {
            isListening = true;
            btnVoz.innerHTML = '<i class="fas fa-microphone-slash mr-2 animate-pulse"></i> Escuchando... (Di "Pausar Dictado")';
            
            if(btnVoz.classList.contains('bg-indigo-600')) {
                 btnVoz.classList.replace('bg-indigo-600', 'bg-red-600');
                 btnVoz.classList.replace('hover:bg-indigo-700', 'hover:bg-red-700');
            } else if(btnVoz.classList.contains('bg-slate-600')) {
                 btnVoz.classList.replace('bg-slate-600', 'bg-red-600');
                 btnVoz.classList.replace('hover:bg-slate-700', 'hover:bg-red-700');
            }
        };

        recognition.onresult = (e) => {
            const transcript = e.results[e.results.length - 1][0].transcript.toLowerCase();
            
            const transUI = document.getElementById('status');
            transUI.innerHTML = `Escuchó: <i>"${transcript}"</i>`;
            transUI.className = "text-[10px] font-bold text-slate-500";
            
            if (transcript.includes("pausar dictado") || transcript.includes("terminar dictado") || transcript.includes("detener dictado")) {
                isListening = false;
                recognition.stop();
                logEvento(`⏸️ Reconocimiento de voz en PAUSA.`, "alerta");
                btnVoz.innerHTML = '<i class="fas fa-microphone mr-2"></i> Micrófono Pausado (Clic para Reanudar)';
                btnVoz.classList.replace('bg-red-600', 'bg-slate-600');
                btnVoz.classList.replace('hover:bg-red-700', 'hover:bg-slate-700');
                return;
            }

            procesarComando(transcript);
        };

        recognition.onend = () => {
            if(isListening) {
                try{ recognition.start(); } catch(err) {} 
            } else {
                btnVoz.innerHTML = '<i class="fas fa-microphone mr-2"></i> Iniciar Dictado Especializado';
                if(btnVoz.classList.contains('bg-red-600')) {
                     btnVoz.classList.replace('bg-red-600', 'bg-indigo-600');
                     btnVoz.classList.replace('hover:bg-red-700', 'hover:bg-indigo-700');
                } else if(btnVoz.classList.contains('bg-slate-600')) {
                     btnVoz.classList.replace('bg-slate-600', 'bg-indigo-600');
                     btnVoz.classList.replace('hover:bg-slate-700', 'hover:bg-indigo-700');
                }
                status.innerText = "Micrófono en pausa, toca para reiniciar";
                status.className = "text-[10px] font-bold text-amber-600 uppercase";
            }
        };

        recognition.onerror = (e) => {
            if(e.error === 'not-allowed') {
                 isListening = false;
                 logEvento("❌ Permiso de micrófono denegado.", "error");
            }
            status.innerText = "❌ Error Mic: " + e.error;
            status.className = "text-[10px] font-bold text-red-600 uppercase";
        };
    } else {
        btnVoz.innerHTML = "Navegador Incompatible";
        btnVoz.disabled = true;
    }

    inicializarSesion();
});
