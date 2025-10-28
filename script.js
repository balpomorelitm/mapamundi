let globe;
let targetCountry = null;
let score = 0;
let countriesData = [];
let geoJsonData = null;

// Cargar datos del juego
async function loadGameData() {
    try {
        const response = await fetch('data.json');
        countriesData = await response.json();
        console.log('Cargados', countriesData.length, 'países');
    } catch (error) {
        console.error('Error cargando data.json:', error);
        alert('Error: No se pudo cargar data.json. Asegúrate de que el archivo existe.');
    }
}

// Cargar datos GeoJSON
async function loadGeoJSON() {
    try {
        // Intentar cargar desde archivo local primero
        const response = await fetch('ne_110m_admin_0_countries.geojson');
        geoJsonData = await response.json();
        console.log('GeoJSON cargado con', geoJsonData.features.length, 'países');
    } catch (error) {
        console.error('Error cargando GeoJSON local:', error);
        // Fallback a CDN de Natural Earth
        try {
            const response = await fetch('https://raw.githubusercontent.com/nvkelso/natural-earth-vector/master/geojson/ne_110m_admin_0_countries.geojson');
            geoJsonData = await response.json();
            console.log('GeoJSON cargado desde CDN');
        } catch (cdnError) {
            console.error('Error cargando desde CDN:', cdnError);
            alert('Error: No se pudo cargar el archivo GeoJSON.');
        }
    }
}

// Inicializar el globo
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
        .globeImageUrl('//unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
        .backgroundImageUrl('//unpkg.com/three-globe/example/img/night-sky.png')
        .polygonsData(geoJsonData.features)
        .polygonAltitude(d => d === globe.hoverPolygon ? 0.12 : 0.06)
        .polygonCapColor(d => d === globe.hoverPolygon ? 'steelblue' : 'rgba(200, 200, 200, 0.6)')
        .polygonSideColor(() => 'rgba(0, 100, 0, 0.15)')
        .polygonStrokeColor(() => '#111')
        .polygonLabel(({ properties: d }) => `
            <div style="background: rgba(0,0,0,0.8); padding: 10px; border-radius: 5px; color: white;">
                <b>${d.NAME || d.ADMIN || 'Desconocido'}</b>
            </div>
        `)
        .onPolygonClick(handleCountryClick)
        .onPolygonHover(hoverPolygon => globe.hoverPolygon = hoverPolygon)
        (document.getElementById('globeViz'));

    // Establecer vista inicial
    globe.pointOfView({ lat: 20, lng: 0, altitude: 2 });

    // Iniciar el juego
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
        
        // Resaltar el país correcto brevemente
        highlightCountry(polygon);
        
        setTimeout(() => {
            hideMessage();
            loadNewGame();
        }, 2000);
    } else {
        const clickedName = polygon.properties.NAME || polygon.properties.ADMIN || 'ese país';
        showMessage(`Incorrecto. Ese es ${clickedName}. ¡Inténtalo de nuevo! 🤔`, false);
        setTimeout(hideMessage, 2500);
    }
}

// Resaltar el país correcto
function highlightCountry(polygon) {
    const originalColor = globe.polygonCapColor();
    globe.polygonCapColor(d => d === polygon ? '#4CAF50' : (typeof originalColor === 'function' ? originalColor(d) : originalColor));
    
    setTimeout(() => {
        globe.polygonCapColor(d => d === globe.hoverPolygon ? 'steelblue' : 'rgba(200, 200, 200, 0.6)');
    }, 2000);
}

// Mostrar mensaje
function showMessage(text, isCorrect) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = 'message ' + (isCorrect ? 'correct' : 'incorrect');
    messageEl.style.display = 'block';
}

// Ocultar mensaje
function hideMessage() {
    document.getElementById('message').style.display = 'none';
}

// Cargar una nueva ronda del juego
function loadNewGame() {
    if (countriesData.length === 0) return;

    // Elegir un país aleatorio
    const randomIndex = Math.floor(Math.random() * countriesData.length);
    targetCountry = countriesData[randomIndex];

    // Mostrar pistas
    document.getElementById('capital').textContent = targetCountry.capital_es;
    document.getElementById('fact').textContent = targetCountry.fact_es;

    console.log('Nuevo país objetivo:', targetCountry.ISO_A3);
}

// Inicializar cuando la página cargue
window.addEventListener('load', initGlobe);
