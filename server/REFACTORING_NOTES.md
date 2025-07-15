# Refactoring Notes: Economic Assumptions and Six Jars Profiles

## Overview

This refactoring separates economic assumptions and six jars profiles from the user model into their own collections for better data management and reusability.

## Changes Made

### 1. Economic Assumptions Collection

- **New Model**: `server/src/api/economicAssumptions/economicAssumption.model.js`
- **Purpose**: Store economic assumptions that are shared across all users
- **Fields**:
  - `inflationRate` (default: 2.0%)
  - `bankInterestRate` (default: 1.0%)
  - `marketReturnRate` (default: 7.0%)
  - `taxRate` (default: 20.0%)
  - `isActive` (boolean flag for active assumptions)

### 2. Six Jars Profiles Collection

- **New Model**: `server/src/api/sixJarsProfiles/sixJarsProfile.model.js`
- **Purpose**: Store preset and custom six jars budget profiles
- **Fields**:
  - `name` (profile name)
  - `description` (profile description)
  - `isPreset` (boolean to identify preset profiles)
  - `isActive` (boolean for active profiles)
  - `jarPercentages` (object with 6 jar percentages that sum to 100%)

### 3. Updated User Model

- **Removed**: `economicAssumptions` and `sixJarsProfile` embedded objects
- **Added**: `sixJarsProfileId` (reference to SixJarsProfile collection)
- **Kept**: `investmentProfile` with `riskTolerance` and `monthlyInvestableIncome`

### 4. Preset Six Jars Profiles

Created 6 preset profiles:

1. **Standard Budget** (55-10-10-10-10-5)
2. **Conservative Saver** (60-5-10-10-12-3)
3. **Balanced Lifestyle** (50-15-15-10-8-2)
4. **Education Focus** (55-8-20-8-7-2)
5. **Financial Freedom Focus** (50-8-10-20-10-2)
6. **Generous Giver** (55-8-10-10-7-10)

## API Endpoints

### Economic Assumptions

- `GET /api/economic-assumptions/active` - Get active economic assumptions
- `GET /api/economic-assumptions` - Get all economic assumptions (admin)
- `PUT /api/economic-assumptions` - Update economic assumptions (admin)

### Six Jars Profiles

- `GET /api/six-jars-profiles/presets` - Get preset profiles
- `GET /api/six-jars-profiles` - Get all profiles
- `GET /api/six-jars-profiles/:id` - Get specific profile
- `POST /api/six-jars-profiles` - Create custom profile
- `PUT /api/six-jars-profiles/:id` - Update profile
- `DELETE /api/six-jars-profiles/:id` - Delete custom profile

### Updated User Endpoints

- `GET /api/users/:id` - Get user with populated six jars profile
- `PUT /api/users/:id/six-jars-profile` - Update user's six jars profile

## Database Setup

### Running the Seed Script

```bash
npm run seed
```

This will:

1. Create 6 preset six jars profiles
2. Create default economic assumptions
3. Clear any existing preset profiles before seeding

### User Registration

When a user registers:

- If no `sixJarsProfileId` is provided, the system automatically assigns the "Standard Budget" profile
- If "Standard Budget" doesn't exist, it falls back to any available preset profile

## Benefits of This Refactoring

1. **Shared Economic Assumptions**: All users use the same economic assumptions, ensuring consistency
2. **Flexible Six Jars Profiles**: Users can choose from presets or create custom profiles
3. **Better Data Management**: Separating concerns makes the system more maintainable
4. **Scalability**: Easy to add new preset profiles or modify economic assumptions
5. **Data Integrity**: Validation ensures jar percentages always sum to 100%

## Migration Notes

For existing users:

- Economic assumptions will be retrieved from the new collection
- Users will need to select a six jars profile (or be assigned the default)
- The system will work with the new structure once seeded
