# AutoRent - Premium Car Rental Booking Platform

A modern car rental booking website built with React, Vite, Tailwind CSS, and a JSON Server mock backend.

## Features

- **Public Facing Pages**: Home, Cars Listing, Car Detail, Booking Confirmation.
- **Dynamic Booking Logic**: Automatically calculates total prices and checks for overlapping dates to prevent double bookings.
- **Admin Dashboard**: Full CRUD functionality for Cars and Bookings with revenue metrics.
- **Premium UI**: Designed with a sleek, automotive-focused aesthetic.

## Tech Stack
- React 19 + Vite
- React Router DOM
- Tailwind CSS v4
- React Hook Form
- date-fns
- Axios
- JSON Server
- Lucide React

## Getting Started

### Prerequisites
- Node.js (v18+)

### Installation

1. Clone the repository and navigate into the project directory.
2. Install the dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   *This command uses `concurrently` to run both the Vite dev server and the JSON Server mock API (on port 3001) simultaneously.*

### API Endpoints
The mock API runs on `http://localhost:3001`.
- `GET /cars`
- `GET /bookings`
