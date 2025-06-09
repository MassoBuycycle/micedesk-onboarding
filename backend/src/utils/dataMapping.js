export const extractDataForTable = (sourceData, fields) => {
  const extracted = {};
  let hasData = false;
  fields.forEach(field => {
    if (sourceData[field] !== undefined) {
      extracted[field] = sourceData[field];
      hasData = true;
    }
  });
  return hasData ? extracted : null;
}; 