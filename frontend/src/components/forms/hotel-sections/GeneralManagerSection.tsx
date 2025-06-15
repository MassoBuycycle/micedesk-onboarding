import { UseFormReturn } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import FormSection from '@/components/shared/FormSection';
import { TextField, TwoColumnGrid, PhoneField } from '@/components/shared/FormFields';
import { HotelFormValues } from '../HotelForm';

interface GeneralManagerSectionProps {
  form: UseFormReturn<HotelFormValues>;
}

const GeneralManagerSection = ({ form }: GeneralManagerSectionProps) => {
  const { t } = useTranslation();

  return (
    <FormSection
      title={t('hotel.generalManagerSection')}
      description={t('hotel.generalManagerSectionDescription')}
      className="shadow-[0_4px_15px_rgba(0,0,0,0.06)] border-0"
    >
      <TwoColumnGrid>
        <TextField
          form={form}
          name="generalManagerName"
          label={t('hotel.generalManagerName')}
          placeholder={t('forms.placeholders.enterName')}
          className="text-sm"
        />
        <PhoneField
          form={form}
          name="generalManagerPhone"
          label={t('hotel.generalManagerPhone')}
          placeholder={t('forms.placeholders.enterPhone')}
        />
        <TextField
          form={form}
          name="generalManagerEmail"
          label={t('hotel.generalManagerEmail')}
          placeholder={t('forms.placeholders.enterEmail')}
          type="email"
          className="text-sm"
        />
      </TwoColumnGrid>
    </FormSection>
  );
};

export default GeneralManagerSection; 