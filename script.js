// Objeto que almacenará los datos de dispositivos por lazo y tipo
let data = {};

// Tipos de dispositivos esperados
const tipos = ["SD", "TD", "MD", "MR", "MS", "SLN"];

// Lazos y circuitos definidos
const lazos = ["L1", "L2", "L3"];
const circuitos = ["C1", "C2", "C3"];

// Variable global para guardar el metrado total de tuberías
let totalLongitud = 0;

/**
 * Genera y muestra la tabla de dispositivos por circuito y los totales
 */
function generarTabla() {
  let tabla = "<table><tr><th>CIRCUITO</th>";
  tipos.forEach(t => tabla += `<th>${t}</th>`);
  tabla += "</tr>";

  // Carga por circuito (ej. L1C1, L1C2...)
  lazos.forEach(lazo => {
    circuitos.forEach(c => {
      let key = `${lazo}${c}`;
      tabla += `<tr><td>${key}</td>`;
      tipos.forEach(t => {
        let val = data[key]?.[t] ?? 0;
        tabla += `<td>${val}</td>`;
      });
      tabla += "</tr>";
    });

    // Totales por lazo (L1, L2, L3)
    tabla += `<tr style='font-weight:bold'><td>${lazo}</td>`;
    tipos.forEach(t => {
      let total = circuitos.reduce((sum, c) => sum + (data[`${lazo}${c}`]?.[t] ?? 0), 0);
      tabla += `<td>${total}</td>`;
    });
    tabla += "</tr>";
  });

  // Totales generales
  tabla += "<tr style='font-weight:bold'><td>TOTAL</td>";
  tipos.forEach(t => {
    let total = lazos.reduce((sumL, lazo) =>
      sumL + circuitos.reduce((sumC, c) => sumC + (data[`${lazo}${c}`]?.[t] ?? 0), 0), 0);
    tabla += `<td>${total}</td>`;
  });
  tabla += "</tr></table>";

  // Muestra la tabla generada
  document.getElementById("tabla-container").innerHTML = tabla;

  // Muestra el metrado si está disponible
  document.getElementById("metrado-total").textContent = totalLongitud > 0
    ? `${totalLongitud.toFixed(2)} metros`
    : "No se ha cargado ningún metrado.";
}

/**
 * Procesa el archivo CSV cargado y llena los datos de dispositivos + metrado
 */
function procesarArchivo() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return;

  document.getElementById("fileName").textContent = file.name;

  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split(/\r?\n/);
    data = {};
    totalLongitud = 0; // Reinicia metrado

    lines.forEach(line => {
      const code = line.trim();
      if (!code) return;

      // 🔍 Buscar patrón de metrado de tuberías (ej: [SL] Longitud total seleccionada: 2306.00 metros.)
      const matchLongitud = code.match(/\[SL\] Longitud total seleccionada: (\d+\.\d+)/);
      if (matchLongitud) {
        totalLongitud = parseFloat(matchLongitud[1]);
        return;
      }

      // Buscar patrón de dispositivos (ej: E04SDL1C1XXX)
      const match = code.match(/E\d{2}([A-Z]+)(L\dC\d)/);
      if (match) {
        const tipo = match[1];
        const lazo = match[2];
        if (!data[lazo]) data[lazo] = {};
        if (!data[lazo][tipo]) data[lazo][tipo] = 0;
        data[lazo][tipo]++;
      }
    });

    // Mostrar resultados
    generarTabla();
  };

  // Leer archivo
  reader.readAsText(file);
}

/**
 * Limpia toda la tabla y campos cargados
 */
function vaciarTabla() {
  data = {};
  totalLongitud = 0;
  document.getElementById("fileInput").value = "";
  document.getElementById("fileName").textContent = "Ningún archivo seleccionado";
  document.getElementById("metrado-total").textContent = "No se ha cargado ningún metrado.";
  generarTabla();
}

// Ejecutar al cargar la página
window.onload = generarTabla;
