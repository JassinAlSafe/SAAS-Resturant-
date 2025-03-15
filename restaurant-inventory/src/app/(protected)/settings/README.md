# Settings Module

This module provides a comprehensive settings management system for the restaurant inventory application. It allows users to customize their experience through various settings categories.

## Features

- **Profile Settings**: Update personal information and profile picture
- **Security Settings**: Change password and manage account deletion
- **Business Settings**: Configure restaurant details and business information
- **Theme Settings**: Customize application appearance (theme, font size, layout)
- **Notification Settings**: Manage notification preferences and schedules

## Architecture

The settings module follows a clean architecture pattern with:

1. **Components**: UI components for each settings section
2. **Hooks**: Custom React hooks for state management and data fetching
3. **Database**: Supabase tables for persistent storage

## Database Schema

The settings module uses the following tables:

### Theme Settings

```sql
CREATE TABLE theme_settings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  font_size VARCHAR(10) DEFAULT 'medium',
  compact_mode BOOLEAN DEFAULT FALSE,
  sticky_header BOOLEAN DEFAULT TRUE,
  animations BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### Notification Preferences

```sql
CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  marketing_emails BOOLEAN DEFAULT FALSE,
  order_updates BOOLEAN DEFAULT TRUE,
  inventory_alerts BOOLEAN DEFAULT TRUE,
  security_alerts BOOLEAN DEFAULT TRUE,
  billing_notifications BOOLEAN DEFAULT TRUE,
  quiet_hours_start VARCHAR(5) DEFAULT '22:00',
  quiet_hours_end VARCHAR(5) DEFAULT '07:00',
  frequency VARCHAR(10) DEFAULT 'immediate',
  digest_time VARCHAR(5) DEFAULT '09:00',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

## Custom Hooks

### useThemeSettings

Manages theme preferences including:

- Color theme (light/dark/system)
- Font size
- Layout preferences (compact mode, sticky header, animations)

### useNotificationSettings

Manages notification preferences including:

- Notification channels (email, push, SMS)
- Notification types (inventory, sales, system)
- Notification schedule (quiet hours, frequency, digest time)

### useProfileSettings

Manages user profile information:

- Name
- Profile picture

### useSecuritySettings

Manages security settings:

- Password changes
- Account deletion

## Components

- **ProfileSection**: Update personal information and profile picture
- **SecuritySection**: Change password and manage account deletion
- **BusinessSettings**: Configure restaurant details
- **ThemeSection**: Customize application appearance
- **NotificationSettings**: Manage notification preferences

## Usage

The settings page is accessible via the `/settings` route and uses a tabbed interface to organize different settings categories.

## Implementation Notes

1. All settings are stored in both localStorage (for immediate access) and Supabase (for persistence across devices)
2. Settings are loaded asynchronously with appropriate loading states
3. Changes are saved explicitly via "Save Changes" buttons
4. Row-level security ensures users can only access their own settings
