import {
  addYears,
  format,
  formatDistance,
  isAfter,
  isBefore,
  isValid,
  parseISO,
  subYears,
} from 'date-fns';
import { zhCN } from 'date-fns/locale';

const MISSING_DATE_LABEL = '未标注日期';

function parseDateTime(dateTime: string) {
  if (!dateTime) {
    return null;
  }

  const date = parseISO(dateTime);

  return isValid(date) ? date : null;
}

function hasExplicitTime(dateTime: string) {
  return /[T\s]\d{2}:\d{2}/.test(dateTime);
}

export function formatAbsoluteDateTime(dateTime: string) {
  const date = parseDateTime(dateTime);

  if (!date) {
    return MISSING_DATE_LABEL;
  }

  return format(
    date,
    hasExplicitTime(dateTime) ? 'yyyy-MM-dd HH:mm' : 'yyyy-MM-dd',
  );
}

export function formatReadableDate(dateTime: string, now = new Date()) {
  const date = parseDateTime(dateTime);

  if (!date) {
    return MISSING_DATE_LABEL;
  }

  if (isBefore(date, subYears(now, 1)) || isAfter(date, addYears(now, 1))) {
    return format(date, 'yyyy-MM-dd');
  }

  return formatDistance(date, now, {
    addSuffix: true,
    locale: zhCN,
  })
    .replace(/^大约\s*/, '')
    .replace(/^约\s*/, '')
    .replace(/\s+/g, '');
}
