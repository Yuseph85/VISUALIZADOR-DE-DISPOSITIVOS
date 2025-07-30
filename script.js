// 🧠 Esta función se activa al seleccionar un archivo
function pedirContrasena() {
  const password = prompt("🔒 Ingrese la contraseña para cargar archivo:");
  if (password !== "controlmatic2025") {
    alert("❌ Contraseña incorrecta. No se cargará el archivo.");
    document.getElementById("fileInput").value = "";
    document.getElementById("fileName").textContent = "Ningún archivo seleccionado";
  } else {
    const fileInput = document.getElementById("fileInput");
    document.getElementById("fileName").textContent = fileInput.files[0]?.name ?? "Ningún archivo";
  }
}

// Función para procesar el archivo seleccionado
function procesarArchivo() {
  const input = document.getElementById("fileInput");
  const archivo = input.files[0];

  if (!archivo) {
    alert("⚠️ Por favor, seleccione un archivo CSV.");
    return;
  }

  const lector = new FileReader();
  lector.onload = function (e) {
    const contenido = e.target.result;
    if (contenido.includes("LongitudTotal")) {
      mostrarMetrado(contenido);
    } else {
      mostrarTabla(contenido);
    }
  };
  lector.readAsText(archivo);
}

// Función para limpiar la visualización
function vaciarTabla() {
  document.getElementById("tabla-container").innerHTML = "";
  document.getElementById("metrado-total").innerHTML = "No se encontró metrado de tuberías.";
  document.getElementById("fileInput").value = "";
  document.getElementById("fileName").textContent = "Ningún archivo seleccionado";
}

// Mostrar tabla de dispositivos por circuito
function mostrarTabla(data) {
  const lineas = data.trim().split("\n");
  const codigos = lineas.map(l => l.split(";")[0]);

  const tipos = ["SD", "TD", "MD", "MR", "MS", "SLN"];
  const lazos = ["L1C1", "L1C2", "L1C3", "L2C1", "L2C2", "L2C3", "L3C1", "L3C2", "L3C3"];
  const matriz = {};

  lazos.forEach(lazo => {
    matriz[lazo] = {};
    tipos.forEach(tipo => matriz[lazo][tipo] = 0);
  });

  codigos.forEach(codigo => {
    tipos.forEach(tipo => {
      lazos.forEach(lazo => {
        if (codigo.includes(tipo) && codigo.includes(lazo)) {
          matriz[lazo][tipo]++;
        }
      });
    });
  });

  let html = "<table><thead><tr><th>CIRCUITO</th>";
  tipos.forEach(tipo => html += `<th>${tipo}</th>`);
  html += "</tr></thead><tbody>";

  const resumen = {};
  tipos.forEach(tipo => resumen[tipo] = 0);

  ["L1", "L2", "L3"].forEach(lazo => {
    const sublazos = lazos.filter(l => l.startsWith(lazo));
    sublazos.forEach(sub => {
      html += `<tr><td>${sub}</td>`;
      tipos.forEach(tipo => {
        const val = matriz[sub][tipo];
        html += `<td>${val > 0 ? `<span style="color:red">${val}</span>` : val}</td>`;
        resumen[tipo] += val;
      });
      html += "</tr>";
    });
    html += `<tr><td><strong>${lazo}</strong></td>` + tipos.map(() => "<td></td>").join("") + "</tr>";
  });

  html += "<tr><td><strong>TOTAL</strong></td>";
  tipos.forEach(tipo => {
    html += `<td><strong style="color:darkblue">${resumen[tipo]}</strong></td>`;
  });
  html += "</tr></tbody></table>";

  document.getElementById("tabla-container").innerHTML = html;
}

// Mostrar metrado de tuberías
function mostrarMetrado(data) {
  const filas = data.trim().split("\n");
  if (filas.length < 2) {
    document.getElementById("metrado-total").innerHTML = "⚠️ Formato de metrado no válido.";
    return;
  }
  const valor = filas[1].split(";")[0].trim();
  document.getElementById("metrado-total").innerHTML = `<span style="color:red; font-size: 22px;">${valor} metros</span>`;
}
