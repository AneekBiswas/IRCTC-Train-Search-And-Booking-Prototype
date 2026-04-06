# RailYatri - Train Search & Booking Prototype

A train ticket booking web application inspired by IRCTC, featuring Kolkata suburban railway routes. Search for trains between stations, view fares and journey times, and book tickets for multiple passengers.

- **Live Demo**: https://aneekbiswas.github.io/IRCTC-Train-Search-And-Booking-Prototype/

## Features

### Search Page (index.html)
- **Station Search**: Autocomplete-enabled dropdown with 23 Kolkata suburban stations
- **Swap Stations**: One-click button to swap From and To stations
- **Date Selection**: Choose travel date with past dates disabled
- **Dynamic Filtering**: Shows only trains running on selected day between selected stations
- **Smart Fare Calculation**: Distance-based pricing with per-km rates (₹0.63/km)
- **Journey Time Display**: Real-time calculation of travel duration based on schedule
- **Sorting Options**: Sort results by fare or journey time (ascending/descending)
- **Refund Option**: Toggle for cancellation refund protection

### Booking Page (booking.html)
- **Passenger Details**: Add multiple passengers with name and age
- **Input Validation**: Name fields accept only alphabets, age restricted to 1-100
- **Booking Summary**: Review selected train, fare, and passenger details

### UI/UX
- **Responsive Design**: Works on desktop and mobile browsers
- **Modern Typography**: Syne (headings) + DM Sans (body) fonts
- **Clean Interface**: Professional train booking UI

## Tech Stack

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Data Storage**: JSON (stations.json, trains.json)
- **External Resources**: Google Fonts

## Project Structure

```
/IRCTC-Train-Search-And-Booking-Prototype
├── index.html              # Main train search page
├── booking.html            # Passenger booking page
├── styles/
│   ├── index.css          # Search page styles
│   └── booking.css        # Booking page styles
├── scripts/
│   ├── index.js           # Search logic, filtering, sorting
│   └── booking.js         # Booking validation & confirmation
├── data/
│   ├── stations.json      # 23 Kolkata suburban stations
│   └── trains.json        # 50+ train schedules
├── pictures/
│   └── rylogo.svg        # RailYatri logo
└── README.md
```

## Data Structure

### Station (23 stations)
```json
{ "code": "HWH", "name": "Howrah" }
```

### Train (50+ trains)
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

## Usage

1. **Search**: Enter From/To stations, select date, click "Search Trains"
2. **Browse**: View available trains with fare & journey time, use sort/filter options
3. **Book**: Click "Book Now", add passenger details, confirm booking