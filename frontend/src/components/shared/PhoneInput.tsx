import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select';
import { Input } from '@/components/ui/input';

// Country code options (same as PhoneField)
const COUNTRY_CODES = [
  { code: '+49', label: '🇩🇪 +49' },
  { code: '+43', label: '🇦🇹 +43' },
  { code: '+41', label: '🇨🇭 +41' },
  { code: '+1', label: '🇺🇸 +1' },
  { code: '+44', label: '🇬🇧 +44' },
  { code: '+33', label: '🇫🇷 +33' },
  { code: '+39', label: '🇮🇹 +39' },
] as const;

interface PhoneInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

/**
 * Country-aware phone number input that can be used outside react-hook-form.
 * Combines a select for the country dial code and an Input for the local part.
 */
const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, placeholder, className }) => {
  // Derive the selected dial code and local number from the combined value
  let defaultCode = '+49';
  let localNumber = value || '';
  const match = /^\+(\d{1,3})\s?(.*)$/.exec(value);
  if (match) {
    defaultCode = `+${match[1]}`;
    localNumber = match[2];
  }

  // When either part changes, emit a combined value via onChange
  const handleCodeChange = (newCode: string) => {
    onChange(`${newCode} ${localNumber}`.trim());
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value.replace(/[^0-9]/g, '');
    onChange(`${defaultCode} ${newVal}`.trim());
  };

  return (
    <div className={`flex gap-2 ${className || ''}`}>
      <Select defaultValue={defaultCode} onValueChange={handleCodeChange}>
        <SelectTrigger className="w-24 h-8 text-sm">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {COUNTRY_CODES.map((c) => (
            <SelectItem key={c.code} value={c.code}>{c.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        type="tel"
        value={localNumber}
        placeholder={placeholder}
        onChange={handleNumberChange}
        className="flex-1 h-8 text-sm"
      />
    </div>
  );
};

export default PhoneInput; 