// Interacciones sencillas de CertiPet
const menuButton = document.querySelector(".menu-toggle");
const navigation = document.querySelector(".main-nav");

menuButton?.addEventListener("click", () => {
  const isOpen = navigation.classList.toggle("open");
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menuButton.setAttribute("aria-label", isOpen ? "Cerrar menú" : "Abrir menú");
  menuButton.textContent = isOpen ? "×" : "☰";
});

navigation?.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    navigation.classList.remove("open");
    menuButton?.setAttribute("aria-expanded", "false");
    if (menuButton) {
      menuButton.textContent = "☰";
      menuButton.setAttribute("aria-label", "Abrir menú");
    }
  });
});

document.querySelector("#year").textContent = new Date().getFullYear();

// Permite que solo una pregunta frecuente quede abierta a la vez.
const questions = document.querySelectorAll(".faq-list details");
questions.forEach((item) => {
  item.addEventListener("toggle", () => {
    if (item.open) {
      questions.forEach((other) => {
        if (other !== item) other.open = false;
      });
    }
  });
});
