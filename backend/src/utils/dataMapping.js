export const extractDataForTable = (sourceData, fields) => {
  const extracted = {};
  let hasData = false;
  fields.forEach(field => {
    // Validate that field is a non-empty string
    if (field && typeof field === 'string' && field.trim().length > 0) {
      if (sourceData[field] !== undefined) {
        extracted[field] = sourceData[field];
        hasData = true;
      }
    }
  });
  return hasData ? extracted : null;
}; 