import { UseFormReturn } from 'react-hook-form';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { useTranslation } from 'react-i18next';
import React from 'react';

type Option = { code: string; label: string };

const COUNTRY_CODES: Option[] = [
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+43', label: '🇦🇹 +43' },
  { code: '+41', label: '🇨🇭 +41' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+39', label: '🇮🇹 +39' },
  { code: '+351', label: '🇵🇹 +351' },
];

interface PhoneFieldProps {
  form: UseFormReturn<any>;
  name: string;
  label: string;
  placeholder?: string;
  required?: boolean;
}

const PhoneField = ({ form, name, label, placeholder, required }: PhoneFieldProps) => {
  const { t } = useTranslation();

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => {
        // split existing value
        let defaultCode = '+49';
        let localNumber = field.value || '';
        const match = /^(\+\d{1,3})\s?(.*)$/.exec(field.value);
        if (match) {
          defaultCode = match[1];
          localNumber = match[2];
        }

        return (
          <FormItem>
            <FormLabel className="text-xs">{label}{required && '*'}</FormLabel>
            <div className="flex gap-2">
              <Select
                defaultValue={defaultCode}
                onValueChange={(val) => {
                  field.onChange(`${val} ${localNumber}`.trim());
                }}
              >
                <SelectTrigger className="w-24 h-8 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {COUNTRY_CODES.map((c) => (
                    <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormControl className="flex-1">
                <Input
                  type="tel"
                  value={localNumber}
                  placeholder={placeholder}
                  onChange={(e) => {
                    const newVal = e.target.value.replace(/[^0-9]/g, '');
                    field.onChange(`${defaultCode} ${newVal}`.trim());
                  }}
                  className="h-8 text-sm"
                />
              </FormControl>
            </div>
            <FormMessage className="text-xs" />
          </FormItem>
        );
      }}
    />
  );
};

export default PhoneField; 