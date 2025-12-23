# API Documentation

## Base URL

```
http://localhost:5000/api
```

## Authentication

Protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

## Endpoints

### Projects

#### GET /projects
Get all projects (public)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "title": "Project Name",
      "description": "Project description",
      "techStack": ["React", "Node.js"],
      "githubUrl": "https://github.com/...",
      "liveUrl": "https://example.com",
      "featured": true,
      "order": 0
    }
  ]
}
```

#### GET /projects/:id
Get single project (public)

#### POST /projects
Create project (admin only)

**Body:**
```json
{
  "title": "Project Name",
  "description": "Project description",
  "techStack": ["React", "Node.js"],
  "githubUrl": "https://github.com/...",
  "liveUrl": "https://example.com",
  "featured": false,
  "order": 0
}
```

#### POST /projects/:id/update
Update project (admin only)

**Body:**
```json
{
  "title": "Updated Project Name",
  "description": "Updated description",
  "techStack": ["React", "Node.js", "TypeScript"],
  "githubUrl": "https://github.com/...",
  "liveUrl": "https://example.com",
  "featured": true,
  "order": 1
}
```

#### POST /projects/:id/delete
Delete project (admin only)

### Skills

#### GET /skills
Get all skills (public)

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "_id": "...",
      "name": "React",
      "category": "frontend",
      "proficiency": 90,
      "order": 0
    }
  ]
}
```

#### GET /skills/:id
Get single skill (public)

#### POST /skills
Create skill (admin only)

**Body:**
```json
{
  "name": "React",
  "category": "frontend",
  "proficiency": 90,
  "order": 0
}
```

#### POST /skills/:id/update
Update skill (admin only)

**Body:**
```json
{
  "name": "Updated Skill",
  "category": "frontend",
  "proficiency": 95,
  "order": 1
}
```

#### POST /skills/:id/delete
Delete skill (admin only)

### Contact

#### POST /contact
Send contact message (public)

**Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Hello",
  "message": "Message content"
}
```

### Authentication

#### POST /auth/login
Admin login

**Body:**
```json
{
  "email": "admin@example.com",
  "password": "password"
}
```

**Response:**
```json
{
  "success": true,
  "token": "jwt-token",
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### POST /auth/verify
Verify JWT token

**Headers:**
```
Authorization: Bearer <token>
```

### LinkedIn

#### GET /linkedin/followers
Get LinkedIn follower count (public)

**Response:**
```json
{
  "success": true,
  "data": {
    "followers": 100
  }
}
```

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "message": "Error message"
}
```

Status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `500` - Internal Server Error

