# Tournament System Implementation Guide

## Overview

The tournament system is fully implemented with a hierarchical flow: **Tournament Creation → Event Management**

---

## System Architecture

### Components Hierarchy

```
Tournament System
├── TournamentManagement (Dashboard)
│   ├── TournamentCreation (Form Dialog)
│   ├── Search & Filter
│   └── Actions Menu
├── TournamentDetails (View)
├── TournamentEdit (Edit)
└── TournamentEventManagement (Events)
    ├── Event Creation
    ├── Event Management
    ├── Groups & Matches
    └── Registrations
```

---

## Features

### 1. Permission-Based Tournament Creation

#### Permission Levels

**Club Users**

- ✅ Create LOCAL tournaments only
- ✅ Max 128 participants
- ✅ Can create paid events
- ⚠️ Requires state approval before publishing

**State Users**

- ✅ Create LOCAL tournaments
- ✅ Create STATE tournaments
- ✅ Max 500 participants
- ✅ Can manage local club tournaments
- ✅ No approval required

**Admin Users**

- ✅ Create LOCAL tournaments
- ✅ Create STATE tournaments
- ✅ Create NATIONAL tournaments
- ✅ Max 1000 participants
- ✅ Full access to all tournaments

---

### 2. Tournament Types

| Type         | Level          | Created By         | Scope      |
| ------------ | -------------- | ------------------ | ---------- |
| **Local**    | City/Area      | Club, State, Admin | Regional   |
| **State**    | Federal Entity | State, Admin       | Statewide  |
| **National** | Country        | Admin              | Nationwide |

---

### 3. Tournament Workflow

#### Step 1: Create Tournament

```
User navigates to /tournaments
→ Clicks "Create New Tournament" button
→ Fills tournament form:
   - Basic info (name, type, category)
   - Venue details
   - Dates & deadlines
   - Entry fee (optional)
   - Contact info
   - Rules
→ Submits form
→ Tournament created (status: draft)
```

#### Step 2: Create Events

```
From tournament dashboard:
→ Click "Manage Events"
→ Navigates to /tournaments/:tournamentId/manage
→ TournamentEventManagement component loads
→ Create events within tournament:
   - Skill level
   - Gender category
   - Format (singles, doubles, etc.)
   - Participant limits
   - Match format
→ Events created & participants register
```

#### Step 3: Manage Matches

```
Within event management:
→ Generate groups
→ Create matches
→ Record results
→ Track standings
```

---

## Usage Examples

### For Club Users

```typescript
// 1. User navigates to tournaments
Route: /tournaments

// 2. Sees their permission level
Permission: "Club - Can create LOCAL tournaments only"

// 3. Creates a tournament
{
  name: "City Championship 2026",
  tournament_type: "local",
  category: "singles",
  organizer_type: "club",
  venue_name: "Club Central",
  state: "Jalisco",
  city: "Guadalajara",
  start_date: "2026-03-15",
  end_date: "2026-03-17",
  registration_deadline: "2026-03-10",
  max_participants: 64
}

// 4. Tournament created in "draft" status
// Club user sees: "Approval Required" badge

// 5. Once approved by state, publishes tournament
// 6. Creates events within tournament
// 7. Manages registrations and matches
```

### For State Users

```typescript
// 1. Navigate to /tournaments
// 2. See permission level
Permission: "State - Can create LOCAL & STATE tournaments"

// 3. Create a state-level tournament
{
  name: "State Championship 2026",
  tournament_type: "state",
  category: "doubles",
  organizer_type: "state",
  ...
}

// 4. Immediately publishable (no approval needed)
// 5. Can also manage club tournaments
// 6. Create events and manage full lifecycle
```

### For Admin Users

```typescript
// 1. Navigate to /tournaments
// 2. See full permission level
Permission: "Admin - Can create LOCAL, STATE, & NATIONAL tournaments"

// 3. Can create national tournament
{
  name: "National Championship 2026",
  tournament_type: "national",
  category: "team",
  organizer_type: "admin",
  ...
}

// 4. Full control over all tournaments
// 5. Can approve/disapprove club tournaments
// 6. Manage all aspects of tournament system
```

---

## API Integration Points

### Redux Actions Used

```typescript
// Fetch tournaments with filters
dispatch(
  fetchTournaments({
    page: 1,
    limit: 50,
    tournament_type: 'local',
    status: 'published',
  }),
);

// Create tournament
dispatch(
  createTournament({
    name: 'Tournament Name',
    tournament_type: 'local',
    // ... other fields
  }),
);

// Update tournament
dispatch(
  updateTournament({
    id: 'tournament-id',
    status: 'published',
  }),
);

// Fetch tournament events
dispatch(
  fetchTournamentEvents({
    tournamentId: 'tournament-id',
  }),
);

// Create event
dispatch(
  createTournamentEvent({
    tournamentId: 'tournament-id',
    eventData: {
      skill_block: '3.0',
      gender: 'male',
      // ... other fields
    },
  }),
);
```

---

## Routes

| Path                                | Component                 | Purpose              |
| ----------------------------------- | ------------------------- | -------------------- |
| `/tournaments`                      | TournamentManagement      | Dashboard & creation |
| `/tournaments/:tournamentId`        | TournamentDetails         | View details         |
| `/tournaments/:tournamentId/manage` | TournamentEventManagement | Manage events        |
| `/tournaments/:tournamentId/edit`   | TournamentEdit            | Edit tournament      |

---

## Form Validation

### Tournament Creation Form

**Required Fields:**

- ✅ Tournament Name
- ✅ Tournament Type (local, state, national)
- ✅ Category (singles, doubles, mixed_doubles, team)
- ✅ Venue Name
- ✅ State
- ✅ City
- ✅ Start Date
- ✅ End Date
- ✅ Registration Deadline

**Validation Rules:**

```
1. End Date > Start Date ✅
2. Registration Deadline < Start Date ✅
3. Max Participants ≤ User's Limit ✅
4. Tournament Type ∈ User's Allowed Types ✅
5. Organizer Type = User's Type ✅
```

---

## State Management

### Redux Store Structure

```typescript
state = {
  tournaments: {
    tournaments: Tournament[],           // All tournaments
    currentTournament: Tournament | null, // Selected tournament
    tournamentEvents: TournamentEvent[], // Events for current tournament
    currentEvent: TournamentEvent | null, // Selected event
    eventRegistrations: Registration[],  // Registrations
    eventGroups: Group[],               // Bracket groups
    eventMatches: Match[],              // Matches
    groupStandings: Standings[],        // Group standings
    loading: boolean,                   // Loading state
    error: string | null                // Error message
  }
}
```

---

## Permissions System

### TournamentCreationPermissions Interface

```typescript
interface TournamentCreationPermissions {
  data: {
    can_create_tournaments: boolean;
    allowed_tournament_types: ('local' | 'state' | 'national')[];
    max_participants_limit: number;
    max_teams_limit: number;
    can_create_paid_events: boolean;
    can_create_state_level: boolean;
    can_create_national_level: boolean;
    requires_approval: boolean;
    approval_required_by?: 'club' | 'state' | 'federation' | 'admin';
    current_subscription_level: string;
    upgrade_required_for?: string[];
  };
}
```

---

## Type Definitions

### CreateTournamentRequest

```typescript
interface CreateTournamentRequest {
  name: string;
  tournament_type: 'local' | 'state' | 'national';
  category: 'singles' | 'doubles' | 'mixed_doubles' | 'team';
  description?: string;
  organizer_type: 'club' | 'state' | 'admin';
  venue_name: string;
  venue_address: string;
  state: string;
  city: string;
  start_date: string;
  end_date: string;
  registration_deadline: string;
  entry_fee?: number;
  max_participants?: number;
  rules?: string;
  contact_email?: string;
  contact_phone?: string;
}
```

---

## Error Handling

### User-Facing Messages

```typescript
// Permission denied
'You do not have permission to create tournaments.';

// Validation error
'Please fill in all required fields.';

// Date validation
'End date must be after start date.';
'Registration deadline must be before start date.'
// Participant limit error
`Maximum participants exceeded. Your limit is ${limit}.`;

// API error
('Failed to create tournament. Please try again.');
```

---

## Styling & Theme

### Color Scheme

- **Background:** #080c14 (Dark)
- **Text:** White / #f5f5f5
- **Primary Action:** #ace600 (Green)
- **Secondary:** #f5f5f5 (Light)
- **Error:** #ef4444 (Red)
- **Warning:** #f59e0b (Amber)

### Components Used

- shadcn/ui Card, Button, Input, Select
- Lucide icons for visual elements
- Custom badge styling for status/type

---

## Best Practices

### For Club Organizers

1. ✅ Create tournament first (in draft)
2. ✅ Fill all required information
3. ✅ Set realistic participant limits
4. ✅ Wait for state approval
5. ✅ Publish tournament
6. ✅ Create events
7. ✅ Manage registrations

### For State Administrators

1. ✅ Review club tournament submissions
2. ✅ Approve/disapprove as needed
3. ✅ Create own state tournaments
4. ✅ Coordinate with federation
5. ✅ Monitor all tournaments in state

### For System Administrators

1. ✅ Create national tournaments
2. ✅ Oversee all tournament operations
3. ✅ Adjust permission levels
4. ✅ Manage appeal processes
5. ✅ Generate reports

---

## Troubleshooting

### Issue: User cannot create tournament

**Solution:** Check user_type matches 'club', 'state', or 'admin'

### Issue: Tournament type greyed out

**Solution:** Your user role doesn't allow that tournament type

### Issue: Submit button disabled

**Solution:** Fill all required fields and fix validation errors

### Issue: Date validation error

**Solution:** Ensure dates are in correct order and in future

---

## Future Enhancements

- [ ] Tournament templates
- [ ] Bulk tournament creation
- [ ] Clone existing tournaments
- [ ] Advanced scheduling
- [ ] Automated seeding
- [ ] Live match updates
- [ ] Mobile app
- [ ] Real-time notifications
- [ ] Video integration
- [ ] Sponsorship management

---

## Summary

The tournament system provides a complete, permission-based solution for creating and managing tournaments with proper validation, error handling, and user experience. The hierarchical permissions ensure proper control over tournament creation while allowing flexibility for different user roles.

**Key Success Metrics:**
✅ Zero compilation errors  
✅ All routes working  
✅ Redux properly integrated  
✅ Form validation complete  
✅ Permission system secure  
✅ UI responsive & themed  
✅ Code well-organized  
✅ Ready for backend integration
