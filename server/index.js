const express = require('express');
const path = require('path');
const stations = require('../stations.json');
const trainsData = require('../trains.json');

const app = express();
const PORT = 3000;

// ---------- Helpers ----------

function findStationCode(stationName) {
    const station = stations.stations.find(
        s => s.name.toLowerCase().trim() === stationName.toLowerCase().trim()
    );
    return station ? station.code : null;
}

function parseDate(ddmmyyyy) {
    const [day, month, year] = ddmmyyyy.split('/');
    return new Date(`${year}-${month}-${day}`);
}

function getDayShort(date) {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
}

function searchTrains(fromCode, toCode, dayShort) {
    return trainsData.trains.filter(train => {
        if (!train.runs_on.includes(dayShort)) return false;

        let hasFrom = false;
        let hasTo = false;

        for (const stop of train.schedule) {
            if (stop.station_code === fromCode) hasFrom = true;
            if (stop.station_code === toCode && hasFrom) {
                hasTo = true;
                break;
            }
        }
        return hasFrom && hasTo;
    });
}

function getTrainFromName(name) {
    return trainsData.trains.find(t => t.train_name.toLowerCase() === name.toLowerCase());
}

function calculateFare(trainName, fromCode, toCode, passengers) {
    let distance_from = 0;
    let distance_to = 0;

    const train = getTrainFromName(trainName);

    for (const stop of train.schedule) {
        if (stop.station_code === fromCode) distance_from = stop.distance;
        if (stop.station_code === toCode) distance_to = stop.distance;
    }
    return (distance_to - distance_from) * train.price_per_km * passengers.length;
}

function timeToMinutes(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    return h * 60 + m;
}

function calculateJourneyTime(train, fromCode, toCode) {
    let timeFrom = null;
    let timeTo = null;

    for (const stop of train.schedule) {
        if (stop.station_code === fromCode) {
            timeFrom = timeToMinutes(stop.time);
        }

        if (stop.station_code === toCode) {
            timeTo = timeToMinutes(stop.time);
        }
    }

    if (timeFrom === null || timeTo === null || timeTo <= timeFrom) {
        return null;
    }

    const diff = timeTo - timeFrom;

    const hours = Math.floor(diff / 60);
    const minutes = diff % 60;

    return `${hours}h ${minutes}m`;
}

// ---------- Routes ----------
app.use(express.json());

// User interface
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'index.html'));
});
app.get('/booking', (req, res) => {
    res.sendFile(path.join(__dirname, '../public', 'booking.html'));
});

// Main search endpoint
app.post('/api/book', (req, res) => {
    try {
        const { train, from, to, date, passengers } = req.body;

        // -------- Validation --------
        if (!train || !from || !to || !date) {
            return res.status(400).json({ error: 'Missing booking data' });
        }

        if (!passengers || !Array.isArray(passengers) || passengers.length === 0) {
            return res.status(400).json({ error: 'Passengers required' });
        }

        for (const p of passengers) {
            if (!p.name || !p.age) {
                return res.status(400).json({ error: 'Invalid passenger details' });
            }
        }

        const fromCode = findStationCode(from);
        const toCode = findStationCode(to);

        if (!fromCode || !toCode) {
            return res.status(404).json({ error: 'Invalid station name(s)' });
        }

        const booking = {
            train,
            from,
            to,
            date,
            fare: calculateFare(train, fromCode, toCode, passengers)
        };

        // -------- RESPONSE (this was missing) --------
        res.json({
            message: 'Booking successful',
            booking
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/search', (req, res) => {
    try {
        const { from, to, date } = req.query;

        // Validate input
        if (!from || !to || !date) {
            return res.status(400).json({
                error: 'Missing required query params: from, to, date (dd/mm/yyyy)'
            });
        }

        const fromCode = findStationCode(from);
        const toCode = findStationCode(to);

        if (!fromCode || !toCode) {
            return res.status(404).json({
                error: 'Invalid station name(s)'
            });
        }

        const parsedDate = parseDate(date);
        if (isNaN(parsedDate)) {
            return res.status(400).json({
                error: 'Invalid date format. Use dd/mm/yyyy'
            });
        }

        const dayShort = getDayShort(parsedDate);

        const results = searchTrains(fromCode, toCode, dayShort).map(train => {
            let journeyTime = null;
            let fare = null;
            try {
                journeyTime = calculateJourneyTime(train, fromCode, toCode);
                fare = calculateFare(train.train_name, fromCode, toCode, [{ name: 'Test', age: 30 }]);
            } catch (e) { }

            return {
                ...train,
                journeyTime,
                fare
            };
        });

        res.json({
            from,
            to,
            date,
            day: dayShort,
            count: results.length,
            trains: results
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

// ---------- Start Server ----------
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});