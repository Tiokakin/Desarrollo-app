// version.js
// Archivo central para manejar las distintas versiones de cada módulo en la Suite Dental

const APP_VERSIONS = {
    // Al estar en etapa previa a 1.0, usamos nomenclaturas tipo 0.x.x
    central: "v0.02",
    fichaclinica: "v0.02",
    odontograma: "v0.02",
    periodontograma: "v0.02",
    mapa: "v0.02",
    reporte: "v0.02",
    periodontograma_legacy: "v0.02"
};

// Exponer la función de Toggle a nivel global desde el inicio
window.toggleThemeGlobal = () => {
    try {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('OdontoTheme', isDark ? 'dark' : 'light');
        
        const sliderKnob = document.getElementById('theme-knob');
        if (sliderKnob) {
            if (isDark) {
                sliderKnob.classList.add('translate-x-5');
            } else {
                sliderKnob.classList.remove('translate-x-5');
            }
        }
    } catch (e) {
        console.error("Error al alternar tema oscuro:", e);
    }
};

document.addEventListener("DOMContentLoaded", () => {
    // Actualizar elementos dinámicamente según su atributo data-app
    const versionElements = document.querySelectorAll('.app-version-display, #version-label');
    
    versionElements.forEach(el => {
        // Obtenemos a qué aplicación corresponde la versión (por defecto 'central')
        const appName = el.getAttribute('data-app') || 'central'; 
        
        if (APP_VERSIONS[appName]) {
            el.textContent = APP_VERSIONS[appName];
        }
    });

    // Unified Banner Population
    try {
        const sessionStr = localStorage.getItem('SesionClinica');
        if (sessionStr) {
            const sesion = JSON.parse(sessionStr);
            document.querySelectorAll('.session-operador-display').forEach(el => {
                el.textContent = sesion.operador ? `Dr/Dra. ${sesion.operador}` : 'No especificado';
            });
            document.querySelectorAll('.session-paciente-display').forEach(el => {
                el.textContent = sesion.paciente ? sesion.paciente : 'No especificado';
            });
            document.querySelectorAll('.session-rut-display').forEach(el => {
                el.textContent = sesion.rut ? sesion.rut : '---';
            });
        }
    } catch(e) {
        console.error("No se pudo cargar la sesión para el banner unificado.", e);
    }

    console.log(`Versiones de módulos cargadas:`, APP_VERSIONS);

    // === MODO OSCURO GLOBAL ===
    const addDarkStyles = () => {
        const style = document.createElement('style');
        style.innerHTML = `
            html.dark .mi-dark-bg-slate-900 { background-color: #0f172a !important; }
            html.dark .mi-dark-bg-slate-800 { background-color: #1e293b !important; }
            html.dark .mi-dark-bg-slate-700 { background-color: #334155 !important; }
            html.dark .mi-dark-bg-slate-600 { background-color: #475569 !important; }
            html.dark .mi-dark-bg-slate-800\\/80 { background-color: rgba(30, 41, 59, 0.8) !important; }
            
            html.dark .mi-dark-text-white { color: #ffffff !important; }
            html.dark .mi-dark-text-slate-100 { color: #f1f5f9 !important; }
            html.dark .mi-dark-text-slate-200 { color: #e2e8f0 !important; }
            html.dark .mi-dark-text-slate-300 { color: #cbd5e1 !important; }
            html.dark .mi-dark-text-slate-400 { color: #94a3b8 !important; }
            html.dark .mi-dark-text-slate-500 { color: #64748b !important; }
            
            html.dark .mi-dark-text-blue-200 { color: #bfdbfe !important; }
            html.dark .mi-dark-text-blue-300 { color: #93c5fd !important; }
            html.dark .mi-dark-text-blue-400 { color: #60a5fa !important; }
            html.dark .mi-dark-bg-blue-900\\/50 { background-color: rgba(30, 58, 138, 0.5) !important; }
            html.dark .mi-dark-bg-blue-900\\/30 { background-color: rgba(30, 58, 138, 0.3) !important; }
            
            html.dark .mi-dark-text-indigo-200 { color: #c7d2fe !important; }
            html.dark .mi-dark-text-indigo-400 { color: #818cf8 !important; }
            html.dark .mi-dark-bg-indigo-900\\/50 { background-color: rgba(49, 46, 129, 0.5) !important; }
            html.dark .mi-dark-bg-indigo-900\\/30 { background-color: rgba(49, 46, 129, 0.3) !important; }
            
            html.dark .mi-dark-border-slate-800 { border-color: #1e293b !important; }
            html.dark .mi-dark-border-slate-700 { border-color: #334155 !important; }
            html.dark .mi-dark-border-slate-600 { border-color: #475569 !important; }

            html.dark .mi-dark-text-amber-400 { color: #fbbf24 !important; }
        `;
        document.head.appendChild(style);
    };
    addDarkStyles();

    const applyDarkClasses = () => {
        // Mapeo seguro de clases de fondo y texto para todas las aplicaciones usando prefijo manual mi-dark-
        const mappings = [
            { selector: '.bg-white', add: 'mi-dark-bg-slate-800' },
            { selector: '.bg-slate-50', add: 'mi-dark-bg-slate-900' },
            { selector: '.bg-slate-100', add: 'mi-dark-bg-slate-700' },
            { selector: '.bg-slate-200', add: 'mi-dark-bg-slate-700' },
            
            { selector: '.text-slate-900', add: 'mi-dark-text-white' },
            { selector: '.text-slate-800', add: 'mi-dark-text-slate-100' },
            { selector: '.text-slate-700', add: 'mi-dark-text-slate-200' },
            { selector: '.text-slate-600', add: 'mi-dark-text-slate-300' },
            { selector: '.text-slate-500', add: 'mi-dark-text-slate-400' },
            { selector: '.text-slate-400', add: 'mi-dark-text-slate-500' },
            
            { selector: '.text-blue-900', add: 'mi-dark-text-blue-200' },
            { selector: '.text-blue-800', add: 'mi-dark-text-blue-300' },
            { selector: '.text-blue-700', add: 'mi-dark-text-blue-400' },
            { selector: '.bg-blue-100', add: 'mi-dark-bg-blue-900/50' },
            { selector: '.bg-blue-50', add: 'mi-dark-bg-blue-900/30' },
            
            { selector: '.text-indigo-900', add: 'mi-dark-text-indigo-200' },
            { selector: '.text-indigo-700', add: 'mi-dark-text-indigo-400' },
            { selector: '.bg-indigo-100', add: 'mi-dark-bg-indigo-900/50' },
            { selector: '.bg-indigo-50', add: 'mi-dark-bg-indigo-900/30' },
            
            { selector: '.border-slate-200', add: 'mi-dark-border-slate-700' },
            { selector: '.border-slate-300', add: 'mi-dark-border-slate-600' },
            { selector: '.border-slate-100', add: 'mi-dark-border-slate-700' },
            
            // Inputs y Selects
            { selector: 'input.bg-slate-50', add: 'mi-dark-bg-slate-900 mi-dark-text-white mi-dark-border-slate-700' },
            { selector: 'input.bg-slate-100', add: 'mi-dark-bg-slate-800 mi-dark-text-white mi-dark-border-slate-600' },
            { selector: 'select, textarea', add: 'mi-dark-bg-slate-800 mi-dark-text-white mi-dark-border-slate-700' },
            { selector: 'input[type="text"], input[type="number"]', add: 'mi-dark-bg-slate-800 mi-dark-text-white mi-dark-border-slate-700' },

            // Body y Componentes especialez
            { selector: 'body', add: 'mi-dark-bg-slate-900 mi-dark-text-slate-100' },
            { selector: '.glass', add: 'mi-dark-bg-slate-800/80 mi-dark-border-slate-700' },
        ];

        mappings.forEach(m => {
            try {
                document.querySelectorAll(m.selector).forEach(el => {
                    const classes = m.add.trim().split(/\s+/);
                    el.classList.add(...classes);
                });
            } catch (err) {
                console.error(`Error aplicando tema oscuro al selector: ${m.selector}`, err);
            }
        });
    };

    applyDarkClasses();

    // Sincronizar el toggle visual de Central Dental con el estado actual
    const syncThemeSlider = () => {
        const sliderKnob = document.getElementById('theme-knob');
        if (sliderKnob) {
            if (document.documentElement.classList.contains('dark')) {
                sliderKnob.classList.add('translate-x-5');
            } else {
                sliderKnob.classList.remove('translate-x-5');
            }
        }
    };

    // Aplicar estado inicial guardado globalmente y deslizar switch si aplica
    if (localStorage.getItem('OdontoTheme') === 'dark') {
        document.documentElement.classList.add('dark');
        const sliderKnob = document.getElementById('theme-knob');
        if (sliderKnob) sliderKnob.classList.add('translate-x-5');
    }
});
