const API_DOMAIN = 'https://www.randyconnolly.com/funwebdev/3rd/api/f1';
let seasonResults = {}; //global variable for cache access
// Global arrays to store favorite items
let favoriteConstructors = JSON.parse(localStorage.getItem('favoriteConstructors')) || [];
let favoriteDrivers = JSON.parse(localStorage.getItem('favoriteDrivers')) || [];
let favoriteCircuits = JSON.parse(localStorage.getItem('favoriteCircuits')) || [];

function getFavoriteIcon(type, ref) {
    let iconHTML = '<img src="./images/tire.png" class="h-6 w-6 favorite-icon">';
    console.log("Stored favoriteDrivers:", favoriteDrivers);
    console.log("Stored favoriteConstructors:", favoriteConstructors);
    console.log("Stored favoriteCircuits:", favoriteCircuits);
    console.log("Comparing ref:", ref);
    
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

//message must be backticked if using a variable!
//BUG: This function is super buggy, switching through race results make it inconsistent, sometimes notifications flat out don't show up.
function showNotification(message, ref) {
    console.log('Calling showNotification()');
    let toFind = `faveNotification_${ref}`;
    const notification = document.getElementById(toFind);
    console.log(toFind);
    
    notification.textContent = message;
    notification.classList.remove('hidden', 'opacity-0');
    notification.classList.add('opacity-100');


    // Remove the notification after the specified duration
    setTimeout(() => {
        notification.classList.remove('hidden');

        // Delay to ensure the fade-out transition completes before hiding
        setTimeout(() => {
            notification.classList.add('hidden');
        }, 100);  // Duration in ms
    }, 2000);
}

document.addEventListener('DOMContentLoaded', () => {
    const homeView = document.getElementById('homeView');
    const browseView = document.getElementById('browseView');
    const favoritesModal = document.getElementById('favoritesModal');

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
    // Get the select element and the span where the selected season will be displayed
    const seasonSelect = document.getElementById('seasonSelect');
    const seasonYear = document.getElementById('seasonYear');

    // Listen for changes on the dropdown
    seasonSelect.addEventListener('change', function() {
        // Update the display text with the selected season
        const selected = seasonSelect.value;
    });

    document.getElementById('f1Logo').addEventListener('click', () => {
        showView(homeView);
    });

    document.getElementById('homeNav').addEventListener('click', () => {
        showView(homeView);
    });

    document.getElementById('browseNav').addEventListener('click', () => {
        showView(browseView);
    });

// -------------------- Event listeners for Pop-ups (constructors and driver details) ------------------------

    document.getElementById('favoritesNav').addEventListener('click', () => {
        favoritesModal.classList.remove('hidden'); // Show favorites modal
    });

    document.getElementById('closeFavoritesModal').addEventListener('click', () => {
        favoritesModal.classList.add('hidden'); // Hide favorites modal
    });

    // TODO: Functionality for clearFavorites
    document.getElementById('clearFavorites').addEventListener('click', () => {
        const favoritesList = document.getElementById('favoritesList');
        favoritesList.innerHTML = ''; // Clear the list
    });

    // Event listener for "View Races" button
    document.getElementById('viewRacesButton').addEventListener('click', () => {
        const season = document.getElementById('seasonSelect').value;

        if (!season) {
            notification.innerText = "Please select a season first.";  // Show message
            notification.classList.remove('hidden');  // Unhide message
        } else
        {   // Switch to browseView
            notification.classList.add('hidden'); 
            
            fetchSeason(season); //Only fetch when there is a season request
                document.getElementById('browseNav').classList.add('hidden');
                document.getElementById('favoritesNav').classList.remove('hidden');
                homeView.classList.add('hidden');  
                browseView.classList.remove('hidden');
        }
    });
});


// Event delegation to handle clicking "View Results" button
racesList.addEventListener('click', function(event) {
    if (event.target.classList.contains('viewResults')) {
        const raceId = event.target.getAttribute('data-race-id');
        const raceName = event.target.getAttribute('data-race-name');
        
        // Testing purposes:
        console.log("Race ID:", raceId);
        console.log("Race Name:", raceName);

        renderCircuitDetails(raceId);
        displayRaceResults(raceId);
    }
});


// handle clicks on constructor and driver links
document.getElementById('browseView').addEventListener('click', function(event) {
    const seasonRef = event.target.getAttribute('data-ref-season');

    // Check if a constructor was clicked
    if (event.target.classList.contains('constructor-name')) {
        const constructorRef = event.target.getAttribute('data-ref');
        const raceIdRef = event.target.getAttribute('data-ref2');
        
        console.log('Constructor ref:', constructorRef);
        console.log('Race ID Ref:', raceIdRef);

        const constructorUrl = `${API_DOMAIN}/constructors.php`;
        // Fetch constructor data from the API
        fetch(constructorUrl)
            .then(response => response.json())
            .then(constructors => {
                // Find the constructor data based on constructorRef
                const constructorInfo = constructors.find(constructor => constructor.constructorRef === constructorRef);
                console.log('Constructor data:', constructorInfo);

                if (constructorInfo) {
                    // Update modal with constructor details
                    document.getElementById('constructorDetails').innerHTML = `
                        <p class="text-white"><strong>Constructor:</strong></p>
                        ${constructorInfo.name}</p>
                        <p class="text-white"><strong>Nationality:</strong> ${constructorInfo.nationality}<br>
                        <a href="${constructorInfo.url}" class="text-red-500">Wikipedia</a>
                        <button id="addConstructorFavorite" data-cons="${constructorInfo.name}" class="mt-2 bg-gray-700 text-white p-2 hover:bg-red-900 rounded">
                        Add to Favorites
                        </button>
                        <div id="faveNotification_${constructorInfo.ref}" class="hidden text-s bg-red-900 text-white p-2 mt-4 rounded shadow-lg"></div>
                    `;

                    // Attach the event listener to the "Add to Favorites" button
                    const addToFavoritesButton = document.getElementById('addConstructorFavorite');
                    addToFavoritesButton.addEventListener('click', function() {
                        const constructorRef = this.getAttribute('data-cons');
                        
                        // Check if the constructor is already in the favorites array
                        if (!favoriteConstructors.includes(constructorRef)) {
                            favoriteConstructors.push(constructorRef);
                            const constructorElement = document.getElementById(constructorRef);
                            console.log("Constructor added to favorites:", constructorRef);
                            showNotification(`${constructorRef} has been added to your favorites!`, constructorInfo.ref);
                            saveFavoritesToLocalStorage('constructor');  // Save to localStorage
                        } else {
                            showNotification(`${constructorRef} is already in favorites!`, constructorInfo.ref);
                            console.log("Constructor is already in favorites:", constructorRef);
                        }
                    });

                    // Show the constructor&season-specific race results display function
                    displayConstructorRaceResults(constructorRef, seasonRef);
                    // Show the constructor modal
                    document.getElementById('constructorModal').classList.remove('hidden');
                }
            })
            .catch(error => {
                console.error('Error fetching constructor data:', error);
            });
    }

    // Check if a driver was clicked
    if (event.target.classList.contains('driver-name')) {
        const driverRef = event.target.getAttribute('data-ref3');
        console.log('Driver ref:', driverRef);

        // Fetch driver data and display the driver modal
        const driverUrl = `${API_DOMAIN}/drivers.php?ref=${driverRef}`;
        fetch(driverUrl)
            .then(response => response.json())
            .then(driver => {
                document.getElementById('driverDetails').innerHTML = `
                    <p class="text-white"><strong>Driver:</strong> ${driver.forename} ${driver.surname}</p>
                    <p class="text-white"><strong>Nationality:</strong> ${driver.nationality}</p>
                    <p class="text-white"><strong>Date of Birth:</strong></p>
                    <p>${driver.dob}</p>
                    <a href="${driver.url}" class="text-red-500">Wikipedia</a>
                    <button id="addDriverFavorite" data-driver="${driver.forename} ${driver.surname}" class="mt-2 bg-gray-700 text-white p-2 hover:bg-red-900 rounded">
                        Add to Favorites
                        </button>
                    <div id="faveNotification_${driver.ref}" class="hidden text-s bg-red-900 text-white p-2 mt-4 rounded shadow-lg"></div>
                `;
                // Attach the event listener to the "Add to Favorites" button
                const addToFavoritesButton = document.getElementById('addDriverFavorite');
                addToFavoritesButton.addEventListener('click', function() {
                    const driverRef = this.getAttribute('data-driver');
                    
                    // Check if the constructor is already in the favorites array
                    if (!favoriteDrivers.includes(driverRef)) {
                        favoriteDrivers.push(driverRef);
                        console.log("Driver added to favorites:", driverRef);
                        showNotification(`${driverRef} has been added to your favorites!`, driver.ref);
                        saveFavoritesToLocalStorage('driver');  // Save to localStorage
                    } else {
                        showNotification(`${driverRef} is already in favorites.`, driver.ref);
                        console.log("Driver is already in favorites:", driverRef);
                    }
                });
                // Show the driver&season-specific race results
                displayDriverRaceResults(driverRef, seasonRef);
                // Show the driver modal
                document.getElementById('driverModal').classList.remove('hidden');
            })
            .catch(error => console.error('Error fetching driver data:', error));
    }

 // Check if a circuit was clicked
if (event.target.classList.contains('circuit-name')) {  // This checks if a circuit name link was clicked
    const circuitId = event.target.getAttribute('data-circuitId');
    console.log('Circuit ID:', circuitId);

    // Fetch circuit data and display the circuit modal
    const circuitUrl = `${API_DOMAIN}/circuits.php?id=${circuitId}`;
    console.log('CircuitUrl : ' + circuitUrl);
    fetch(circuitUrl)
        .then(response => response.json())
        .then(circuit => {
            console.log(circuit);

            // Ensure correct element is being targeted
            const circuitModalDetailsElement = document.getElementById('circuitModalDetails');
            if (circuitModalDetailsElement) {
                circuitModalDetailsElement.innerHTML = `
                    <p class="text-white"><strong>Circuit Name:</strong> ${circuit.name}</p>
                    <p class="text-white"><strong>Location:</strong> ${circuit.location}</p>
                    <p class="text-white"><strong>Country:</strong> ${circuit.country}</p>
                    <a href="${circuit.url}" class="text-red-500"">Wikipedia</a><br>
                    <button id="addCircuitFavorite" data-circuit="${circuit.name}" class="bg-gray-700 text-white p-2 hover:bg-red-900 rounded">
                        Add to Favorites
                    </button>
                    <div id="faveNotification_${circuit.ref}" class="h-3/12 w-3/6 hidden text-s bg-red-900 text-white p-2 mt-4 rounded shadow-lg"></div>
                `;
            } else {
                console.error("circuitModalDetails element not found");
            }

            // Attach event listener to the "Add to Favorites" button
            const addToFavoritesButton = document.getElementById('addCircuitFavorite');
            addToFavoritesButton.addEventListener('click', function() {
                const circuitName = this.getAttribute('data-circuit');
                
                // Check if the circuit is already in the favorites array
                if (!favoriteCircuits.includes(circuitName)) {
                    favoriteCircuits.push(circuitName);
                    console.log("Circuit added to favorites:", circuitName);
                    showNotification(`${circuitName} has been added to your favorites!`, circuit.ref);
                    saveFavoritesToLocalStorage('circuit');  // Save to localStorage
                } else {
                    console.log("Circuit is already in favorites:", circuitName);
                    showNotification(`${circuitName} has been added to your favorites!`, circuit.ref);
                }
            });

            // Show the circuit modal
            document.getElementById('circuitModal').classList.remove('hidden');
        })
        .catch(error => console.error('Error fetching circuit data:', error));
}

});




document.getElementById('closecircuitModal').addEventListener('click', function() {
    document.getElementById('circuitModal').classList.add('hidden');
});

// Close modal functionality
document.getElementById('closeConstructorModal').addEventListener('click', function() {
    document.getElementById('constructorModal').classList.add('hidden');
});

// Close modal functionality
document.getElementById('closeDriverModal').addEventListener('click', function() {
    document.getElementById('driverModal').classList.add('hidden');
});

// ------------------------------- END OF Event listeners -----------------------------------





// ---------------------------- Data Handling Functions ----------------------------------------------------
// Function to fetch race data for the selected season and then save in cache for later use
// Greatly improves performance after first fetch, but can be erroneous if cache is not clear beforehand.
function fetchSeason(season) {
    const url = `${API_DOMAIN}/races.php?season=${season}`;

    const storedResults = localStorage.getItem(`results_${season}`);
    if (storedResults) {
        console.log("Using cached data");
        seasonResults[season] = JSON.parse(storedResults);  // Store in global variable
        showSeasonRaces(seasonResults[season]);  // Display results
        return;
    }

    console.log(`Fetching data for season ${season} from API: ${url}`);
    fetch(url)
        .then(response => response.json())
        .then(data => {
            console.log("Fetched data:", data);
            localStorage.setItem(`results_${season}`, JSON.stringify(data));
            seasonResults[season] = data;  // Store in global variable
            showSeasonRaces(data);
        })
        .catch(error => {
            console.error("Error fetching results:", error);
        });
}




// --------------------------------- Race Display Functions ----------------------------------------------
// Function to display the season races using the fetched data directly
// This function assumes that data is already sorted by round as required. (It is sorted from the API)
function showSeasonRaces(data) {
    console.log("Displaying fetched race data:", data);

    const racesList = document.getElementById('racesList');

    // Clear the previous list of races
    racesList.innerHTML = '';

    if (!data || data.length === 0) {
        racesList.innerHTML = '<p>No races available for this season.</p>';
        return;
    }

    // Iterate over the race data and create list items
    data.forEach(race => {
        const raceItem = document.createElement('li');
        raceItem.classList.add('backdrop-blur-sm', 'p-4', 'mb-2', 'rounded', 'flex', 'justify-between');

        // Create the inner HTML for each race item
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

        // Append each race item to the races list
        racesList.appendChild(raceItem);
    });
}




// using a table, neatly formats and displays the given qualifying data
function renderQualifyingResults(data) {
    if (data && data.length > 0) {
        console.log("Qualifying Results:", data);

        const grandPrixName = data[0].race.name;
        document.getElementById('grandPrixName').innerHTML = `Results for ${grandPrixName}`;

        const resultsContainer = document.getElementById('qualifyingData');
        resultsContainer.innerHTML = ''; // Clear previous results

        let tableHTML = `
            <div class="rounded-lg bg-gray-800 flex-none w-full p-4 shadow-lg">
                <h3 class="rounded-lg text-white font-semibold m-0">Qualifying Results</h3>
                <div class="rounded-lg overflow-x-auto">
                    <table class="rounded-lg min-w-full table-auto border-collapse">
                        <thead>
                            <tr class="rounded-lg bg-gray-800 text-left">
                                <th class="px-2 py-2 font-medium text-white">Pos</th>
                                <th class="px-2 py-2 font-medium text-white">Driver</th>
                                <th class="px-2 py-2 font-medium text-white">Constructor</th>
                                <th class="px-2 py-2 font-medium text-white">Q1</th>
                                <th class="px-2 py-2 font-medium text-white">Q2</th>
                                <th class="px-2 py-2 font-medium text-white">Q3</th>
                            </tr>
                        </thead>
                        <tbody>
        `;

        data.forEach(result => {
            let cmpDriver = result.driver.forename + ' ' + result.driver.surname;
            let cmpCons = result.constructor.name;
            tableHTML += `
                <tr class="rounded-lg border-t">
                    <td class="rounded-lg text-xs font-bold px-2 py-2 text-s text-white">${result.position}</td>
                    <td id="clickableDriver" class="flex items-center text-xs driver-name px-2 py-2 text-s text-white hover:text-red-500" 
                        data-ref-season="${result.race.year}"
                        data-ref3="${result.driver.ref}">
                        ${result.driver.forename} ${result.driver.surname} ${getFavoriteIcon('driver', cmpDriver)}
                    </td>
                    <td class="text-xs pointer-events-auto px-2 py-2 text-white hover:text-red-500">
                        <a class="constructor-name flex items-center" 
                            data-ref="${result.constructor.ref}" 
                            data-ref2="${result.race.id}" 
                            data-ref-season="${result.race.year}">
                            ${result.constructor.name} ${getFavoriteIcon('constructor', cmpCons)}
                        </a>
                    </td>
                    <td class="px-2 py-2 text-xs text-white">${result.q1}</td>
                    <td class="px-2 py-2 text-xs text-white">${result.q2}</td>
                    <td class="px-2 py-2 text-xs text-white">${result.q3}</td>
                </tr>
            `;
        });

        tableHTML += `
                        </tbody>
                    </table>
                </div>
            </div>
        `;

        resultsContainer.innerHTML = tableHTML;
    } else {
        console.log("No qualifying results available for this race.");
        document.getElementById('qualifyingData').innerHTML = '<p>No qualifying results available for this race.</p>';
    }
}

// using a table, neatly formats and displays the given race data
function renderRaceResults(data) {
    if (data && data.length > 0) {
        const raceContent = document.getElementById('raceData');
        raceContent.innerHTML = ''; // Clear previous results

        console.log("Race Results:", data);

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
                    <td class="flex items-center driver-name px-4 py-2 text-xs text-white hover:text-red-500" 
                        data-ref-season="${result.race.year}"
                        data-ref3="${result.driver.ref}">
                        ${result.driver.forename} ${result.driver.surname} ${getFavoriteIcon('driver', cmpDriver)}
                    </td>
                    <td class="pointer-events-auto px-4 py-2 text-xs text-white hover:text-red-500">
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
        console.log("No race results available for this race.");
        document.getElementById('raceData').innerHTML = '<p>No race results available for this race.</p>';
    }
}

// Main function that combines fetching and displaying the requested results in browseView
function displayRaceResults(raceId) {
    const qualifyingUrl = `${API_DOMAIN}/qualifying.php?race=${raceId}`;
    const raceUrl = `${API_DOMAIN}/results.php?race=${raceId}`;
    
    // Fetch Qualifying Data
    fetch(qualifyingUrl)
        .then(response => response.json())
        .then(data => renderQualifyingResults(data))
        .catch(error => {
            console.error("Error fetching qualifying results:", error);
        });

    // Fetch Race Results Data
    fetch(raceUrl)
        .then(response => response.json())
        .then(data => renderRaceResults(data))
        .catch(error => {
            console.error("Error fetching race results:", error);
        });
}

function renderCircuitDetails(raceId) {
    const raceUrl = `${API_DOMAIN}/races.php?id=${raceId}`;

    // Fetch the race details using the raceId
    fetch(raceUrl)
        .then(response => response.json())
        .then(raceData => {
            if (raceData && raceData.length > 0) {
                // Extract race and circuit details
                const race = raceData[0];
                const circuit = race.circuit;
                const circuitDetailsElement = document.getElementById('circuitDetails');

                // Populate the circuit and race details
                circuitDetailsElement.innerHTML = `
            <div class="flex items-center space-x-4">
            <p class="pb-0 pt-0 p-4"><strong>Round:</strong> ${race.round}</p>
            <p class="pb-0 pt-0 p-4"><strong>Year:</strong> ${race.year}</p>
            <p class="pb-0 pt-0 pr-2"><strong>Circuit Name:</strong></p>
            <strong><a data-circuitId="${circuit.id}" data-circuitName="${circuit.name}" 
                        class="border-2 border-red-800 p-2 rounded-lg hover:text-red-700 text-white circuit-name">
                            ${circuit.name}
            </a></strong>
            <p class="pb-0 pt-0 pr-2"><strong>Date:</strong> ${race.date}</p>
            <a href="${circuit.url}" 
                class="border-2 border-red-800 p-2 rounded-lg hover:text-red-700 text-white">
                <strong>Wikipedia</strong>
            </a>
            </div>

                `;
            } else {
                console.error('No race data available.');
                document.getElementById('circuitDetails').innerHTML = 'No race data available.';
            }
        })
        .catch(error => {
            console.error('Error fetching race details:', error);
            document.getElementById('circuitDetails').innerHTML = 'Error loading race details.';
        });
}

// ------------------------ The following are modal-related functions ----------------------------------------------------
// Functions to display the race results
function displayDriverRaceResults(driverRef, seasonRef) {
    const driverUrl = `${API_DOMAIN}/driverResults.php?driver=${driverRef}&season=${seasonRef}`;
    fetchRaceResults(driverUrl, 'driverRaceResult');
}

function displayConstructorRaceResults(constructorRef, seasonRef) {
    const constructorUrl = `${API_DOMAIN}/constructorResults.php?constructor=${constructorRef}&season=${seasonRef}`;
    fetchRaceResults(constructorUrl, 'constructorRaceResult');
}

function fetchRaceResults(url, resultElementId) {
    fetch(url)
        .then(response => response.json())
        .then(data => {
            const raceContent = document.getElementById(resultElementId);
            raceContent.innerHTML = '';

            if (data.length > 0) {
                let tableHTML = generateRaceResultsHTML(data);
                raceContent.innerHTML = tableHTML;
            } else {
                raceContent.innerHTML = '<p>No race results available for this entry in this season.</p>';
            }
        })
        .catch(error => console.error("Error fetching race results:", error));
}

// generic results function since both modals have basically the same format
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
                <td class="px-4 py-1 text-white">${result.round}</td>
                <td class="px-4 py-1 text-white">${result.name}</td>
                <td class="px-4 py-1 text-s text-white hover:text-red-500">
                    ${result.forename} ${result.surname}
                </td>
                <td class="px-4 py-2 text-white">${result.positionOrder}</td>
            </tr>
        `;
    });

    tableHTML += `</tbody></table></div></div>`;
    return tableHTML;
}



// ------------------------------------------ END OF Race Display Functions ------------------------------------------------------
// ------------------------------------------ END OF Data Handling Functions ------------------------------------------

// ------------------------------------------ START OF Favorites Handling ------------------------------------------
// Display favorites in the modal
function displayFavorites() {
    const favoriteConstructorsContainer = document.getElementById('favoriteConstructors');
    const favoriteDriversContainer = document.getElementById('favoriteDrivers');
    const favoriteCircuitsContainer = document.getElementById('favoriteCircuits');

    // Clear current content
    favoriteConstructorsContainer.innerHTML = '';
    favoriteDriversContainer.innerHTML = '';
    favoriteCircuitsContainer.innerHTML = '';

    // Display constructors
    if (favoriteConstructors.length === 0) {
        favoriteConstructorsContainer.innerHTML = '<p class="text-white">No constructors added to favorites.</p>';
    } else {
        favoriteConstructors.forEach(constructorRef => {
            const listItem = document.createElement('div');
            listItem.classList.add('text-white', 'p-2', 'border-b', 'border-gray-600');
            listItem.innerHTML = `
                <p> ${constructorRef}</p>
                <button class="text-red-500" onclick="removeFromFavorites('${constructorRef}', 'constructor')">Remove</button>
            `;
            favoriteConstructorsContainer.appendChild(listItem);
        });
    }

    // Display drivers
    if (favoriteDrivers.length === 0) {
        favoriteDriversContainer.innerHTML = '<p class="text-white">No drivers added to favorites.</p>';
    } else {
        favoriteDrivers.forEach(driverRef => {
            const listItem = document.createElement('div');
            listItem.classList.add('text-white', 'p-2', 'border-b', 'border-gray-600');
            listItem.innerHTML = `
                <p> ${driverRef}</p>
                <button class="text-red-500" onclick="removeFromFavorites('${driverRef}', 'driver')">Remove</button>
            `;
            favoriteDriversContainer.appendChild(listItem);
        });
    }

    // Display circuits
    if (favoriteCircuits.length === 0) {
        favoriteCircuitsContainer.innerHTML = '<p class="text-white">No circuits added to favorites.</p>';
    } else {
        favoriteCircuits.forEach(circuitRef => {
            const listItem = document.createElement('div');
            listItem.classList.add('text-white', 'p-2', 'border-b', 'border-gray-600');
            listItem.innerHTML = `
                <p> ${circuitRef}</p>
                <button class="text-red-500" onclick="removeFromFavorites('${circuitRef}', 'circuit')">Remove</button>
            `;
            favoriteCircuitsContainer.appendChild(listItem);
        });
    }
}

// Function to remove an item from favorites, NOT a requirement for this project
function removeFromFavorites(itemRef, type) {
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

    // Remove the item and update localStorage
    const index = favoritesArray.indexOf(itemRef);
    if (index !== -1) {
        favoritesArray.splice(index, 1);
        localStorage.setItem(`favorite${capitalizeFirstLetter(type)}s`, JSON.stringify(favoritesArray));
        displayFavorites(); // Refresh the display
    }
}

// Helper function to capitalize the first letter of a string
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Display favorites when the modal is opened
document.getElementById('favoritesModal').addEventListener('click', displayFavorites);


// Handle "Clear Favorites" button click
document.getElementById('clearFavorites').addEventListener('click', function() {
    favoriteConstructors = [];  // Clear the array
    favoriteDrivers = []; 
    favoriteCircuits = [];  
    saveFavoritesToLocalStorage('constructor');  // Update localStorage
    saveFavoritesToLocalStorage('driver'); 
    saveFavoritesToLocalStorage('circuit'); 
    displayFavorites();  // Refresh the display
});

// Handle "Close" button click
document.getElementById('closeFavoritesModal').addEventListener('click', function() {
    document.getElementById('favoritesModal').classList.add('hidden');
});

function openFavoritesModal() {
    displayFavorites();  // Populate the modal with current favorites
    document.getElementById('favoritesModal').classList.remove('hidden');
}

// Function to save a specific favorite category to localStorage
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
        default:
            console.error('Unknown category:', category);
    }
}
  
  