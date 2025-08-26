# Warehouse Management System

A web application for managing warehouse operations, allowing product tracking, note creation, and user management.

## Technologies and Languages

### Frontend
- **Next.js** - React framework for server-side rendering and static site generation
- **React** - JavaScript library for building user interfaces
- **TypeScript** - typed superset of JavaScript
- **Tailwind CSS** - utility-first CSS framework
- **React Icons** - popular icon library for React

### Backend
- **Next.js API Routes** - server functions for API handling
- **MongoDB** - NoSQL database for data storage
- **Mongoose** - Object Data Modeling (ODM) library for MongoDB and Node.js
- **NextAuth.js** - complete authentication solution for Next.js

## Features

### Authentication
- User registration
- Login with credentials (username and password)
- Protected routes for authenticated users
- User roles (standard user, administrator)
- Session management

### Product Management
- Add new products to the warehouse
- Edit existing products
- Delete products
- Search products
- Sort product list by various criteria
- View detailed product information
- Calculate product value (quantity × price)

### Notes System
- Add notes to products
- View note history
- Track new and updated notes
- Author information for notes

### Admin Panel
- User management
- Warehouse statistics overview
- System activity history
- Notification management
- System settings

### User Interface
- Responsive design across devices
- Intuitive interface with navigation based on user roles
- Modal dialogs for interactions
- User feedback messages
- Dynamic forms with validation

## Project Structure

The project uses modern Next.js App Router structure with main directories:

- `/app` - main page components and routing
- `/components` - shared React components
- `/lib` - helper functions and configuration
- `/models` - Mongoose data models
- `/public` - static assets
- `/contexts` - React contexts for application state management

## Installation and Running

### Requirements
- Node.js (version 14 or newer)
- MongoDB database (local or cloud, e.g., MongoDB Atlas)

### Configuration
1. Clone the repository
2. Install dependencies: `npm install`
3. Create a `.env.local` file with the following variables:
   ```
   MONGODB_URI=<your_MongoDB_URI>
   NEXTAUTH_SECRET=<generated_secret_key>
   NEXTAUTH_URL=http://localhost:3000
   ```

### Run Application
```bash
npm run dev
```

The application will be accessible at [http://localhost:3000](http://localhost:3000).

