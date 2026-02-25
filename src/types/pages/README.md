# Page Interfaces Documentation

This directory contains TypeScript interfaces for all page components in the application.

## Structure

### Core Files
- `index.ts` - Main export file for all interfaces
- `shared.ts` - Common interfaces used across multiple pages

### Page-Specific Interface Files
- `auth.ts` - Authentication page interfaces
- `home.ts` - Home and landing page interfaces  
- `player.ts` - Player dashboard and profile interfaces
- `coach.ts` - Coach dashboard and management interfaces
- `club.ts` - Club management interfaces
- `partner.ts` - Business partner interfaces
- `state.ts` - State organization interfaces
- `admin.ts` - System administration interfaces
- `common.ts` - Shared functionality interfaces (clubs, courts, tournaments, etc.)
- `notFound.ts` - Error page interfaces

## Usage

Import interfaces from the main index:

```typescript
import { LoginPageProps, PlayerDashboardProps, ClubProfilePageProps } from '../types/pages';
```

## Interface Categories

### Authentication
- User registration and login flows
- Profile management
- User type selection

### Dashboard Interfaces
- Player, Coach, Club, Partner, State, and Admin dashboards
- Activity feeds, statistics, and notifications
- Recent events and upcoming activities

### Profile Management
- User profile updates
- Credential management
- Business information
- Preferences and settings

### Facility Management
- Court reservations
- Facility availability
- Pricing and policies
- Maintenance schedules

### User Management
- Member management
- Staff management
- Committee organization
- Permission systems

### Analytics & Reporting
- Performance metrics
- Trend analysis
- Business insights
- System statistics

### Event Management
- Tournament organization
- Event scheduling
- Registration systems
- Participant management

## Common Patterns

All page interfaces follow consistent patterns:
- Props interfaces for component props
- Data interfaces for business entities
- Filter interfaces for search and filtering
- Action interfaces for event handlers
- Loading states and error handling
- Pagination for list views

## Shared Types

Common interfaces used across multiple pages:
- `Pagination` - Standard pagination structure
- `SocialMediaLinks` - Social media URLs
- `ContactInfo` - Contact information
- `Address` - Geographic location data
- `TimeSlot` - Time availability
- `BusinessHours` - Operating hours
- `Notification` - System notifications
- `Activity` - User activity records
- `Event` - Event information
- `Stats` - Statistical data 