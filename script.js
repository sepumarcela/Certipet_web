
/* =====================================================
   CERTIPET - INTERACCIONES DE LA PÁGINA
===================================================== */

document.addEventListener("DOMContentLoaded", () => {

    /* ================================================
       1. MENÚ DE NAVEGACIÓN PARA MÓVILES
    ================================================ */

    const menuButton = document.querySelector(".menu-toggle");
    const navigation = document.querySelector(".main-nav");

    function closeMenu() {
        if (!menuButton || !navigation) return;

        navigation.classList.remove("open");

        menuButton.setAttribute("aria-expanded", "false");
        menuButton.setAttribute("aria-label", "Abrir menú");
        menuButton.textContent = "☰";
    }

    if (menuButton && navigation) {

        menuButton.addEventListener("click", () => {

            const isOpen = navigation.classList.toggle("open");

            menuButton.setAttribute("aria-expanded", String(isOpen));
            menuButton.setAttribute(
                "aria-label",
                isOpen ? "Cerrar menú" : "Abrir menú"
            );

            menuButton.textContent = isOpen ? "×" : "☰";

        });

        // Cerrar el menú al seleccionar una sección.
        navigation.querySelectorAll("a").forEach((link) => {

            link.addEventListener("click", closeMenu);

        });

        // Cerrar el menú al hacer clic fuera de él.
        document.addEventListener("click", (event) => {

            const clickedInsideMenu = navigation.contains(event.target);
            const clickedMenuButton = menuButton.contains(event.target);

            if (!clickedInsideMenu && !clickedMenuButton) {
                closeMenu();
            }

        });

        // Cerrar el menú si cambia el tamaño de pantalla.
        window.addEventListener("resize", () => {

            if (window.innerWidth > 760) {
                closeMenu();
            }

        });

        // Permitir cerrar el menú con Escape.
        document.addEventListener("keydown", (event) => {

            if (event.key === "Escape") {
                closeMenu();
            }

        });

    }


    /* ================================================
       2. AÑO AUTOMÁTICO DEL FOOTER
    ================================================ */

    const yearElement = document.querySelector("#year");

    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }


    /* ================================================
       3. PREGUNTAS FRECUENTES
       Solo una pregunta abierta a la vez.
    ================================================ */

    const questions = document.querySelectorAll(".faq-list details");

    questions.forEach((item) => {

        item.addEventListener("toggle", () => {

            if (item.open) {

                questions.forEach((other) => {

                    if (other !== item) {
                        other.open = false;
                    }

                });

            }

        });

    });


    /* ================================================
       4. NAVEGACIÓN SUAVE ENTRE SECCIONES
    ================================================ */

    document.querySelectorAll('a[href^="#"]').forEach((link) => {

        link.addEventListener("click", (event) => {

            const targetId = link.getAttribute("href");

            if (!targetId || targetId === "#") return;

            const target = document.querySelector(targetId);

            if (!target) return;

            event.preventDefault();

            target.scrollIntoView({
                behavior: window.matchMedia(
                    "(prefers-reduced-motion: reduce)"
                ).matches ? "auto" : "smooth",
                block: "start"
            });

            // Mantener la dirección de la sección en la barra del navegador.
            history.replaceState(null, "", targetId);

        });

    });


    /* ================================================
       5. PROTECCIÓN DE ENLACES EXTERNOS
    ================================================ */

    document.querySelectorAll('a[target="_blank"]').forEach((link) => {

        link.setAttribute("rel", "noopener noreferrer");

    });


});
