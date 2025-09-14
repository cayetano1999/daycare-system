// Navigation Toggle
const navToggle = document.getElementById('navToggle');
const navMenu = document.getElementById('navMenu');

navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on links
document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Features Data
const features = [
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v5h5"/>
            <path d="M6 17l4-4 4 4 6-6"/>
            <path d="M18 7h3v5"/>
        </svg>`,
        title: "Gestión Avanzada de Invitados",
        description: "Organiza, clasifica y gestiona todos tus invitados en un solo lugar"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v5h5"/>
            <path d="M6 17l4-4 4 4 6-6"/>
            <path d="M18 7h3v5"/>
        </svg>`,
        title: "Estadísticas en Tiempo Real",
        description: "Visualiza el estado de todas tus invitaciones con gráficos detallados"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 9h6v6H9z"/>
        </svg>`,
        title: "Códigos QR de Seguridad",
        description: "Valida la identidad de tus invitados con tecnología QR avanzada"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>`,
        title: "Múltiples Administradores",
        description: "Colabora con tu equipo para gestionar eventos de forma simultánea"
    }
];

const featuresData = [
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v5h5"/>
            <path d="M6 17l4-4 4 4 6-6"/>
            <path d="M18 7h3v5"/>
        </svg>`,
        title: "Visualización de Invitaciones",
        description: "Consulta enviadas, aceptadas, abiertas/no respondidas y rechazadas"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 9h6v6H9z"/>
        </svg>`,
        title: "Compartir como Enlace o QR",
        description: "Comparte en redes o descarga un código QR de seguridad"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/>
            <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/>
        </svg>`,
        title: "Recordatorios Inteligentes",
        description: "Envía recordatorios a quienes aún no confirman asistencia"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
            <polyline points="7,10 12,15 17,10"/>
            <line x1="12" y1="15" x2="12" y2="3"/>
        </svg>`,
        title: "Imprimir Lista de Invitados",
        description: "Exporta en un clic todo el listado para control en puerta"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z"/>
        </svg>`,
        title: "Gestión Avanzada de Invitados",
        description: "Agrega, edita, elimina y clasifica (familia, amigos, trabajo, etc.)"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 3v5h5"/>
            <path d="M6 17l4-4 4 4 6-6"/>
            <path d="M18 7h3v5"/>
        </svg>`,
        title: "Estadísticas del Evento",
        description: "Gráficas con enviados, aceptados, rechazados y sin respuesta"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="3"/>
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
        </svg>`,
        title: "Edición en Tiempo Real",
        description: "Actualiza fecha, lugar y mensajes; se sincroniza en todos los dispositivos"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/>
        </svg>`,
        title: "Bloqueo & Registro de Acceso",
        description: "Restringe invitados y revisa el historial de actividad"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"/>
            <line x1="12" y1="18" x2="12.01" y2="18"/>
        </svg>`,
        title: "Integración con Contactos",
        description: "Sincroniza tus contactos para agregar invitados fácilmente"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>`,
        title: "Cronogramas",
        description: "Crea horarios y actividades y vincúlalos a la invitación"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>`,
        title: "Mensajes Personalizados",
        description: "Envía agradecimientos o actualizaciones a grupos específicos"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="m22 21-3-3m0 0a5.5 5.5 0 1 0-7.78-7.78 5.5 5.5 0 0 0 7.78 7.78Z"/>
        </svg>`,
        title: "Gestión de Grupos",
        description: "Organiza por familias, amigos o equipos y envía invitaciones segmentadas"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="m22 12-4-4-6 6-2-3-4 4"/>
            <path d="M16 8h6v6"/>
        </svg>`,
        title: "Seguimiento Detallado",
        description: "Analiza aceptación, rechazo y no respuesta por segmento"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
            <circle cx="12" cy="13" r="3"/>
        </svg>`,
        title: "Galería Colaborativa",
        description: "Los invitados comparten fotos después del evento"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="1" x2="12" y2="23"/>
            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>`,
        title: "Gestión de Presupuesto",
        description: "Planifica y controla gastos con reportes simples"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="8" width="18" height="4" rx="1"/>
            <path d="M12 8v13"/>
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
        </svg>`,
        title: "Seguimiento de Regalos",
        description: "Administra listas de regalos y agradecimientos"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
            <circle cx="12" cy="12" r="3"/>
        </svg>`,
        title: "Análisis de Invitación",
        description: "Detecta reenvíos y dispositivos utilizados para abrirla"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M9 9h6v6H9z"/>
        </svg>`,
        title: "Gestión de Mesas",
        description: "Asigna invitados a mesas de forma visual"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M3 7V5a2 2 0 0 1 2-2h2"/>
            <path d="M17 3h2a2 2 0 0 1 2 2v2"/>
            <path d="M21 17v2a2 2 0 0 1-2 2h-2"/>
            <path d="M7 21H5a2 2 0 0 1-2-2v-2"/>
        </svg>`,
        title: "Escáner QR",
        description: "Valida la entrada de cada invitado con su código único"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>`,
        title: "Múltiples Administradores",
        description: "Varios anfitriones gestionan el mismo evento en simultáneo"
    },
    {
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
            <polyline points="14,2 14,8 20,8"/>
        </svg>`,
        title: "Solicitar Plantillas",
        description: "Elige y solicita nuevas plantillas"
    }
];

// Screenshots Data
const screenshots = [
    {
        image: "https://cayetano1999.github.io/festiva-app-host/screenshots-ios/admin-event.png",
        title: "Dashboard Principal",
        description: "Vista general de todos tus eventos"
    },
    {
        image: "https://cayetano1999.github.io/festiva-app-host/screenshots-ios/guest-options.png",
        title: "Gestión de Invitados",
        description: "Organiza y administra tu lista de invitados"
    },
    {
        image: "https://cayetano1999.github.io/festiva-app-host/screenshots-ios/guests.png",
        title: "Estadísticas",
        description: "Visualiza el progreso de tus invitaciones"
    },
    {
        image: "https://cayetano1999.github.io/festiva-app-host/screenshots-ios/scanner.png",
        title: "Códigos QR",
        description: "Genera y gestiona códigos de seguridad"
    },
    {
        image: "https://cayetano1999.github.io/festiva-app-host/screenshots-ios/event-option.png",
        title: "Herramientas",
        description: "Personaliza tu experiencia"
    },
    {
        image: "https://cayetano1999.github.io/festiva-app-host/screenshots-ios/templates.png",
        title: "Invitaciones",
        description: "Selecciona invitaciones únicas"
    }
];

// Event Types Data
const eventTypes = [
    {
        name: "Starter",
        description: "Perfecto para eventos pequeños e íntimos con funcionalidades básicas",
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
        </svg>`,
        colorClass: "starter"
    },
    {
        name: "Essential",
        description: "Ideal para celebraciones familiares con herramientas avanzadas de gestión",
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
            <line x1="16" y1="2" x2="16" y2="6"/>
            <line x1="8" y1="2" x2="8" y2="6"/>
            <line x1="3" y1="10" x2="21" y2="10"/>
        </svg>`,
        colorClass: "essential"
    },
    {
        name: "Premium",
        description: "Para eventos especiales e importantes con funcionalidades completas",
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>`,
        colorClass: "premium"
    },
    {
        name: "Elite",
        description: "La experiencia más completa para eventos exclusivos y de gran escala",
        icon: `<svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="3" y="8" width="18" height="4" rx="1"/>
            <path d="M12 8v13"/>
            <path d="M19 12v7a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2v-7"/>
            <path d="M7.5 8a2.5 2.5 0 0 1 0-5A4.8 8 0 0 1 12 8a4.8 8 0 0 1 4.5-5 2.5 2.5 0 0 1 0 5"/>
        </svg>`,
        colorClass: "elite"
    }
];

// Feature Showcase Animation
let currentFeatureIndex = 0;
const showcaseIcon = document.getElementById('showcaseIcon');
const showcaseTitle = document.getElementById('showcaseTitle');
const showcaseDescription = document.getElementById('showcaseDescription');

function updateFeatureShowcase() {
    const feature = features[currentFeatureIndex];
    showcaseIcon.innerHTML = feature.icon;
    showcaseTitle.textContent = feature.title;
    showcaseDescription.textContent = feature.description;
    
    currentFeatureIndex = (currentFeatureIndex + 1) % features.length;
}

// Update showcase every 3 seconds
setInterval(updateFeatureShowcase, 3000);

// Generate Features Grid
function generateFeaturesGrid() {
    const featuresGrid = document.querySelector('.features-grid');
    
    featuresData.forEach(feature => {
        const featureCard = document.createElement('div');
        featureCard.className = 'feature-card';
        featureCard.innerHTML = `
            <div class="feature-icon">
                ${feature.icon}
            </div>
            <h3>${feature.title}</h3>
            <p>${feature.description}</p>
        `;
        featuresGrid.appendChild(featureCard);
    });
}

// Generate Screenshots Grid
function generateScreenshotsGrid() {
    const screenshotsGrid = document.querySelector('.screenshots-grid');
    
    screenshots.forEach(screenshot => {
        const screenshotCard = document.createElement('div');
        screenshotCard.className = 'screenshot-card';
        screenshotCard.innerHTML = `
            <div class="screenshot-image">
                <img src="${screenshot.image}" alt="${screenshot.title}">
            </div>
            <div class="screenshot-overlay"></div>
            <div class="screenshot-content">
                <h3>${screenshot.title}</h3>
                <p>${screenshot.description}</p>
            </div>
        `;
        screenshotsGrid.appendChild(screenshotCard);
    });
}

// Generate Event Types Grid
function generateEventTypesGrid() {
    const eventTypesGrid = document.querySelector('.event-types-grid');
    
    eventTypes.forEach(eventType => {
        const eventTypeCard = document.createElement('div');
        eventTypeCard.className = `event-type-card ${eventType.colorClass}`;
        eventTypeCard.innerHTML = `
            <div class="event-type-icon ${eventType.colorClass}">
                ${eventType.icon}
            </div>
            <h3>${eventType.name}</h3>
            <p>${eventType.description}</p>
        `;
        eventTypesGrid.appendChild(eventTypeCard);
    });
}

// Smooth scrolling for navigation links
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    generateFeaturesGrid();
    generateScreenshotsGrid();
    generateEventTypesGrid();
    updateFeatureShowcase();
    
    // Add scroll animations
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);
    
    // Observe all feature cards, screenshot cards, and event type cards
    document.querySelectorAll('.feature-card, .screenshot-card, .event-type-card').forEach(card => {
        card.style.opacity = '0';
        card.style.transform = 'translateY(30px)';
        card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(card);
    });
});