export const formatDate = (date: Date): string => {
  if (!date || isNaN(date.getTime())) {
    return 'an unknown date';
  }
  return date.toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const formatHour = (hour: number): string => {
  if (isNaN(hour) || hour < 0 || hour > 23) {
    return 'an unknown time';
  }
  const date = new Date();
  date.setHours(hour, 0, 0, 0);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    hour12: true,
  });
};
