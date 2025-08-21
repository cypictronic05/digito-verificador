# Calculadora de Dígito Verificador (RUT) — README

Calculadora **HTML + CSS + JS**  que calcula el **dígito verificador (DV)** del **RUT** usando el algoritmo **módulo 11**. Incluye una vista *paso a paso* que muestra los pesos aplicados, los productos y la suma, para que puedas **enseñar** y **auditar** el cálculo.

> **Propósito**: educación y validación local en frontend. No almacena datos ni hace peticiones externas.

---

## 🔗 Demo local (cómo ejecutar)
1. Guarda el archivo `index.html` (el de la respuesta anterior).
2. Abre `index.html` en tu navegador (doble clic). **No requiere servidor**.
3. Escribe el **cuerpo** del RUT (solo dígitos). La app:
   - Calcula el **DV** al instante.
   - Muestra el **RUT formateado** `12.345.678-5`.
   - Despliega una **tabla paso a paso** con pesos, productos, suma, resto y DV.

> Sugerencia: proyecta la tabla “paso a paso” cuando des una clase.

---

## 🧮 Fundamento teórico — *Aritmética modular (módulo 11)*

El DV del RUT se obtiene con una suma ponderada y reducción módulo 11. Es un **mecanismo de detección de errores** (tipeo y algunas transposiciones), **no** de seguridad.

### Notación
- Sea el cuerpo del RUT un vector de dígitos:  
  \( \mathbf{d} = (d_1, d_2, \dots, d_n) \) de **izquierda a derecha**.
- Sea la **secuencia de pesos** \( \mathbf{w} = (w_1, w_2, \dots, w_n) \) tal que al **dígito más a la derecha** (\( d_n \)) se le asigna el peso **2**, y hacia la izquierda se incrementa cíclicamente **2,3,4,5,6,7,2,3,…**.

### Suma ponderada
\[
S \;=\; \sum_{i=1}^{n} d_i \cdot w_i
\]

### Resto y DV
1. Calcula \( r = 11 - (S \bmod 11) \).
2. Mapea el **resto** \( r \) a **DV**:
   - Si \( r = 11 \) → DV = `0`
   - Si \( r = 10 \) → DV = `K` (equivale a 10)
   - En otro caso → DV = \( r \)

### Propiedad de verificación (razón de ser)
Si interpretamos `K` como **10**, entonces el **número DV** \( \tilde{d} \in \{0,1,\dots,10\} \) cumple:
\[
(S + \tilde{d}) \bmod 11 \;=\; 0
\]
Es decir, **suma ponderada + DV ≡ 0 (mod 11)**. Por eso, si un dígito cambia o se transponen dos adyacentes, lo normal es que la congruencia se rompa y el DV **no coincida**.

> **Complejidad:** \( \mathcal{O}(n) \) en tiempo y \( \mathcal{O}(1) \) en memoria.

---

## 📝 Ejemplos manuales (paso a paso)

### 1) Ejemplo con DV = 5
**Cuerpo:** `12345678`  
**Pesos derecha→izquierda:** 2, 3, 4, 5, 6, 7, 2, 3  

| Dígito | Peso | Producto |
|:-----:|:----:|:--------:|
| 8 | 2 | 16 |
| 7 | 3 | 21 |
| 6 | 4 | 24 |
| 5 | 5 | 25 |
| 4 | 6 | 24 |
| 3 | 7 | 21 |
| 2 | 2 | 4  |
| 1 | 3 | 3  |

**Suma** \( S = 138 \) → \( 138 \bmod 11 = 6 \) → \( r = 11 - 6 = 5 \) → **DV = 5**.  
**RUT**: `12.345.678-5`.

### 2) Ejemplo con DV = K
**Cuerpo:** `15345678`  

Pesos y productos → **Suma** \( S = 144 \) → \( 144 \bmod 11 = 1 \) → \( r = 11 - 1 = 10 \) → **DV = K** (porque 10 ≡ `K`).

### 3) Ejemplo con DV = 0
**Cuerpo:** `7645123`  

Suma y módulo → \( S \bmod 11 = 0 \) → \( r = 11 \) → **DV = 0**.

---

## 🔧 Implementación (JavaScript)

> El proyecto es un único archivo con HTML, CSS y JS. Aquí se listan las funciones **clave** que usa la UI.

```js
// Calcula DV a partir del cuerpo (solo dígitos)
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

// Formatea el cuerpo con puntos y agrega el DV calculado
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

La UI además construye una **tabla pedagógica** con:
- **Pesos** aplicados a cada dígito.
- **Productos** por posición.
- **Suma total**.
- **Módulo** \( S \bmod 11 \).
- **Resto** \( r = 11 - (S \bmod 11) \).
- **DV** final (con el mapeo `10 → K`, `11 → 0`).

---

## ✅ Validaciones y UX

- Entrada **sanitizada**: se eliminan caracteres no numéricos; longitud máxima 9 dígitos.
- Mensaje de **longitud recomendada** (7–9 dígitos) para RUT reales.
- **Copia al portapapeles** del RUT formateado.
- **Accesibilidad**: roles/labels ARIA, contraste alto, y diseño *responsive*.

---

## 🔐 Privacidad y uso responsable
- El RUT es **dato personal**. Úsalo con base legal o consentimiento.
- Evita registrar (logs) RUT en claro; si necesitas, **enmascara** (`12.345.***-*`).
- Esta demo **no** envía datos a ningún servidor.

---

## 🧭 Cómo explicar el algoritmo en clase (guion rápido)

1. **Motivación**: por qué existe un dígito verificador (detectar errores humanos).
2. **Intuición**: suma ponderada + módulo 11 → “ajustar” con un DV que haga resto 0.
3. **Paso a paso** con un ejemplo (DV=K para que sea memorable).
4. **Propiedad**: \( (S + \tilde{d}) \bmod 11 = 0 \) con \( \tilde{d} = 10 \) si DV=K.
5. **Implementación**: 10–15 líneas de JS; complejidad lineal.
6. **Buenas prácticas**: sanitizar, enmascarar, validar en front y back.
7. **Comparativas**: ISBN-10 (mod 11), IBAN (mod 97), CRC (tramas binarias).

---

## 🧪 Pruebas manuales sugeridas

- **Entrada vacía** → sin DV.
- **Longitudes** 6, 7, 8, 9 dígitos (comportamiento esperado).
- **Caso `K`**: asegura que `10 → 'K'`.
- **Caso `0`**: cuando \( S \bmod 11 = 0 \).
- **No dígitos**: se eliminan automáticamente.
- **Grandes cantidades**: probar miles de aleatorios y verificar que el algoritmo siempre produce un DV válido (se puede hacer en consola).

---

## ↗️ Extensiones posibles
- **RIF (Venezuela)**: variante de módulo 11 con mapeo de letra inicial y pesos fijos.  
- **Validador completo**: aceptar `12.345.678-5`, con o sin puntos/guion, verificando que el DV coincida.  
- **Paquete NPM** o pequeño API para backends.

---

## 🌐 Redes sociales
- TikTok: [@cypictronic](https://www.tiktok.com/@cypictronic?lang=es)
- Instagram: [@cypictronic](https://www.instagram.com/cypictronic/)

---

## 📄 Licencia
MIT — úsalo, modifícalo y compártelo citando la fuente.

---

## ✍️ Autoría y créditos
Hecho con ❤️ para fines educativos. Inspirado en los colores de la bandera de **Chile** y pensado para enseñar con claridad el **módulo 11** aplicado al **RUT**.
