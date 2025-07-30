// Datos de dispositivos por lazo
let data = {};

// Tipos de dispositivos esperados
const tipos = ["SD", "TD", "MD", "MR", "MS", "SLN"];
const lazos = ["L1", "L2", "L3"];
const circuitos = ["C1", "C2", "C3"];

// Genera la tabla de dispositivos por lazo
function generarTabla() {
  let tabla = "<table><tr><th>CIRCUITO</th>";
  tipos.forEach(t => tabla += `<th>${t}</th>`);
  tabla += "</tr>";

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
    // Fila de subtotal por lazo
    tabla += `<tr style='font-weight:bold'><td>${lazo}</td>`;
    tipos.forEach(t => {
      let total = circuitos.reduce((sum, c) => sum + (data[`${lazo}${c}`]?.[t] ?? 0), 0);
      tabla += `<td>${total}</td>`;
    });
    tabla += "</tr>";
  });

  // Fila total general
  tabla += "<tr style='font-weight:bold'><td>TOTAL</td>";
  tipos.forEach(t => {
    let total = lazos.reduce((sumL, lazo) =>
      sumL + circuitos.reduce((sumC, c) => sumC + (data[`${lazo}${c}`]?.[t] ?? 0), 0), 0);
    tabla += `<td>${total}</td>`;
  });
  tabla += "</tr></table>";

  document.getElementById("tabla-container").innerHTML = tabla;
}

// Procesa archivo .csv cargado por el usuario
function procesarArchivo() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return;

  document.getElementById("fileName").textContent = file.name;

  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split(/\r?\n/);
    data = {};
    let tuberiaTotal = null;

    lines.forEach(line => {
      const code = line.trim();
      if (!code) return;

      // Detecta si es una línea de tubería
      const tuberiaMatch = code.match(/^\[SL\] Longitud total seleccionada: ([\d.]+) metros\./);
      if (tuberiaMatch) {
        tuberiaTotal = parseFloat(tuberiaMatch[1]).toFixed(2);
      }

      // Detecta si es un dispositivo con código E...
      const match = code.match(/E\d{2}([A-Z]+)(L\dC\d)/);
      if (match) {
        const tipo = match[1];
        const lazo = match[2];
        if (!data[lazo]) data[lazo] = {};
        if (!data[lazo][tipo]) data[lazo][tipo] = 0;
        data[lazo][tipo]++;
      }
    });

    // Muestra el metrado de tuberías si fue detectado
    const tuberiaText = tuberiaTotal
      ? `${tuberiaTotal} metros`
      : "No se encontró metrado de tuberías.";
    document.getElementById("metrado-total").textContent = tuberiaText;

    generarTabla();
  };
  reader.readAsText(file);
}

// Vacía todos los datos y reinicia la tabla
function vaciarTabla() {
  data = {};
  document.getElementById("fileInput").value = "";
  document.getElementById("fileName").textContent = "Ningún archivo seleccionado";
  document.getElementById("metrado-total").textContent = "No se ha cargado ningún metrado.";
  generarTabla();
}

// Inicializa la tabla al cargar la página
window.onload = generarTabla;
