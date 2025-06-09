# Shared Form Components

This directory contains reusable form components that provide a consistent UI across the entire application. These components should be used in all hotel, room, and event forms to maintain a consistent user experience.

## Available Components

### FormSection

A reusable form section component that wraps content in a card with title and description.

```tsx
import FormSection from '@/components/shared/FormSection';

<FormSection 
  title="Section Title" 
  description="Optional section description"
  className="optional-additional-classes"
>
  {/* Form fields go here */}
</FormSection>
```

### Form Fields

A collection of form field components that abstract away common field patterns:

- **TextField**: For text input fields
- **NumberField**: For numeric input fields
- **TextareaField**: For multi-line text input
- **SwitchField**: For boolean toggle switches
- **CheckboxField**: For boolean checkboxes
- **TwoColumnGrid**: A layout helper for arranging fields in two columns

```tsx
import { 
  TextField, 
  NumberField,
  TextareaField,
  SwitchField,
  CheckboxField,
  TwoColumnGrid
} from '@/components/shared/FormFields';

// Inside your form component
<FormSection title="Example Section">
  <TwoColumnGrid>
    <TextField 
      form={form} // Your react-hook-form instance
      name="fieldName" // The field name in your form data
      label="Field Label" 
      placeholder="Optional placeholder"
      description="Optional description text"
    />
    
    <NumberField 
      form={form} 
      name="numericField" 
      label="Numeric Field" 
      min={0}
      max={100}
      step={0.01}
    />
  </TwoColumnGrid>
  
  <TextareaField 
    form={form} 
    name="longText" 
    label="Long Text Field" 
    rows={5}
  />
  
  <SwitchField 
    form={form} 
    name="toggleField" 
    label="Toggle Feature" 
    description="Optional description"
  />
  
  <CheckboxField 
    form={form} 
    name="checkboxField" 
    label="Checkbox Option" 
  />
</FormSection>
```

## Usage Guidelines

1. Always use these components instead of directly using Form, FormField, etc.
2. Group related fields within a FormSection
3. Use TwoColumnGrid for fields that work well side-by-side
4. Use consistent naming conventions:
   - Use descriptive labels that match the database field names when possible
   - Use clear, action-oriented labels for boolean fields

## Benefits

- **Consistency**: All forms in the application will have the same look and feel
- **Maintainability**: Changes to form styling only need to be made in one place
- **Reduced Boilerplate**: Less repetitive form markup in your components
- **Better User Experience**: Consistent UI patterns help users learn the interface 