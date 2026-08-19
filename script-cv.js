document.addEventListener('DOMContentLoaded', () => {

  // ==========================================
  // 0. NAVEGACIÓN DESDE LANDING PAGE (cv-ia.html)
  // ==========================================
  const btnLlenarAhora = document.getElementById('btnLlenarAhora');
  const btnLlenarDatos = document.getElementById('btnLlenarDatos');

  btnLlenarAhora?.addEventListener('click', () => {
    window.location.href = 'formulario-cv.html';
  });

  btnLlenarDatos?.addEventListener('click', () => {
    window.location.href = 'formulario-cv.html';
  });


  // ==========================================
  // 1. VARIABLES Y CONTROL DEL FORMULARIO MULTI-PASO
  // ==========================================
  let pasoActual = 1;
  const totalPasos = 7;

  const titulosPasos = [
    { title: "1. Datos personales", subtitle: "Por favor completa tus datos personales aquí" },
    { title: "2. Experiencia", subtitle: "Añade tus puestos anteriores y logros más importantes" },
    { title: "3. Formación", subtitle: "Escribe tus títulos académicos y certificaciones" },
    { title: "4. Competencias", subtitle: "Indica tus habilidades técnicas y blandas principales" },
    { title: "5. Idiomas", subtitle: "Selecciona los idiomas que dominas y tu nivel" },
    { title: "6. Actividades extracurriculares", subtitle: "Agrega voluntariados, proyectos o logros personales" },
    { title: "7. Elige el diseño de tu CV", subtitle: "Selecciona la estructura visual para exportar" }
  ];

  // ELEMENTOS DE NAVEGACIÓN
  const btnAnterior = document.getElementById('btnAnterior');
  const btnSiguiente = document.getElementById('btnSiguiente');
  const stepTitle = document.getElementById('stepTitle');
  const stepSubtitle = document.getElementById('stepSubtitle');
  const progressBar = document.getElementById('progressBar');
  const stepCounter = document.getElementById('stepCounter');
  const navItems = document.querySelectorAll('.nav-item');

  function actualizarNavegacion(paso) {
    pasoActual = paso;

    // Actualizar secciones activas en el formulario
    document.querySelectorAll('.step-content').forEach((sec, idx) => {
      sec.classList.toggle('active', (idx + 1) === pasoActual);
    });

    // Actualizar sidebar
    navItems.forEach((item) => {
      const stepItem = parseInt(item.getAttribute('data-step'));
      item.classList.toggle('active', stepItem === pasoActual);
    });

    // Actualizar encabezados y progreso
    if (stepTitle) stepTitle.textContent = titulosPasos[pasoActual - 1].title;
    if (stepSubtitle) stepSubtitle.textContent = titulosPasos[pasoActual - 1].subtitle;
    if (progressBar) progressBar.style.width = `${(pasoActual / totalPasos) * 100}%`;
    if (stepCounter) stepCounter.textContent = `Paso ${pasoActual} de ${totalPasos}`;

    // Visibilidad de botones
    if (btnAnterior) btnAnterior.style.display = pasoActual === 1 ? 'none' : 'inline-block';
    
    if (btnSiguiente) {
      if (pasoActual === totalPasos) {
        btnSiguiente.style.display = 'none';
      } else {
        btnSiguiente.style.display = 'inline-block';
        const siguientePasoNombre = titulosPasos[pasoActual].title.split('.')[1];
        btnSiguiente.textContent = `Siguiente: ${siguientePasoNombre} →`;
      }
    }
  }

  btnSiguiente?.addEventListener('click', () => {
    if (pasoActual < totalPasos) actualizarNavegacion(pasoActual + 1);
  });

  btnAnterior?.addEventListener('click', () => {
    if (pasoActual > 1) actualizarNavegacion(pasoActual - 1);
  });

  navItems.forEach((item) => {
    item.addEventListener('click', () => {
      const paso = parseInt(item.getAttribute('data-step'));
      actualizarNavegacion(paso);
    });
  });


  // ==========================================
  // 2. EVENTOS DE ESCRITURA EN TIEMPO REAL (LIVE PREVIEW)
  // ==========================================
  const inputsDirectos = [
    { inputId: 'profesion', pvId: 'pvProfesion', defecto: 'Tu Profesión' },
    { inputId: 'correo', pvId: 'pvCorreo', defecto: 'correo@ejemplo.com' },
    { inputId: 'telefono', pvId: 'pvTelefono', defecto: '+00 0000 0000' },
    { inputId: 'experienciaTexto', pvId: 'pvExperiencia', defecto: 'Tu experiencia aparecerá aquí...' },
    { inputId: 'formacionTexto', pvId: 'pvFormacion', defecto: 'Tu educación aparecerá aquí...' },
    { inputId: 'competenciasTexto', pvId: 'pvCompetencias', defecto: 'Tus habilidades destacadas...' }
  ];

  inputsDirectos.forEach(item => {
    const input = document.getElementById(item.inputId);
    const pv = document.getElementById(item.pvId);

    if (input && pv) {
      input.addEventListener('input', () => {
        pv.textContent = input.value.trim() !== '' ? input.value : item.defecto;
      });
    }
  });

  // Nombre Completo
  const inputNombre = document.getElementById('nombre');
  const inputApellidos = document.getElementById('apellidos');
  const pvNombreCompleto = document.getElementById('pvNombreCompleto');

  function actualizarNombre() {
    if (!pvNombreCompleto) return;
    const nom = inputNombre ? inputNombre.value.trim() : '';
    const ape = inputApellidos ? inputApellidos.value.trim() : '';
    pvNombreCompleto.textContent = (nom || ape) ? `${nom} ${ape}` : 'Tu Nombre Aquí';
  }

  inputNombre?.addEventListener('input', actualizarNombre);
  inputApellidos?.addEventListener('input', actualizarNombre);

  // Localidad / Ubicación
  const inputLocalidad = document.getElementById('localidad');
  const pvUbicacion = document.getElementById('pvUbicacion');

  if (inputLocalidad && pvUbicacion) {
    inputLocalidad.addEventListener('input', () => {
      pvUbicacion.textContent = inputLocalidad.value.trim() !== '' ? inputLocalidad.value : 'Ciudad, País';
    });
  }

  // Actividades Extracurriculares
  const inputActividades = document.getElementById('actividadesTexto');
  const pvActividades = document.getElementById('pvActividades');
  const pvSectionActividades = document.getElementById('pvSectionActividades');

  if (inputActividades && pvActividades && pvSectionActividades) {
    inputActividades.addEventListener('input', () => {
      const val = inputActividades.value.trim();
      if (val !== '') {
        pvSectionActividades.style.display = 'block';
        pvActividades.textContent = val;
      } else {
        pvSectionActividades.style.display = 'none';
      }
    });
  }


  // ==========================================
  // 3. FOTO DE PERFIL EN VISTA PREVIA
  // ==========================================
  const fotoInput = document.getElementById('fotoInput');
  const photoPreview = document.getElementById('photoPreview');
  const pvPhotoContainer = document.getElementById('pvPhotoContainer');

  fotoInput?.addEventListener('change', (e) => {
    const archivo = e.target.files[0];
    if (archivo) {
      const reader = new FileReader();
      reader.onload = (evento) => {
        const imgHTML = `<img src="${evento.target.result}" alt="Foto CV">`;
        if (photoPreview) photoPreview.innerHTML = imgHTML;
        if (pvPhotoContainer) pvPhotoContainer.innerHTML = imgHTML;
      };
      reader.readAsDataURL(archivo);
    }
  });


  // ==========================================
  // 4. IDIOMAS DINÁMICOS EN VISTA PREVIA
  // ==========================================
  const idiomasLista = document.getElementById('idiomasLista');
  const btnAgregarIdioma = document.getElementById('btnAgregarIdioma');
  const pvIdiomas = document.getElementById('pvIdiomas');

  function renderizarIdiomasPreview() {
    if (!pvIdiomas) return;
    pvIdiomas.innerHTML = '';

    const filas = document.querySelectorAll('.idioma-row');
    filas.forEach(fila => {
      const selectNombre = fila.querySelector('.select-idioma-nombre');
      const selectNivel = fila.querySelector('.select-idioma-nivel');

      if (selectNombre && selectNivel) {
        const li = document.createElement('li');
        li.textContent = `${selectNombre.value} - ${selectNivel.value}`;
        pvIdiomas.appendChild(li);
      }
    });
  }

  function vincularEventosFilaIdioma(fila) {
    const selects = fila.querySelectorAll('select');
    selects.forEach(s => s.addEventListener('change', renderizarIdiomasPreview));

    const btnRemove = fila.querySelector('.btn-remove-idioma');
    btnRemove?.addEventListener('click', () => {
      if (document.querySelectorAll('.idioma-row').length > 1) {
        fila.remove();
        renderizarIdiomasPreview();
      }
    });
  }

  document.querySelectorAll('.idioma-row').forEach(vincularEventosFilaIdioma);

  btnAgregarIdioma?.addEventListener('click', () => {
    if (!idiomasLista) return;
    const nuevaFila = document.createElement('div');
    nuevaFila.className = 'idioma-row';
    nuevaFila.innerHTML = `
      <select class="custom-select select-idioma-nombre">
        <option value="Español">Español</option>
        <option value="Inglés" selected>Inglés</option>
        <option value="Alemán">Alemán</option>
        <option value="Ruso">Ruso</option>
        <option value="Francés">Francés</option>
        <option value="Italiano">Italiano</option>
        <option value="Portugués">Portugués</option>
        <option value="Chino Mandarín">Chino Mandarín</option>
      </select>

      <select class="custom-select select-idioma-nivel">
        <option value="Principiante">Principiante</option>
        <option value="Intermedio" selected>Intermedio</option>
        <option value="Avanzado">Avanzado</option>
        <option value="Bilingüe">Bilingüe</option>
        <option value="Nativo">Nativo</option>
      </select>

      <button type="button" class="btn-remove-idioma" title="Eliminar idioma">&times;</button>
    `;
    idiomasLista.appendChild(nuevaFila);
    vincularEventosFilaIdioma(nuevaFila);
    renderizarIdiomasPreview();
  });


  // ==========================================
  // 5. DESCARGAR PDF CON HTML2PDF
  // ==========================================
  const btnDescargarPDF = document.getElementById('btnDescargarPDF');

  btnDescargarPDF?.addEventListener('click', () => {
    const elementoCV = document.getElementById('cvPaper');
    if (!elementoCV) return;

    const opciones = {
      margin:       8,
      filename:     'Curriculum_Vitae.pdf',
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opciones).from(elementoCV).save();
  });

});