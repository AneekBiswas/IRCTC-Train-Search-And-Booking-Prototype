// Parse query params
function getQueryParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        train: params.get('train'),
        from: params.get('from'),
        to: params.get('to'),
        date: params.get('date')
    };
}

const data = getQueryParams();

// Autofill fields
document.getElementById('train').value = `Train: ${data.train || ''}`;
document.getElementById('from').value = `From: ${data.from || ''}`;
document.getElementById('to').value = `To: ${data.to || ''}`;
document.getElementById('date').value = `Date: ${data.date || ''}`;

// Summary box
document.getElementById('summary').innerHTML = `
    <strong>${data.train}</strong><br/>
    ${data.from} → ${data.to}<br/>
    Date: ${data.date}
`;

function addPassenger(name = '', age = '') {
    const container = document.getElementById('passengers');

    const div = document.createElement('div');
    div.className = 'passenger-row';

    div.innerHTML = `
    <input class="p-name" placeholder="Passenger Name" pattern="[A-Za-z\s]+"  value="${name}" />
    <input class="p-age" type="number" placeholder="Age" min="1" max="100" value="${age}" />
    `;

    const nameInput = div.querySelector('.p-name');
    const ageInput = div.querySelector('.p-age');

    nameInput.addEventListener('input', () => {
        nameInput.value = nameInput.value.replace(/[^A-Za-z\s]/g, '');
    });

    ageInput.addEventListener('input', () => {
        let val = ageInput.value;
        if (isNaN(val)) ageInput.value = '';
        else if (val<1) ageInput.value = '';
        else if (val>100) ageInput.value = '100';
    });

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
        alert(`Booking Confirmed!\nTotal Fare: ₹${fare.toFixed(2)}\n\nPress Ok to Pay`);

    } catch (err) {
        alert('Failed to load data.');
    }
}

function goBack() {
    window.location.href = '../index.html';
}
