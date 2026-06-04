# Security Fix: Remove Hardcoded Admin Credentials

## Overview
This PR removes hardcoded admin credentials (`admin`/`admin123`) from the AdminSignIn component and replaces them with real database authentication via the existing `/auth/login` backend endpoint.

## Changes Made

### 1. **AdminSignIn Component** (`src/components/AdminSignIn.tsx`)
**Before:**
- Hardcoded username: `admin`
- Hardcoded password: `admin123`
- Client-side validation only
- Demo credentials displayed to users
- Session stored as `sessionStorage.setItem("admin_session", "demo")`

**After:**
- Replaced with phone number-based authentication (consistent with API)
- Calls existing `/auth/login` endpoint on the backend
- Backend validates user credentials and admin role
- JWT token stored securely in `localStorage`
- Client-side role validation as additional security layer
- Structured admin session with metadata:
  ```typescript
  {
    userId: string;
    phone: string;
    role: string;
    loginTime: ISO8601 timestamp;
  }
  ```
- Info banner explaining credential requirements

### 2. **API Utility** (`src/lib/api.ts`)
**Added:**
```typescript
export const adminLogin = async (credentials: {
  phone: string;
  password: string;
}) => {
  return apiRequest("/auth/login", {
    method: "POST",
    body: JSON.stringify(credentials),
    auth: false,
  });
};
```

## Security Improvements

✅ **Removed hardcoded credentials** - No more client-side secrets  
✅ **Real database validation** - Admin credentials validated on backend  
✅ **Backend role enforcement** - Backend checks admin privileges  
✅ **JWT token authentication** - Proper session management  
✅ **Dual-layer validation** - Frontend also validates admin role for UX feedback  
✅ **Protected admin endpoints** - Backend protects sensitive endpoints to admin-only users  
✅ **Structured session data** - Enhanced admin context with metadata  

## Backend Implementation

The backend uses the existing `/auth/login` endpoint with role-based access control:

```typescript
POST /api/auth/login
Content-Type: application/json

{
  "phone": "0781234567",
  "password": "secure_password"
}

Response (200 OK):
{
  "token": "JWT_TOKEN",
  "user": {
    "id": "UUID",
    "phone": "0781234567",
    "type": "admin",
    "role": "admin"  // or in user.type
  }
}

Response (401 Unauthorized - if not admin):
{
  "message": "Unauthorized - admin access required"
}
```

**Backend Responsibilities:**
- Validate phone + password credentials
- Check if user has admin role (`user.type === "admin"` or `user.role === "admin"`)
- Return JWT token only for authenticated admin users
- Protect admin-only endpoints with role validation middleware

## Migration Steps

1. ✅ Admin users must exist in the database with phone and password
2. ✅ Admin users must have `type: "admin"` or `role: "admin"` set
3. ✅ Backend `/auth/login` endpoint already returns user role
4. ✅ Backend protects admin endpoints to admin-only users (as mentioned)
5. Test admin login with real credentials

## Testing Checklist

- [ ] Try logging in with invalid credentials → Should see error message
- [ ] Try logging in with valid non-admin credentials → Should see "Access denied" message
- [ ] Try logging in with valid admin credentials → Should redirect to dashboard
- [ ] Verify JWT token is stored in `localStorage`
- [ ] Verify admin_session is properly structured
- [ ] Check that session persists on page reload
- [ ] Verify backend protected endpoints reject non-admin users

## Files Modified

- `src/components/AdminSignIn.tsx` - Component refactor to use `/auth/login` with phone
- `src/lib/api.ts` - Added `adminLogin` helper function

## Related Backend Endpoints

As mentioned by backend developer, the following endpoints are protected to admin-only:
- Admin dashboard metrics endpoints
- User management endpoints
- Provider approval endpoints
- Dispute resolution endpoints
- Analytics endpoints

These are secured via JWT token validation and role checking middleware on the backend.
