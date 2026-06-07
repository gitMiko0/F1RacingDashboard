const API_DOMAIN = 'https://f1backend-black.vercel.app';
let seasonResults = {}; //global variable for cache access
// Global arrays to store favorite items
let favoriteConstructors = JSON.parse(localStorage.getItem('favoriteConstructors')) || [];
let favoriteDrivers = JSON.parse(localStorage.getItem('favoriteDrivers')) || [];
let favoriteCircuits = JSON.parse(localStorage.getItem('favoriteCircuits')) || [];

document.addEventListener('DOMContentLoaded', () => {
    const homeView = document.getElementById('homeView');
    const browseView = document.getElementById('browseView');
    const favoritesModal = document.getElementById('favoritesModal');
    const notification = document.getElementById('notification'); // Ensure this exists in your HTML

    //Shows the view inputted: In this project only homeView and browseView.
    function showView(view) {
        homeView.classList.add('hidden');
        browseView.classList.add('hidden');
        favoritesModal.classList.add('hidden');
        view.classList.remove('hidden');

        if (view === homeView) {
            document.getElementById('browseNav').classList.remove('hidden');
            document.getElementById('favoritesNav').classList.add('hidden');
        } else if (view === browseView) {
            document.getElementById('browseNav').classList.add('hidden');
            document.getElementById('favoritesNav').classList.remove('hidden');
        }
    }

    //Startup call
    showView(homeView);

    // ----------------------- Event listeners for navigation -----------------------------------
    const seasonSelect = document.getElementById('seasonSelect');

    document.getElementById('f1Logo').addEventListener('click', () => showView(homeView));
    document.getElementById('homeNav').addEventListener('click', () => showView(homeView));
    document.getElementById('browseNav').addEventListener('click', () => showView(browseView));

    // -------------------- Event listeners for Pop-ups ------------------------
    document.getElementById('favoritesNav').addEventListener('click', () => {
        displayFavorites();
        favoritesModal.classList.remove('hidden'); 
    });

    document.getElementById('closeFavoritesModal').addEventListener('click', () => {
        favoritesModal.classList.add('hidden'); 
    });

    document.getElementById('clearFavorites').addEventListener('click', () => {
        favoriteConstructors = [];  
        favoriteDrivers = []; 
        favoriteCircuits = [];  
        saveFavoritesToLocalStorage('constructor');  
        saveFavoritesToLocalStorage('driver'); 
        saveFavoritesToLocalStorage('circuit'); 
        displayFavorites();  
    });

    // Event listener for "View Races" button
    document.getElementById('viewRacesButton').addEventListener('click', () => {
        const season = document.getElementById('seasonSelect').value;

        if (!season) {
            if(notification) {
                notification.innerText = "Please select a season first.";  
                notification.classList.remove('hidden');  
            } else {
                alert("Please select a season first.");
            }
        } else {   
            if(notification) notification.classList.add('hidden'); 
            
            fetchSeason(season); 
            document.getElementById('browseNav').classList.add('hidden');
            document.getElementById('favoritesNav').classList.remove('hidden');
            homeView.classList.add('hidden');  
            browseView.classList.remove('hidden');
        }
    });
});

// Event delegation to handle clicking "View Results" button inside the races list
document.getElementById('racesList').addEventListener('click', function(event) {
    if (event.target.classList.contains('viewResults')) {
        const raceId = event.target.getAttribute('data-race-id');
        
        console.log("Race ID:", raceId);

        renderCircuitDetails(raceId);
        displayRaceResults(raceId);
    }
});

// handle clicks on constructor, driver, and circuit links in the browse view
document.getElementById('browseView').addEventListener('click', function(event) {
    const seasonRef = event.target.getAttribute('data-ref-season');

    // 1. Check if a constructor was clicked
    if (event.target.classList.contains('constructor-name')) {
        const constructorRef = event.target.getAttribute('data-ref');
        
        console.log('Constructor ref:', constructorRef);

        const constructorUrl = `${API_DOMAIN}/api/constructors/${constructorRef}`;
        fetch(constructorUrl)
            .then(response => response.json())
            .then(constructorInfo => {
                if (constructorInfo && !constructorInfo.error) {
                    document.getElementById('constructorDetails').innerHTML = `
                        <p class="text-white"><strong>Constructor:</strong> ${constructorInfo.name}</p>
                        <p class="text-white"><strong>Nationality:</strong> ${constructorInfo.nationality}<br>
                        <a href="${constructorInfo.url}" target="_blank" class="text-red-500">Wikipedia</a>
                        <button id="addConstructorFavorite" data-cons="${constructorInfo.name}" class="mt-2 bg-gray-700 text-white p-2 hover:bg-red-900 rounded">
                        Add to Favorites
                        </button>
                        <div id="faveNotification_${constructorInfo.constructorRef}" class="hidden text-s bg-red-900 text-white p-2 mt-4 rounded shadow-lg"></div>
                    `;

                    const addToFavoritesButton = document.getElementById('addConstructorFavorite');
                    addToFavoritesButton.addEventListener('click', function() {
                        const name = this.getAttribute('data-cons');
                        if (!favoriteConstructors.includes(name)) {
                            favoriteConstructors.push(name);
                            showNotification(`${name} has been added to your favorites!`, constructorInfo.constructorRef);
                            saveFavoritesToLocalStorage('constructor');  
                        } else {
                            showNotification(`${name} is already in favorites!`, constructorInfo.constructorRef);
                        }
                    });

                    displayConstructorRaceResults(constructorRef, seasonRef);
                    document.getElementById('constructorModal').classList.remove('hidden');
                } else {
                    console.error("Constructor not found");
                }
            })
            .catch(error => console.error('Error fetching constructor data:', error));
    }

    // 2. Check if a driver was clicked
    if (event.target.classList.contains('driver-name')) {
        const driverRef = event.target.getAttribute('data-ref3');
        console.log('Driver ref:', driverRef);

        const driverUrl = `${API_DOMAIN}/api/drivers/${driverRef}`;
        fetch(driverUrl)
            .then(response => response.json())
            .then(driver => {
                if (driver && !driver.error) {
                    document.getElementById('driverDetails').innerHTML = `
                        <p class="text-white"><strong>Driver:</strong> ${driver.forename} ${driver.surname}</p>
                        <p class="text-white"><strong>Nationality:</strong> ${driver.nationality}</p>
                        <p class="text-white"><strong>Date of Birth:</strong> ${driver.dob}</p>
                        <a href="${driver.url}" target="_blank" class="text-red-500">Wikipedia</a>
                        <button id="addDriverFavorite" data-driver="${driver.forename} ${driver.surname}" class="mt-2 bg-gray-700 text-white p-2 hover:bg-red-900 rounded">
                            Add to Favorites
                        </button>
                        <div id="faveNotification_${driver.driverRef}" class="hidden text-s bg-red-900 text-white p-2 mt-4 rounded shadow-lg"></div>
                    `;
                    
                    const addToFavoritesButton = document.getElementById('addDriverFavorite');
                    addToFavoritesButton.addEventListener('click', function() {
                        const name = this.getAttribute('data-driver');
                        if (!favoriteDrivers.includes(name)) {
                            favoriteDrivers.push(name);
                            showNotification(`${name} has been added to your favorites!`, driver.driverRef);
                            saveFavoritesToLocalStorage('driver');  
                        } else {
                            showNotification(`${name} is already in favorites.`, driver.driverRef);
                        }
                    });

                    displayDriverRaceResults(driverRef, seasonRef);
                    document.getElementById('driverModal').classList.remove('hidden');
                }
            })
            .catch(error => console.error('Error fetching driver data:', error));
    }

    // 3. Check if a circuit was clicked
    if (event.target.classList.contains('circuit-name')) {  
        const circuitId = event.target.getAttribute('data-circuitId');
        console.log('Circuit ID:', circuitId);

        const circuitUrl = `${API_DOMAIN}/api/circuits/${circuitId}`;
        fetch(circuitUrl)
            .then(response => response.json())
            .then(circuit => {
                if (circuit && !circuit.error) {
                    const circuitModalDetailsElement = document.getElementById('circuitModalDetails');
                    if (circuitModalDetailsElement) {
                        circuitModalDetailsElement.innerHTML = `
                            <p class="text-white"><strong>Circuit Name:</strong> ${circuit.name}</p>
                            <p class="text-white"><strong>Location:</strong> ${circuit.location}</p>
                            <p class="text-white"><strong>Country:</strong> ${circuit.country}</p>
                            <a href="${circuit.url}" target="_blank" class="text-red-500">Wikipedia</a><br>
                            <button id="addCircuitFavorite" data-circuit="${circuit.name}" class="bg-gray-700 text-white p-2 hover:bg-red-900 rounded mt-2">
                                Add to Favorites
                            </button>
                            <div id="faveNotification_${circuit.circuitId || circuit.circuitRef}" class="h-3/12 w-3/6 hidden text-s bg-red-900 text-white p-2 mt-4 rounded shadow-lg"></div>
                        `;
                    }

                    const addToFavoritesButton = document.getElementById('addCircuitFavorite');
                    addToFavoritesButton.addEventListener('click', function() {
                        const name = this.getAttribute('data-circuit');
                        if (!favoriteCircuits.includes(name)) {
                            favoriteCircuits.push(name);
                            showNotification(`${name} has been added to your favorites!`, circuit.circuitId || circuit.circuitRef);
                            saveFavoritesToLocalStorage('circuit');  
                        } else {
                            showNotification(`${name} is already in favorites!`, circuit.circuitId || circuit.circuitRef);
                        }
                    });

                    document.getElementById('circuitModal').classList.remove('hidden');
                }
            })
            .catch(error => console.error('Error fetching circuit data:', error));
    }
});

// Close modal functionalities
document.getElementById('closecircuitModal').addEventListener('click', function() {
    document.getElementById('circuitModal').classList.add('hidden');
});
document.getElementById('closeConstructorModal').addEventListener('click', function() {
    document.getElementById('constructorModal').classList.add('hidden');
});
document.getElementById('closeDriverModal').addEventListener('click', function() {
    document.getElementById('driverModal').classList.add('hidden');
});

// ---------------------------- Data Handling Functions ----------------------------------------------------

function fetchSeason(season) {
    const url = `${API_DOMAIN}/api/races/season/${season}`;

    const storedResults = localStorage.getItem(`results_${season}`);
    if (storedResults) {
        console.log("Using cached data");
        seasonResults[season] = JSON.parse(storedResults); 
        showSeasonRaces(seasonResults[season]); 
        return;
    }

    console.log(`Fetching data for season ${season} from API: ${url}`);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            if (!data.error) {
                console.log("Fetched data:", data);
                localStorage.setItem(`results_${season}`, JSON.stringify(data));
                seasonResults[season] = data;  
                showSeasonRaces(data);
            } else {
                console.error(data.error);
                showSeasonRaces([]);
            }
        })
        .catch(error => console.error("Error fetching results:", error));
}

// --------------------------------- Race Display Functions ----------------------------------------------

function showSeasonRaces(data) {
    const racesList = document.getElementById('racesList');
    racesList.innerHTML = '';

    if (!data || data.length === 0) {
        racesList.innerHTML = '<p class="text-white">No races available for this season.</p>';
        return;
    }

    data.forEach(race => {
        const raceItem = document.createElement('li');
        raceItem.classList.add('backdrop-blur-sm', 'p-4', 'mb-2', 'rounded', 'flex', 'justify-between');

        raceItem.innerHTML = `
            <div class="flex flex-col h-14 mb-2">
                <p class="mb-0 text-white text-s font-bold">Round: ${race.round}</p>
                <h3 class="mt-0 mb-0 text-white font-bold text-s">${race.name}</h3>
                <button id="viewResults_${race.id}" class="w-32 hover:bg-red-900 bg-gray-700 viewResults text-white rounded" 
                data-race-id="${race.id}" data-race-name="${race.name}">
                    View Results
                </button>
            </div>
        `;
        racesList.appendChild(raceItem);
    });
}

function renderRaceResults(data) {
    if (data && data.length > 0 && !data.error) {
        const raceContent = document.getElementById('raceData');
        raceContent.innerHTML = ''; 

        let tableHTML = `
        <div class="rounded-lg bg-gray-800 flex-none w-full p-4 shadow-lg">
            <h3 class="rounded-lg text-white font-semibold m-0">Race Results</h3>
            <div class="overflow-x-auto">    
                <table class="rounded-lg table-auto w-full border-collapse text-left">
                    <thead>
                        <tr class="bg-gray-800 font-semibold">
                            <th class="px-4 py-2 text-white">Pos</th>
                            <th class="px-4 py-2 text-white">Name</th>
                            <th class="px-4 py-2 text-white">Constructor</th>
                            <th class="px-4 py-2 text-white">Laps</th>
                            <th class="px-4 py-2 text-white">Pts</th>
                        </tr>
                    </thead>
                <tbody>
        `;

        data.forEach(result => {
            let cmpDriver = result.driver.forename + ' ' + result.driver.surname;
            let cmpCons = result.constructor.name;
            tableHTML += `
                <tr class="rounded-lg border-t">
                    <td class="rounded-lg px-4 py-2 text-white font-bold">${result.position}</td>
                    <td class="flex items-center driver-name px-4 py-2 text-xs text-white hover:text-red-500 cursor-pointer" 
                        data-ref-season="${result.race.year}"
                        data-ref3="${result.driver.ref}">
                        ${result.driver.forename} ${result.driver.surname} ${getFavoriteIcon('driver', cmpDriver)}
                    </td>
                    <td class="pointer-events-auto px-4 py-2 text-xs text-white hover:text-red-500 cursor-pointer">
                        <a class="constructor-name flex items-center" 
                            data-ref="${result.constructor.ref}" 
                            data-ref2="${result.race.id}" 
                            data-ref-season="${result.race.year}">
                            ${result.constructor.name} ${getFavoriteIcon('constructor', cmpCons)}
                        </a>
                    </td>
                    <td class="px-4 py-2 text-xs text-white">${result.laps}</td>
                    <td class="px-4 py-2 text-xs text-white">${result.points}</td>
                </tr>
            `;
        });

        tableHTML += `
                    </tbody>
                </table>
            </div>
        </div>
        `;
        raceContent.innerHTML = tableHTML;
    } else {
        document.getElementById('raceData').innerHTML = '<p class="text-white">No race results available for this race.</p>';
    }
}

function displayRaceResults(raceId) {
    const raceUrl = `${API_DOMAIN}/api/results/race/${raceId}`;
    
    // Clear out qualifying section since it's not in the assignment API requirements
    const qualifyingContainer = document.getElementById('qualifyingData');
    if (qualifyingContainer) qualifyingContainer.innerHTML = '';

    fetch(raceUrl)
        .then(response => response.json())
        .then(data => {
            if(!data.error) {
                renderRaceResults(data);
            } else {
                document.getElementById('raceData').innerHTML = `<p class="text-white">${data.error}</p>`;
            }
        })
        .catch(error => console.error("Error fetching race results:", error));
}

function renderCircuitDetails(raceId) {
    const raceUrl = `${API_DOMAIN}/api/results/race/${raceId}`;

    fetch(raceUrl)
        .then(response => response.json())
        .then(raceData => {
            if (raceData && raceData.length > 0 && !raceData.error) {
                const race = raceData[0].race;
                const circuit = race.circuit;
                const circuitDetailsElement = document.getElementById('circuitDetails');

                circuitDetailsElement.innerHTML = `
                    <div class="flex items-center space-x-4">
                        <p class="pb-0 pt-0 p-4 text-white"><strong>Round:</strong> ${race.round}</p>
                        <p class="pb-0 pt-0 p-4 text-white"><strong>Year:</strong> ${race.year}</p>
                        <p class="pb-0 pt-0 pr-2 text-white"><strong>Circuit Name:</strong></p>
                        <strong>
                            <a data-circuitId="${circuit.circuitId || circuit.id}" 
                               class="border-2 border-red-800 p-2 rounded-lg hover:text-red-700 text-white circuit-name cursor-pointer">
                                ${circuit.name}
                            </a>
                        </strong> ${getFavoriteIcon('circuit', circuit.name)}
                        <p class="pb-0 pt-0 pr-2 text-white pl-4"><strong>Date:</strong> ${race.date}</p>
                    </div>
                `;
            } else {
                document.getElementById('circuitDetails').innerHTML = '<p class="text-white">No circuit details available.</p>';
            }
        })
        .catch(error => console.error('Error fetching race details:', error));
}

function displayDriverRaceResults(driverRef, seasonRef) {
    const driverUrl = `${API_DOMAIN}/api/driverResults/${driverRef}/${seasonRef}`;
    fetchRaceResults(driverUrl, 'driverRaceResult');
}

function displayConstructorRaceResults(constructorRef, seasonRef) {
    const constructorUrl = `${API_DOMAIN}/api/constructorResults/${constructorRef}/${seasonRef}`;
    fetchRaceResults(constructorUrl, 'constructorRaceResult');
}

function fetchRaceResults(url, resultElementId) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const raceContent = document.getElementById(resultElementId);
            raceContent.innerHTML = '';

            if (data && data.length > 0 && !data.error) {
                let tableHTML = generateRaceResultsHTML(data);
                raceContent.innerHTML = tableHTML;
            } else {
                raceContent.innerHTML = '<p class="text-white">No race results available for this entry in this season.</p>';
            }
        })
        .catch(error => console.error("Error fetching race results:", error));
}

function generateRaceResultsHTML(data) {
    let tableHTML = `
        <div class="bg-gray-800 flex-none w-full p-4 rounded-lg shadow-lg">
            <h3 class="text-xl text-white font-semibold mb-2">Race Results</h3>
            <div class="overflow-x-auto">    
                <table class="table-auto w-full border-collapse text-left">
                    <thead>
                        <tr class="bg-gray-800 font-semibold">
                            <th class="px-4 py-2 text-white">Round</th>
                            <th class="px-4 py-2 text-white">Name</th>
                            <th class="px-4 py-2 text-white">Driver</th>
                            <th class="px-4 py-2 text-white">Pos</th>
                        </tr>
                    </thead>
                    <tbody>
    `;

    data.forEach(result => {
        tableHTML += `
            <tr class="border-t">
                <td class="px-4 py-1 text-white">${result.race.round || result.round}</td>
                <td class="px-4 py-1 text-white">${result.race.name || result.name}</td>
                <td class="px-4 py-1 text-s text-white hover:text-red-500">
                    ${result.driver.forename} ${result.driver.surname}
                </td>
                <td class="px-4 py-2 text-white">${result.positionOrder || result.position}</td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table></div></div>`;
    return tableHTML;
}

// ------------------------------------------ START OF Favorites Handling ------------------------------------------

function displayFavorites() {
    const favoriteConstructorsContainer = document.getElementById('favoriteConstructors');
    const favoriteDriversContainer = document.getElementById('favoriteDrivers');
    const favoriteCircuitsContainer = document.getElementById('favoriteCircuits');

    favoriteConstructorsContainer.innerHTML = '';
    favoriteDriversContainer.innerHTML = '';
    favoriteCircuitsContainer.innerHTML = '';

    if (favoriteConstructors.length === 0) {
        favoriteConstructorsContainer.innerHTML = '<p class="text-white">No constructors added to favorites.</p>';
    } else {
        favoriteConstructors.forEach(constructorRef => {
            const listItem = document.createElement('div');
            listItem.classList.add('text-white', 'p-2', 'border-b', 'border-gray-600');
            listItem.innerHTML = `
                <p> ${constructorRef}</p>
                <button class="text-red-600" onclick="removeFromFavorites('${constructorRef}', 'constructor')">Remove</button>
            `;
            favoriteConstructorsContainer.appendChild(listItem);
        });
    }

    if (favoriteDrivers.length === 0) {
        favoriteDriversContainer.innerHTML = '<p class="text-white">No drivers added to favorites.</p>';
    } else {
        favoriteDrivers.forEach(driverRef => {
            const listItem = document.createElement('div');
            listItem.classList.add('text-white', 'p-2', 'border-b', 'border-gray-600');
            listItem.innerHTML = `
                <p> ${driverRef}</p>
                <button class="text-red-600" onclick="removeFromFavorites('${driverRef}', 'driver')">Remove</button>
            `;
            favoriteDriversContainer.appendChild(listItem);
        });
    }

    if (favoriteCircuits.length === 0) {
        favoriteCircuitsContainer.innerHTML = '<p class="text-white">No circuits added to favorites.</p>';
    } else {
        favoriteCircuits.forEach(circuitRef => {
            const listItem = document.createElement('div');
            listItem.classList.add('text-white', 'p-2', 'border-b', 'border-gray-600');
            listItem.innerHTML = `
                <p> ${circuitRef}</p>
                <button class="text-red-600" onclick="removeFromFavorites('${circuitRef}', 'circuit')">Remove</button>
            `;
            favoriteCircuitsContainer.appendChild(listItem);
        });
    }
}

// Expose globally so inline onclick events in HTML strings work
window.removeFromFavorites = function(itemRef, type) {
    let favoritesArray;
    switch (type) {
        case 'constructor':
            favoritesArray = favoriteConstructors;
            break;
        case 'driver':
            favoritesArray = favoriteDrivers;
            break;
        case 'circuit':
            favoritesArray = favoriteCircuits;
            break;
    }

    const index = favoritesArray.indexOf(itemRef);
    if (index !== -1) {
        favoritesArray.splice(index, 1);
        saveFavoritesToLocalStorage(type);
        displayFavorites(); 
    }
}

function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

function saveFavoritesToLocalStorage(category) {
    switch (category) {
        case 'constructor':
            localStorage.setItem('favoriteConstructors', JSON.stringify(favoriteConstructors));
            break;
        case 'driver':
            localStorage.setItem('favoriteDrivers', JSON.stringify(favoriteDrivers));
            break;
        case 'circuit':
            localStorage.setItem('favoriteCircuits', JSON.stringify(favoriteCircuits));
            break;
    }
}
  
function getFavoriteIcon(type, ref) {
    let iconHTML = '<img src="./images/tire.png" class="h-6 w-6 favorite-icon">';
    
    if (type === 'driver' && favoriteDrivers.includes(ref)) {
        return iconHTML;
    } else if (type === 'constructor' && favoriteConstructors.includes(ref)) {
        return iconHTML;
    } else if (type === 'circuit' && favoriteCircuits.includes(ref)){
        return iconHTML;
    } else {
        return '';
    }
}

function showNotification(message, ref) {
    if (!ref) return;
    let toFind = `faveNotification_${ref}`;
    const notification = document.getElementById(toFind);
    
    if (notification) {
        notification.textContent = message;
        notification.classList.remove('hidden', 'opacity-0');
        notification.classList.add('opacity-100');

        setTimeout(() => {
            notification.classList.remove('opacity-100');
            notification.classList.add('opacity-0');
            
            setTimeout(() => {
                notification.classList.add('hidden');
            }, 300); 
        }, 2000);
    }
}