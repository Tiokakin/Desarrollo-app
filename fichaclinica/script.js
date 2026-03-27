document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('patientForm');

    // Cargar datos previos si existen
    const cargarSesion = () => {
        try {
            const sesionStr = localStorage.getItem('SesionClinica');
            if (sesionStr) {
                const sesion = JSON.parse(sesionStr);
                document.getElementById('nombre').value = sesion.paciente || '';
                document.getElementById('rut').value = sesion.rut || '';
                document.getElementById('edad').value = sesion.edad || '';
                document.getElementById('genero').value = sesion.genero || 'Masculino';
                document.getElementById('contacto').value = sesion.contacto || '';
                document.getElementById('prevision').value = sesion.prevision || '';
                document.getElementById('ocupacion').value = sesion.ocupacion || '';
                
                document.getElementById('motivo_actual').value = sesion.motivo_actual || '';
                document.getElementById('ultima_visita').value = sesion.ultima_visita || '';
                document.getElementById('motivo_ultima_visita').value = sesion.motivo_ultima_visita || '';

                document.getElementById('alergias').value = sesion.alergias || '';
                document.getElementById('enfermedades').value = sesion.enfermedades || '';
                document.getElementById('farmacos').value = sesion.farmacos || '';
                document.getElementById('antecedentes_familiares').value = sesion.antecedentes_familiares || '';

                document.getElementById('habitos').value = sesion.habitos || '';
                document.getElementById('evaluacion_psicologica').value = sesion.evaluacion_psicologica || '';
                document.getElementById('expectativas').value = sesion.expectativas || '';
                document.getElementById('riesgo_social').value = sesion.riesgo_social || '';
            }
        } catch (e) {
            console.error('Error cargando sesión', e);
        }
    };

    // Guardar datos
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        const data = {
            paciente: document.getElementById('nombre').value,
            rut: document.getElementById('rut').value,
            edad: document.getElementById('edad').value,
            genero: document.getElementById('genero').value,
            contacto: document.getElementById('contacto').value,
            prevision: document.getElementById('prevision').value,
            ocupacion: document.getElementById('ocupacion').value,

            motivo_actual: document.getElementById('motivo_actual').value,
            ultima_visita: document.getElementById('ultima_visita').value,
            motivo_ultima_visita: document.getElementById('motivo_ultima_visita').value,

            alergias: document.getElementById('alergias').value,
            enfermedades: document.getElementById('enfermedades').value,
            farmacos: document.getElementById('farmacos').value,
            antecedentes_familiares: document.getElementById('antecedentes_familiares').value,

            habitos: document.getElementById('habitos').value,
            evaluacion_psicologica: document.getElementById('evaluacion_psicologica').value,
            expectativas: document.getElementById('expectativas').value,
            riesgo_social: document.getElementById('riesgo_social').value,
        };

        localStorage.setItem('SesionClinica', JSON.stringify(data));
        
        // Alerta visual de guardado
        const boton = form.querySelector('button[type="submit"]') || document.querySelector('button[form="patientForm"]');
        const textoOriginal = boton.innerHTML;
        boton.innerHTML = "✅ ¡Guardado y Sincronizado!";
        boton.classList.replace('bg-blue-600', 'bg-emerald-500');
        boton.classList.replace('hover:bg-blue-700', 'hover:bg-emerald-600');
        
        setTimeout(() => {
            boton.innerHTML = textoOriginal;
            boton.classList.replace('bg-emerald-500', 'bg-blue-600');
            boton.classList.replace('hover:bg-emerald-600', 'hover:bg-blue-700');
        }, 2000);
    });

    cargarSesion();
});
