document.addEventListener('DOMContentLoaded', () => {

  // 1. Redirección desde la landing de bienvenida (si los botones existen)
  const btnEmpezarCV = document.getElementById('btnEmpezarCV');
  const btnIrAFormulario = document.getElementById('btnIrAFormulario');

  function irAlFormulario() {
    window.location.href = 'formulario-cv.html';
  }

  if (btnEmpezarCV) btnEmpezarCV.addEventListener('click', irAlFormulario);
  if (btnIrAFormulario) btnIrAFormulario.addEventListener('click', irAlFormulario);


  // 2. Control de la interfaz interactiva del Formulario
  const navItems = document.querySelectorAll('.sidebar-menu .nav-item[data-step]');
  const stepTitle = document.querySelector('.step-title');
  const stepSubtitle = document.querySelector('.step-subtitle');
  const progressBar = document.querySelector('.progress-bar');
  const stepCounter = document.querySelector('.step-counter');
  const btnSiguiente = document.getElementById('btnSiguienteExperiencia');

  // Mapeo de información y textos por cada paso
  const pasosInfo = {
    1: {
      titulo: '1. Datos personales',
      subtitulo: 'Por favor completa tus datos personales aquí',
      siguienteTexto: 'Siguiente: Experiencia →'
    },
    2: {
      titulo: '2. Experiencia laboral',
      subtitulo: 'Añade tus empleos previos y funciones más destacadas',
      siguienteTexto: 'Siguiente: Formación →'
    },
    3: {
      titulo: '3. Formación académica',
      subtitulo: 'Ingresa tus estudios, grados y certificaciones',
      siguienteTexto: 'Siguiente: Competencias →'
    },
    4: {
      titulo: '4. Competencias y habilidades',
      subtitulo: 'Indica tus fortalezas técnicas y habilidades blandas',
      siguienteTexto: 'Siguiente: Idiomas →'
    },
    5: {
      titulo: '5. Idiomas',
      subtitulo: 'Añade los idiomas que dominas y tu nivel de fluidez',
      siguienteTexto: 'Siguiente: Actividades extracurriculares →'
    },
    6: {
      titulo: '6. Actividades extracurriculares',
      subtitulo: 'Menciona proyectos, voluntariados o logros adicionales',
      siguienteTexto: 'Siguiente: Elige el diseño de tu CV →'
    },
    7: {
      titulo: '7. Elige el diseño de tu CV',
      subtitulo: 'Selecciona la plantilla visual para exportar tu currículum',
      siguienteTexto: '✨ Generar y optimizar con IA'
    }
  };

  let pasoActual = 1;

  // Función para cambiar de paso
  function cambiarPaso(numeroPaso) {
    const paso = parseInt(numeroPaso, 10);
    if (!pasosInfo[paso]) return;

    pasoActual = paso;

    // Actualizar clase activa en la sidebar
    navItems.forEach(item => {
      if (parseInt(item.getAttribute('data-step'), 10) === pasoActual) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });

    // Actualizar encabezados
    if (stepTitle) stepTitle.textContent = pasosInfo[pasoActual].titulo;
    if (stepSubtitle) stepSubtitle.textContent = pasosInfo[pasoActual].subtitulo;

    // Actualizar barra de progreso (1/7 = 14.28%, 7/7 = 100%)
    const porcentaje = Math.round((pasoActual / 7) * 100);
    if (progressBar) progressBar.style.width = `${porcentaje}%`;
    if (stepCounter) stepCounter.textContent = `Paso ${pasoActual} de 7`;

    // Actualizar texto del botón Siguiente
    if (btnSiguiente) {
      btnSiguiente.textContent = pasosInfo[pasoActual].siguienteTexto;
    }
  }

  // Click en las opciones de la barra lateral
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const step = item.getAttribute('data-step');
      if (step) cambiarPaso(step);
    });
  });

  // Click en el botón principal "Siguiente"
  if (btnSiguiente) {
    btnSiguiente.addEventListener('click', () => {
      if (pasoActual < 7) {
        cambiarPaso(pasoActual + 1);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        alert('¡Formulario completado! En el siguiente paso procesaremos la optimización de tu CV con Inteligencia Artificial.');
      }
    });
  }

  // Listener para el selector de Idioma
  const idiomaSelect = document.getElementById('idiomaCv');
  if (idiomaSelect) {
    idiomaSelect.addEventListener('change', (e) => {
      const idioma = e.target.value;
      console.log(`Idioma del CV cambiado a: ${idioma}`);
    });
  }

});