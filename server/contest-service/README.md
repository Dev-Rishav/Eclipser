# Contest Service

A real-time coding contest platform with Socket.IO integration for live updates.

## Features

- Real-time contest and submission updates via Socket.IO
- Multi-language code execution (Python, JavaScript, Java, C, C++)
- Docker-based secure code execution
- MongoDB for data persistence
- Redis/Bull for job queue management
- Comprehensive error handling and diagnostics

## Setup

### Prerequisites

- Node.js (v18 or higher)
- Docker (for code execution)
- MongoDB (local or remote)
- Redis (for job queue)

### Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. Pull required Docker images:
```bash
npm run pull-images
```

4. Seed the database with sample data:
```bash
npm run seed
```

### Running the Service

Development mode:
```bash
npm run dev
```

Production mode:
```bash
npm run start:prod
```

## API Endpoints

### Contest Management
- `GET /api/contest/contests` - Get all contests
- `GET /api/contest/contests/:id` - Get contest by ID
- `POST /api/contest/contests` - Create new contest
- `GET /api/contest/contests/:id/submissions` - Get contest submissions
- `POST /api/contest/submit` - Submit code for execution

### Testing Endpoints
- `POST /api/test/emit/submission` - Test submission events
- `POST /api/test/emit/contest` - Test contest events
- `POST /api/test/emit/winner` - Test winner announcement

## Socket.IO Events

### Client Events
- `join_contest` - Join a contest room
- `leave_contest` - Leave a contest room
- `join_user_room` - Join user-specific room

### Server Events
- `submission_update` - Real-time submission status updates
- `contest_update` - Contest state changes
- `winner_declared` - Contest winner announcements

## Supported Languages

- **Python** - Uses `python:3.9-slim` Docker image
- **JavaScript** - Uses `node:18-slim` Docker image  
- **Java** - Uses `openjdk:11` Docker image
- **C** - Uses `gcc:latest` Docker image
- **C++** - Uses `gcc:latest` Docker image

## Code Execution Flow

1. Code submitted via API
2. Submission stored in MongoDB
3. Job queued in Redis/Bull
4. Worker processes job in Docker container
5. Results stored and real-time updates sent via Socket.IO

## Testing

Use the included Postman collection (`postman-collection.json`) to test all endpoints.

For Socket.IO testing, open `test-client.html` in a browser or refer to `SOCKET_TESTING_GUIDE.md`.

## Error Handling

The service includes comprehensive error handling for:
- Database connection issues
- Redis/queue connection problems
- Docker execution failures
- Socket.IO initialization errors
- Invalid submissions

## Architecture

```
├── server.js              # Main server entry point
├── src/
│   ├── app.js             # Express app configuration
│   ├── controllers/       # Business logic
│   ├── models/           # MongoDB schemas
│   ├── routes/           # API routes
│   ├── utils/            # Utilities (DB, Socket, Queue)
│   ├── workers/          # Background job processors
│   └── data/             # Sample data and seeds
├── scripts/              # Utility scripts
└── docs/                 # Documentation
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License
