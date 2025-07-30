let data = {};
const tipos = ["SD", "TD", "MD", "MR", "MS", "SLN"];
const lazos = ["L1", "L2", "L3"];
const circuitos = ["C1", "C2", "C3"];

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
    tabla += `<tr style='font-weight:bold'><td>${lazo}</td>`;
    tipos.forEach(t => {
      let total = circuitos.reduce((sum, c) => sum + (data[`${lazo}${c}`]?.[t] ?? 0), 0);
      tabla += `<td>${total}</td>`;
    });
    tabla += "</tr>";
  });

  tabla += "<tr style='font-weight:bold'><td>TOTAL</td>";
  tipos.forEach(t => {
    let total = lazos.reduce((sumL, lazo) =>
      sumL + circuitos.reduce((sumC, c) => sumC + (data[`${lazo}${c}`]?.[t] ?? 0), 0), 0);
    tabla += `<td>${total}</td>`;
  });
  tabla += "</tr></table>";

  document.getElementById("tabla-container").innerHTML = tabla;
}

function procesarArchivo() {
  const password = prompt("🔒 Ingrese la contraseña:");
  if (password !== "controlmatic2025") {
    alert("❌ Contraseña incorrecta. Acceso denegado.");
    return;
  }

  const fileInput = document.getElementById("fileInput");
  const file = fileInput.files[0];
  if (!file) return;
  document.getElementById("fileName").textContent = file.name;

  const reader = new FileReader();
  reader.onload = function (e) {
    const lines = e.target.result.split(/\r?\n/);
    data = {};
    let metrado = null;

    lines.forEach(line => {
      const cleanLine = line.trim();
      if (!cleanLine) return;

      // Detectar si es un número (metrado de tuberías)
      if (!isNaN(cleanLine)) {
        metrado = parseFloat(cleanLine);
        return;
      }

      // Detectar si es código de dispositivo
      const match = cleanLine.match(/E\d{2}([A-Z]+)(L\dC\d)/);
      if (match) {
        const tipo = match[1];
        const lazo = match[2];
        if (!data[lazo]) data[lazo] = {};
        if (!data[lazo][tipo]) data[lazo][tipo] = 0;
        data[lazo][tipo]++;
      }
    });

    generarTabla();

    // Mostrar metrado si existe
    const metradoElem = document.getElementById("metrado-total");
    if (metradoElem) {
      if (metrado !== null) {
        metradoElem.textContent = `📏 ${metrado.toFixed(2)} metros de tubería`;
      } else {
        metradoElem.textContent = "No se encontró metrado de tuberías.";
      }
    }
  };
  reader.readAsText(file);
}

function vaciarTabla() {
  data = {};
  document.getElementById("fileInput").value = "";
  document.getElementById("fileName").textContent = "Ningún archivo seleccionado";
  document.getElementById("tabla-container").innerHTML = "";
  const metradoElem = document.getElementById("metrado-total");
  if (metradoElem) metradoElem.textContent = "No se encontró metrado de tuberías.";
}

window.onload = generarTabla;

