document.addEventListener('DOMContentLoaded', () => {
    // 0. CAPTURAR FIRMA Y FECHA
    const now = new Date();
    document.getElementById('rep-fecha').innerText = now.toLocaleDateString('es-CL');
    document.getElementById('rep-hora').innerText = now.toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'});

    setTimeout(() => {
        const prof = prompt("Ingrese el nombre del Dr/Dra que realizó la evaluación clínica para la firma del reporte:");
        if (prof && prof.trim() !== "") {
            document.getElementById('firma-dr').innerText = `Dr/Dra. ${prof.trim()}`;
        } else {
            document.getElementById('firma-dr').innerText = `Firma Evaluador`;
        }
    }, 500);

    // 1. POBLAR FICHA CLÍNICA
    const sesionStr = localStorage.getItem('SesionClinica');
    const cFicha = document.getElementById('sec-ficha');
    if (sesionStr) {
        const sesion = JSON.parse(sesionStr);
        document.title = `Reporte_${sesion.paciente || 'Vacio'}_${now.toLocaleDateString('es-CL')}`;

        const mapFicha = [
            {l: 'Paciente', v: sesion.paciente, col: 'col-span-2 text-lg text-indigo-900'},
            {l: 'RUT', v: sesion.rut, col: ''},
            {l: 'Edad / Género', v: `${sesion.edad || '-'} / ${sesion.genero || '-'}`, col: ''},
            {l: 'Previsión', v: sesion.prevision, col: ''},
            {l: 'Ocupación', v: sesion.ocupacion, col: ''},
            {l: 'Motivo Consulta', v: sesion.motivo_actual, col: 'col-span-2 border-t pt-2 mt-2'},
            {l: 'Enfermedades Base', v: sesion.enfermedades, col: 'col-span-2 text-rose-700'},
            {l: 'Alergias', v: sesion.alergias, col: 'text-rose-700'},
            {l: 'Fármacos', v: sesion.farmacos, col: 'text-rose-700'},
            {l: 'Hábitos / Riesgo', v: `${sesion.habitos || 'No referidos'} - Riesgo Psicosocial: ${sesion.riesgo_social || 'N/A'}`, col: 'col-span-2 border-t pt-2 mt-2'},
        ];
        
        cFicha.innerHTML = '';
        mapFicha.forEach(item => {
            if(item.v && item.v !== " / " && item.v.trim() !== "") {
                cFicha.innerHTML += `
                <div class="${item.col || ''}">
                    <span class="block text-xs font-bold text-slate-400 uppercase tracking-widest">${item.l}</span> 
                    <span class="block font-medium ${item.col && item.col.includes('text-') ? '' : 'text-slate-800'}">${item.v}</span>
                </div>`;
            }
        });
    } else {
        cFicha.innerHTML = `<p class="col-span-2 text-slate-400 italic">No hay datos de filiación del paciente.</p>`;
    }

    // 2. POBLAR ODONTOGRAMA
    const histStr = localStorage.getItem('HistorialClinico');
    const tOdonto = document.getElementById('tabla-odonto');
    let hayOdonto = false;
    if (histStr) {
        let hist = JSON.parse(histStr);
        // Sólo mapeo dental Odonto
        hist = hist.filter(h => h.tipo_app === 'Odontograma_Digital');
        
        // Reducir array cronológico a un estado final por diente
        const mapDientes = {};
        hist.forEach(h => {
             if (h.type === 'sano' || h.type === 'ausencia') {
                 // Sano borra todo, Ausencia borra todo y marca ausente
                 mapDientes[h.diente] = { type: h.type, faces: [] };
             } else if (h.type === 'caries' || h.type.includes('restauracion')) {
                 if(!mapDientes[h.diente]) mapDientes[h.diente] = { type: 'Hallazgos', faces: [] };
                 
                 // Si no estaba ausente, sumamos la patología
                 if(mapDientes[h.diente].type !== 'ausencia') {
                     mapDientes[h.diente].type = 'Restauraciones / Patologías';
                     const tipoText = h.type === 'caries' ? 'Caries' : (h.type === 'restauracion_defectuosa' ? 'Resina Defectuosa' : 'Resina/Obturación');
                     mapDientes[h.diente].faces.push(`<strong>${tipoText}</strong> (Cara ${h.face.toUpperCase()})`);
                 }
             }
        });

        Object.keys(mapDientes).sort((a,b)=>a-b).forEach(d => {
            const data = mapDientes[d];
            
            let colorTR = 'hover:bg-slate-50';
            let badge = '';
            let textFaces = data.faces.join('<br>');

            if (data.type === 'ausencia') {
                colorTR = 'bg-slate-50 text-slate-400';
                badge = `<span class="bg-slate-200 text-slate-600 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Extraído/Ausente</span>`;
                textFaces = '-';
            } else if (data.type === 'sano') {
                colorTR = 'bg-emerald-50/50 text-emerald-800';
                badge = `<span class="bg-emerald-100 text-emerald-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Pieza Sana</span>`;
                textFaces = '<i class="text-slate-400">Sin hallazgos patológicos</i>';
            } else {
                badge = `<span class="bg-amber-100 text-amber-700 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest">Hallazgo Clínico</span>`;
            }
            
            tOdonto.innerHTML += `
                <tr class="border-b border-slate-100 ${colorTR} break-inside-avoid">
                    <td class="py-3 font-black text-lg text-slate-700">${d}</td>
                    <td class="py-3">${badge}</td>
                    <td class="py-3 text-sm text-slate-600 leading-snug">${textFaces}</td>
                </tr>
            `;
            hayOdonto = true;
        });
    }
    if(!hayOdonto) {
        tOdonto.innerHTML = `<tr><td colspan="3" class="py-6 text-center text-slate-400 italic">Dentadura Saneada o No Evaluada en el Odontograma</td></tr>`;
    }

    // 3. POBLAR PERIODONTOGRAMA
    const cPerio = document.getElementById('sec-perio');
    const piezasPerio = JSON.parse(localStorage.getItem('PeriodontoPiezasTrabajadas')) || [];
    if (piezasPerio.length === 0) {
        cPerio.innerHTML = `<p class="bg-white border rounded-xl p-6 text-center text-slate-400 italic print:border-none print:p-0">No se detectaron piezas sondadas en esta sesión clínica.</p>`;
    } else {
        cPerio.innerHTML = `<div class="grid grid-cols-2 gap-6 w-full" id="grid-perio"></div>`;
        const gridPerio = document.getElementById('grid-perio');

        piezasPerio.sort((a,b)=>a-b).forEach(p => {
            const dDataStr = localStorage.getItem(`Periodonto_Diente_${p}`);
            if(dDataStr) {
                const dData = JSON.parse(dDataStr);
                
                // Buscar si hay filas con datos (NIC, PS > 0 o sangrado)
                let tbody = ``;
                const caras = [{c:'v', n:'Vest.'}, {c:'p', n:'Pal/Lin'}];
                const puntos = [{p:'d', n:'Distal'}, {p:'m', n:'Medio'}, {p:'mes', n:'Mesial'}];

                caras.forEach(cara => {
                    puntos.forEach(pto => {
                        const mg = parseInt(dData[`${cara.c}-${pto.p}-mg`]) || 0;
                        const ps = parseInt(dData[`${cara.c}-${pto.p}-ps`]) || 0;
                        const nic = ps - mg; // Revertido: El usuario usa MG positivo para hiperplasia
                        const ss = !!dData[`${cara.c}-${pto.p}-ss`];
                        const sp = !!dData[`${cara.c}-${pto.p}-sp`];
                        
                        let markers = [];
                        if (ss) markers.push('<span class="text-rose-600 font-bold">● SS</span>');
                        if (sp) markers.push('<span class="text-amber-500 font-bold">● SP</span>');

                        let colorPS = ps >= 4 ? 'text-rose-600 bg-rose-50 px-1 rounded' : 'text-indigo-600';

                        if(mg !== 0 || ps !== 0 || ss || sp) {
                            tbody += `
                            <tr class="border-b border-slate-100 last:border-0 hover:bg-slate-50 text-slate-600">
                                <td class="py-1">${cara.n}</td>
                                <td>${pto.n}</td>
                                <td class="font-bold border-l border-slate-100">${mg}</td>
                                <td class="font-bold ${colorPS}">${ps}</td>
                                <td class="text-slate-400 font-bold">${nic}</td>
                                <td class="text-xs text-right">${markers.join(' ') || '-'}</td>
                            </tr>
                            `;
                        }
                    });
                });

                if(tbody !== "") {
                    gridPerio.innerHTML += `
                    <div class="bg-white border border-slate-200 p-4 rounded-xl shadow-sm break-inside-avoid print:border-slate-300">
                        <div class="flex items-center gap-2 border-b-2 border-slate-800 pb-2 mb-3">
                            <span class="bg-slate-800 text-white w-8 h-8 flex items-center justify-center rounded-lg font-black">${p}</span>
                            <h4 class="font-bold text-slate-700 uppercase tracking-widest text-xs">Métricas</h4>
                        </div>
                        <table class="w-full text-xs text-center border-collapse">
                            <thead>
                                <tr class="bg-slate-50 text-slate-500 uppercase tracking-wider text-[9px]">
                                    <th class="py-2 text-left">Cara</th><th>Punto</th><th>MG</th><th>PS</th><th>NIC</th><th class="text-right">Obs</th>
                                </tr>
                            </thead>
                            <tbody>${tbody}</tbody>
                        </table>
                    </div>
                    `;
                }
            }
        });
        
        if (gridPerio.innerHTML === "") {
             cPerio.innerHTML = `<p class="text-center text-slate-400 italic">Piezas inicializadas en PeriodontoVoice pero sin patologías ingresadas.</p>`;
        }
    }
});
