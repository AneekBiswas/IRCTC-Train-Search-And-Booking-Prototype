// Set today's date as default
const dateInput = document.getElementById('date');
if (dateInput) {
    dateInput.value = new Date().toISOString().split('T')[0];
}

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

function goToResults() {
    const from = document.getElementById('from').value.trim();
    const to = document.getElementById('to').value.trim();
    const date = document.getElementById('date').value.trim();

    if (!from || !to || !date) {
        alert("All fields are required");
        return;
    }

    // Redirect with data in URL
    window.location.href = `./results/results.html?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}`;
}
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        from: params.get('from'),
        to: params.get('to'),
        date: params.get('date')
    };
}

async function searchTrains() {

    const resultsDiv = document.getElementById('results');
    const errorDiv = document.getElementById('error');
    console.log("URL:", window.location.href);

   let from, to, date;

// SAFE GET VALUES
const fromInput = document.getElementById('from');
const toInput = document.getElementById('to');
const dateInput = document.getElementById('date');

if (fromInput && toInput && dateInput) {
    from = fromInput.value.trim();
    to = toInput.value.trim();
    date = dateInput.value.trim();
} else {
    const params = new URLSearchParams(window.location.search);
    from = params.get('from');
    to = params.get('to');
    date = params.get('date');
}
    console.log("Searching trains from", from, "to", to, "on", date);

    resultsDiv.innerHTML = '';
    errorDiv.textContent = '';

    if (!from || !to || !date) {
        errorDiv.textContent = 'All fields are required.';
        return;
    }

    try {
        // Fetch both JSON files directly from the repo
        const [stationsRes, trainsRes] = await Promise.all([
            fetch('/data/stations.json'),
            fetch('/data/trains.json')
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

        // Get day of week from the date input (yyyy-mm-dd format)
        const dayShort = new Date(date).toLocaleDateString('en-US', { weekday: 'short' });

        // Filter trains and compute fare + journey time for each
        let results = filterTrains(trainsData.trains, fromCode, toCode, dayShort).map(train => ({
            ...train,
            journeyTime: calculateJourneyTime(train, fromCode, toCode) || "N/A",
            fare: calculateFare(train, fromCode, toCode, 1)
        }));

        if (results.length === 0) {
            resultsDiv.innerHTML = '<p>No trains found.</p>';
            return;
        }

        // Sort results if a sort option is selected
        const sortByEl = document.getElementById('sortBy');
        const sortOrderEl = document.getElementById('sortOrder');

        const sortBy = sortByEl ? sortByEl.value : "";
        const sortOrder = sortOrderEl ? sortOrderEl.value : "asc";

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

          const bookingUrl = `/booking/booking.html?train=${encodeURIComponent(train.train_name)}&from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&date=${encodeURIComponent(date)}&duration=${encodeURIComponent(train.journeyTime || "N/A")}&fare=${encodeURIComponent(train.fare ?? 0)}`;
            console.log("Journey:", train.journeyTime, "Fare:", train.fare);
           div.innerHTML = `
  <div class="train-card">

  <div class="side left"></div>

    <div class="train-content">
    <div class="train-header">
      <h2>${train.train_name}</h2>
      <span class="fare">₹${train.fare != null ? train.fare.toFixed(2) : 'N/A'}</span>
    </div>

    <div class="train-body">
      <div class="station">
        <h3>${from}</h3>
        <p>Departure</p>
      </div>
      <div class="design">
      <div class="line"></div>
      <div class="line"></div>
      <div class="logo_train">
        <img src="../pictures/train.png" alt="Train Icon">
      </div>
      <div class="line"></div>
      <div class="line"></div>
        </div>

      <div class="station">
        <h3>${to}</h3>
        <p>Arrival</p>
      </div>
    </div>

    <div class="train-info">
      <span> ${train.journeyTime || 'N/A'}</span>
      <span> ${train.runs_on.join(', ')}</span>
    </div>
            <button onclick="window.location.href='${bookingUrl}'">
        Book Now →
      </button>
      
    </div>

    <div class="side right"></div>

  </div>
`;
            resultsDiv.appendChild(div);
        });

    } catch (err) {
    console.error("FULL ERROR:", err);
    errorDiv.textContent = 'Failed to load data.';
}
}

window.onload = function () {
    searchTrains();
};

//creating a dropdown list of stations
async function populateStations() {
    const res = await fetch('/data/stations.json');
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

if (document.getElementById("station-list-from")) {
    populateStations();
}
