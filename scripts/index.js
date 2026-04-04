// Set today's date as default
const today_date=document.getElementById('date').value = new Date().toISOString().split('T')[0];
const date=document.getElementById('date');

//User cant enter a date before today
date.min=today_date;

let hasSearched = false;
// ---------- Helpers ----------

// Finds a station's code from its name
function findStationCode(name, stations) {
    const s = stations.find(s => s.name.toLowerCase().trim() === name.toLowerCase().trim());
    return s ? s.code : null;
}

// Converts "HH:MM" string to total minutes
function timeToMinutes(timeStr) {
    if (!timeStr) return Infinity;
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

// Converts "Xh Ym" journey string to total minutes (used for sorting)
function journeyTimeToMinutes(str) {
    if (!str) return Infinity;
    const match = str.match(/(\d+)h\s*(\d+)m/);
    if (!match) return Infinity;
    return parseInt(match[1]) * 60 + parseInt(match[2]);
}

// Filters trains that run on the given day and stop at both fromCode then toCode in order
function filterTrains(trains, fromCode, toCode, dayShort) {
    return trains.filter(train => {
        if (!train.runs_on.includes(dayShort)) return false;
        let hasFrom = false;
        let hasTo = false;
        for (const stop of train.schedule) {
            if (stop.station_code === fromCode) hasFrom = true;
            if (stop.station_code === toCode && hasFrom) { hasTo = true; break; }
        }
        return hasFrom && hasTo;
    });
}

// Calculates fare based on distance between stations * price per km * number of passengers
function calculateFare(train, fromCode, toCode, passengerCount) {
    let distFrom = 0, distTo = 0;
    for (const stop of train.schedule) {
        if (stop.station_code === fromCode) distFrom = stop.distance;
        if (stop.station_code === toCode) distTo = stop.distance;
    }
    return (distTo - distFrom) * train.price_per_km * passengerCount;
}

// Calculates journey duration as a "Xh Ym" string
function calculateJourneyTime(train, fromCode, toCode) {
    let timeFrom = null, timeTo = null;
    for (const stop of train.schedule) {
        if (stop.station_code === fromCode) timeFrom = timeToMinutes(stop.time);
        if (stop.station_code === toCode) timeTo = timeToMinutes(stop.time);
    }
    if (timeFrom === null || timeTo === null || timeTo <= timeFrom) return null;
    const diff = timeTo - timeFrom;
    return `${Math.floor(diff / 60)}h ${diff % 60}m`;
}

// ---------- Main Search ----------

async function searchTrains() {
    hasSearched = true;
    const from = document.getElementById('from').value.trim();
    const to = document.getElementById('to').value.trim();
    const date = document.getElementById('date').value.trim();
    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');

    resultsDiv.innerHTML = '';
    errorDiv.textContent = '';

    if (!from || !to || !date) {
        errorDiv.textContent = 'All fields are required.';
        return;
    }

    try {
        // Fetch both JSON files directly from the repo
        const [stationsRes, trainsRes] = await Promise.all([
            fetch('./data/stations.json'),
            fetch('./data/trains.json')
        ]);
        const stationsData = await stationsRes.json();
        const trainsData = await trainsRes.json();

        // Find station codes from names
        const fromCode = findStationCode(from, stationsData.stations);
        const toCode = findStationCode(to, stationsData.stations);

        if (!fromCode || !toCode) {
            errorDiv.textContent = 'Invalid station name(s).';
            return;
        }
        if(fromCode === toCode){
            errorDiv.textContent = 'From and To stations cannot be the same.';
            return;
        }

        // Get day of week from the date input (yyyy-mm-dd format)
        const dayShort = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

        // Filter trains and compute fare + journey time for each
        let results = filterTrains(trainsData.trains, fromCode, toCode, dayShort).map(train => ({
            ...train,
            journeyTime: calculateJourneyTime(train, fromCode, toCode),
            fare: calculateFare(train, fromCode, toCode, 1)
        }));

        if (results.length === 0) {
            resultsDiv.innerHTML = '<p>No trains found.</p>';
            return;
        }

        // Sort results if a sort option is selected
        const sortBy = document.getElementById('sortBy').value;
        const sortOrder = document.getElementById('sortOrder').value;

        if (sortBy) {
            results.sort((a, b) => {
                const valA = sortBy === 'fare' ? (a.fare ?? Infinity) : journeyTimeToMinutes(a.journeyTime);
                const valB = sortBy === 'fare' ? (b.fare ?? Infinity) : journeyTimeToMinutes(b.journeyTime);
                if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
                if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
                return 0;
            });
        }

        // Render each train card
        results.forEach(train => {
            const div = document.createElement('div');
            div.className = 'train';

            const bookingUrl = `booking.html?train=${encodeURIComponent(train.train_name)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;

            div.innerHTML = `
                <strong>${train.train_name}</strong><br/>
                Runs on: ${train.runs_on.join(', ')}<br/>
                Journey Time: ${train.journeyTime || 'N/A'}<br/>
                Fare: ₹${train.fare != null ? train.fare.toFixed(2) : 'N/A'}
                <button onclick="window.location.href='${bookingUrl}'">Book Now</button>
            `;
            resultsDiv.appendChild(div);
        });

    } catch (err) {
        errorDiv.textContent = 'Failed to load data.';
    }
}

//creating a dropdown list of stations
async function populateStations() {
    const res = await fetch('./data/stations.json');
    const data = await res.json();
    
    ['station-list-from', 'station-list-to'].forEach(listId => {
        const dl = document.getElementById(listId);
        data.stations.forEach(s => {
            const option = document.createElement('option');
            option.value = s.name;
            dl.appendChild(option);
        });
    });
}

populateStations();

function swapStations() {
    const fromInput = document.getElementById('from');
    const toInput = document.getElementById('to');
    if(fromInput.value && toInput.value){
        const temp = fromInput.value;
        fromInput.value = toInput.value;
        toInput.value = temp;
        if(hasSearched){
            searchTrains();
        }
    }else{
        alert('Both From and To stations must be filled to swap.');
        return
    }
}