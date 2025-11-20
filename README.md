# AfterSchool Frontend Application

## Project Overview

This is a Vue.js frontend application for booking after-school classes. The application allows users to browse available lessons, search and filter classes, add items to cart, and place orders.

## Technology Stack

- **Frontend Framework**: Vue.js 3
- **Build Tool**: Vite
- **Styling**: Bootstrap 5
- **Icons**: Font Awesome
- **Package Manager**: npm

## Features

- Browse available after-school classes
- Search classes by subject, location, price, or availability
- Sort classes by various criteria
- Add classes to shopping cart
- Checkout and place orders
- Real-time availability updates

## Repository Links

### [Vue.js App] GitHub Repository:


https://github.com/chinna98790890varma/CST3144-afterschool-frontend.git

### [Vue.js App] GitHub Pages:

https://chinna98790890varma.github.io/CST3144-afterschool-frontend

### [Express.js App] GitHub Repository:

https://github.com/chinna98790890varma/CST3144-afterschool-backend

### [AWS (or render.com) Express.js App] Route:

https://cst3144-afterschool-backend.onrender.com/lessons

## Installation

1. Clone the repository:
```bash
git clone https://github.com/chinna98790890varma/CST3144-afterschool-frontend.git
```

2. Navigate to the project directory:
```bash
cd CST3144-afterschool-frontend
```

3. Install dependencies:
```bash
npm install
```

## Development

Run the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Building for Production

Build the application for production:
```bash
npm run build
```

The production files will be generated in the `dist` directory.

## Environment Configuration

The application uses environment variables for API configuration:

- `VITE_API_URL`: Backend API URL (defaults to production URL: https://cst3144-afterschool-backend.onrender.com)

For local development, create a `.env.local` file:
```
VITE_API_URL=http://localhost:3000
```

For production, the `.env.production` file is configured with:
```
VITE_API_URL=https://cst3144-afterschool-backend.onrender.com
```

## API Endpoints

The frontend communicates with the following backend endpoints:

- `GET /lessons` - Fetch all available lessons
- `GET /search?query=<search_term>` - Search lessons
- `POST /orders` - Create a new order

Base URL: https://cst3144-afterschool-backend.onrender.com

## Project Structure

```
vue-frontend/
├── public/          # Static assets
├── src/
│   ├── assets/      # Project assets
│   ├── components/  # Vue components
│   │   └── LessonBooking.vue  # Main component
│   ├── App.vue      # Root component
│   ├── main.js      # Application entry point
│   └── style.css    # Global styles
├── .env.production  # Production environment variables
├── vite.config.js   # Vite configuration
└── package.json     # Project dependencies
```

## Deployment

The application is configured for GitHub Pages deployment. To deploy:

1. Build the production version:
```bash
npm run build
```

2. Deploy to GitHub Pages:
```bash
npm run deploy
```
