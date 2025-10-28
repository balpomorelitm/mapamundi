let globe;
let targetCountry = null;
let score = 0;
let countriesData = [];
let geoJsonData = null;

// Mapeo de códigos ISO a nombres en español
const countryNamesES = {
    'ESP': 'España', 'MEX': 'México', 'GTM': 'Guatemala', 'HND': 'Honduras',
    'SLV': 'El Salvador', 'NIC': 'Nicaragua', 'CRI': 'Costa Rica', 'PAN': 'Panamá',
    'CUB': 'Cuba', 'DOM': 'República Dominicana', 'VEN': 'Venezuela', 'COL': 'Colombia',
    'ECU': 'Ecuador', 'PER': 'Perú', 'BOL': 'Bolivia', 'CHL': 'Chile',
    'ARG': 'Argentina', 'URY': 'Uruguay', 'PRY': 'Paraguay', 'GNQ': 'Guinea Ecuatorial',
    'USA': 'Estados Unidos', 'CAN': 'Canadá', 'BRA': 'Brasil', 'FRA': 'Francia',
    'ITA': 'Italia', 'DEU': 'Alemania', 'GBR': 'Reino Unido', 'PRT': 'Portugal',
    'CHN': 'China', 'JPN': 'Japón', 'IND': 'India', 'RUS': 'Rusia',
    'AUS': 'Australia', 'NZL': 'Nueva Zelanda', 'EGY': 'Egipto', 'ZAF': 'Sudáfrica',
    'NGA': 'Nigeria', 'KEN': 'Kenia', 'MAR': 'Marruecos', 'DZA': 'Argelia',
    'TUN': 'Túnez', 'LBY': 'Libia', 'ETH': 'Etiopía', 'TZA': 'Tanzania',
    'SAU': 'Arabia Saudita', 'IRN': 'Irán', 'IRQ': 'Irak', 'TUR': 'Turquía',
    'GRC': 'Grecia', 'POL': 'Polonia', 'UKR': 'Ucrania', 'ROU': 'Rumania',
    'NLD': 'Países Bajos', 'BEL': 'Bélgica', 'CHE': 'Suiza', 'AUT': 'Austria',
    'SWE': 'Suecia', 'NOR': 'Noruega', 'DNK': 'Dinamarca', 'FIN': 'Finlandia',
    'THA': 'Tailandia', 'VNM': 'Vietnam', 'MYS': 'Malasia', 'PHL': 'Filipinas',
    'IDN': 'Indonesia', 'KOR': 'Corea del Sur', 'PRK': 'Corea del Norte',
    'PAK': 'Pakistán', 'BGD': 'Bangladés', 'AFG': 'Afganistán', 'NPL': 'Nepal',
    'LKA': 'Sri Lanka', 'MMR': 'Myanmar', 'KHM': 'Camboya', 'LAO': 'Laos'
};

// Cargar datos del juego
async function loadGameData() {
    try {
        const response = await fetch('data.json');
        countriesData = await response.json();
        console.log('Cargados', countriesData.length, 'datos de países');
    } catch (error) {
        console.error('Error cargando data.json:', error);
        alert('Error: No se pudo cargar data.json.');
    }
}

// Cargar datos GeoJSON
async function loadGeoJSON() {
    try {
        const response = await fetch('ne_110m_admin_0_countries.geojson');
        geoJsonData = await response.json();
        console.log('GeoJSON cargado con', geoJsonData.features.length, 'países');
    } catch (error) {
        console.error('Error cargando GeoJSON local:', error);
        try {
            const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_50m_admin_0_countries.geojson');
            geoJsonData = await response.json();
            console.log('GeoJSON cargado desde CDN');
        } catch (cdnError) {
            console.error('Error cargando desde CDN:', cdnError);
            alert('Error: No se pudo cargar el archivo GeoJSON.');
        }
    }
}

// Inicializar el globo (VERSIÓN OPTIMIZADA)
async function initGlobe() {
    await loadGeoJSON();
    await loadGameData();

    if (!geoJsonData || countriesData.length === 0) {
        document.getElementById('loading').textContent = 'Error al cargar los datos';
        return;
    }

    document.getElementById('loading').style.display = 'none';
    document.getElementById('clue-box').style.display = 'block';
    document.getElementById('score-box').style.display = 'block';

    globe = Globe()
        // Texturas más ligeras o color sólido
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        // .globeImageUrl(null) // Descomentar para globo sin textura (MÁS RÁPIDO)
        // .backgroundColor('rgba(0,0,0,0.8)') // Fondo simple sin estrellas
        .showAtmosphere(false) // Desactivar atmósfera para mejor rendimiento
        .polygonsData(geoJsonData.features)
        .polygonAltitude(0.01) // Elevación mínima (MÁS RÁPIDO)
        .polygonCapColor(d => d === globe.hoverPolygon ? 'steelblue' : 'rgba(200, 200, 200, 0.8)')
        .polygonSideColor(() => 'rgba(0, 100, 0, 0.1)')
        .polygonStrokeColor(() => '#333')
        // NOMBRES EN ESPAÑOL
        .polygonLabel(({ properties: d }) => {
            const iso = d.ISO_A3 || d.ADM0_A3;
            const nombreES = countryNamesES[iso] || d.NAME || d.ADMIN || 'País';
            return `
                <div style="background: rgba(0,0,0,0.85); padding: 8px 12px; border-radius: 4px; color: white; font-size: 14px;">
                    <b>${nombreES}</b>
                </div>
            `;
        })
        .onPolygonClick(handleCountryClick)
        .onPolygonHover(hoverPolygon => globe.hoverPolygon = hoverPolygon)
        (document.getElementById('globeViz'));

    // Vista inicial optimizada
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 0);
    
    // Controles más suaves
    globe.controls().enableDamping = true;
    globe.controls().dampingFactor = 0.1;
    globe.controls().rotateSpeed = 0.5;

    loadNewGame();
}

// Manejar clic en país
function handleCountryClick(polygon, event, coords) {
    if (!targetCountry) return;

    const clickedISO = polygon.properties.ISO_A3 || polygon.properties.ADM0_A3;
    
    if (clickedISO === targetCountry.ISO_A3) {
        showMessage('¡Correcto! 🎉', true);
        score++;
        document.getElementById('score').textContent = score;
        
        highlightCountry(polygon);
        
        setTimeout(() => {
            hideMessage();
            loadNewGame();
        }, 1800); // Reducido tiempo de espera
    } else {
        const clickedName = countryNamesES[clickedISO] || polygon.properties.NAME || 'ese país';
        showMessage(`Incorrecto. Ese es ${clickedName}. ¡Inténtalo de nuevo! 🤔`, false);
        setTimeout(hideMessage, 2000); // Reducido tiempo
    }
}

// Resaltar país (simplificado)
function highlightCountry(polygon) {
    globe.polygonCapColor(d => d === polygon ? '#4CAF50' : 'rgba(200, 200, 200, 0.8)');
    setTimeout(() => {
        globe.polygonCapColor(d => d === globe.hoverPolygon ? 'steelblue' : 'rgba(200, 200, 200, 0.8)');
    }, 1800);
}

function showMessage(text, isCorrect) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = 'message ' + (isCorrect ? 'correct' : 'incorrect');
    messageEl.style.display = 'block';
}

function hideMessage() {
    document.getElementById('message').style.display = 'none';
}

function loadNewGame() {
    if (countriesData.length === 0) return;
    
    const randomIndex = Math.floor(Math.random() * countriesData.length);
    targetCountry = countriesData[randomIndex];
    
    document.getElementById('capital').textContent = targetCountry.capital_es;
    document.getElementById('fact').textContent = targetCountry.fact_es;
    
    console.log('Nuevo país:', countryNamesES[targetCountry.ISO_A3] || targetCountry.ISO_A3);
}

window.addEventListener('load', initGlobe);
