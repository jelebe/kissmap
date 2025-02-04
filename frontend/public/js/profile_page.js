// frontend/public/js/profile_page.js

// Importar Firebase desde firebaseConfig.js
import { auth, db } from '../js/firebaseConfig.js';
import { onAuthStateChanged, getAuth } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-auth.js";
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/11.2.0/firebase-firestore.js";

// Importar configuración
import { CONFIG } from '../js/config.js';

// Función para cargar los datos del usuario
async function loadUserProfile() {
    const user = auth.currentUser;
    if (!user) {
        alert('Debes iniciar sesión para ver tu perfil.');
        window.location.href = `${CONFIG.PUBLIC_URL}/login.html`;
        return;
    }

    try {
        // Obtener los datos del usuario desde Firestore
        const userDoc = await getDoc(doc(db, 'users', user.uid));
        if (!userDoc.exists()) {
            alert('No se encontraron datos de perfil. Por favor, configúralo.');
            window.location.href = `${CONFIG.PUBLIC_URL}/profile_setup.html`;
            return;
        }

        const userData = userDoc.data();
        // Mostrar los datos del usuario en la interfaz
        document.getElementById('profile-image').src = userData.profile_picture || 'images/usuario by Aldo Cervantes.png';
        document.getElementById('user-fullname').textContent = userData.fullname || 'Nombre no disponible';
        document.getElementById('user-description').textContent = userData.description || 'Sin descripción';

        // Configurar el mapa con la ubicación del usuario (si está disponible)
        initializeMap(userData.location);
    } catch (error) {
        console.error('Error al cargar los datos del perfil:', error);
        alert('Ocurrió un error al cargar tu perfil.');
    }
}

// Función para inicializar el mapa
function initializeMap(location) {
    const map = L.map('map').setView([location?.lat || 40.4165, location?.lng || -3.7038], 13); // Coordenadas predeterminadas: Madrid
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    if (location) {
        // Agregar un marcador en la ubicación del usuario
        L.marker([location.lat, location.lng]).addTo(map)
            .bindPopup('Tu ubicación actual')
            .openPopup();
    } else {
        alert('No se ha configurado ninguna ubicación en tu perfil.');
    }
}

// Escuchar cambios en el estado de autenticación
onAuthStateChanged(auth, async (user) => {
    if (user) {
        // Cargar los datos del perfil del usuario
        await loadUserProfile();
    } else {
        // Redirigir al usuario a la página de inicio de sesión si no está autenticado
        alert('Debes iniciar sesión para acceder a esta página.');
        window.location.href = `${CONFIG.PUBLIC_URL}/login.html`;
    }
});