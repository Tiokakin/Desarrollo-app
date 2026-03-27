/**
 * Generador de Mapa Periodontal Panorámico
 * Dibuja los dientes con SVG dinámico según anatomofisiología.
 */

const maxilar = [18,17,16,15,14,13,12,11, 21,22,23,24,25,26,27,28];
const mandibular = [48,47,46,45,44,43,42,41, 31,32,33,34,35,36,37,38];

// Paths de morfología dental (58px ancho x 120px alto por diente, Y=60 UCE/CEJ)
// Raíces hacia Y=0 (arriba), coronas hacia Y=120 (abajo)
const P_INCISIVO = "M15,60 C15,30 29,5 29,5 C29,5 43,30 43,60 C48,60 48,110 43,115 C35,120 23,120 15,115 C10,110 10,60 15,60 Z";
const P_CANINO = "M15,60 C15,20 29,0 29,0 C29,0 43,20 43,60 C48,60 48,90 43,115 L29,125 L15,115 C10,90 10,60 15,60 Z";
const P_PREMOLAR = "M12,60 C12,30 20,5 29,5 C38,5 46,30 46,60 C50,60 48,100 43,110 C35,115 23,115 15,110 C10,100 8,60 12,60 Z";
const P_MOLARSUP = "M5,60 C5,45 10,15 15,5 C20,15 25,45 25,60 M25,60 C25,40 29,15 29,15 C29,15 33,40 33,60 M33,60 C33,45 38,15 43,5 C48,15 53,45 53,60 C58,60 55,100 48,110 C35,115 23,115 10,110 C3,100 0,60 5,60 Z";
const P_MOLARINF = "M8,60 L18,5 L29,50 L40,5 L50,60 C55,60 53,100 45,110 C35,115 23,115 13,110 C5,100 3,60 8,60 Z";

function obtenerPath(diente) {
    const d = parseInt(diente);
    const num = d % 10;
    if (num >= 1 && num <= 2) return P_INCISIVO;
    if (num === 3) return P_CANINO;
    if (num >= 4 && num <= 5) return P_PREMOLAR;
    
    // Molares
    if (d >= 16 && d <= 28) return P_MOLARSUP; // Sup maxilar tiene 3 raices normalmente (simplificadas aquí)
    return P_MOLARINF; // Inf tiene 2 raices
}

const CARA_VP = [{id:'v', name:'Vestibular'}, {id:'p', name:'Palatino'}];
const CARA_VL = [{id:'v', name:'Vestibular'}, {id:'p', name:'Lingual'}]; // Palatino en inferior es Lingual (Guardado igual como p en data)

function generarFilaValores(titulo, arcada, propCara, propMedida, dataMap) {
    let html = `<div class="tooth-row data-row"><div class="tooth-col header-col">${titulo}</div>`;
    arcada.forEach(pieza => {
        const dData = dataMap[pieza] || {};
        
        // Propiedades unitarias de todo el diente (ej: movilidad)
        if (propCara === 'tooth') {
            let val = dData[propMedida] !== undefined ? dData[propMedida] : '0';
            html += `<div class="tooth-col font-bold text-slate-500 bg-slate-50"><div class="values-grid"><span style="grid-column: span 3">${val}</span></div></div>`;
            return;
        }
        
        let p1='d', p2='m', p3='mes';
        if ((pieza >= 21 && pieza <= 28) || (pieza >= 31 && pieza <= 38)) { p1='mes'; p2='m'; p3='d'; }

        const v1 = dData[`${propCara}-${p1}-${propMedida}`];
        const v2 = dData[`${propCara}-${p2}-${propMedida}`];
        const v3 = dData[`${propCara}-${p3}-${propMedida}`];

        // PS highlight rule: si es 'ps' y >= 4, rojo.
        const isPS = propMedida === 'ps';
        
        const styleText = (val) => {
            if (val === undefined || val === '0' || val === 0) return 'text-slate-300';
            if (isPS && parseInt(val) >= 4) return 'font-black text-rose-600 bg-rose-50 px-1 rounded';
            return 'font-black text-slate-800';
        };

        const cx1 = styleText(v1);
        const cx2 = styleText(v2);
        const cx3 = styleText(v3);

        html += `<div class="tooth-col"><div class="values-grid"><span class="${cx1}">${v1 || '0'}</span><span class="${cx2}">${v2 || '0'}</span><span class="${cx3}">${v3 || '0'}</span></div></div>`;
    });
    html += `</div>`;
    return html;
}

function generarFilaREC(titulo, arcada, propCara, dataMap) {
    let html = `<div class="tooth-row data-row"><div class="tooth-col header-col">${titulo}</div>`;
    arcada.forEach(pieza => {
        const dData = dataMap[pieza] || {};
        let p1='d', p2='m', p3='mes';
        if ((pieza >= 21 && pieza <= 28) || (pieza >= 31 && pieza <= 38)) { p1='mes'; p2='m'; p3='d'; }

        const calcRec = (pnt) => {
            const mg = parseInt(dData[`${propCara}-${pnt}-mg`]) || 0;
            const ps = parseInt(dData[`${propCara}-${pnt}-ps`]) || 0;
            const nic = ps + mg; // NIC = PS + MG
            const rec = mg; // REC = MG (Recesión es el valor del Margen Gingival)
            const cCls = rec === 0 ? 'text-slate-300' : 'font-black text-indigo-700';
            return `<span class="${cCls}">${rec}</span>`;
        };

        html += `<div class="tooth-col"><div class="values-grid">${calcRec(p1)}${calcRec(p2)}${calcRec(p3)}</div></div>`;
    });
    html += `</div>`;
    return html;
}

function generarFilaNIC(titulo, arcada, propCara, dataMap) {
    let html = `<div class="tooth-row data-row"><div class="tooth-col header-col">${titulo}</div>`;
    arcada.forEach(pieza => {
        const dData = dataMap[pieza] || {};
        let p1='d', p2='m', p3='mes';
        if ((pieza >= 21 && pieza <= 28) || (pieza >= 31 && pieza <= 38)) { p1='mes'; p2='m'; p3='d'; }

        const calcNic = (pnt) => {
            const mg = parseInt(dData[`${propCara}-${pnt}-mg`]) || 0;
            const ps = parseInt(dData[`${propCara}-${pnt}-ps`]) || 0;
            const nic = ps - mg; // NIC = PS - MG
            const cCls = nic === 0 ? 'text-slate-300' : 'font-black text-indigo-700';
            return `<span class="${cCls}">${nic}</span>`;
        };

        html += `<div class="tooth-col"><div class="values-grid">${calcNic(p1)}${calcNic(p2)}${calcNic(p3)}</div></div>`;
    });
    html += `</div>`;
    return html;
}

function generarFilaBoolean(titulo, arcada, propCara, propFlag, dataMap, strMarcador = '●', colorClass = 'text-red-500') {
    let html = `<div class="tooth-row data-row"><div class="tooth-col header-col">${titulo}</div>`;
    arcada.forEach(pieza => {
        const dData = dataMap[pieza] || {};
        let p1='d', p2='m', p3='mes';
        if ((pieza >= 21 && pieza <= 28) || (pieza >= 31 && pieza <= 38)) { p1='mes'; p2='m'; p3='d'; }

        const v1 = dData[`${propCara}-${p1}-${propFlag}`] ? `<span class="${colorClass}">${strMarcador}</span>` : '';
        const v2 = dData[`${propCara}-${p2}-${propFlag}`] ? `<span class="${colorClass}">${strMarcador}</span>` : '';
        const v3 = dData[`${propCara}-${p3}-${propFlag}`] ? `<span class="${colorClass}">${strMarcador}</span>` : '';

        html += `<div class="tooth-col"><div class="values-grid"><span>${v1}</span><span>${v2}</span><span>${v3}</span></div></div>`;
    });
    html += `</div>`;
    return html;
}

function dibujarArcoSVG(arcada, propCara, dataMap, invert = false) {
    const W_TOOTH = 58;  // Width assigned to each tooth slot (928 / 16 = 58)
    const H_SVG = 160;
    const Y_CEJ = 70; // Cemento enamel junction baseline in SVG coordinates
    const PIXEL_PER_MM = 3; // Cuántos píxeles mueve cada mm 

    // Grid lines de fondo (2mm)
    let gridHTML = `<line x1="0" y1="${Y_CEJ}" x2="928" y2="${Y_CEJ}" class="cej-line" />`;
    for(let m = 2; m <= 15; m+=2) {
        const oy1 = Y_CEJ - (m * PIXEL_PER_MM); // Hacia raíz
        const oy2 = Y_CEJ + (m * PIXEL_PER_MM); // Hacia corona
        gridHTML += `<line x1="0" y1="${oy1}" x2="928" y2="${oy1}" class="mm-line" />`;
        gridHTML += `<line x1="0" y1="${oy2}" x2="928" y2="${oy2}" class="mm-line" />`;
    }

    let teethHTML = '';
    let mgPoints = []; // Puntos del Margen Gingival (Recesión)
    let psPoints = []; // Puntos del Fondo de Bolsa (Sondaje)

    arcada.forEach((pieza, index) => {
        const dData = dataMap[pieza] || {};
        const isAusente = dData.ausente;
        const xOffset = index * W_TOOTH;
        
        // Puntos anatómicos relativos al centroide X del diente
        let pd=10, pm=29, pmes=48;
        if ((pieza >= 21 && pieza <= 28) || (pieza >= 31 && pieza <= 38)) {
            pd=48; pm=29; pmes=10; // Invertir L-R interno
        }

        const x1 = xOffset + pd;
        const x2 = xOffset + pm;
        const x3 = xOffset + pmes;

        // Recuperar medidas
        const r1 = parseInt(dData[`${propCara}-d-mg`]) || 0;
        const p1 = parseInt(dData[`${propCara}-d-ps`]) || 0;
        const n1 = p1 - r1; // NIC = PS - MG

        const r2 = parseInt(dData[`${propCara}-m-mg`]) || 0;
        const p2 = parseInt(dData[`${propCara}-m-ps`]) || 0;
        const n2 = p2 - r2;

        const r3 = parseInt(dData[`${propCara}-mes-mg`]) || 0;
        const p3 = parseInt(dData[`${propCara}-mes-ps`]) || 0;
        const n3 = p3 - r3;

        let yR1, yR2, yR3;
        let yP1, yP2, yP3;

        if (!invert) { // MAXILLARY: Crown is DOWN (>70). Root is UP (<70).
            yR1 = Y_CEJ + (r1 * PIXEL_PER_MM);
            yR2 = Y_CEJ + (r2 * PIXEL_PER_MM);
            yR3 = Y_CEJ + (r3 * PIXEL_PER_MM);

            yP1 = Y_CEJ - (n1 * PIXEL_PER_MM);
            yP2 = Y_CEJ - (n2 * PIXEL_PER_MM);
            yP3 = Y_CEJ - (n3 * PIXEL_PER_MM);
        } else { // MANDIBULAR: Crown is UP (<70). Root is DOWN (>70).
            yR1 = Y_CEJ - (r1 * PIXEL_PER_MM);
            yR2 = Y_CEJ - (r2 * PIXEL_PER_MM);
            yR3 = Y_CEJ - (r3 * PIXEL_PER_MM);

            yP1 = Y_CEJ + (n1 * PIXEL_PER_MM);
            yP2 = Y_CEJ + (n2 * PIXEL_PER_MM);
            yP3 = Y_CEJ + (n3 * PIXEL_PER_MM);
        }

        if(!isAusente) {
             if ((pieza >= 21 && pieza <= 28) || (pieza >= 31 && pieza <= 38)) {
                  mgPoints.push(`${x1},${yR3}`, `${x2},${yR2}`, `${x3},${yR1}`);
                  psPoints.push(`${x1},${yP3}`, `${x2},${yP2}`, `${x3},${yP1}`);
             } else {
                  mgPoints.push(`${x1},${yR1}`, `${x2},${yR2}`, `${x3},${yR3}`);
                  psPoints.push(`${x1},${yP1}`, `${x2},${yP2}`, `${x3},${yP3}`);
             }

             let tTransform = invert ? `translate(${xOffset}, 160) scale(1, -1)` : `translate(${xOffset}, 10)`;
             teethHTML += `<g transform="${tTransform}"><path d="${obtenerPath(pieza)}" class="tooth-path" /></g>`;
        } else {
             teethHTML += `<line x1="${xOffset+10}" y1="${Y_CEJ-40}" x2="${xOffset+48}" y2="${Y_CEJ+40}" stroke="red" stroke-width="2" />`;
             teethHTML += `<line x1="${xOffset+48}" y1="${Y_CEJ-40}" x2="${xOffset+10}" y2="${Y_CEJ+40}" stroke="red" stroke-width="2" />`;
        }
    });

    const d_mg = mgPoints.join(' ');
    const d_ps = psPoints.join(' ');

    return `
        <div class="svg-container">
            <svg class="svg-canvas" viewBox="0 0 928 160">
                ${gridHTML}
                ${teethHTML}
                <polyline points="${d_mg}" class="mg-line" />
                <polyline points="${d_ps}" class="ps-line" />
            </svg>
        </div>
    `;
}

function renderSeccion(arcada, titulo, nombresCaras, dataMap, isInvertido = false) {
    let html = `<div class="grid-container">`;
    html += `<div class="row-header">${titulo}</div>`;

    // Numeros de piezas
    html += `<div class="tooth-row"><div class="tooth-col header-col bg-slate-200">Pieza</div>`;
    arcada.forEach(p => html += `<div class="tooth-col font-black text-slate-800 text-lg bg-teal-50">${p}</div>`);
    html += `</div>`;

    // BLOQUE SUPERIOR (Cara 1 = Vestibular) 
    html += generarFilaValores('Movilidad', arcada, 'tooth', 'movilidad', dataMap);
    html += generarFilaBoolean('Sangrado', arcada, 'v', 'ss', dataMap, '●', 'text-red-500');
    html += generarFilaBoolean('Supuración', arcada, 'v', 'sp', dataMap, '●', 'text-amber-500');
    html += generarFilaREC('Margen Gingival', arcada, 'v', dataMap);
    html += generarFilaValores('Profund. Sondaje', arcada, 'v', 'ps', dataMap);
    html += generarFilaNIC('Nivel Inserción', arcada, 'v', dataMap);

    // --- GRAFICA VESTIBULAR ---
    html += `<div class="tooth-row"><div class="tooth-col header-col text-slate-400 uppercase tracking-widest text-center" style="writing-mode: vertical-rl; transform: rotate(180deg);">${nombresCaras[0]}</div></div>`;
    html += dibujarArcoSVG(arcada, 'v', dataMap, isInvertido);

    // --- GRAFICA LINGUAL/PALATINA ---
    html += `<div class="tooth-row"><div class="tooth-col header-col text-slate-400 uppercase tracking-widest text-center" style="writing-mode: vertical-rl; transform: rotate(180deg);">${nombresCaras[1]}</div></div>`;
    html += dibujarArcoSVG(arcada, 'p', dataMap, isInvertido);

    // BLOQUE INFERIOR (Cara 2 = Palatino/Lingual) 
    html += generarFilaNIC('Nivel Inserción', arcada, 'p', dataMap);
    html += generarFilaValores('Profund. Sondaje', arcada, 'p', 'ps', dataMap);
    html += generarFilaREC('Margen Gingival', arcada, 'p', dataMap);
    html += generarFilaBoolean('Supuración', arcada, 'p', 'sp', dataMap, '●', 'text-amber-500');
    html += generarFilaBoolean('Sangrado', arcada, 'p', 'ss', dataMap, '●', 'text-red-500');

    html += `</div>`;
    return html;
}

document.addEventListener('DOMContentLoaded', () => {
    // 1. Cargar Memoria
    const dictData = {};
    const piezasPerio = JSON.parse(localStorage.getItem('PeriodontoPiezasTrabajadas')) || [];
    [...maxilar, ...mandibular].forEach(p => {
        const str = localStorage.getItem(`Periodonto_Diente_${p}`);
        if(str) dictData[p] = JSON.parse(str);
        else dictData[p] = {ausente: false}; // Faltaría cruzar con Odontograma ausentes.
    });

    // Cruzar con Odontograma para detectar extracciones
    const histStr = localStorage.getItem('HistorialClinico');
    if(histStr) {
        const hist = JSON.parse(histStr);
        hist.forEach(h => {
             if (h.tipo_app==='Odontograma_Digital' && h.type==='ausencia') {
                 if(dictData[h.diente]) dictData[h.diente].ausente = true;
             }
        });
    }

    // 2. Renderizar Superior
    const app = document.getElementById('app');
    app.innerHTML += renderSeccion(maxilar, 'MAXILAR (SUPERIOR)', ['Vestibular', 'Palatino'], dictData, false);
    
    // 3. Renderizar Inferior
    app.innerHTML += renderSeccion(mandibular, 'MANDÍBULA (INFERIOR)', ['Vestibular', 'Lingual'], dictData, true);
});
