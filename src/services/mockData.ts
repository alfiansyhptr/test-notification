export const initialCars = [
  {
    id: "1",
    name: "Porsche 911 Carrera",
    brand: "Porsche",
    type: "Sports",
    seats: 2,
    transmission: "Automatic",
    pricePerDay: 350,
    image: "https://images.unsplash.com/photo-1503376713601-382c44342410?w=800&q=80",
    description: "Experience the ultimate driving machine with the iconic Porsche 911 Carrera. Perfect for weekend getaways.",
    features: [
      "GPS",
      "Bluetooth",
      "Leather Seat",
      "Sport Mode"
    ],
    status: "available" as const
  },
  {
    id: "2",
    name: "BMW M4 Competition",
    brand: "BMW",
    type: "Coupe",
    seats: 4,
    transmission: "Automatic",
    pricePerDay: 280,
    image: "https://images.unsplash.com/photo-1617531653332-bd46c24f2068?w=800&q=80",
    description: "The BMW M4 Competition blends track-ready performance with everyday luxury.",
    features: [
      "GPS",
      "Bluetooth",
      "Leather Seat",
      "Premium Audio"
    ],
    status: "available" as const
  },
  {
    id: "3",
    name: "Tesla Model S Plaid",
    brand: "Tesla",
    type: "Sedan",
    seats: 5,
    transmission: "Automatic",
    pricePerDay: 250,
    image: "https://images.unsplash.com/photo-1617788138017-80ad40651399?w=800&q=80",
    description: "Electric performance meets luxury in the Tesla Model S Plaid. Experience unparalleled acceleration.",
    features: [
      "Autopilot",
      "Bluetooth",
      "Leather Seat",
      "Electric"
    ],
    status: "available" as const
  },
  {
    id: "4",
    name: "Mercedes-Benz G-Class",
    brand: "Mercedes",
    type: "SUV",
    seats: 5,
    transmission: "Automatic",
    pricePerDay: 400,
    image: "https://images.unsplash.com/photo-1520050206274-a1ae44613e6d?w=800&q=80",
    description: "The ultimate luxury SUV for any terrain. Make a statement wherever you go.",
    features: [
      "GPS",
      "Bluetooth",
      "Leather Seat",
      "4WD"
    ],
    status: "available" as const
  }
];

export const initialBookings = [
  {
    id: "1",
    carId: "1",
    customerName: "John Doe",
    phone: "123456789",
    startDate: "2026-06-10",
    endDate: "2026-06-15",
    totalPrice: 1750,
    status: "confirmed" as const
  },
  {
    id: "NzHkMTx7pKA",
    carId: "2",
    customerName: "test",
    phone: "+628123456789",
    startDate: "2026-06-10",
    endDate: "2026-06-22",
    totalPrice: 3360,
    status: "confirmed" as const
  }
];
