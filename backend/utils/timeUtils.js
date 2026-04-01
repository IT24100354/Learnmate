const timeToMinutes = (value) => {
  if (!value || typeof value !== 'string') return null;
  const [hours, minutes] = value.split(':').map((part) => Number(part));
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  return (hours * 60) + minutes;
};

const isTimeOverlap = (startA, endA, startB, endB) => {
  const aStart = timeToMinutes(startA);
  const aEnd = timeToMinutes(endA);
  const bStart = timeToMinutes(startB);
  const bEnd = timeToMinutes(endB);

  if ([aStart, aEnd, bStart, bEnd].some((v) => v === null)) {
    return false;
  }

  return aStart < bEnd && bStart < aEnd;
};

const parseIsoDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const toDateOnlyString = (value) => {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toISOString().slice(0, 10);
};

module.exports = {
  timeToMinutes,
  isTimeOverlap,
  parseIsoDate,
  toDateOnlyString,
};
