import { RoomFormValues } from '@/components/forms/RoomForm';
import { MainRoomConfigInput } from '@/apiClient/roomsApi';

/**
 * Convert the room wizard form values into the payload expected by
 * the backend `POST /api/rooms` (createOrUpdateMainRoomConfig).
 */
export function mapRoomFormToApi(hotelId: number, form: RoomFormValues): MainRoomConfigInput {
  return {
    hotel_id: hotelId,
    main_contact_name: form.main_contact_name_room,
    main_contact_position: form.main_contact_position_room,
    phone: form.room_phone,
    email: form.room_email,
    check_in: form.check_in_time,
    check_out: form.check_out_time,
    early_check_in_cost: form.early_checkin_fee,
    early_check_in_fee_type: form.early_checkin_fee_type,
    late_check_out_cost: form.late_checkout_fee,
    early_check_in_time_frame: form.early_check_in_time_frame || undefined,
    late_check_out_time: form.late_check_out_tme || undefined,
    reception_hours: form.reception_hours || undefined,
    payment_methods: form.payment_methods,
    amt_single_rooms: form.single_rooms,
    amt_double_rooms: form.double_rooms,
    amt_connecting_rooms: form.connected_rooms,
    amt_handicapped_accessible_rooms: form.accessible_rooms,
    is_dogs_allowed: form.dogs_allowed,
    dog_fee: form.dog_fee,
    dog_fee_type: form.dog_fee_type,
    dog_fee_inclusions: form.dog_fee_inclusions || undefined,
  };
} 