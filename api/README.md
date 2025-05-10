# UrbanRent API

This is the backend API for the UrbanRent property rental platform.

## Tech Stack

- Node.js
- Express
- PostgreSQL (with Sequelize ORM)
- JWT Authentication
- Cloudinary for image storage

## Deployment to Vercel

### Prerequisites

- A Vercel account
- PostgreSQL database (e.g., Neon, Supabase, etc.)
- Cloudinary account for image storage

### Environment Variables

The following environment variables need to be set in Vercel:

```
PORT=4000
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
JWT_SECRET=your_jwt_secret
JWT_EXPIRY=20d
COOKIE_TIME=7
SESSION_SECRET=your_session_secret
CLOUDINARY_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
CLIENT_URL=https://your-client-url.vercel.app
```

### Deployment Steps

1. Install the Vercel CLI:
   ```
   npm install -g vercel
   ```

2. Login to Vercel:
   ```
   vercel login
   ```

3. Deploy the API:
   ```
   cd /path/to/api
   vercel
   ```

4. Follow the prompts to complete the deployment.

5. Set up environment variables in the Vercel dashboard.

6. Update the `CLIENT_URL` in the environment variables to match your deployed frontend URL.

## Local Development

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Create a `.env` file with the required environment variables
4. Run the development server:
   ```
   npm start
   ```

## API Endpoints

- Authentication: `/auth`
- Users: `/user`
- Properties: `/places`
- Bookings: `/booking`
- Locations: `/location`

For detailed API documentation, refer to the API documentation.
