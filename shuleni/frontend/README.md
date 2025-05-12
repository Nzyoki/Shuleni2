# Shuleni2 Frontend

React application for the Shuleni2 school management system.

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm start
   ```

   This will start the application on [http://localhost:3000](http://localhost:3000)

## Configuration

- The API URL is configured in `src/services/api.js`
- By default, it connects to `http://localhost:5000/api`
- There's a fallback mechanism that tries `http://127.0.0.1:5000/api` if the first URL fails

## Build for Production

To build the application for production:

```bash
npm run build
```

This generates optimized files in the `build` folder.

## Troubleshooting

### Network Errors

If you see "Network Error" when trying to register or login:
1. Make sure the backend server is running
2. Check that the API URL in `src/services/api.js` matches your backend location
3. Ensure CORS is properly configured in the backend

### School Selection Not Working

If schools don't appear in the registration dropdown:
1. Make sure you've created at least one school as a super_admin
2. Check the browser console for API errors
3. The `/api/schools/public` endpoint must be accessible without authentication

For other issues, check the main README.md in the project root. 