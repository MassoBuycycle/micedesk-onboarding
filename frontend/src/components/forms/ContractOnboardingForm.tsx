import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, ArrowRight, Plus, X } from 'lucide-react';
import { toast } from 'sonner';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { TextField, NumberField, TextareaField, CheckboxField } from '@/components/shared/FormFields';
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
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
  selectedHotel: any;
  initialData?: Partial<ContractFormValues>;
  onNext: (data: Partial<ContractFormValues>) => void;
  onPrevious: (data: Partial<ContractFormValues>) => void;
  onChange?: (data: Partial<ContractFormValues>) => void;
  mode?: 'add' | 'edit';
}

const ContractOnboardingForm = ({ 
  selectedHotel, 
  initialData = {}, 
  onNext, 
  onPrevious, 
  onChange, 
  mode 
}: ContractOnboardingFormProps) => {
  const { t } = useTranslation();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newSystem, setNewSystem] = useState('');

  const form = useForm<ContractFormValues>({
    resolver: zodResolver(contractSchema),
    defaultValues: {
      contract_model: '',
      fte_count: 0,
      onboarding_date: '',
      contract_start_date: '',
      special_agreements: '',
      email_addresses_created: false,
      access_pms_system: false,
      access_sc_tool: false,
      access_other_systems: [],
      ...initialData
    }
  });

  useEffect(() => {
    if (onChange) {
      const subscription = form.watch((value) => {
        onChange(value);
      });
      return () => subscription.unsubscribe();
    }
  }, [form, onChange]);

  const onSubmit = async (data: ContractFormValues) => {
    if (!selectedHotel?.id) {
      toast.error(t('messages.error.hotelNotFound'));
      return;
    }

    setIsSubmitting(true);
    try {
      await upsertContractDetails(selectedHotel.id, data);
      toast.success(mode === 'edit' ? t('contract.updated') : t('contract.created'));
      onNext(data);
    } catch (error: any) {
      console.error('Error saving contract details:', error);
      toast.error(error.message || t('messages.error.failedToSave'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const addOtherSystem = () => {
    if (newSystem.trim()) {
      const currentSystems = form.getValues('access_other_systems');
      form.setValue('access_other_systems', [...currentSystems, newSystem.trim()]);
      setNewSystem('');
    }
  };

  const removeOtherSystem = (index: number) => {
    const currentSystems = form.getValues('access_other_systems');
    form.setValue('access_other_systems', currentSystems.filter((_, i) => i !== index));
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Contracting Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('contract.contracting')}</CardTitle>
            <CardDescription>{t('contract.contractingDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <TextField
                form={form}
                name="contract_model"
                label={t('contract.contractModel')}
                placeholder={t('contract.contractModelPlaceholder')}
              />
              
              <NumberField
                form={form}
                name="fte_count"
                label={t('contract.fteCount')}
                placeholder={t('contract.fteCountPlaceholder')}
                step="0.1"
              />
              
              <FormField
                control={form.control}
                name="onboarding_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contract.onboardingDate')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="contract_start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('contract.contractStartDate')}</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <TextareaField
              form={form}
              name="special_agreements"
              label={t('contract.specialAgreements')}
              placeholder={t('contract.specialAgreementsPlaceholder')}
              className="min-h-[100px]"
            />
          </CardContent>
        </Card>

        {/* Technical Setup Section */}
        <Card>
          <CardHeader>
            <CardTitle>{t('contract.technicalSetup')}</CardTitle>
            <CardDescription>{t('contract.technicalSetupDescription')}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <CheckboxField
              form={form}
              name="email_addresses_created"
              label={t('contract.emailAddressesCreated')}
            />
            
            <Separator />
            
            <div className="space-y-3">
              <h4 className="text-sm font-medium">{t('contract.systemAccess')}</h4>
              
              <CheckboxField
                form={form}
                name="access_pms_system"
                label={t('contract.pmsSystem')}
              />
              
              <CheckboxField
                form={form}
                name="access_sc_tool"
                label={t('contract.scTool')}
              />
              
              {/* Other Systems */}
              <div className="space-y-2">
                <FormLabel>{t('contract.otherSystems')}</FormLabel>
                
                {form.watch('access_other_systems').map((system, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="secondary" className="flex-1 justify-between">
                      <span>{system}</span>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="h-4 w-4 p-0 ml-2"
                        onClick={() => removeOtherSystem(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </Badge>
                  </div>
                ))}
                
                <div className="flex items-center gap-2">
                  <Input
                    placeholder={t('contract.addSystemPlaceholder')}
                    value={newSystem}
                    onChange={(e) => setNewSystem(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addOtherSystem();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addOtherSystem}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex justify-between">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => onPrevious(form.getValues())} 
            className="gap-1"
          >
            <ArrowLeft className="h-4 w-4" /> {t('common.previous')}
          </Button>
          <Button 
            type="submit" 
            disabled={isSubmitting} 
            className="gap-1"
          >
            {isSubmitting ? t('common.saving') : t('common.save')} <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ContractOnboardingForm; 