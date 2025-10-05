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
            value={field.value ?? ''}
            // Ensure field.onChange supports empty values
            onChange={e => {
              const value = e.target.value;
              if (value === '') {
                field.onChange(undefined);
              } else {
                field.onChange(e.target.valueAsNumber);
              }
            }}
            // Prevent scroll wheel from changing the value
            onWheel={(e) => e.currentTarget.blur()}
            // Add class to hide spinner buttons
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
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
 * Payment methods options
 */
export const paymentMethodOptions = [
  { id: 'cash', label_key: 'rooms.paymentMethodsList.cash' },
  { id: 'credit_card', label_key: 'rooms.paymentMethodsList.creditCard' },
  { id: 'debit_card', label_key: 'rooms.paymentMethodsList.debitCard' },
  { id: 'bank_transfer', label_key: 'rooms.paymentMethodsList.bankTransfer' },
  { id: 'paypal', label_key: 'rooms.paymentMethodsList.paypal' },
  { id: 'apple_pay', label_key: 'rooms.paymentMethodsList.applePay' },
  { id: 'google_pay', label_key: 'rooms.paymentMethodsList.googlePay' },
];

interface PaymentMethodsFieldProps extends BaseFieldProps {
  t: (key: string) => string; // Translation function
}

/**
 * Payment methods checkbox field - reusable across hotel, rooms, and events
 */
export const PaymentMethodsField: React.FC<PaymentMethodsFieldProps> = ({
  form,
  name,
  label,
  description,
  t,
  className,
}) => (
  <FormField
    control={form.control}
    name={name}
    render={() => (
      <FormItem className={className}>
        <FormLabel>{label}</FormLabel>
        {description && <FormDescription>{description}</FormDescription>}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mt-2">
          {paymentMethodOptions.map((method) => (
            <FormField
              key={method.id}
              control={form.control}
              name={name}
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value?.includes(method.id)}
                      onCheckedChange={(checked) => {
                        const currentValue = Array.isArray(field.value) ? field.value : [];
                        if (checked) {
                          field.onChange([...currentValue, method.id]);
                        } else {
                          field.onChange(currentValue.filter((v) => v !== method.id));
                        }
                      }}
                    />
                  </FormControl>
                  <FormLabel className="font-normal">{t(method.label_key)}</FormLabel>
                </FormItem>
              )}
            />
          ))}
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