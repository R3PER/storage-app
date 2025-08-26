# Warehouse Management System

A web application for managing warehouse operations, allowing product tracking, note creation, and user management.

## Screens and Videos
<img width="1914" height="936" alt="1" src="https://github.com/user-attachments/assets/11e3e34f-208f-4b5c-a251-3224ed9b8b7f" />
<img width="1912" height="936" alt="3" src="https://github.com/user-attachments/assets/91a3e54d-2452-4431-8e3a-bfaf2396857b" />
<img width="1914" height="937" alt="4" src="https://github.com/user-attachments/assets/2f1061c5-5482-497a-ac9a-30e165aef07e" />
<img width="1916" height="936" alt="6" src="https://github.com/user-attachments/assets/05477132-c63a-4aa3-9626-579f9859a31f" />
<img width="1914" height="934" alt="7" src="https://github.com/user-attachments/assets/58328cf9-00f0-4953-bb4d-6af76637facb" />
<img width="1916" height="934" alt="8" src="https://github.com/user-attachments/assets/ef5fbbb7-3f5c-44d8-8112-fb0f4fc56acc" />
<img width="1914" height="937" alt="9" src="https://github.com/user-attachments/assets/5dd4ecd9-bce2-4886-8ca7-9c2b65c8bd78" />
<img width="1915" height="938" alt="11" src="https://github.com/user-attachments/assets/6842ef53-9698-4a37-a09b-ae97e5abf6f9" />
<img width="1908" height="930" alt="12" src="https://github.com/user-attachments/assets/7fd7c85f-fad9-4368-9d61-6cfcd55c573a" />
<img width="1910" height="862" alt="13" src="https://github.com/user-attachments/assets/69c5aed8-5f13-4e68-85c3-485d13af1760" />
<img width="1908" height="935" alt="14" src="https://github.com/user-attachments/assets/d8fed975-f487-4877-a74d-04d956a532ec" />
<img width="1913" height="937" alt="15" src="https://github.com/user-attachments/assets/b9c77669-97e3-4bb1-9554-725bc0c30643" />



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

