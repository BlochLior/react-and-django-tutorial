import { format, isFuture } from 'date-fns';

/**
 * Check if a publication date is in the future
 * @param {string} dateString - ISO date string to check
 * @returns {boolean} - True if date is in the future, false otherwise or if invalid
 */
export const isPublicationDateFuture = (dateString) => {
  if (!dateString) return false;
  try {
    return isFuture(new Date(dateString));
  } catch {
    return false;
  }
};

/**
 * Format a publication date for display
 * @param {string} dateString - ISO date string to format
 * @returns {string} - Formatted date string or 'Invalid date' if invalid
 */
export const formatPublicationDate = (dateString) => {
  try {
    return format(new Date(dateString), 'MMM dd, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
};

/**
 * Get appropriate display text for publication date
 * @param {string} dateString - ISO date string to check and format 
 * @returns {string} - 'To be published:' or 'Published:' with formatted date
 */
export const getPublicationDateText = (dateString) => {
  const isFutureDate = isPublicationDateFuture(dateString);
  const formattedDate = formatPublicationDate(dateString);
  return `${isFutureDate ? 'To be published:' : 'Published:'} ${formattedDate}`;
};
