# Venue & Courts Management Implementation Guide

## Architecture Overview

The structure follows this hierarchy:

```
Club
  └─ Venues (multiple)
      └─ Courts (multiple per venue)
```

## What's Been Implemented

### 1. Redux Store (`venuesSlice.ts`)

- **State Management**: Handles venues, pagination, loading states, and errors
- **Async Thunks**:
  - `fetchVenuesByClub`: Get all venues for a club with pagination
  - `fetchVenueById`: Get a single venue with its courts
  - `createVenue`: Create a new venue (automatically creates courts)
  - `updateVenue`: Update venue details (can update court count)
  - `deleteVenue`: Soft delete venue (sets `is_active` to false)

### 2. Components

#### VenuesManagement.tsx

Main component for managing venues. Features:

- List all venues for a club with pagination
- Search and filter venues
- Create new venues
- Edit existing venues
- Delete venues
- **Auto-court Creation**: When you set `number_of_courts`, the backend automatically creates that many courts named "Court 1", "Court 2", etc.

**Props**:

```tsx
<VenuesManagement clubId={clubId} />
```

#### CourtsViewer.tsx

Display courts for a specific venue. Features:

- View all courts in a venue
- Display court details (type, surface, rate, availability)
- Responsive grid layout

**Props**:

```tsx
<CourtsViewer venue={venue} onBack={handleBackClick} />
```

## Backend Implementation Requirements

### API Endpoints Needed

#### 1. Get Venues by Club

```
GET /venues/club/:clubId
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - is_active: boolean

Response:
{
  success: true,
  data: {
    venues: Venue[],
    pagination: {
      total: number,
      page: number,
      limit: number,
      pages: number
    }
  }
}
```

#### 2. Get Venue by ID

```
GET /venues/:id

Response:
{
  success: true,
  data: Venue (includes courts array)
}
```

#### 3. Create Venue

```
POST /venues

Body:
{
  club_id: string,
  name: string,
  state: string,
  address: string,
  phone?: string,
  whatsapp?: string,
  court_type: 'indoor' | 'outdoor' | 'covered',
  surface_type: 'concrete' | 'clay' | 'asphalt' | 'synthetic' | 'grass',
  base_price_per_hour: number,
  number_of_courts: number, // THIS TRIGGERS AUTO-CREATION
  operating_hours?: object,
  payment_config?: object,
  description?: string,
  facilities?: string[]
}

Important:
- Endpoint should create 'number_of_courts' courts automatically
- Each court should be named "Court 1", "Court 2", etc.
- Set is_active: true by default

Response:
{
  success: true,
  message: 'Venue created successfully',
  data: Venue (includes courts array)
}
```

#### 4. Update Venue

```
PUT /venues/:id

Body: (all fields optional)
{
  name?: string,
  state?: string,
  address?: string,
  phone?: string,
  whatsapp?: string,
  court_type?: string,
  surface_type?: string,
  base_price_per_hour?: number,
  number_of_courts?: number, // Update court count if provided
  operating_hours?: object,
  payment_config?: object,
  description?: string,
  facilities?: string[]
}

Important:
- If number_of_courts is updated, backend should:
  - Add new courts if count increases
  - Deactivate extra courts if count decreases (don't delete)

Response:
{
  success: true,
  message: 'Venue updated successfully',
  data: Updated Venue
}
```

#### 5. Delete Venue (Soft Delete)

```
DELETE /venues/:id

Checks before deletion:
- No active courts (is_active: true)
- No future reservations (after current date)

Response:
{
  success: true,
  message: 'Venue deactivated successfully'
}

Or if has active data:
{
  success: false,
  message: 'Cannot delete venue with active courts or future reservations...'
}
```

## Database Schema (Suggested)

### Venues Table

```sql
CREATE TABLE venues (
  id UUID PRIMARY KEY,
  club_id UUID NOT NULL REFERENCES clubs(id),
  name VARCHAR(255) NOT NULL,
  state VARCHAR(100),
  address TEXT,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  court_type ENUM('indoor', 'outdoor', 'covered'),
  surface_type ENUM('concrete', 'clay', 'asphalt', 'synthetic', 'grass'),
  base_price_per_hour DECIMAL(10, 2),
  number_of_courts INT DEFAULT 1,
  operating_hours JSONB,
  payment_config JSONB,
  description TEXT,
  facilities JSONB (array of strings),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Courts Table

```sql
CREATE TABLE courts (
  id UUID PRIMARY KEY,
  venue_id UUID NOT NULL REFERENCES venues(id),
  club_id UUID NOT NULL REFERENCES clubs(id),
  name VARCHAR(255) NOT NULL,
  court_number INT NOT NULL,
  court_type VARCHAR(50),
  surface_type VARCHAR(50),
  hourly_rate DECIMAL(10, 2),
  capacity INT DEFAULT 4,
  has_net BOOLEAN DEFAULT true,
  has_lighting BOOLEAN,
  is_available BOOLEAN DEFAULT true,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Processing Response (Following Admin Pattern)

All API responses must follow the standardized `ApiResponse` format defined in `@/lib/apiResponseHandler.ts`:

### Success Response Format

```json
{
  "data": {
    "venues": [],
    "pagination": {
      "total": 15,
      "page": 1,
      "limit": 10,
      "pages": 2
    }
  },
  "message": "Venues retrieved successfully",
  "status": "success",
  "metadata": {
    "timestamp": "2026-02-23T10:30:00Z",
    "requestId": "req_12345xyz",
    "pagination": {
      "page": 1,
      "limit": 10,
      "total": 15,
      "totalPages": 2
    }
  }
}
```

### Error Response Format

```json
{
  "data": null,
  "message": "Venue not found",
  "status": "error",
  "errors": ["Venue with ID '123' does not exist"],
  "metadata": {
    "timestamp": "2026-02-23T10:30:00Z",
    "requestId": "req_12345xyz"
  }
}
```

### Response Status Types

- **success**: Operation completed without issues
- **error**: Operation failed with error(s)
- **partial_success**: Operation completed but with warnings

### Error Handling by Status Code

- **400**: Validation error → Display validation messages
- **401**: Authentication error → Redirect to login
- **403**: Authorization error → Show "Access Denied" message
- **404**: Not Found error → Show "Resource not found" message
- **500**: Server error → Show "Server error, please try again"

### Response Implementation Pattern

```typescript
// In your backend route handlers:

// Success with pagination
res.status(200).json({
  data: {
    venues: venuesArray,
    pagination: {
      total: totalCount,
      page: currentPage,
      limit: pageLimit,
      pages: Math.ceil(totalCount / pageLimit),
    },
  },
  message: 'Venues retrieved successfully',
  status: 'success',
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: req.id,
  },
});

// Single resource success
res.status(201).json({
  data: newVenue,
  message: 'Venue created successfully',
  status: 'success',
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: req.id,
  },
});

// Error response
res.status(400).json({
  data: null,
  message: 'Invalid venue data',
  status: 'error',
  errors: ['Court type is required', 'Number of courts must be greater than 0'],
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: req.id,
  },
});

// Validation error with field-level detail
res.status(400).json({
  data: null,
  message: 'Validation failed',
  status: 'error',
  errors: ['Validation failed for venue creation'],
  metadata: {
    timestamp: new Date().toISOString(),
    requestId: req.id,
    validationErrors: {
      name: 'Name is required',
      address: 'Address must be at least 5 characters',
      number_of_courts: 'Number of courts must be between 1 and 20',
    },
  },
});
```

## How to Use in Your Dashboard

### Example Integration in Club Dashboard

```tsx
import VenuesManagement from '@/pages/clubs/dashboard/VenuesManagement';
import CourtsViewer from '@/pages/clubs/dashboard/CourtsViewer';

export default function ClubDashboard() {
  const [selectedVenue, setSelectedVenue] = useState<Venue | null>(null);

  if (selectedVenue) {
    return <CourtsViewer venue={selectedVenue} onBack={() => setSelectedVenue(null)} />;
  }

  return <VenuesManagement clubId={clubId} onSelectVenue={(venue) => setSelectedVenue(venue)} />;
}
```

## Key Features

### 1. Auto-Court Creation

When creating a venue with `number_of_courts: 4`, the backend automatically creates:

- Court 1
- Court 2
- Court 3
- Court 4

### 2. Court Update Handling

If you update a venue from 4 courts to 6 courts:

- Creates 2 new courts (Court 5, Court 6)

If you update from 4 courts to 2 courts:

- Deactivates Court 3 and Court 4 (doesn't delete for audit trail)

### 3. Soft Delete

Venues are never permanently deleted - just marked `is_active: false`

### 4. Access Control

- Only club admin or the club owner can create/edit/delete venues
- Returns 403 Forbidden if unauthorized

## Usage Flow

1. **View Venues**: `VenuesManagement` component displays all venues for the club
2. **Create Venue**:
   - Click "Add Venue"
   - Fill in venue details
   - Set number of courts (e.g., 4)
   - Submit → Backend creates venue + 4 courts
3. **Edit Venue**:
   - Click "Edit" on a venue
   - Update details and/or court count
   - Submit → Backend updates venue + adds/deactivates courts
4. **View Courts**:
   - Click on a venue card
   - `CourtsViewer` shows all courts in that venue
5. **Delete Venue**:
   - Click "Delete"
   - Confirms no active courts or future reservations
   - Soft deletes the venue

## Error Handling

All components include:

- Loading states with spinner
- Error messages for failed operations
- Toast notifications for success/failure
- Validation before submission
- Access control checks

## Next Steps

1. Implement backend endpoints according to specs above
2. Ensure courts are auto-created when venue is created
3. Add authentication middleware to protect routes
4. Test the full flow: Create venue → View courts → Update court count → Delete venue
