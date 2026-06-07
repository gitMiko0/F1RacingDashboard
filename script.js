const API_DOMAIN = 'https://f1backend-black.vercel.app';


// -------------------- Event listeners for Pop-ups (constructors and driver details) ------------------------

// Handle clicks on constructor, driver, and circuit links
document.getElementById('browseView').addEventListener('click', function(event) {
    const seasonRef = event.target.getAttribute('data-ref-season');

    // 1. FIX CONSTRUCTOR FETCH
    if (event.target.classList.contains('constructor-name')) {
        const constructorRef = event.target.getAttribute('data-ref');
        
        // Changed from /constructors.php to your structured API endpoint
        const constructorUrl = `${API_DOMAIN}/api/constructors`;
        fetch(constructorUrl)
            .then(response => response.json())
            .then(constructors => {
                const constructorInfo = constructors.find(c => c.constructorRef.toLowerCase() === constructorRef.toLowerCase());
                
                if (constructorInfo) {
                    document.getElementById('constructorDetails').innerHTML = `
                        <p class="text-white"><strong>Constructor:</strong> ${constructorInfo.name}</p>
                        <p class="text-white"><strong>Nationality:</strong> ${constructorInfo.nationality}</p>
                        <a href="${constructorInfo.url}" target="_blank" class="text-red-500">Wikipedia</a>
                        <button id="addConstructorFavorite" data-cons="${constructorInfo.name}" class="mt-2 bg-gray-700 text-white p-2 hover:bg-red-900 rounded">
                            Add to Favorites
                        </button>
                        <div id="faveNotification_${constructorInfo.constructorRef}" class="hidden text-s bg-red-900 text-white p-2 mt-4 rounded shadow-lg"></div>
                    `;

                    document.getElementById('addConstructorFavorite').addEventListener('click', function() {
                        const name = this.getAttribute('data-cons');
                        if (!favoriteConstructors.includes(name)) {
                            favoriteConstructors.push(name);
                            saveFavoritesToLocalStorage('constructor');
                        }
                    });

                    displayConstructorRaceResults(constructorRef, seasonRef);
                    document.getElementById('constructorModal').classList.remove('hidden');
                }
            })
            .catch(error => console.error('Error fetching constructor data:', error));
    }

    // 2. FIX DRIVER FETCH
    if (event.target.classList.contains('driver-name')) {
        const driverRef = event.target.getAttribute('data-ref3');

        // Target clean API pattern: /api/drivers/:ref
        const driverUrl = `${API_DOMAIN}/api/drivers/${driverRef}`;
        fetch(driverUrl)
            .then(response => response.json())
            .then(driver => {
                document.getElementById('driverDetails').innerHTML = `
                    <p class="text-white"><strong>Driver:</strong> ${driver.forename} ${driver.surname}</p>
                    <p class="text-white"><strong>Nationality:</strong> ${driver.nationality}</p>
                    <p class="text-white"><strong>Date of Birth:</strong> ${driver.dob}</p>
                    <a href="${driver.url}" target="_blank" class="text-red-500">Wikipedia</a>
                    <button id="addDriverFavorite" data-driver="${driver.forename} ${driver.surname}" class="mt-2 bg-gray-700 text-white p-2 hover:bg-red-900 rounded">
                        Add to Favorites
                    </button>
                `;
                
                document.getElementById('addDriverFavorite').addEventListener('click', function() {
                    const name = this.getAttribute('data-driver');
                    if (!favoriteDrivers.includes(name)) {
                        favoriteDrivers.push(name);
                        saveFavoritesToLocalStorage('driver');
                    }
                });

                displayDriverRaceResults(driverRef, seasonRef);
                document.getElementById('driverModal').classList.remove('hidden');
            })
            .catch(error => console.error('Error fetching driver data:', error));
    }

    // 3. FIX CIRCUIT FETCH
    if (event.target.classList.contains('circuit-name')) {
        const circuitId = event.target.getAttribute('data-circuitId');

        // Target clean API pattern: /api/circuits/:id
        const circuitUrl = `${API_DOMAIN}/api/circuits/${circuitId}`;
        fetch(circuitUrl)
            .then(response => response.json())
            .then(circuit => {
                const circuitModalDetailsElement = document.getElementById('circuitModalDetails');
                if (circuitModalDetailsElement) {
                    circuitModalDetailsElement.innerHTML = `
                        <p class="text-white"><strong>Circuit Name:</strong> ${circuit.name}</p>
                        <p class="text-white"><strong>Location:</strong> ${circuit.location}</p>
                        <p class="text-white"><strong>Country:</strong> ${circuit.country}</p>
                        <a href="${circuit.url}" target="_blank" class="text-red-500">Wikipedia</a><br>
                        <button id="addCircuitFavorite" data-circuit="${circuit.name}" class="bg-gray-700 text-white p-2 hover:bg-red-900 rounded">
                            Add to Favorites
                        </button>
                    `;
                }

                document.getElementById('addCircuitFavorite').addEventListener('click', function() {
                    const name = this.getAttribute('data-circuit');
                    if (!favoriteCircuits.includes(name)) {
                        favoriteCircuits.push(name);
                        saveFavoritesToLocalStorage('circuit');
                    }
                });

                document.getElementById('circuitModal').classList.remove('hidden');
            })
            .catch(error => console.error('Error fetching circuit data:', error));
    }
});

// 4. FIX SEASON DATA FETCHING
function fetchSeason(season) {
    // Maps cleanly onto: /api/races/season/:year
    const url = `${API_DOMAIN}/api/races/season/${season}`;

    const storedResults = localStorage.getItem(`results_${season}`);
    if (storedResults) {
        seasonResults[season] = JSON.parse(storedResults);
        showSeasonRaces(seasonResults[season]);
        return;
    }

    fetch(url)
        .then(response => response.json())
        .then(data => {
            localStorage.setItem(`results_${season}`, JSON.stringify(data));
            seasonResults[season] = data;
            showSeasonRaces(data);
        })
        .catch(error => console.error("Error fetching season races:", error));
}

// 5. FIX COMBINED RACE RESULTS FETCH
function displayRaceResults(raceId) {
    // Note: Since qualifying.json was commented out as non-functional in your Express server,
    // we bypass rendering qualifying or catch it cleanly to protect UI workflow.
    const raceUrl = `${API_DOMAIN}/api/results/race/${raceId}`;

    document.getElementById('qualifyingData').innerHTML = '<p class="text-gray-400">Qualifying data unavailable for this assignment.</p>';

    // Fetch Race Results Data via express pattern
    fetch(raceUrl)
        .then(response => response.json())
        .then(data => renderRaceResults(data))
        .catch(error => console.error("Error fetching race results:", error));
}

// 6. FIX CIRCUIT DETAILS VIA RACE ID
function renderCircuitDetails(raceId) {
    // Express doesn't have an exact structural lookup for 'race details' directly matching your array setup, 
    // but your script looks into an index object output. We'll map to the raw /api/results/race endpoint safely:
    const raceUrl = `${API_DOMAIN}/api/results/race/${raceId}`;

    fetch(raceUrl)
        .then(response => response.json())
        .then(raceData => {
            if (raceData && raceData.length > 0) {
                const firstEntry = raceData[0];
                const race = firstEntry.race; 
                // Adjust path layout dependent on your results JSON nested architecture schemas
                const circuitDetailsElement = document.getElementById('circuitDetails');

                circuitDetailsElement.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <p class="pb-0 pt-0 p-4"><strong>Round:</strong> ${race.round || 'N/A'}</p>
                        <p class="pb-0 pt-0 p-4"><strong>Year:</strong> ${race.year}</p>
                        <p class="pb-0 pt-0 pr-2"><strong>Circuit Name:</strong></p>
                        <strong>
                            <a data-circuitId="${race.circuitId || 1}" class="border-2 border-red-800 p-2 rounded-lg hover:text-red-700 text-white circuit-name cursor-pointer">
                                ${race.name}
                            </a>
                        </strong>
                    </div>
                `;
            }
        })
        .catch(error => console.error('Error rendering circuit details:', error));
}

// 7. FIX NESTED DRIVER/CONSTRUCTOR SEASON METRICS
function displayDriverRaceResults(driverRef, seasonRef) {
    // Maps cleanly into /api/driverResults/:ref/:year
    const driverUrl = `${API_DOMAIN}/api/driverResults/${driverRef}/${seasonRef}`;
    fetchRaceResults(driverUrl, 'driverRaceResult');
}

function displayConstructorRaceResults(constructorRef, seasonRef) {
    // Maps cleanly into /api/constructorResults/:ref/:year
    const constructorUrl = `${API_DOMAIN}/api/constructorResults/${constructorRef}/${seasonRef}`;
    fetchRaceResults(constructorUrl, 'constructorRaceResult');
}
