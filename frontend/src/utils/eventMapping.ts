import { EventInfoData } from '@/components/forms/EventInfoForm';
import { EventInput } from '@/types/events';

/**
 * Convert the composite EventInfoData (gathered in Event wizard) into the flat
 * payload expected by the backend POST /api/events endpoint.
 * The backend will de-normalize the payload into the various event_* tables.
 */
export function mapEventFormToApi(data: EventInfoData): Record<string, any> {
  const {
    contact,
    booking,
    operations,
    financials,
    technical,
    contracting,
    // equipment will still be saved separately b/c backend expects array endpoint
  } = data;

  return {
    // main table
    hotel_id: contact.hotel_id,
    contact_name: contact.contact_name,
    contact_phone: contact.contact_phone,
    contact_email: contact.contact_email,
    contact_position: contact.contact_position,

    // spread the rest (already uses backend field names)
    ...booking,
    ...operations,
    ...financials,
    ...technical,
    ...contracting,
  } as Record<string, any>;
} 