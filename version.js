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
});
