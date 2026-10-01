const symbols = "!@#$%&*+-=?_";
const numbers = "0123456789";

const sourceWord = document.querySelector("#source-word");
const generatorForm = document.querySelector("#generator-form");
const generatedList = document.querySelector("#generated-list");
const passwordInput = document.querySelector("#password-input");
const criteriaList = document.querySelector("#criteria-list");
const strengthBadge = document.querySelector("#strength-badge");
const meterFill = document.querySelector("#strength-meter-fill");
const togglePassword = document.querySelector("#toggle-password");

function secureRandom(max) {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] % max;
}

function pick(source) {
  return source[secureRandom(source.length)];
}

function shuffle(characters) {
  const result = [...characters];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = secureRandom(index + 1);
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result.join("");
}

function makePassword(word, variant) {
  const cleaned = word.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z]/g, "").toLowerCase() || "nube";
  const seed = cleaned.length > 2 ? cleaned : `${cleaned}clave`;
  const transformed = [...seed].map((letter, index) => index % 2 === variant % 2 ? letter.toUpperCase() : letter).join("");
  const extraWord = ["Ritmo", "Lumen", "Norte", "Vivo", "Pulso"][secureRandom(5)];
  const required = [pick("ABCDEFGHIJKLMNOPQRSTUVWXYZ"), pick("abcdefghijklmnopqrstuvwxyz"), pick(numbers), pick(symbols)];
  const tail = `${pick(numbers)}${pick(numbers)}${pick(symbols)}${extraWord}`;
  return `${transformed}${shuffle(`${tail}${required.join("")}`)}`;
}

function copyText(text, button) {
  navigator.clipboard.writeText(text).then(() => {
    button.textContent = "✓";
    button.classList.add("copied");
    button.setAttribute("aria-label", "Contraseña copiada");
    setTimeout(() => { button.textContent = "↗"; button.classList.remove("copied"); }, 1500);
  });
}

function renderPasswords(word) {
  const passwords = [];
  while (passwords.length < 3) {
    const password = makePassword(word, passwords.length);
    if (!passwords.includes(password)) passwords.push(password);
  }
  generatedList.innerHTML = passwords.map((password, index) => `
    <div class="generated-item" style="animation-delay: ${index * 70}ms">
      <span class="generated-number">0${index + 1}</span>
      <span class="generated-password">${password}</span>
      <button class="copy-button" type="button" aria-label="Copiar contraseña ${index + 1}" title="Copiar contraseña">↗</button>
    </div>
  `).join("");
  generatedList.querySelectorAll(".copy-button").forEach((button, index) => {
    button.addEventListener("click", () => copyText(passwords[index], button));
  });
}

generatorForm.addEventListener("submit", (event) => {
  event.preventDefault();
  const word = sourceWord.value.trim();
  if (!word) return;
  renderPasswords(word);
});

function updateCriterion(name, pass) {
  const item = criteriaList.querySelector(`[data-criterion="${name}"]`);
  item.classList.toggle("pass", pass);
  item.classList.toggle("fail", !pass);
  item.querySelector(".criterion-icon").textContent = pass ? "✓" : "○";
  item.querySelector("b").textContent = pass ? "OK" : "PENDIENTE";
}

function checkPassword(value) {
  const checks = {
    length: value.length >= 12,
    uppercase: /[A-Z]/.test(value),
    lowercase: /[a-z]/.test(value),
    number: /\d/.test(value),
    symbol: /[^A-Za-z0-9\s]/.test(value),
  };
  Object.entries(checks).forEach(([name, pass]) => updateCriterion(name, pass));
  const passed = Object.values(checks).filter(Boolean).length;
  const percentage = `${(passed / 5) * 100}%`;
  meterFill.style.width = percentage;
  if (!value) {
    strengthBadge.textContent = "—";
    strengthBadge.dataset.level = "empty";
    meterFill.style.background = "var(--mint)";
  } else if (passed >= 5) {
    strengthBadge.textContent = "Fuerte";
    strengthBadge.dataset.level = "strong";
    meterFill.style.background = "var(--mint)";
  } else if (passed >= 3) {
    strengthBadge.textContent = "En camino";
    strengthBadge.dataset.level = "medium";
    meterFill.style.background = "#f4cc7d";
  } else {
    strengthBadge.textContent = "Débil";
    strengthBadge.dataset.level = "weak";
    meterFill.style.background = "var(--coral)";
  }
}

passwordInput.addEventListener("input", (event) => checkPassword(event.target.value));
togglePassword.addEventListener("click", () => {
  const showing = passwordInput.type === "text";
  passwordInput.type = showing ? "password" : "text";
  togglePassword.textContent = showing ? "◉" : "◌";
  togglePassword.setAttribute("aria-label", showing ? "Mostrar contraseña" : "Ocultar contraseña");
  togglePassword.setAttribute("title", showing ? "Mostrar contraseña" : "Ocultar contraseña");
});
