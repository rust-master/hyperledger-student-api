# Hyperledger Student Records API

A Node.js TypeScript Express API for interacting with Hyperledger Fabric Student Records Chaincode.

## Features

- ✅ Add new students
- ✅ Update student GPA
- ✅ Query student information
- ✅ Check student existence
- ✅ TypeScript support
- ✅ Input validation
- ✅ Error handling
- ✅ Logging with Winston
- ✅ Security headers with Helmet
- ✅ CORS support

## API Endpoints

### Health Check
- `GET /health` - Check API health status

### Student Operations
- `POST /api/students` - Add a new student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id/gpa` - Update student GPA
- `GET /api/students/:id/exists` - Check if student exists

## Request Examples

### Add Student
\`\`\`bash
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "id": "STU001",
    "name": "John Doe",
    "degree": "Computer Science",
    "gpa": 3.8
  }'
\`\`\`

### Get Student
\`\`\`bash
curl http://localhost:3000/api/students/STU001?username=admin&org=Org1
\`\`\`

### Update GPA
\`\`\`bash
curl -X PUT http://localhost:3000/api/students/STU001/gpa \
  -H "Content-Type: application/json" \
  -d '{"gpa": 3.9}'
\`\`\`

### Check Existence
\`\`\`bash
curl http://localhost:3000/api/students/STU001/exists
\`\`\`

## Setup

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` and configure
3. Build: `npm run build`
4. Start: `npm start` or `npm run dev` for development

## Environment Variables

- `PORT` - Server port (default: 3000)
- `CHANNEL_NAME` - Hyperledger channel name
- `CHAINCODE_NAME` - Chaincode name
- `DEFAULT_ORG` - Default organization
