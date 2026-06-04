# Security Fix: Remove Hardcoded Admin Credentials

## Overview
This PR removes hardcoded admin credentials (`admin`/`admin123`) from the AdminSignIn component and replaces them with real database authentication via the backend API.

## Changes Made

### 1. **AdminSignIn Component** (`src/components/AdminSignIn.tsx`)
**Before:**
- Hardcoded username: `admin`
- Hardcoded password: `admin123`
- Client-side validation only
- Demo credentials displayed to users
- Session stored as `sessionStorage.setItem("admin_session", "demo")`

**After:**
- Replaced with email-based authentication
- Calls `/auth/admin-login` endpoint on the backend
- Real database credential validation
- JWT token stored securely in `localStorage`
- Structured admin session with metadata:
  ```typescript
  {
    userId: string;
    email: string;
    role: string;
    loginTime: ISO8601 timestamp;
  }
  ```
- Info banner explaining credential requirements

### 2. **API Utility** (`src/lib/api.ts`)
**Added:**
```typescript
export const adminLogin = async (credentials: {
  email: string;
  password: string;
}) => {
  return apiRequest("/auth/admin-login", {
    method: "POST",
    body: JSON.stringify(credentials),
    auth: false,
  });
};
```

## Security Improvements

✅ **Removed hardcoded credentials** - No more client-side secrets  
✅ **Real database validation** - Admin credentials stored securely on backend  
✅ **JWT token authentication** - Proper session management  
✅ **Structured session data** - Enhanced admin context with metadata  
✅ **API-driven authentication** - Backend controls admin access  

## Backend Requirements

The backend must implement the `/auth/admin-login` endpoint:

```typescript
POST /api/auth/admin-login
Content-Type: application/json

{
  "email": "admin@example.com",
  "password": "secure_password"
}

Response (200 OK):
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "UUID",
    "email": "admin@example.com",
    "type": "admin",
    "role": "admin"
  }
}
```

## Migration Steps

1. Ensure admin users exist in the database with email and password
2. Backend implements `/auth/admin-login` endpoint
3. Test admin login with real credentials
4. Update admin user management in database

## Testing

1. Try logging in with invalid credentials → Should see error message
2. Try logging in with valid admin credentials → Should redirect to dashboard
3. Verify JWT token is stored in `localStorage`
4. Verify admin_session is properly structured
5. Check that session persists on page reload

## Files Modified

- `src/components/AdminSignIn.tsx` - Component refactor
- `src/lib/api.ts` - Added `adminLogin` helper function
