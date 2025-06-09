// Helper function to check if a step has data to display
export const hasStepData = (formData: any, currentStep: string): boolean => {
  switch (currentStep) {
    case 'hotel':
      return formData.hotel && Object.keys(formData.hotel).some(key => formData.hotel[key]);
    case 'roomInfo':
      return formData.roomInfo && Object.keys(formData.roomInfo).some(key => formData.roomInfo[key]);
    case 'roomCategories':
      return formData.roomCategories && formData.roomCategories.length > 0;
    case 'roomHandling':
      return formData.roomHandling && Object.keys(formData.roomHandling).some(key => formData.roomHandling[key]);
    case 'eventsInfo':
      return formData.eventsInfo && Object.keys(formData.eventsInfo).some(key => formData.eventsInfo[key]);
    case 'eventSpaces':
      return formData.eventSpaces && formData.eventSpaces.length > 0;
    case 'foodBeverage':
      return formData.foodBeverage && Object.keys(formData.foodBeverage).some(key => formData.foodBeverage[key]);
    default:
      return false;
  }
};

// Adding utility function for optimized UI space
export const getCompactStyles = () => {
  return {
    card: "shadow-sm",
    cardHeader: "px-4 py-2 border-b",
    cardTitle: "text-base",
    cardDescription: "text-xs",
    cardContent: "p-4 space-y-4",
    formLabel: "text-xs",
    input: "h-8 text-sm",
    textarea: "min-h-[80px] text-sm",
    formMessage: "text-xs",
    selectTrigger: "h-8 text-sm",
  };
};
