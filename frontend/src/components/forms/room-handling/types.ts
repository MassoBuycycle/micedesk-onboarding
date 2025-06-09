
// Define room handling type
export interface RoomHandling {
  checkInTime: string;
  checkOutTime: string;
  earlyCheckInPolicy: string;
  lateCheckOutPolicy: string;
  guaranteePolicy: string;
  cancellationPolicy: string;
  noShowPolicy: string;
  childrenPolicy: string;
  petsAllowed: boolean;
  petFee: string;
  petRestrictions: string;
  extraBedAvailable: boolean;
  extraBedFee: string;
  extraBedRestrictions: string;
  smokingPolicy: string;
  accessibilityFeatures: string[];
}

// Props definition
export interface RoomHandlingFormProps {
  initialData: Partial<RoomHandling>;
  selectedHotel: any;
  onNext: (data: RoomHandling) => void;
  onPrevious: (data: RoomHandling) => void;
  onChange?: (data: RoomHandling) => void;
}

export interface SectionProps {
  formData: RoomHandling;
  updateField: (field: keyof RoomHandling, value: any) => void;
  updateAccessibilityFeatures?: (feature: string, isChecked: boolean) => void;
}
