# Minimal Feedback Full UI

A GraphQL API for managing user feedback with a simple web interface. Built with Express and MongoDB, this project supports creating, viewing, and deleting feedback, along with user authentication using JSON Web Tokens (JWT). The API is accessible via a GraphQL endpoint, and the frontend includes pages for feedback submission, login, and admin functionality.


## Table of Contents

- Features
- Tech Stack
- Installation
- Running the Project
- API Usage
- Example Queries and Mutations
- Project Structure
- Contributing
- License


## Features

- Create and retrieve feedback with user, product, rating, and comment fields
- Secure deletion of feedback (authenticated users only)
- User registration and login with JWT-based authentication
- MongoDB for persistent data storage
- GraphQL API with an interactive GraphiQL interface
- Simple web interface for feedback submission, login, and admin access

## Tech Stack
Node.js: JavaScript runtime
Express: Web framework
GraphQL: API query language (via express-graphql)
Mongoose: MongoDB object modeling
bcryptjs: Password hashing
jsonwebtoken: JWT-based authentication
MongoDB: NoSQL database

### Installation 
git clone https://github.com/your-username/minimal-feedback-full-ui.git](https://github.com/Ghassen1111/service_web.git)
cd service_web

### Install dependencies
npm install

## Running the Project
node index.js
The server will run at http://localhost:3000/graphql


### Access the web interface:
- Feedback form: http://localhost:3000/
- Login page: http://localhost:3000/login
- Admin page: http://localhost:3000/admin

## API Usage
The GraphQL API is available at http://localhost:3000/graphql.
It supports queries and mutations for feedback management and user authentication.

### Authentication
Login: Authenticate a user to receive a JWT token.
Protected operations: The deleteFeedback mutation requires a valid JWT token in the Authorization header (format: Bearer <token>).
### Feedback Operations
Query: Retrieve all feedback entries.
Add Feedback: Create a new feedback entry (no authentication required).
Delete Feedback: Delete a feedback entry by ID (requires authentication)


### Example Queries and Mutations
Below are example GraphQL requests to interact with the API. Use the GraphiQL interface or a tool like Postman.
### Login
mutation {
  login(username: "testuser", password: "securepassword") {
    userId
    token
    tokenExpiration
  }
}
