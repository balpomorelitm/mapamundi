let globe;
let targetCountry = null;
let score = 0;
let countriesData = [];
let geoJsonData = null;

// NEW VARIABLES for game state
let availableCountries = []; // Countries we can still pick from
let completedCountries = new Set(); // ISO codes of countries already guessed
let lastSkippedISO = null; // ISO code of the most recently skipped country
let recentlyRevealedISO = null; // ISO code temporarily highlighted after revealing

// Variables para el sistema de pistas progresivas
let currentClues = [];
let clueIndex = 0;
let currentRoundPoints = 100;

// Mapeo de códigos ISO a nombres en español (lista ampliada)
const countryNamesES = {
    'AFG': 'Afganistán', 'ALA': 'Åland', 'ALB': 'Albania', 'DEU': 'Alemania', 'AND': 'Andorra',
    'AGO': 'Angola', 'AIA': 'Anguila', 'ATA': 'Antártida', 'ATG': 'Antigua y Barbuda', 'SAU': 'Arabia Saudita',
    'DZA': 'Argelia', 'ARG': 'Argentina', 'ARM': 'Armenia', 'ABW': 'Aruba', 'AUS': 'Australia',
    'AUT': 'Austria', 'AZE': 'Azerbaiyán', 'BHS': 'Bahamas', 'BHR': 'Baréin', 'BGD': 'Bangladés',
    'BRB': 'Barbados', 'BEL': 'Bélgica', 'BLZ': 'Belice', 'BEN': 'Benín', 'BMU': 'Bermudas',
    'BLR': 'Bielorrusia', 'BOL': 'Bolivia', 'BIH': 'Bosnia y Herzegovina', 'BWA': 'Botsuana', 'BRA': 'Brasil',
    'BRN': 'Brunéi', 'BGR': 'Bulgaria', 'BFA': 'Burkina Faso', 'BDI': 'Burundi', 'BTN': 'Bután',
    'CPV': 'Cabo Verde', 'KHM': 'Camboya', 'CMR': 'Camerún', 'CAN': 'Canadá', 'QAT': 'Catar', 'TCD': 'Chad',
    'CHL': 'Chile', 'CHN': 'China', 'CYP': 'Chipre', 'VAT': 'Ciudad del Vaticano', 'COL': 'Colombia',
    'COM': 'Comoras', 'PRK': 'Corea del Norte', 'KOR': 'Corea del Sur', 'CIV': 'Costa de Marfil',
    'CRI': 'Costa Rica', 'HRV': 'Croacia', 'CUB': 'Cuba', 'CUW': 'Curazao', 'DNK': 'Dinamarca',
    'DMA': 'Dominica', 'ECU': 'Ecuador', 'EGY': 'Egipto', 'SLV': 'El Salvador', 'ARE': 'Emiratos Árabes Unidos',
    'ERI': 'Eritrea', 'SVK': 'Eslovaquia', 'SVN': 'Eslovenia', 'ESP': 'España', 'USA': 'Estados Unidos',
    'EST': 'Estonia', 'ETH': 'Etiopía', 'PHL': 'Filipinas', 'FIN': 'Finlandia', 'FJI': 'Fiyi',
    'FRA': 'Francia', 'GAB': 'Gabón', 'GMB': 'Gambia', 'GEO': 'Georgia', 'GHA': 'Ghana',
    'GIB': 'Gibraltar', 'GRD': 'Granada', 'GRC': 'Grecia', 'GRL': 'Groenlandia', 'GLP': 'Guadalupe',
    'GUM': 'Guam', 'GTM': 'Guatemala', 'GUF': 'Guayana Francesa', 'GGY': 'Guernsey', 'GIN': 'Guinea',
    'GNB': 'Guinea-Bisáu', 'GNQ': 'Guinea Ecuatorial', 'GUY': 'Guyana', 'HTI': 'Haití', 'HND': 'Honduras',
    'HKG': 'Hong Kong', 'HUN': 'Hungría', 'IND': 'India', 'IDN': 'Indonesia', 'IRN': 'Irán', 'IRQ': 'Irak',
    'IRL': 'Irlanda', 'ISL': 'Islandia', 'IMN': 'Isla de Man', 'CXR': 'Isla de Navidad', 'NFK': 'Isla Norfolk',
    'SLE': 'Sierra Leona', 'CYM': 'Islas Caimán', 'CCK': 'Islas Cocos', 'COK': 'Islas Cook',
    'FRO': 'Islas Feroe', 'SGS': 'Islas Georgias del Sur y Sandwich del Sur', 'HMD': 'Islas Heard y McDonald',
    'FLK': 'Islas Malvinas', 'MNP': 'Islas Marianas del Norte', 'MHL': 'Islas Marshall', 'PCN': 'Islas Pitcairn',
    'SLB': 'Islas Salomón', 'TCA': 'Islas Turcas y Caicos', 'VGB': 'Islas Vírgenes Británicas',
    'VIR': 'Islas Vírgenes de los Estados Unidos', 'ISR': 'Israel', 'ITA': 'Italia', 'JAM': 'Jamaica',
    'JPN': 'Japón', 'JEY': 'Jersey', 'JOR': 'Jordania', 'KAZ': 'Kazajistán', 'KEN': 'Kenia',
    'KGZ': 'Kirguistán', 'KIR': 'Kiribati', 'KWT': 'Kuwait', 'LAO': 'Laos', 'LSO': 'Lesoto',
    'LVA': 'Letonia', 'LBN': 'Líbano', 'LBR': 'Liberia', 'LBY': 'Libia', 'LIE': 'Liechtenstein',
    'LTU': 'Lituania', 'LUX': 'Luxemburgo', 'MAC': 'Macao', 'MKD': 'Macedonia del Norte', 'MDG': 'Madagascar',
    'MYS': 'Malasia', 'MWI': 'Malaui', 'MDV': 'Maldivas', 'MLI': 'Malí', 'MLT': 'Malta', 'MAR': 'Marruecos',
    'MTQ': 'Martinica', 'MUS': 'Mauricio', 'MRT': 'Mauritania', 'MYT': 'Mayotte', 'MEX': 'México',
    'FSM': 'Micronesia', 'MDA': 'Moldavia', 'MCO': 'Mónaco', 'MNG': 'Mongolia', 'MNE': 'Montenegro',
    'MSR': 'Montserrat', 'MOZ': 'Mozambique', 'MMR': 'Myanmar (Birmania)', 'NAM': 'Namibia', 'NRU': 'Nauru',
    'NPL': 'Nepal', 'NIC': 'Nicaragua', 'NER': 'Níger', 'NGA': 'Nigeria', 'NIU': 'Niue', 'NOR': 'Noruega',
    'NCL': 'Nueva Caledonia', 'NZL': 'Nueva Zelanda', 'OMN': 'Omán', 'NLD': 'Países Bajos', 'PAK': 'Pakistán',
    'PLW': 'Palaos', 'PSE': 'Palestina', 'PAN': 'Panamá', 'PNG': 'Papúa Nueva Guinea', 'PRY': 'Paraguay',
    'PER': 'Perú', 'PYF': 'Polinesia Francesa', 'POL': 'Polonia', 'PRT': 'Portugal', 'PRI': 'Puerto Rico',
    'GBR': 'Reino Unido', 'CAF': 'República Centroafricana', 'CZE': 'República Checa', 'COG': 'República del Congo',
    'COD': 'República Democrática del Congo', 'DOM': 'República Dominicana', 'REU': 'Reunión', 'RWA': 'Ruanda',
    'ROU': 'Rumania', 'RUS': 'Rusia', 'ESH': 'Sáhara Occidental', 'WSM': 'Samoa', 'ASM': 'Samoa Americana',
    'BLM': 'San Bartolomé', 'KNA': 'San Cristóbal y Nieves', 'SMR': 'San Marino', 'MAF': 'San Martín (Francia)',
    'SXM': 'San Martín (Países Bajos)', 'SPM': 'San Pedro y Miquelón', 'VCT': 'San Vicente y las Granadinas',
    'SHN': 'Santa Elena', 'LCA': 'Santa Lucía', 'STP': 'Santo Tomé y Príncipe', 'SEN': 'Senegal',
    'SRB': 'Serbia', 'SYC': 'Seychelles', 'SGP': 'Singapur', 'SYR': 'Siria', 'SOM': 'Somalia',
    'LKA': 'Sri Lanka', 'SWZ': 'Suazilandia (Esuatini)', 'ZAF': 'Sudáfrica', 'SDN': 'Sudán',
    'SSD': 'Sudán del Sur', 'SWE': 'Suecia', 'CHE': 'Suiza', 'SUR': 'Surinam', 'SJM': 'Svalbard y Jan Mayen',
    'THA': 'Tailandia', 'TWN': 'Taiwán', 'TZA': 'Tanzania', 'TJK': 'Tayikistán', 'TLS': 'Timor Oriental',
    'TGO': 'Togo', 'TKL': 'Tokelau', 'TON': 'Tonga', 'TTO': 'Trinidad y Tobago', 'TUN': 'Túnez',
    'TKM': 'Turkmenistán', 'TUR': 'Turquía', 'TUV': 'Tuvalu', 'UKR': 'Ucrania', 'UGA': 'Uganda',
    'URY': 'Uruguay', 'UZB': 'Uzbekistán', 'VUT': 'Vanuatu', 'VEN': 'Venezuela', 'VNM': 'Vietnam',
    'WLF': 'Wallis y Futuna', 'YEM': 'Yemen', 'DJI': 'Yibuti', 'ZMB': 'Zambia', 'ZWE': 'Zimbabue'
};

// Fallback por nombre en inglés para países cuyos códigos ISO no coinciden con el GeoJSON
const fallbackCountryNamesByEnglish = {
    'France': 'Francia',
    'French Republic': 'Francia',
    'Norway': 'Noruega',
    'Kingdom of Norway': 'Noruega'
};

// Seguimiento para evitar mensajes repetidos en la consola
const missingIsoWarnings = new Set();

function getCountryNameES(props = {}, isoOverride = null) {
    const isoCandidates = [
        isoOverride,
        props.ISO_A3,
        props.ADM0_A3,
        props.ISO_A3_EH,
        props.ADM0_A3_US,
        props.WB_A3,
        props.SOV_A3,
        props.iso_a3,
        props.adm0_a3
    ].filter(Boolean);

    let lastIsoWithoutTranslation = null;

    for (const iso of isoCandidates) {
        const normalizedIso = typeof iso === 'string'
            ? iso.trim().toUpperCase()
            : String(iso).trim().toUpperCase();
        if (!normalizedIso) continue;
        const spanishName = countryNamesES[normalizedIso];
        if (spanishName) {
            return spanishName;
        }
        lastIsoWithoutTranslation = normalizedIso;
    }

    const englishNameCandidates = [
        props.NAME,
        props.NAME_LONG,
        props.ADMIN,
        props.SOVEREIGNT,
        props.BRK_NAME
    ].filter(Boolean);

    for (const candidate of englishNameCandidates) {
        const trimmed = candidate.trim();
        if (!trimmed) continue;
        const spanishName = fallbackCountryNamesByEnglish[trimmed];
        if (spanishName) {
            return spanishName;
        }
    }

    if (lastIsoWithoutTranslation && !missingIsoWarnings.has(lastIsoWithoutTranslation)) {
        console.warn(`No se encontró traducción en español para el código ISO ${lastIsoWithoutTranslation}.`);
        missingIsoWarnings.add(lastIsoWithoutTranslation);
    }

    if (englishNameCandidates.length > 0) {
        return englishNameCandidates[0];
    }

    if (isoCandidates.length > 0) {
        return isoCandidates[0];
    }

    return 'País desconocido';
}

// Cargar datos del juego
async function loadGameData() {
    try {
        const response = await fetch('data_v2.json');
        countriesData = await response.json();
        availableCountries = [...countriesData]; // Initialize the available list
        console.log('Cargados', countriesData.length, 'datos de países (v2)');
    } catch (error) {
        console.error('Error cargando data_v2.json:', error);
        alert('Error: No se pudo cargar data_v2.json.');
    }
}

// Cargar datos GeoJSON
async function loadGeoJSON() {
    try {
        // Force loading the lightweight 110m version from CDN
        const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
        geoJsonData = await response.json();
        console.log('GeoJSON 110m cargado desde CDN:', geoJsonData.features.length, 'países');
    } catch (error) {
        console.error('Error cargando GeoJSON 110m desde CDN:', error);
        alert('Error: No se pudo cargar el archivo GeoJSON.');
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

    document.getElementById('next-clue-btn').addEventListener('click', showNextClue);
    document.getElementById('skip-btn').addEventListener('click', handleSkip);

    globe = Globe()
        // Texturas más ligeras o color sólido
        .globeImageUrl(null)
        // .backgroundColor('rgba(0,0,0,0.8)') // Fondo simple sin estrellas
        .showAtmosphere(false) // Desactivar atmósfera para mejor rendimiento
        .polygonsData(geoJsonData.features)
        .polygonAltitude(0.01) // Elevación mínima (MÁS RÁPIDO)
        .polygonCapColor(d => {
            const iso = d.properties.ISO_A3 || d.properties.ADM0_A3;
            if (recentlyRevealedISO && iso === recentlyRevealedISO) {
                return 'rgba(180, 50, 50, 0.7)';
            }
            return completedCountries.has(iso) ? 'rgba(0, 100, 0, 0.6)' : 'rgba(200, 200, 200, 0.8)';
        })
        .polygonSideColor(() => 'rgba(0, 100, 0, 0.1)')
        .polygonStrokeColor(() => '#333')
        // NOMBRES EN ESPAÑOL
        .polygonLabel(({ properties: d }) => {
            const nombreES = getCountryNameES(d);
            return `
                <div style="background: rgba(0,0,0,0.85); padding: 8px 12px; border-radius: 4px; color: white; font-size: 14px;">
                    <b>${nombreES}</b>
                </div>
            `;
        })
        .onPolygonClick(handleCountryClick)
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
        showMessage(`¡Correcto! Ganaste ${currentRoundPoints} puntos. 🎉`, true);
        score += currentRoundPoints;
        document.getElementById('score').textContent = score;

        // ADD to completed list
        completedCountries.add(targetCountry.ISO_A3);

        // UPDATE map colors to show temporary green highlight
        globe.polygonCapColor(d => {
            const iso = d.properties.ISO_A3 || d.properties.ADM0_A3;
            if (iso === targetCountry.ISO_A3) return '#4CAF50'; // Highlight correct
            return completedCountries.has(iso) ? 'rgba(0, 100, 0, 0.6)' : 'rgba(200, 200, 200, 0.8)';
        });

        setTimeout(() => {
            hideMessage();
            loadNewGame();
        }, 2000); // Incrementado tiempo de espera para leer el mensaje
    } else {
        const clickedName = getCountryNameES(polygon.properties, clickedISO) || 'ese país';
        showMessage(`Incorrecto. Ese es ${clickedName}. ¡Inténtalo de nuevo! 🤔`, false);
        setTimeout(hideMessage, 2000);
    }
}

// Manejar botón de pasar (mostrar respuesta)
function handleSkip() {
    if (!targetCountry) return; // Check if a game is active

    // 1. Store the country to be skipped and then immediately nullify the global target
    //    THIS IS THE FIX: Clicks on the globe are now disabled.
    const skippedCountry = targetCountry;
    targetCountry = null;

    // 2. Now, use the local 'skippedCountry' variable for all skip logic
    const skipButton = document.getElementById('skip-btn');
    skipButton.disabled = true;

    const correctName = getCountryNameES(skippedCountry, skippedCountry.ISO_A3);
    showMessage(`Respuesta: ${correctName}. ¡Intenta con el siguiente!`, false);

    // 3. Update map colors to show the skipped country as a temporary reveal
    recentlyRevealedISO = skippedCountry.ISO_A3;
    globe.polygonCapColor(d => {
        const iso = d.properties.ISO_A3 || d.properties.ADM0_A3;
        if (recentlyRevealedISO && iso === recentlyRevealedISO) {
            return 'rgba(180, 50, 50, 0.7)';
        }
        return completedCountries.has(iso) ? 'rgba(0, 100, 0, 0.6)' : 'rgba(200, 200, 200, 0.8)';
    });

    // 4. Find polygon and move camera
    const targetPolygon = geoJsonData.features.find(
        f => (f.properties.ISO_A3 || f.properties.ADM0_A3) === skippedCountry.ISO_A3
    );

    if (targetPolygon) {
        const centroid = getFeatureCentroid(targetPolygon);
        if (centroid) {
            globe.pointOfView({ ...centroid, altitude: 1.5 }, 1000);
        }
    }

    // Reinsert skipped country so it can appear again later
    availableCountries.push(skippedCountry);
    lastSkippedISO = skippedCountry.ISO_A3;

    // 5. Load next game. loadNewGame() will assign a new targetCountry.
    setTimeout(() => {
        hideMessage();
        globe.pointOfView({ lat: 20, lng: 0, altitude: 2.5 }, 1000);
        loadNewGame();
    }, 3000); // 3-second delay to read the answer
}

function getFeatureCentroid(feature) {
    if (!feature) return null;

    const props = feature.properties || {};
    const labelLng = typeof props.LABEL_X === 'number' ? props.LABEL_X : null;
    const labelLat = typeof props.LABEL_Y === 'number' ? props.LABEL_Y : null;

    if (labelLat !== null && labelLng !== null) {
        return { lat: labelLat, lng: labelLng };
    }

    const geometry = feature.geometry;
    if (!geometry) return null;

    let sumLat = 0;
    let sumLng = 0;
    let count = 0;

    const accumulatePoint = point => {
        if (!Array.isArray(point) || point.length < 2) return;
        const [lng, lat] = point;
        if (typeof lat !== 'number' || typeof lng !== 'number') return;
        sumLat += lat;
        sumLng += lng;
        count += 1;
    };

    const handlePolygon = polygon => {
        if (!Array.isArray(polygon)) return;
        polygon.forEach(ring => {
            if (!Array.isArray(ring)) return;
            ring.forEach(accumulatePoint);
        });
    };

    if (geometry.type === 'Polygon') {
        handlePolygon(geometry.coordinates);
    } else if (geometry.type === 'MultiPolygon') {
        geometry.coordinates.forEach(handlePolygon);
    }

    if (count === 0) return null;

    return { lat: sumLat / count, lng: sumLng / count };
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

function showNextClue() {
    if (!targetCountry || clueIndex >= currentClues.length) return;

    if (clueIndex > 0) {
        currentRoundPoints = Math.round(currentRoundPoints * 0.85);
    }

    document.getElementById('round-score').textContent = currentRoundPoints;

    const clueList = document.getElementById('clue-list');
    const li = document.createElement('li');
    const clueText = currentClues[clueIndex];

    if (clueText === "PISTA: Bandera" && targetCountry.ISO_A2) {
        const iso_a2 = targetCountry.ISO_A2;
        li.innerHTML = `La bandera es... <span class="fi fi-${iso_a2} clue-flag"></span>`;
    } else {
        li.textContent = clueText;
    }

    clueList.appendChild(li);

    clueIndex++;

    if (clueIndex >= currentClues.length) {
        const button = document.getElementById('next-clue-btn');
        button.disabled = true;
        button.textContent = 'No hay más pistas';
    }
}

function loadNewGame() {

    recentlyRevealedISO = null;

    // 1. Reset map colors from any temporary highlights
    globe.polygonCapColor(d => {
        const iso = d.properties.ISO_A3 || d.properties.ADM0_A3;
        return completedCountries.has(iso) ? 'rgba(0, 100, 0, 0.6)' : 'rgba(200, 200, 200, 0.8)';
    });

    // 2. Check for GAME OVER
    if (availableCountries.length === 0) {
        if (countriesData.length > 0) { // Check that game loaded at least once
            showMessage('¡Juego completado! Has adivinado todos los países.', true);
            document.getElementById('clue-box').style.display = 'none';
        }
        return; // Stop the game
    }

    // 3. Reset round variables
    currentRoundPoints = 100;
    clueIndex = 0;
    currentClues = [];

    document.getElementById('clue-list').innerHTML = '';
    document.getElementById('round-score').textContent = currentRoundPoints;

    const button = document.getElementById('next-clue-btn');
    button.disabled = false;
    button.textContent = 'Pedir Pista (coste: -15%)';

    const skipButton = document.getElementById('skip-btn');
    skipButton.disabled = false;

    // 4. Pick a new country from AVAILABLE list and REMOVE it
    let randomIndex = Math.floor(Math.random() * availableCountries.length);
    let candidate = availableCountries[randomIndex];
    let attempts = 0;

    while (
        availableCountries.length > 1 &&
        lastSkippedISO &&
        candidate.ISO_A3 === lastSkippedISO &&
        attempts < 10
    ) {
        randomIndex = Math.floor(Math.random() * availableCountries.length);
        candidate = availableCountries[randomIndex];
        attempts++;
    }

    targetCountry = availableCountries.splice(randomIndex, 1)[0]; // Pulls *and removes*
    lastSkippedISO = null;

    // 5. Load clues for the new country
    // --- New Clue Sorting Logic ---
    const allClues = [...targetCountry.clues_es];

    // 1. Extract the special (easy) clues
    // We use .find() to get the first match for each
    const banderaClue = allClues.find(c => c.startsWith("PISTA: Bandera"));
    const capitalClue = allClues.find(c => c.startsWith("La capital es"));
    const monedaClue = allClues.find(c => c.startsWith("La moneda es"));

    // 2. Get all other (general) clues
    const generalClues = allClues.filter(c => 
        c !== banderaClue && 
        c !== capitalClue && 
        c !== monedaClue
    );

    // 3. Shuffle only the general clues
    generalClues.sort(() => Math.random() - 0.5);

    // 4. Rebuild the final clues array in the correct order
    // (General first, then easy ones in order)
    currentClues = [...generalClues];
    if (monedaClue) currentClues.push(monedaClue);
    if (capitalClue) currentClues.push(capitalClue);
    if (banderaClue) currentClues.push(banderaClue);
    // --- End of New Logic ---
    showNextClue();

    console.log('Nuevo país:', getCountryNameES(targetCountry, targetCountry.ISO_A3));
    console.log('Países restantes:', availableCountries.length);
}

window.addEventListener('load', initGlobe);
