
// ==========================================
// CERTIPET - PANEL DE ADMINISTRACIÓN
// ==========================================

// 1. CONEXIÓN CON SUPABASE
const SUPABASE_URL = "https://csuavczbqbrkpibiwqkj.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_PWSpNsjutHF_7k5vIRe4Fw_aCDeoi3c";

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_ANON_KEY
);

// 2. ELEMENTOS DEL HTML
const loginSection = document.getElementById("login-section");
const recoverySection = document.getElementById("recovery-section");
const adminSection = document.getElementById("admin-section");

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const forgotPasswordButton = document.getElementById("forgot-password-button");
const forgotPasswordMessage = document.getElementById("forgot-password-message");
const logoutButton = document.getElementById("logout-button");

const recoveryForm = document.getElementById("recovery-form");
const recoveryMessage = document.getElementById("recovery-message");
const recoveryButton = document.getElementById("recovery-button");

// 3. CONFIGURACIÓN DE FOTOGRAFÍAS
const BUCKET_NAME = "certipet-images";

const imageFiles = {
    portada: "portada-mascotas.jpg",
    premium: "mascota-premium.jpg",
    vip: "mascota-vip.jpg",
    veterinaria: "gato-veterinario.jpg",
    perfil: "foto-psicologa.jpg"
};

// 4. ESTADO DE RECUPERACIÓN
let recoveryMode = window.location.hash.includes("type=recovery");

// 5. MOSTRAR MENSAJES
function showMessage(element, message, isError = false) {
    element.textContent = message;
    element.classList.toggle("error", isError);
    element.classList.toggle("success", !isError);
}

// 6. MOSTRAR FORMULARIO DE RECUPERACIÓN
function showRecoveryForm() {
    recoveryMode = true;
    loginSection.hidden = true;
    adminSection.hidden = true;
    recoverySection.hidden = false;
}
// ENVIAR CORREO PARA RECUPERAR CONTRASEÑA
forgotPasswordButton.addEventListener("click", async () => {
    const email = document.getElementById("email").value.trim();

    if (!email) {
        showMessage(
            forgotPasswordMessage,
            "Primero escribe tu correo electrónico.",
            true
        );
        return;
    }

    forgotPasswordButton.disabled = true;
    showMessage(forgotPasswordMessage, "Enviando correo...");

    const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
        redirectTo: "https://certipetweb-sepia.vercel.app/admin/"
    });

    forgotPasswordButton.disabled = false;

    if (error) {
        showMessage(
            forgotPasswordMessage,
            "No se pudo enviar el correo. Inténtalo nuevamente.",
            true
        );
        console.error(error);
        return;
    }

    showMessage(
        forgotPasswordMessage,
        "Te enviamos un correo para recuperar tu contraseña. Revisa tu bandeja de entrada."
    );
});

// 7. INICIAR SESIÓN
loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;
    const loginButton = document.getElementById("login-button");

    loginButton.disabled = true;
    loginButton.textContent = "Ingresando...";
    showMessage(loginMessage, "");

    const { data, error } = await supabaseClient.auth.signInWithPassword({
        email,
        password
    });

    loginButton.disabled = false;
    loginButton.textContent = "Iniciar sesión";

    if (error) {
        showMessage(
            loginMessage,
            "No fue posible iniciar sesión. Verifica tus datos.",
            true
        );
        return;
    }

    await showAdminPanel(data.session);
});

// 8. GUARDAR NUEVA CONTRASEÑA
recoveryForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const newPassword = document.getElementById("new-password").value;
    const confirmPassword = document.getElementById("confirm-password").value;

    if (newPassword.length < 8) {
        showMessage(
            recoveryMessage,
            "La contraseña debe tener al menos 8 caracteres.",
            true
        );
        return;
    }

    if (newPassword !== confirmPassword) {
        showMessage(
            recoveryMessage,
            "Las contraseñas no coinciden.",
            true
        );
        return;
    }

    recoveryButton.disabled = true;
    recoveryButton.textContent = "Guardando...";
    showMessage(recoveryMessage, "");

    const { error } = await supabaseClient.auth.updateUser({
        password: newPassword
    });

    recoveryButton.disabled = false;
    recoveryButton.textContent = "Guardar nueva contraseña";

    if (error) {
        showMessage(
            recoveryMessage,
            "No se pudo actualizar la contraseña. Solicita un enlace nuevo.",
            true
        );
        return;
    }

    showMessage(
        recoveryMessage,
        "¡Contraseña actualizada! Ahora puedes iniciar sesión."
    );

    recoveryForm.reset();

    await supabaseClient.auth.signOut();

    window.history.replaceState(
        {},
        document.title,
        window.location.pathname
    );

    recoveryMode = false;
    recoverySection.hidden = true;
    loginSection.hidden = false;
});

// 9. MOSTRAR EL PANEL ADMINISTRATIVO
async function showAdminPanel(session) {
    if (recoveryMode) {
        showRecoveryForm();
        return;
    }

    if (!session) {
        loginSection.hidden = false;
        recoverySection.hidden = true;
        adminSection.hidden = true;
        return;
    }

    loginSection.hidden = true;
    recoverySection.hidden = true;
    adminSection.hidden = false;

    await loadImages();
}

// 10. CARGAR LAS FOTOGRAFÍAS
async function loadImages() {
    for (const [key, fileName] of Object.entries(imageFiles)) {
        const { data } = supabaseClient.storage
            .from(BUCKET_NAME)
            .getPublicUrl(fileName);

        const card = document.querySelector(
            `[data-image-key="${key}"]`
        );

        if (!card) continue;

        const preview = card.querySelector(".photo-preview img");
        const emptyPreview = card.querySelector(".empty-preview");

        preview.onload = () => {
            preview.hidden = false;
            emptyPreview.hidden = true;
        };

        preview.onerror = () => {
            preview.hidden = true;
            emptyPreview.hidden = false;
        };

        preview.src = data.publicUrl;
    }
}

// 11. CERRAR SESIÓN
logoutButton.addEventListener("click", async () => {
    await supabaseClient.auth.signOut();

    adminSection.hidden = true;
    loginSection.hidden = false;

    loginForm.reset();
    showMessage(loginMessage, "Sesión cerrada correctamente.");
});

// 12. ESCUCHAR LOS CAMBIOS DE AUTENTICACIÓN
supabaseClient.auth.onAuthStateChange((event, session) => {
    if (event === "PASSWORD_RECOVERY") {
        showRecoveryForm();
    }

    if (event === "SIGNED_OUT" && !recoveryMode) {
        loginSection.hidden = false;
        recoverySection.hidden = true;
        adminSection.hidden = true;
    }
});

// 13. COMPROBAR SI YA EXISTE UNA SESIÓN
async function checkSession() {
    if (recoveryMode) {
        showRecoveryForm();
        return;
    }

    const { data, error } = await supabaseClient.auth.getSession();

    if (error) {
        console.error("Error al comprobar la sesión:", error.message);
    }

    if (data.session) {
        await showAdminPanel(data.session);
    } else {
        loginSection.hidden = false;
        recoverySection.hidden = true;
        adminSection.hidden = true;
    }
}

checkSession();
