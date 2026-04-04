// Parse query params
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        train: params.get('train'),
        from: params.get('from'),
        to: params.get('to'),
        date: params.get('date'),
        duration: params.get('duration'),  
        fare: params.get('fare')  
    };
}

const data = getQueryParams();

// Autofill fields
document.getElementById('train').value = `Train: ${data.train || ''}`;
document.getElementById('from').value = `From: ${data.from || ''}`;
document.getElementById('to').value = `To: ${data.to || ''}`;
document.getElementById('date').value = `Date: ${data.date || ''}`;

// Summary box
function renderTrainDetails(data) {
  const container = document.getElementById("summary");
  console.log("Journey:", train.journeyTime, "Fare:", train.fare);

  container.innerHTML = `
    <div class="train-summary">
      <div class="train-left">
        <h2>${data.train || 'Train Name'}</h2>
        <p>${data.from || ''} → ${data.to || ''}</p>
        <span class="date">${data.date || ''}</span>
      </div>

      <div class="train-right">
        <span class="duration">Duration: ${data.duration || 'N/A'}</span>
        <span class="fare">₹ ${data.fare || '0'}</span>
      </div>
    </div>
  `;
}
renderTrainDetails(data);

function addPassenger(name = '', age = '') {
    const container = document.getElementById('passengers');

    const div = document.createElement('div');
    div.style.marginBottom = '10px';

    div.innerHTML = `
  <div class="booking-page">


    <!-- Passenger form -->
    <div class="passenger-card">
      <h2>Passenger Details</h2>

      <div class="form-row">
        <div class="input-group">
          <label>Full Name * </label>
          <input type="text" class="p-name"placeholder="Full Name">
        </div>

        <div class="input-group">
          <label>Email</label>
          <input type="email" placeholder="Email">
        </div>
      </div>

      <div class="form-row">
        <div class="input-group">
          <label>Phone</label>
          <div class="phone-box">
            <span>+91</span>
            <input type="text" placeholder="Phone Number">
          </div>
        </div>

        <div class="input-group">
          <label>Age * </label>
          <input type="number" class="p-age" placeholder="Age">
        </div>
      </div>
      <div class="but">
      <button  class="add-passenger-btn" type="button" onclick="addPassenger()">+ Add Passenger</button>
      <button type="button"  class="proceed-btn" onclick="confirmBooking()">Proceed to Payment →</button>
        </div>
    </div>

  </div>
`;

    container.appendChild(div);
}

// Make it accessible to button
window.addPassenger = addPassenger;

// Add one passenger by default
addPassenger();

// Finds a station's code from its name
function findStationCode(name, stations) {
    const s = stations.find(s => s.name.toLowerCase().trim() === name.toLowerCase().trim());
    return s ? s.code : null;
}

// Calculates fare based on distance * price per km * passenger count
function calculateFare(train, fromCode, toCode, passengerCount) {
    let distFrom = 0, distTo = 0;
    for (const stop of train.schedule) {
        if (stop.station_code === fromCode) distFrom = stop.distance;
        if (stop.station_code === toCode) distTo = stop.distance;
    }
    return (distTo - distFrom) * train.price_per_km * passengerCount;
}

async function confirmBooking() {
    const container = document.getElementById('passengers');

    const names = document.querySelectorAll('.p-name');
    const ages = document.querySelectorAll('.p-age');

    const passengers = [];


    for (let i = 0; i < names.length; i++) {
        const name = names[i].value.trim();
        const age = ages[i].value.trim();

        if (!name || !age) {
            alert('Please fill all passenger details');
            return;
        }

        passengers.push({
            name,
            age: Number(age)
        });
    }

    try {
        const [stationsRes, trainsRes] = await Promise.all([
            fetch('../data/stations.json'),
            fetch('../data/trains.json'),
            console.log('Data Fetched')
        ]);
        const stationsData = await stationsRes.json();
        const trainsData = await trainsRes.json();

        const fromCode = findStationCode(data.from, stationsData.stations);
        const toCode = findStationCode(data.to, stationsData.stations);

        if (!fromCode || !toCode) {
            alert('Invalid station names.');
            return;
        }

        const train = trainsData.trains.find(
            t => t.train_name.toLowerCase() === data.train.toLowerCase()
        );

        if (!train) {
            alert('Train not found.');
            return;
        }

        const fare = calculateFare(train, fromCode, toCode, passengers.length);
        alert(`✅ Booking Confirmed!\nTotal Fare: ₹${fare.toFixed(2)}\nPress Ok to Pay`);

    } catch (err) {
        alert('Failed to load data.');
    }
}

function goBack() {
    window.location.href = '/index.html';
}
