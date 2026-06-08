# ROLE

You are a Senior Frontend Engineer and UI/UX Designer.

Build a complete Car Rental Booking Website using React + Vite.

Do not create unnecessary features outside the requirements.

Focus on clean architecture, maintainability, responsive UI, and booking availability logic.

---

# OBJECTIVE

Create a modern car rental booking platform where users can:

1. Browse rental cars
2. View car details
3. Check car availability by date
4. Make bookings
5. View booking confirmation

Provide a simple admin area for CRUD operations.

All data must use a Mock API with JSON format.

No backend implementation is required.

---

# TECH STACK

Mandatory:

- React
- Vite
- React Router
- JSON Server (Mock API)
- Axios
- React Hook Form
- Date-fns
- Tailwind CSS

Optional:

- Shadcn UI
- Framer Motion
- React Query

Do NOT use Redux unless absolutely necessary.

---

# DESIGN REQUIREMENTS

Design style:

- Modern
- Premium
- Automotive-focused
- High-end rental company appearance
- Clean spacing
- Professional typography
- Smooth interactions

Reference inspiration:

- Porsche
- BMW
- Tesla
- Hertz
- Avis
- Enterprise

Visual direction:

- Large hero section
- High-quality car imagery
- Modern cards
- Soft shadows
- Rounded corners
- Premium booking experience

Avoid:

- Generic admin templates
- Bootstrap look
- Outdated UI
- Overly colorful design

---

# PAGES

## Home Page

Sections:

- Navbar
- Hero Section
- Featured Cars
- Why Choose Us
- Rental Process
- Testimonials
- CTA Section
- Footer

---

## Cars Listing Page

Features:

- Search
- Filter
- Sort

Display:

- Car Image
- Car Name
- Brand
- Transmission
- Seats
- Price Per Day
- Availability Status

---

## Car Detail Page

Display:

- Gallery
- Car Information
- Features
- Rental Terms
- Price Information
- Availability Calendar
- Booking Form

---

## Booking Confirmation Page

Display:

- Booking ID
- Customer Information
- Rental Dates
- Total Price
- Car Information

---

## Admin Dashboard

Sections:

### Cars

- Create
- Read
- Update
- Delete

### Bookings

- Create
- Read
- Update
- Delete

Dashboard metrics:

- Total Cars
- Active Bookings
- Available Cars
- Revenue Estimate

---

# DATA MODEL

## Cars

```json
{
  "id": 1,
  "name": "Toyota Alphard",
  "brand": "Toyota",
  "type": "MPV",
  "seats": 7,
  "transmission": "Automatic",
  "pricePerDay": 150,
  "image": "/images/alphard.jpg",
  "description": "Luxury MPV",
  "features": [
    "GPS",
    "Bluetooth",
    "Leather Seat"
  ],
  "status": "available"
}
```

## Bookings

```json
{
  "id": 1,
  "carId": 1,
  "customerName": "John Doe",
  "phone": "123456789",
  "startDate": "2025-01-10",
  "endDate": "2025-01-15",
  "totalPrice": 750,
  "status": "confirmed"
}
```

---

# BOOKING RULES

This is the most important feature.

Implement proper date overlap validation.

A booking is NOT allowed when:

New booking overlaps with existing booking.

Example:

Existing:

2025-01-10 → 2025-01-15

Rejected:

2025-01-12 → 2025-01-18

Rejected:

2025-01-08 → 2025-01-12

Rejected:

2025-01-10 → 2025-01-15

Allowed:

2025-01-16 → 2025-01-20

---

# AVAILABILITY LOGIC

Availability must be calculated dynamically.

Rules:

- Available = no overlapping booking
- Booked = selected dates overlap
- Unavailable = manually disabled

Availability must not be hardcoded.

Always calculate from booking records.

---

# CRUD REQUIREMENTS

Cars:

- Create Car
- Edit Car
- Delete Car
- View Car

Bookings:

- Create Booking
- Edit Booking
- Cancel Booking
- Delete Booking

All CRUD operations must use JSON Server API.

---

# API STRUCTURE

Use JSON Server.

Endpoints:

GET /cars

GET /cars/:id

POST /cars

PUT /cars/:id

DELETE /cars/:id

GET /bookings

GET /bookings/:id

POST /bookings

PUT /bookings/:id

DELETE /bookings/:id

---

# PROJECT STRUCTURE

Use feature-based architecture.

```text
src
│
├── app
├── routes
├── pages
│
├── features
│   ├── cars
│   ├── booking
│   └── dashboard
│
├── services
│
├── hooks
│
├── components
│
├── layouts
│
├── utils
│
└── mock-api
```

---

# COMPONENT REQUIREMENTS

Create reusable components.

Required:

- Navbar
- Footer
- Hero
- CarCard
- CarGrid
- BookingForm
- AvailabilityCalendar
- SearchBar
- FilterPanel
- StatusBadge
- DataTable
- Modal
- EmptyState
- LoadingState
- ErrorState

---

# BUSINESS LOGIC

Create utility functions:

```javascript
calculateRentalDays()

calculateTotalPrice()

isDateRangeAvailable()

getBookedDates()

formatCurrency()
```

Business logic must be separated from UI components.

---

# UX REQUIREMENTS

Show:

- Loading state
- Error state
- Empty state
- Success notification

Provide:

- Form validation
- Booking validation
- Confirmation dialog

---

# RESPONSIVE REQUIREMENTS

Support:

- Mobile
- Tablet
- Desktop

Mobile-first approach.

---

# DELIVERABLES

Generate:

1. Folder structure
2. Mock JSON database
3. API layer
4. Reusable components
5. Booking availability logic
6. CRUD implementation
7. Responsive UI
8. Routing setup
9. Utility functions
10. Setup instructions

Code must be production-ready and easy to extend.

Do not skip any required feature.
Do not use placeholders for core functionality.
Implement complete booking availability logic.