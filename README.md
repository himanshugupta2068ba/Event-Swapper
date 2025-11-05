# SlotSwapper

A peer-to-peer time-slot scheduling application built with the MERN stack (MongoDB, Express, React, Node.js).

## Features

- **User Authentication**: Sign up and login with JWT token-based authentication
- **Calendar Management**: Create, update, and delete events/slots
- **Swap Marketplace**: Browse available slots from other users
- **Swap Requests**: Request swaps and respond to incoming requests
- **Real-time Updates**: Dynamic state management for seamless user experience

## Tech Stack

### Backend
- Node.js & Express.js
- MongoDB with Mongoose
- JWT for authentication
- bcryptjs for password hashing

### Frontend
- React 18
- React Router for navigation
- Axios for API calls
- Context API for state management

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register a new user
- `POST /api/auth/login` - Login user

### Events
- `GET /api/events` - Get all events for authenticated user
- `POST /api/events` - Create a new event
- `PUT /api/events/:id` - Update an event
- `DELETE /api/events/:id` - Delete an event

### Swaps
- `GET /api/swaps/swappable-slots` - Get all swappable slots from other users
- `POST /api/swaps/swap-request` - Create a swap request
- `GET /api/swaps/requests/incoming` - Get incoming swap requests
- `GET /api/swaps/requests/outgoing` - Get outgoing swap requests
- `POST /api/swaps/swap-response/:requestId` - Respond to a swap request (accept/reject)

## Project Structure

```
slotswapper/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Event.js
│   │   └── SwapRequest.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── events.js
│   │   └── swaps.js
│   ├── middleware/
│   │   └── auth.js
│   ├── server.js
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   ├── pages/
│   │   ├── utils/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── package.json
```

## Usage

1. **Sign Up**: Create a new account with your name, email, and password
2. **Login**: Use your credentials to log in
3. **Create Events**: Add events to your calendar in the Dashboard
4. **Make Swappable**: Mark events as "Swappable" to make them available for swaps
5. **Browse Marketplace**: View slots available from other users
6. **Request Swap**: Click "Request Swap" on a slot and select one of your swappable slots to offer
7. **Respond to Requests**: Accept or reject incoming swap requests in the Requests page
8. **View Status**: Monitor your outgoing requests and see their status (Pending, Accepted, Rejected)

## Event Status

- **BUSY**: Default status, slot is not available for swapping
- **SWAPPABLE**: Slot is available for other users to request swaps
- **SWAP_PENDING**: Slot is involved in a pending swap request

## Swap Request Status

- **PENDING**: Waiting for the other user's response
- **ACCEPTED**: Swap completed, slots have been exchanged
- **REJECTED**: Swap was rejected, slots returned to SWAPPABLE status

## License

ISC
