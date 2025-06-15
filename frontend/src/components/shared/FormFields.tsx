import React from 'react';
import { UseFormReturn } from 'react-hook-form';
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface BaseFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  description?: string;
  placeholder?: string;
  className?: string;
}

interface TextFieldProps extends BaseFieldProps {
  type?: 'text' | 'email' | 'tel' | 'password' | 'url' | 'time';
}

interface NumberFieldProps extends BaseFieldProps {
  min?: number;
  max?: number;
  step?: number | string;
}

interface TextareaFieldProps extends BaseFieldProps {
  rows?: number;
}

interface SwitchFieldProps extends BaseFieldProps {
  alignRight?: boolean;
}

interface CheckboxFieldProps extends BaseFieldProps {
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Text input form field
 */
export const TextField: React.FC<TextFieldProps> = ({
  form,
  name,
  label,
  description,
  placeholder,
  type = 'text',
  className,
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input type={type} placeholder={placeholder} {...field} />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * Number input form field
 */
export const NumberField: React.FC<NumberFieldProps> = ({
  form,
  name,
  label,
  description,
  placeholder,
  min,
  max,
  step = 1,
  className,
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Input 
            type="number"
            placeholder={placeholder}
            min={min}
            max={max}
            step={step}
            {...field}
            // Ensure field.onChange receives a number
            onChange={e => field.onChange(e.target.valueAsNumber)}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * Textarea form field
 */
export const TextareaField: React.FC<TextareaFieldProps> = ({
  form,
  name,
  label,
  description,
  placeholder,
  rows = 3,
  className,
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        <FormControl>
          <Textarea 
            placeholder={placeholder}
            rows={rows}
            {...field}
          />
        </FormControl>
        {description && <FormDescription>{description}</FormDescription>}
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * Switch form field
 */
export const SwitchField: React.FC<SwitchFieldProps> = ({
  form,
  name,
  label,
  description,
  alignRight = true,
  className,
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className={`${alignRight ? 'flex items-center justify-between' : ''} rounded-lg border p-4 ${className}`}>
        <div>
          <FormLabel>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormControl>
          <Switch 
            checked={field.value} 
            onCheckedChange={field.onChange}
          />
        </FormControl>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * Checkbox form field
 */
export const CheckboxField: React.FC<CheckboxFieldProps> = ({
  form,
  name,
  label,
  description,
  onCheckedChange,
  className,
}) => (
  <FormField
    control={form.control}
    name={name}
    render={({ field }) => (
      <FormItem className={`flex flex-row items-start space-x-3 space-y-0 ${className}`}>
        <FormControl>
          <Checkbox
            checked={field.value}
            onCheckedChange={(checked) => {
              field.onChange(checked);
              if (onCheckedChange) onCheckedChange(!!checked);
            }}
          />
        </FormControl>
        <div className="space-y-1 leading-none">
          <FormLabel>{label}</FormLabel>
          {description && <FormDescription>{description}</FormDescription>}
        </div>
        <FormMessage />
      </FormItem>
    )}
  />
);

/**
 * Two-column grid container for form fields
 */
export const TwoColumnGrid: React.FC<{ children: React.ReactNode; className?: string }> = ({ 
  children,
  className = ''
}) => (
  <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${className}`}>
    {children}
  </div>
);

export { default as PhoneField } from './PhoneField'; 