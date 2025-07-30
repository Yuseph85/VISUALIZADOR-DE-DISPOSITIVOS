let data = {};
const tipos = ["SD", "TD", "MD", "MR", "MS", "SLN"];
const lazos = ["L1", "L2", "L3"];
const circuitos = ["C1", "C2", "C3"];
const contraseña = "controlmatic2025";  // Puedes cambiar la contraseña aquí

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

// 🛡️ Verificación de contraseña antes de procesar el archivo
function procesarArchivo() {
  const ingreso = prompt("🔐 Ingrese la contraseña para continuar:");
  if (ingreso !== contraseña) {
    alert("❌ Contraseña incorrecta. No se cargará el archivo.");
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
    let esMetrado = true;

    for (let line of lines) {
      if (line.trim().match(/^E\d{2}/)) {
        esMetrado = false;
        break;
      }
    }

    if (esMetrado) {
      const num = parseFloat(lines[0].replace(",", "."));
      if (!isNaN(num)) {
        document.getElementById("metrado-total").textContent =
          `🔧 Longitud total: ${num.toFixed(2)} metros`;
      } else {
        document.getElementById("metrado-total").textContent = "❌ Archivo no válido.";
      }
      return;
    }

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

function vaciarTabla() {
  data = {};
  document.getElementById("fileInput").value = "";
  document.getElementById("fileName").textContent = "Ningún archivo seleccionado";
  document.getElementById("tabla-container").innerHTML = "";
  document.getElementById("metrado-total").textContent = "No se encontró metrado de tuberías.";
}

window.onload = generarTabla;
