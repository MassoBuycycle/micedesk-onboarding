# Translation System Guide

## Overview

The hotel onboarding application now supports internationalization (i18n) with German and English languages. The translation system is built using `react-i18next` and provides seamless language switching throughout the application.

## Features

- **Dual Language Support**: English (default) and German
- **Automatic Language Detection**: Detects browser language preference
- **Persistent Language Selection**: Saves language choice in localStorage
- **Language Switcher**: Easy-to-use dropdown in the sidebar
- **Comprehensive Coverage**: All major UI elements are translated

## How to Use

### Language Switching

1. **Via Sidebar**: Click the language switcher in the sidebar footer
   - Shows current language with flag (🇺🇸 English / 🇩🇪 Deutsch)
   - Dropdown menu to select between languages
   - Changes are applied immediately

2. **Automatic Detection**: 
   - First visit: Detects browser language
   - Subsequent visits: Uses saved preference

### Translated Sections

The following areas are fully translated:

#### Navigation
- Sidebar menu items
- Admin section labels
- Version information

#### Hotel Management
- Basic information form
- All form fields and labels
- Validation messages
- Success/error notifications

#### Policies Management
- Policy types (Room Information, Service Information, General Policies)
- Form dialogs and buttons
- Status messages
- Policy management interface

#### Common Elements
- Buttons (Save, Cancel, Edit, Delete, etc.)
- Loading states
- Error messages
- Form validation

## Technical Implementation

### File Structure

```
frontend/src/i18n/
├── index.ts              # i18n configuration
└── locales/
    ├── en.json          # English translations
    └── de.json          # German translations
```

### Usage in Components

```typescript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t("navigation.addHotel")}</h1>
      <p>{t("hotel.description")}</p>
    </div>
  );
};
```

### Translation Keys Structure

```json
{
  "navigation": {
    "addHotel": "Add Hotel",
    "viewHotels": "View Hotels"
  },
  "hotel": {
    "name": "Hotel Name",
    "description": "Description"
  },
  "policies": {
    "title": "Information Policies",
    "policyTypes": {
      "roomInformation": "Room Information"
    }
  }
}
```

## Adding New Translations

### 1. Add to Translation Files

**English** (`frontend/src/i18n/locales/en.json`):
```json
{
  "newSection": {
    "newKey": "New English Text"
  }
}
```

**German** (`frontend/src/i18n/locales/de.json`):
```json
{
  "newSection": {
    "newKey": "Neuer deutscher Text"
  }
}
```

### 2. Use in Components

```typescript
const { t } = useTranslation();
return <span>{t("newSection.newKey")}</span>;
```

### 3. With Variables

**Translation files**:
```json
{
  "messages": {
    "welcome": "Welcome {{name}} to {{hotel}}"
  }
}
```

**Component usage**:
```typescript
{t("messages.welcome", { name: "John", hotel: "Hotel ABC" })}
```

## Language Codes

- **English**: `en` (default)
- **German**: `de`

## Browser Support

The translation system works in all modern browsers and automatically detects:
- Browser language preferences
- System locale settings
- Saved user preferences

## Performance

- **Lazy Loading**: Translation files are loaded on demand
- **Caching**: Translations are cached in memory
- **Small Bundle Size**: Only active language is loaded

## Troubleshooting

### Missing Translations
- Check console for missing key warnings
- Verify key exists in both language files
- Ensure proper nesting structure

### Language Not Switching
- Clear localStorage: `localStorage.clear()`
- Check browser console for errors
- Verify i18n initialization in App.tsx

### Adding New Languages

To add a new language (e.g., French):

1. Create `frontend/src/i18n/locales/fr.json`
2. Add to `frontend/src/i18n/index.ts`:
   ```typescript
   import fr from './locales/fr.json';
   
   const resources = {
     en: { translation: en },
     de: { translation: de },
     fr: { translation: fr }  // Add this
   };
   ```
3. Update LanguageSwitcher component:
   ```typescript
   const languages = [
     { code: 'en', name: 'English', flag: '🇺🇸' },
     { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
     { code: 'fr', name: 'Français', flag: '🇫🇷' }  // Add this
   ];
   ```

## Best Practices

1. **Consistent Key Naming**: Use descriptive, hierarchical keys
2. **Complete Coverage**: Ensure all user-facing text is translated
3. **Context Awareness**: Group related translations together
4. **Variable Usage**: Use interpolation for dynamic content
5. **Testing**: Test all languages thoroughly

## Current Status

✅ **Completed**:
- i18n system setup and configuration
- Language switcher component
- Navigation translations
- Policies page translations
- Hotel form basic info translations
- Policy form dialogs translations

🔄 **Partially Completed**:
- Hotel form sections (billing, facilities, etc.)
- Policy items management dialog
- View pages and tables

⏳ **Pending**:
- Admin pages
- User management
- Error pages
- Email templates (if any)

The translation system is fully functional and ready for use. Users can switch between English and German seamlessly throughout the application. 