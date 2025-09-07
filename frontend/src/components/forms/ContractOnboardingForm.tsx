import React, { useState, useCallback, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { X, Plus, FileText, Shield, Calendar, ArrowLeft, ArrowRight } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Badge } from "@/components/ui/badge";
import { useDebouncedCallback } from "use-debounce";
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { TextField, NumberField, TextareaField, CheckboxField } from '@/components/shared/FormFields';
import { FormField, FormItem, FormMessage } from '@/components/ui/form';
import { ContractDetailsInput, upsertContractDetails } from '@/apiClient/contractApi';

// Schema for form validation
const contractSchema = z.object({
  // Contracting fields
  contract_model: z.string().optional(),
  fte_count: z.coerce.number().min(0).optional(),
  onboarding_date: z.string().optional(),
  contract_start_date: z.string().optional(),
  special_agreements: z.string().optional(),
  
  // Technical Setup fields
  email_addresses_created: z.boolean().default(false),
  access_pms_system: z.boolean().default(false),
  access_sc_tool: z.boolean().default(false),
  access_other_systems: z.array(z.string()).default([])
});

type ContractFormValues = z.infer<typeof contractSchema>;

interface ContractOnboardingFormProps {
  hotelId?: string;
  data: any;
  onUpdateData: (newData: any) => void;
  readOnly?: boolean;
  onNext?: (data: any) => void;
  onPrevious?: (data: any) => void;
  mode?: 'add' | 'edit';
}

const ContractOnboardingForm: React.FC<ContractOnboardingFormProps> = ({ 
  hotelId, 
  data, 
  onUpdateData, 
  readOnly = false,
  onNext,
  onPrevious,
  mode = 'add'
}) => {
  const { t } = useTranslation();
  
  // Local state for immediate UI updates
  const [localData, setLocalData] = useState(data || {
    contract_model: '',
    fte_count: '',
    onboarding_date: '',
    contract_start_date: '',
    special_agreements: '',
    email_addresses_created: false,
    access_pms_system: false,
    access_sc_tool: false,
    access_other_systems: []
  });

  // Debounced update to parent
  const debouncedUpdate = useDebouncedCallback((newData) => {
    onUpdateData(newData);
  }, 500);

  // Update local data and trigger debounced update
  const handleFieldChange = useCallback((field: string, value: any) => {
    setLocalData(prev => {
      const updated = { ...prev, [field]: value };
      debouncedUpdate(updated);
      return updated;
    });
  }, [debouncedUpdate]);

  // Handle numeric fields with validation
  const handleNumberChange = useCallback((field: string, value: string) => {
    const numValue = value === '' ? '' : parseInt(value, 10);
    if (value === '' || !isNaN(numValue as number)) {
      handleFieldChange(field, numValue);
    }
  }, [handleFieldChange]);

  // Other systems management
  const [otherSystemInput, setOtherSystemInput] = useState('');

  const handleAddOtherSystem = useCallback(() => {
    if (otherSystemInput.trim()) {
      const newSystems = [...(localData.access_other_systems || []), otherSystemInput.trim()];
      handleFieldChange('access_other_systems', newSystems);
      setOtherSystemInput('');
    }
  }, [otherSystemInput, localData.access_other_systems, handleFieldChange]);

  const handleRemoveOtherSystem = useCallback((index: number) => {
    const newSystems = (localData.access_other_systems || []).filter((_, i) => i !== index);
    handleFieldChange('access_other_systems', newSystems);
  }, [localData.access_other_systems, handleFieldChange]);

  // Memoized sections for better performance
  const contractingSection = useMemo(() => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          {t('contract.contracting')}
        </CardTitle>
        <CardDescription>{t('contract.contractingDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Contract Model */}
        <div className="space-y-2">
          <Label htmlFor="contract_model">{t('contract.contractModel')}</Label>
          <Input
            id="contract_model"
            value={localData.contract_model || ''}
            onChange={(e) => handleFieldChange('contract_model', e.target.value)}
            placeholder={t('contract.contractModelPlaceholder')}
            disabled={readOnly}
          />
        </div>

        {/* FTE Count */}
        <div className="space-y-2">
          <Label htmlFor="fte_count">{t('contract.fteCount')}</Label>
          <Input
            id="fte_count"
            type="number"
            value={localData.fte_count || ''}
            onChange={(e) => handleNumberChange('fte_count', e.target.value)}
            placeholder={t('contract.fteCount')}
            disabled={readOnly}
            className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
            onWheel={(e) => e.currentTarget.blur()}
          />
        </div>

        {/* Date Fields */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>{t('contract.onboardingDate')}</Label>
            <Input
              id="onboarding_date"
              type="date"
              value={localData.onboarding_date || ''}
              onChange={(e) => handleFieldChange('onboarding_date', e.target.value)}
              disabled={readOnly}
            />
          </div>

          <div className="space-y-2">
            <Label>{t('contract.contractStartDate')}</Label>
            <Input
              id="contract_start_date"
              type="date"
              value={localData.contract_start_date || ''}
              onChange={(e) => handleFieldChange('contract_start_date', e.target.value)}
              disabled={readOnly}
            />
          </div>
        </div>

        {/* Special Agreements */}
        <div className="space-y-2">
          <Label htmlFor="special_agreements">{t('contract.specialAgreements')}</Label>
          <Textarea
            id="special_agreements"
            value={localData.special_agreements || ''}
            onChange={(e) => handleFieldChange('special_agreements', e.target.value)}
            placeholder={t('contract.specialAgreementsPlaceholder')}
            disabled={readOnly}
            rows={4}
          />
        </div>
      </CardContent>
    </Card>
  ), [localData, t, readOnly, handleFieldChange, handleNumberChange]);

  const technicalSetupSection = useMemo(() => (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          {t('contract.technicalSetup')}
        </CardTitle>
        <CardDescription>{t('contract.technicalSetupDescription')}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Email Addresses Created */}
        <div className="flex items-center justify-between p-3 border rounded-lg">
          <Label htmlFor="email_addresses_created" className="cursor-pointer">
            {t('contract.emailAddressesCreated')}
          </Label>
          <Switch
            id="email_addresses_created"
            checked={localData.email_addresses_created || false}
            onCheckedChange={(checked) => handleFieldChange('email_addresses_created', checked)}
            disabled={readOnly}
          />
        </div>

        {/* System Access */}
        <div className="space-y-2">
          <Label className="text-base font-medium">{t('contract.systemAccess')}</Label>
          
          <div className="space-y-3">
            {/* PMS System */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="access_pms_system"
                checked={localData.access_pms_system || false}
                onCheckedChange={(checked) => handleFieldChange('access_pms_system', checked)}
                disabled={readOnly}
              />
              <Label
                htmlFor="access_pms_system"
                className="cursor-pointer text-sm font-normal"
              >
                {t('contract.pmsSystem')}
              </Label>
            </div>

            {/* S&C Tool */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="access_sc_tool"
                checked={localData.access_sc_tool || false}
                onCheckedChange={(checked) => handleFieldChange('access_sc_tool', checked)}
                disabled={readOnly}
              />
              <Label
                htmlFor="access_sc_tool"
                className="cursor-pointer text-sm font-normal"
              >
                {t('contract.scTool')}
              </Label>
            </div>

            {/* Other Systems */}
            <div className="space-y-2">
              <Label className="text-sm">{t('contract.otherSystems')}</Label>
              
              {!readOnly && (
                <div className="flex gap-2">
                  <Input
                    value={otherSystemInput}
                    onChange={(e) => setOtherSystemInput(e.target.value)}
                    placeholder={t('contract.addSystemPlaceholder')}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddOtherSystem();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddOtherSystem}
                    disabled={!otherSystemInput.trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              )}

              {localData.access_other_systems && localData.access_other_systems.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {localData.access_other_systems.map((system: string, index: number) => (
                    <Badge
                      key={index}
                      variant="secondary"
                      className="flex items-center gap-1"
                    >
                      {system}
                      {!readOnly && (
                        <button
                          type="button"
                          onClick={() => handleRemoveOtherSystem(index)}
                          className="ml-1 hover:text-destructive"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  ), [localData, t, readOnly, otherSystemInput, handleFieldChange, handleAddOtherSystem, handleRemoveOtherSystem]);

  return (
    <div className="space-y-6">
      {contractingSection}
      {technicalSetupSection}
      
      {/* Navigation */}
      {(onNext || onPrevious) && (
        <div className="flex justify-between pt-4">
          {onPrevious && (
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onPrevious(localData)}
              className="gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              {t('common.previous')}
            </Button>
          )}
          {onNext && (
            <Button 
              type="button"
              onClick={() => onNext(localData)}
              className="gap-2 ml-auto"
            >
              {mode === 'edit' ? t('common.save') : t('common.finish')}
              <ArrowRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default React.memo(ContractOnboardingForm); 