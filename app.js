/* ====== Utilidades RUT (módulo 11) ====== */
function calcularDV(cuerpoStr){
  const cuerpo = String(cuerpoStr).replace(/\D/g,'');
  if (!cuerpo) return null;
  let suma = 0, mult = 2;
  for (let i = cuerpo.length - 1; i >= 0; i--) {
    suma += Number(cuerpo[i]) * mult;
    mult = mult === 7 ? 2 : mult + 1;
  }
  const resto = 11 - (suma % 11);
  return resto === 11 ? '0' : (resto === 10 ? 'K' : String(resto));
}

function formatearCuerpo(cuerpo){
  let s = String(cuerpo).replace(/\D/g,'');
  if (!s) return '';
  let out = '';
  while (s.length > 3){
    out = '.' + s.slice(-3) + out;
    s = s.slice(0, -3);
  }
  return s + out;
}

/* ====== UI ====== */
const $cuerpo = document.getElementById('cuerpo');
const $dv = document.getElementById('dv');
const $rutFmt = document.getElementById('rutFmt');
const $estado = document.getElementById('estado');
const $tablaWrap = document.getElementById('tablaWrap');
const $btnCopiar = document.getElementById('btnCopiar');
const $btnLimpiar = document.getElementById('btnLimpiar');

$cuerpo.addEventListener('input', ()=>{
  // Sanitiza y limita a 9 dígitos
  const limpio = $cuerpo.value.replace(/\D/g,'').slice(0,9);
  if ($cuerpo.value !== limpio) $cuerpo.value = limpio;

  if (!limpio) {
    $dv.textContent = '—';
    $rutFmt.textContent = '—';
    $estado.textContent = 'Ingresa el cuerpo para calcular.';
    $estado.className = 'muted';
    $tablaWrap.innerHTML = '';
    $btnCopiar.disabled = true;
    return;
  }
  const dv = calcularDV(limpio);
  $dv.textContent = dv ?? '—';
  const fmt = `${formatearCuerpo(limpio)}-${dv ?? ''}`;
  $rutFmt.textContent = dv ? fmt : '—';
  $btnCopiar.disabled = !dv;

  // Estado y validación suave (longitud sugerida)
  if (limpio.length < 7){
    $estado.textContent = 'Cuerpo corto. Recomendado 7–9 dígitos para RUT reales.';
    $estado.className = 'warn';
  } else {
    $estado.textContent = 'Cálculo correcto (módulo 11).';
    $estado.className = 'ok';
  }

  // Render paso a paso
  renderTabla(limpio);
});

$btnCopiar.addEventListener('click', async ()=>{
  const texto = $rutFmt.textContent;
  try{
    await navigator.clipboard.writeText(texto);
    $btnCopiar.textContent = '¡Copiado!';
    setTimeout(()=> $btnCopiar.textContent = 'Copiar', 1200);
  }catch{
    alert('No se pudo copiar automáticamente. Selecciona y copia manualmente.');
  }
});

$btnLimpiar.addEventListener('click', ()=>{
  $cuerpo.value = '';
  $cuerpo.dispatchEvent(new Event('input'));
  $cuerpo.focus();
});

function renderTabla(cuerpo){
  // Calcula pesos y productos
  const digits = String(cuerpo).split('').map(n=>Number(n));
  const pesos = [];
  for (let i=digits.length-1, m=2; i>=0; i--){
    pesos[i] = m;
    m = m === 7 ? 2 : m + 1;
  }
  const productos = digits.map((d,i)=> d * pesos[i]);
  const suma = productos.reduce((a,b)=>a+b,0);
  const mod = suma % 11;
  const resto = 11 - mod;
  const dv = resto === 11 ? '0' : (resto === 10 ? 'K' : String(resto));

  const rows = digits.map((d,i)=>`
    <tr>
      <td>${i+1}</td>
      <td>${d}</td>
      <td>${pesos[i]}</td>
      <td>${d} × ${pesos[i]}</td>
      <td>${productos[i]}</td>
    </tr>`).join('');

  $tablaWrap.innerHTML = `
    <table aria-label="Tabla paso a paso">
      <thead>
        <tr><th>#</th><th>Dígito</th><th>Peso</th><th>Producto</th><th>Parcial</th></tr>
      </thead>
      <tbody>${rows}</tbody>
      <tfoot>
        <tr><td colspan="4" style="text-align:right;font-weight:700">Suma</td><td><strong>${suma}</strong></td></tr>
        <tr><td colspan="4" style="text-align:right">Suma % 11</td><td>${mod}</td></tr>
        <tr><td colspan="4" style="text-align:right">Resto (11 - %)</td><td>${resto}</td></tr>
        <tr><td colspan="4" style="text-align:right;font-weight:800">DV</td><td><strong>${dv}</strong></td></tr>
      </tfoot>
    </table>`;
}

// Estado inicial
$cuerpo.dispatchEvent(new Event('input'));