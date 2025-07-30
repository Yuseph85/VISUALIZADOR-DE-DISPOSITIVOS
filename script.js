let data = {};

// Tipos de dispositivos esperados
const tipos = ["SD", "TD", "MD", "MR", "MS", "SLN"];

// Lazos y circuitos
const lazos = ["L1", "L2", "L3"];
const circuitos = ["C1", "C2", "C3"];

// Genera la tabla con los datos procesados
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
    // Fila de totales por lazo
    tabla += `<tr style='font-weight:bold'><td>${lazo}</td>`;
    tipos.forEach(t => {
      let total = circuitos.reduce((sum, c) => sum + (data[`${lazo}${c}`]?.[t] ?? 0), 0);
      tabla += `<td>${total}</td>`;
    });
    tabla += "</tr>";
  });

  // Fila final de total general
  tabla += "<tr style='font-weight:bold'><td>TOTAL</td>";
  tipos.forEach(t => {
    let total = lazos.reduce((sumL, lazo) =>
      sumL + circuitos.reduce((sumC, c) => sumC + (data[`${lazo}${c}`]?.[t] ?? 0), 0), 0);
    tabla += `<td>${total}</td>`;
  });
  tabla += "</tr></table>";

  document.getElementById("tabla-container").innerHTML = tabla;
}

// Procesa el archivo cargado
function procesarArchivo() {
  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return;

  document.getElementById("fileName").textContent = file.name;

  const reader = new FileReader();
  reader.onload = function (e) {
    const content = e.target.result.trim();
    const lines = content.split(/\r?\n/);
    data = {};

    // 📌 Si es un archivo de metrado de tuberías
    if (
      lines.length === 2 &&
      lines[0].toLowerCase().includes("longitudtotal") &&
      !isNaN(parseFloat(lines[1]))
    ) {
      const total = parseFloat(lines[1]).toFixed(2);
      document.getElementById("metrado-total").textContent = `${total} metros`;
      document.getElementById("metrado-total").style.color = "red";
      return;
    }

    // 📌 Si es un archivo de códigos de dispositivos
    lines.forEach(line => {
      const code = line.trim();
      if (!code) return;
      const match = code.match(/E\d{2}([A-Z]+)(L\dC\d)/);
      if (match) {
        const tipo = match[1];
        const lazo = match[2];
        if (!data[lazo]) data[lazo] = {};
        if (!data[lazo][tipo]) data[lazo][tipo] = 0;
        data[lazo][tipo]++;
      }
    });

    generarTabla();
  };

  reader.readAsText(file);
}

// Vacía los datos y la tabla
function vaciarTabla() {
  data = {};
  document.getElementById("fileInput").value = "";
  document.getElementById("fileName").textContent = "Ningún archivo seleccionado";
  document.getElementById("metrado-total").textContent = "No se encontró metrado de tuberías.";
  document.getElementById("metrado-total").style.color = "darkblue";
  generarTabla();
}

// Ejecutar al cargar la página
window.onload = generarTabla;
