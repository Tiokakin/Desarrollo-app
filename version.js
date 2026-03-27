// version.js
// Archivo central para manejar las distintas versiones de cada módulo en la Suite Dental

const APP_VERSIONS = {
    // Al estar en etapa previa a 1.0, usamos nomenclaturas tipo 0.x.x
    central: "v0.01",
    fichaclinica: "v0.01",
    odontograma: "v0.01",
    periodontograma: "v0.01",
    mapa: "v0.01",
    reporte: "v0.01",
    periodontograma_legacy: "v0.01"
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
        }
    } catch(e) {
        console.error("No se pudo cargar la sesión para el banner unificado.", e);
    }

    console.log(`Versiones de módulos cargadas:`, APP_VERSIONS);

    // === MODO OSCURO GLOBAL ===
    const applyDarkClasses = () => {
        // Mapeo seguro de clases de fondo y texto para todas las aplicaciones
        const mappings = [
            { selector: '.bg-white', add: 'dark:bg-slate-800' },
            { selector: '.bg-slate-50', add: 'dark:bg-slate-900' },
            { selector: '.bg-slate-100', add: 'dark:bg-slate-700' },
            { selector: '.bg-slate-200', add: 'dark:bg-slate-700' },
            
            { selector: '.text-slate-900', add: 'dark:text-white' },
            { selector: '.text-slate-800', add: 'dark:text-slate-100' },
            { selector: '.text-slate-700', add: 'dark:text-slate-200' },
            { selector: '.text-slate-600', add: 'dark:text-slate-300' },
            { selector: '.text-slate-500', add: 'dark:text-slate-400' },
            { selector: '.text-slate-400', add: 'dark:text-slate-500' },
            
            { selector: '.text-blue-900', add: 'dark:text-blue-200' },
            { selector: '.text-blue-800', add: 'dark:text-blue-300' },
            { selector: '.text-blue-700', add: 'dark:text-blue-400' },
            { selector: '.bg-blue-100', add: 'dark:bg-blue-900/50' },
            { selector: '.bg-blue-50', add: 'dark:bg-blue-900/30' },
            
            { selector: '.text-indigo-900', add: 'dark:text-indigo-200' },
            { selector: '.text-indigo-700', add: 'dark:text-indigo-400' },
            { selector: '.bg-indigo-100', add: 'dark:bg-indigo-900/50' },
            { selector: '.bg-indigo-50', add: 'dark:bg-indigo-900/30' },
            
            { selector: '.border-slate-200', add: 'dark:border-slate-700' },
            { selector: '.border-slate-300', add: 'dark:border-slate-600' },
            { selector: '.border-slate-100', add: 'dark:border-slate-700' },
            
            // Inputs y Selects
            { selector: 'input.bg-slate-50', add: 'dark:bg-slate-900 dark:text-white dark:border-slate-700' },
            { selector: 'input.bg-slate-100', add: 'dark:bg-slate-800 dark:text-white dark:border-slate-600' },
            { selector: 'select, textarea', add: 'dark:bg-slate-800 dark:text-white dark:border-slate-700' },
            { selector: 'input[type="text"], input[type="number"]', add: 'dark:bg-slate-800 dark:text-white dark:border-slate-700' },

            // Body
            { selector: 'body', add: 'dark:bg-slate-900 dark:text-slate-100' },
        ];

        mappings.forEach(m => {
            document.querySelectorAll(m.selector).forEach(el => {
                const classes = m.add.split(' ');
                el.classList.add(...classes);
            });
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

    // Aplicar estado inicial guardado
    if (localStorage.getItem('OdontoTheme') === 'dark') {
        document.documentElement.classList.add('dark');
    }
    syncThemeSlider();

    // Exponer la función de Toggle a nivel global para que el botón en index.html pueda llamarla
    window.toggleThemeGlobal = () => {
        const isDark = document.documentElement.classList.toggle('dark');
        localStorage.setItem('OdontoTheme', isDark ? 'dark' : 'light');
        syncThemeSlider();
    };
});
