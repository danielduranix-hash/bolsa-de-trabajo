document.addEventListener('DOMContentLoaded', () => {
  const btnEmpezarCV = document.getElementById('btnEmpezarCV');
  const btnIrAFormulario = document.getElementById('btnIrAFormulario');

  function irAlSiguientePaso() {
    // Aquí pondremos el redireccionamiento al formulario de datos personales en el futuro
    alert("Próximamente: Redirigiendo a la pantalla para llenar datos personales.");
  }

  if (btnEmpezarCV) btnEmpezarCV.addEventListener('click', irAlSiguientePaso);
  if (btnIrAFormulario) btnIrAFormulario.addEventListener('click', irAlSiguientePaso);
});