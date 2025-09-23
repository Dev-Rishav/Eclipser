# Contest Service with Judge0 API

A comprehensive contest management system that allows users to create programming contests, upload problems with test cases, and compete by submitting solutions in Java and JavaScript. The service uses Judge0 API via RapidAPI for code execution and evaluation.

## Features

### 🏆 Contest Management
- Create and manage programming contests
- Set contest duration, registration periods, and rules
- Support for public and private contests
- Real-time leaderboard with ranking system
- ICPC and IOI scoring systems

### 📝 Problem Management
- Create problems with detailed descriptions
- Support for multiple test cases (visible and hidden)
- Difficulty levels (Easy, Medium, Hard)
- Sample inputs and outputs
- Custom time and memory limits

### 💻 Code Submission & Evaluation
- Submit solutions in Java and JavaScript
- Real-time code evaluation using Judge0 API
- Detailed test case results
- Compilation and runtime error reporting
- Execution time and memory usage tracking

### 📊 Analytics & Statistics
- Submission statistics by status
- Problem acceptance rates
- Contest participation metrics
- User performance tracking

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- RapidAPI account with Judge0 CE subscription

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd contest-service
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/contest-service

# RapidAPI Configuration
RAPIDAPI_KEY=your_rapidapi_key_here

# Server
PORT=3000
NODE_ENV=development
```

4. Start MongoDB service:
```bash
# For Ubuntu/Debian
sudo systemctl start mongod

# For macOS with Homebrew
brew services start mongodb-community
```

5. Start the server:
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## RapidAPI Setup

1. Sign up for a RapidAPI account at [rapidapi.com](https://rapidapi.com/)
2. Subscribe to the Judge0 CE API at [rapidapi.com/judge0-official/api/judge0-ce](https://rapidapi.com/judge0-official/api/judge0-ce)
3. Get your API key from the RapidAPI dashboard
4. Set the `RAPIDAPI_KEY` in your `.env` file

## API Documentation

### Base URL
```
http://localhost:3000/api
```

### Health Check
```http
GET /
GET /api/admin/health
```

### Problems
```http
# Create a problem
POST /api/problems
Content-Type: application/json

{
  "title": "Two Sum",
  "description": "Find two numbers that add up to target",
  "difficulty": "Easy",
  "testCases": [
    {
      "input": "2 7 11 15\\n9",
      "expectedOutput": "0 1",
      "isHidden": false,
      "points": 1
    }
  ],
  "supportedLanguages": ["javascript", "java"],
  "createdBy": "user123"
}

# Get all problems
GET /api/problems?page=1&limit=10&difficulty=Easy

# Get specific problem
GET /api/problems/:id

# Test problem with code
POST /api/problems/:id/test
{
  "sourceCode": "console.log('Hello World');",
  "language": "javascript"
}
```

### Contests
```http
# Create a contest
POST /api/contests
{
  "title": "Weekly Contest #1",
  "description": "Practice contest",
  "startTime": "2024-12-25T10:00:00Z",
  "endTime": "2024-12-25T12:00:00Z",
  "duration": 120,
  "problems": [
    {
      "problemId": "problem_id_here",
      "points": 100,
      "order": 1
    }
  ],
  "registrationEndTime": "2024-12-25T09:30:00Z",
  "allowedLanguages": ["javascript", "java"],
  "createdBy": "organizer123"
}

# Get contests
GET /api/contests?page=1&limit=10&status=upcoming

# Register for contest
POST /api/contests/:id/register
{
  "userId": "user123",
  "username": "coder123"
}

# Get leaderboard
GET /api/contests/:id/leaderboard
```

### Submissions
```http
# Submit solution
POST /api/submissions
{
  "userId": "user123",
  "username": "coder123",
  "contestId": "contest_id_here",
  "problemId": "problem_id_here",
  "sourceCode": "console.log('Hello World');",
  "language": "javascript"
}

# Get submissions
GET /api/submissions?userId=user123&contestId=contest_id

# Get submission status (for polling)
GET /api/submissions/:id/status
```

### Admin Endpoints
```http
# Get service statistics
GET /api/admin/stats

# Test Judge0 connection
GET /api/admin/test-connection

# Get supported languages
GET /api/admin/languages
```

## Supported Languages

| Language   | Judge0 ID | Extension |
|------------|-----------|-----------|
| JavaScript | 63        | .js       |
| Java       | 62        | .java     |

## Rate Limiting

- General API: 100 requests per 15 minutes
- Submissions: 10 requests per 5 minutes
- Contest creation: 5 requests per hour
- Problem creation: 10 requests per 30 minutes

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Validation error message"
    }
  ]
}
```

Common HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation errors)
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `429` - Too Many Requests (rate limited)
- `500` - Internal Server Error

## Database Schema

### Problems Collection
```javascript
{
  title: String,
  description: String,
  difficulty: "Easy" | "Medium" | "Hard",
  testCases: [{
    input: String,
    expectedOutput: String,
    isHidden: Boolean,
    points: Number
  }],
  supportedLanguages: ["javascript", "java"],
  timeLimit: Number, // seconds
  memoryLimit: Number, // MB
  createdBy: String,
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Contests Collection
```javascript
{
  title: String,
  description: String,
  startTime: Date,
  endTime: Date,
  duration: Number, // minutes
  problems: [{
    problemId: ObjectId,
    points: Number,
    order: Number
  }],
  contestants: [{
    userId: String,
    username: String,
    score: Number,
    rank: Number,
    problemsSolved: Number,
    joinedAt: Date
  }],
  allowedLanguages: ["javascript", "java"],
  status: "upcoming" | "running" | "completed" | "cancelled",
  visibility: "public" | "private",
  createdBy: String
}
```

### Submissions Collection
```javascript
{
  userId: String,
  username: String,
  contestId: ObjectId,
  problemId: ObjectId,
  sourceCode: String,
  language: "javascript" | "java",
  status: "pending" | "evaluating" | "accepted" | "wrong_answer" | ...,
  score: Number,
  passedTestCases: Number,
  totalTestCases: Number,
  executionTime: Number, // milliseconds
  memoryUsage: Number, // KB
  testCaseResults: [{
    testCaseNumber: Number,
    passed: Boolean,
    input: String,
    expectedOutput: String,
    actualOutput: String,
    error: String
  }],
  submissionNumber: Number,
  isAccepted: Boolean,
  points: Number,
  createdAt: Date
}
```

## Development

### Running in Development Mode
```bash
npm run dev
```

### Environment Variables
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)
- `MONGODB_URI`: MongoDB connection string
- `RAPIDAPI_KEY`: Your RapidAPI key for Judge0 API

### Testing Judge0 Connection
```bash
curl http://localhost:3000/api/admin/test-connection
```

## Production Deployment

1. Set environment variables:
```bash
export NODE_ENV=production
export PORT=3000
export MONGODB_URI=your_production_mongodb_uri
export RAPIDAPI_KEY=your_rapidapi_key
```

2. Start with PM2 (recommended):
```bash
npm install -g pm2
pm2 start index.js --name "contest-service"
pm2 startup
pm2 save
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

ISC License

## Support

For issues and questions:
- Create an issue in the repository
- Check the API documentation
- Verify your RapidAPI subscription and key

---

**Note**: Make sure to keep your RapidAPI key secure and never commit it to version control. Use environment variables or secure secret management systems in production.
