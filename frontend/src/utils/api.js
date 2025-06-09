// Empty API implementation (no actual API calls)

export const hotelApi = {
  getHotels: async () => {
    return { success: true, data: [] };
  },
  
  getHotelById: async () => {
    return { success: true, data: null };
  },
  
  createHotel: async () => {
    return { success: true };
  },
  
  updateHotel: async () => {
    return { success: true };
  },
  
  deleteHotel: async () => {
    return { success: true };
  },
  
  uploadHotelImage: async () => {
    return { success: true };
  }
};

export const submitHotelForm = async () => {
  // Do nothing - no API calls
  return { success: true };
}; 