# RailYatri - Train Search & Booking Prototype

A train ticket booking web application inspired by IRCTC, featuring Kolkata suburban railway routes. Search for trains between stations, view fares and journey times, and book tickets for multiple passengers.

- **GitHub Pages**: Deployed on GitHub Pages https://aneekbiswas.github.io/IRCTC-Train-Search-And-Booking-Prototype/

## Features

- **Station Search**: Autocomplete-enabled dropdown with 23 Kolkata suburban stations
- **Swap Stations**: One-click button to swap From and To stations
- **Date Selection**: Choose travel date with past dates disabled
- **Dynamic Filtering**: Shows only trains running on selected day between selected stations
- **Smart Fare Calculation**: Distance-based pricing with per-km rates
- **Journey Time Display**: Real-time calculation of travel duration
- **Sorting Options**: Sort results by fare or journey time (ascending/descending)
- **Multi-Passenger Booking**: Add multiple passengers with validation
- **Input Validation**: Name fields accept only alphabets, age restricted to 1-100
- **Responsive Design**: Works on desktop and mobile browsers

## Tech Stack

- HTML5
- CSS3
- JavaScript (ES6+)
- JSON (data storage)
- Google Fonts (Syne, DM Sans)

## Project Structure

```
/IRCTC-Train-Search-And-Booking-Prototype
├── index.html              # Main train search page
├── booking.html            # Passenger booking page
├── styles/
│   ├── index.css          # Search page styles
│   └── booking.css        # Booking page styles
├── scripts/
│   ├── index.js           # Search logic
│   └── booking.js         # Booking logic
├── data/
│   ├── stations.json      # Station data (23 stations)
│   └── trains.json        # Train schedules (50+ trains)
├── pictures/
│   └── rylogo.svg         # Site logo
└── README.md
```

## Usage

1. **Search for Trains**
   - Enter origin station (From)
   - Enter destination station (To)
   - Select travel date
   - Click "Search Trains"

2. **View Results**
   - Browse available trains with fare and journey time
   - Use Sort By dropdown to organize results
   - Toggle refund option if desired

3. **Book Tickets**
   - Click "Book Now" on preferred train
   - Review booking summary
   - Add passenger details (name & age)
   - Click "Confirm Booking & Pay"

## Data Structure

### Station Format
```json
{
  "code": "HWH",
  "name": "Howrah"
}
```

### Train Format
```json
{
  "train_id": "L001",
  "train_name": "Kolkata Local 1",
  "price_per_km": 0.63,
  "runs_on": ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  "schedule": [
    { "station_code": "KGP", "time": "7:16", "distance": 0 }
  ]
}
```

## Future Enhancements

- Payment gateway integration
- User authentication system
- PNR status checking
- Seat availability display
- Live train tracking
- Booking history
- Mobile app version

## License

This project was created for educational purposes as a prototype demonstration.

---