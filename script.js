const MINIMO = 6;
const MAXIMO = 64;

const CONJUNTOS = {
  minusculas: "abcdefghijklmnopqrstuvwxyz",
  mayusculas: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  numeros: "0123456789",
  simbolos: "!@#$%&*?",
};

const rango = document.getElementById("rango");
const longitudInput = document.getElementById("longitud");
const aviso = document.getElementById("aviso");
const salida = document.getElementById("contrasena");
const barra = document.getElementById("barra");
const textoFuerza = document.getElementById("textoFuerza");

// Número aleatorio seguro (sin sesgo) usando crypto
function enteroAleatorio(max) {
  const limite = Math.floor(0x100000000 / max) * max;
  const buffer = new Uint32Array(1);
  let n;
  do {
    crypto.getRandomValues(buffer);
    n = buffer[0];
  } while (n >= limite);
  return n % max;
}

function caracterDe(texto) {
  return texto[enteroAleatorio(texto.length)];
}

// Valida la longitud y muestra advertencias si hace falta
function leerLongitud() {
  const texto = longitudInput.value.trim();
  const longitud = Number(texto);

  if (texto === "" || !Number.isInteger(longitud)) {
    aviso.textContent = "⚠️ Debes escribir un número entero. Intenta de nuevo.";
    return null;
  }
  if (longitud > MAXIMO) {
    aviso.textContent = `⚠️ Solo se aceptan hasta ${MAXIMO} caracteres como máximo. Intenta de nuevo.`;
    return null;
  }
  if (longitud < MINIMO) {
    aviso.textContent = `⚠️ El mínimo es ${MINIMO} caracteres. Intenta de nuevo.`;
    return null;
  }
  aviso.textContent = "";
  return longitud;
}

function generar() {
  const longitud = leerLongitud();
  if (longitud === null) return;

  // Siempre hay minúsculas; el resto según las casillas marcadas
  const elegidos = [CONJUNTOS.minusculas];
  if (document.getElementById("mayus").checked) elegidos.push(CONJUNTOS.mayusculas);
  if (document.getElementById("nums").checked) elegidos.push(CONJUNTOS.numeros);
  if (document.getElementById("simbolos").checked) elegidos.push(CONJUNTOS.simbolos);

  const todos = elegidos.join("");

  // Un carácter de cada tipo elegido para garantizar variedad
  const resultado = elegidos.map(caracterDe);
  while (resultado.length < longitud) {
    resultado.push(caracterDe(todos));
  }

  // Mezclar (Fisher-Yates)
  for (let i = resultado.length - 1; i > 0; i--) {
    const j = enteroAleatorio(i + 1);
    [resultado[i], resultado[j]] = [resultado[j], resultado[i]];
  }

  salida.textContent = resultado.join("");
  mostrarFuerza(longitud, todos.length, elegidos.length - 1);
}

function mostrarFuerza(longitud, tamanoConjunto, extras) {
  const entropia = longitud * Math.log2(tamanoConjunto);
  let nivel, color, ancho;

  // Sin mayúsculas, números ni símbolos la seguridad siempre es baja
  if (extras === 0 || entropia < 40) { nivel = "Baja"; color = "#ef4444"; ancho = 25; }
  else if (entropia < 60) { nivel = "Media"; color = "#f59e0b"; ancho = 50; }
  else if (entropia < 80) { nivel = "Alta"; color = "#22c55e"; ancho = 75; }
  else { nivel = "Muy alta"; color = "#10b981"; ancho = 100; }

  barra.style.width = ancho + "%";
  barra.style.background = color;
  textoFuerza.textContent = "Seguridad: " + nivel;
}

// Sincronizar el deslizador con el cuadro numérico (sin generar nada)
rango.addEventListener("input", () => {
  longitudInput.value = rango.value;
  leerLongitud();
});

longitudInput.addEventListener("input", () => {
  const valor = Number(longitudInput.value);
  if (Number.isInteger(valor) && valor >= MINIMO && valor <= MAXIMO) {
    rango.value = valor;
  }
  leerLongitud();
});

// La contraseña solo se genera al presionar el botón
document.getElementById("generar").addEventListener("click", generar);

document.getElementById("copiar").addEventListener("click", async (e) => {
  const texto = salida.textContent;
  if (!texto) return;
  try {
    await navigator.clipboard.writeText(texto);
    e.target.textContent = "✅";
    setTimeout(() => (e.target.textContent = "📋"), 1200);
  } catch (error) {
    aviso.textContent = "⚠️ No se pudo copiar. Selecciona la contraseña y cópiala a mano.";
  }
});