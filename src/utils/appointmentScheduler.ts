import { RequestItem } from '../types';

function normalizeAsciiDigits(input: string): string {
  return String(input || '')
    .replace(/[٠-٩]/g, (d) => String(d.charCodeAt(0) - 1632))
    .replace(/[۰-۹]/g, (d) => String(d.charCodeAt(0) - 1776));
}

/**
 * Converts a timestamp (ms) to a `YYYY-MM-DDTHH:mm` string suitable for `<input type="datetime-local">`.
 */
export function timestampToDatetimeLocalValue(ts?: number | null): string {
  const base = ts && ts > 1000000000000 ? new Date(ts) : new Date(Date.now() + 60 * 60 * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  const yyyy = base.getFullYear();
  const mm = pad(base.getMonth() + 1);
  const dd = pad(base.getDate());
  const hh = pad(base.getHours());
  const min = pad(base.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

/**
 * Smartly parses either an explicit datetime-local string/timestamp OR an Arabic agreement time note
 * (such as "بعد 15 دقيقة", "بعد 30 دقيقة", "بعد ساعة", "اليوم على 15:00", "غداً صباحاً") into a timestamp (ms).
 */
export function resolveAgreementScheduledTimestamp(
  note: string,
  explicitDatetimeOrTs?: string | number | null
): number {
  const now = Date.now();

  if (typeof explicitDatetimeOrTs === 'number' && explicitDatetimeOrTs > 1000000000000) {
    return explicitDatetimeOrTs;
  }

  if (typeof explicitDatetimeOrTs === 'string' && explicitDatetimeOrTs.trim()) {
    const parsed = Date.parse(explicitDatetimeOrTs.trim());
    if (!Number.isNaN(parsed) && parsed > 1000000000000) {
      return parsed;
    }
  }

  const clean = normalizeAsciiDigits(note || '').trim();
  if (!clean) {
    return now + 30 * 60 * 1000;
  }

  // Relative minutes: "بعد 15 دقيقة" / "بعد 30 د" / "بعد نصف ساعة"
  if (clean.includes('نصف ساعة') || clean.includes('نص ساعة')) {
    return now + 30 * 60 * 1000;
  }
  if (clean.includes('ربع ساعة')) {
    return now + 15 * 60 * 1000;
  }
  const minMatch = clean.match(/بعد\s*(\d+)\s*(?:دقيقة|دقائق|د)/);
  if (minMatch) {
    const mins = Math.max(1, parseInt(minMatch[1], 10) || 15);
    return now + mins * 60 * 1000;
  }

  // Relative hours: "بعد ساعة" / "بعد ساعتين" / "بعد 2 ساعة"
  if (clean.includes('بعد ساعتين')) {
    return now + 2 * 60 * 60 * 1000;
  }
  if (clean.includes('بعد ساعة')) {
    return now + 60 * 60 * 1000;
  }
  const hourRelMatch = clean.match(/بعد\s*(\d+)\s*(?:ساعة|ساعات|سا)/);
  if (hourRelMatch) {
    const hrs = Math.max(1, parseInt(hourRelMatch[1], 10) || 1);
    return now + hrs * 60 * 60 * 1000;
  }

  const targetDate = new Date(now);
  const isTomorrow = clean.includes('غدا') || clean.includes('غداً') || clean.includes('غدوة');
  if (isTomorrow) {
    targetDate.setDate(targetDate.getDate() + 1);
  }

  // Explicit HH:mm or HHh: e.g. "15:00" or "09:30" or "الساعة 16"
  const timeMatch =
    clean.match(/(\d{1,2})\s*[:hH]\s*(\d{1,2})/) ||
    clean.match(/(?:الساعة|على|ساعة)\s*(\d{1,2})(?:\s*[:hH]\s*(\d{1,2}))?/);

  if (timeMatch) {
    let hh = parseInt(timeMatch[1], 10);
    const mm = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
    if ((clean.includes('مساء') || clean.includes('عشية')) && hh < 12) {
      hh += 12;
    }
    targetDate.setHours(Math.min(23, Math.max(0, hh)), Math.min(59, Math.max(0, mm)), 0, 0);
    if (!isTomorrow && targetDate.getTime() <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    return targetDate.getTime();
  }

  if (clean.includes('صباح')) {
    targetDate.setHours(9, 0, 0, 0);
    if (targetDate.getTime() <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    return targetDate.getTime();
  }

  if (clean.includes('مساء') || clean.includes('عشية')) {
    targetDate.setHours(16, 0, 0, 0);
    if (targetDate.getTime() <= now) {
      targetDate.setDate(targetDate.getDate() + 1);
    }
    return targetDate.getTime();
  }

  // Default: 30 minutes from now so the craftsman receives an approaching reminder automatically
  return now + 30 * 60 * 1000;
}

/**
 * Formats a scheduled appointment timestamp in clear Arabic with date and time.
 */
export function formatScheduledAppointmentAr(ts?: number | null): string {
  if (!ts || ts < 1000000000000) return '';
  try {
    const d = new Date(ts);
    const now = new Date();
    const isToday =
      d.getFullYear() === now.getFullYear() &&
      d.getMonth() === now.getMonth() &&
      d.getDate() === now.getDate();

    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const isTomorrow =
      d.getFullYear() === tomorrow.getFullYear() &&
      d.getMonth() === tomorrow.getMonth() &&
      d.getDate() === tomorrow.getDate();

    const timeStr = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    if (isToday) return `اليوم على ${timeStr}`;
    if (isTomorrow) return `غداً على ${timeStr}`;

    const dateStr = d.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
    return `${dateStr} على ${timeStr}`;
  } catch {
    return '';
  }
}

export interface AppointmentCountdownInfo {
  diffMs: number;
  diffMinutes: number;
  isApproaching: boolean;
  isDueNow: boolean;
  isPast: boolean;
  badgeText: string;
}

/**
 * Computes real-time countdown state for an agreed customer request.
 */
export function getAppointmentCountdownInfo(
  scheduledAt?: number | null,
  reminderMinutes = 30,
  now = Date.now()
): AppointmentCountdownInfo | null {
  if (!scheduledAt || scheduledAt < 1000000000000) return null;

  const diffMs = scheduledAt - now;
  const diffMinutes = Math.ceil(diffMs / 60000);
  const leadMins = Math.max(5, Number(reminderMinutes) || 30);

  if (diffMinutes <= 0 && diffMinutes >= -60) {
    return {
      diffMs,
      diffMinutes,
      isApproaching: true,
      isDueNow: true,
      isPast: false,
      badgeText: '🔔 حان موعد الإتفاق الآن!'
    };
  }

  if (diffMinutes < -60) {
    return {
      diffMs,
      diffMinutes,
      isApproaching: false,
      isDueNow: false,
      isPast: true,
      badgeText: 'مرّ وقت الموعد المحدد'
    };
  }

  const isApproaching = diffMinutes <= leadMins;
  let badgeText = '';
  if (diffMinutes < 60) {
    badgeText = isApproaching
      ? `🔔 اقترب الموعد (متبقي ${diffMinutes} د)`
      : `⏳ متبقي ${diffMinutes} د`;
  } else {
    const hrs = Math.floor(diffMinutes / 60);
    const remMins = diffMinutes % 60;
    badgeText =
      remMins > 0 ? `⏳ متبقي ${hrs} سا و ${remMins} د` : `⏳ متبقي ${hrs} ساعة`;
  }

  return {
    diffMs,
    diffMinutes,
    isApproaching,
    isDueNow: false,
    isPast: false,
    badgeText
  };
}

function toUtcCalendarStamp(ms: number): string {
  const d = new Date(ms);
  const pad = (n: number) => String(n).padStart(2, '0');
  return (
    d.getUTCFullYear().toString() +
    pad(d.getUTCMonth() + 1) +
    pad(d.getUTCDate()) +
    'T' +
    pad(d.getUTCHours()) +
    pad(d.getUTCMinutes()) +
    pad(d.getUTCSeconds()) +
    'Z'
  );
}

/**
 * Builds a direct Google Calendar event creation URL (`action=TEMPLATE`).
 */
export function buildGoogleCalendarUrl(
  req: RequestItem,
  options?: { canShowPhone?: boolean }
): string {
  const startMs =
    req.agreementScheduledAt && req.agreementScheduledAt > 1000000000000
      ? req.agreementScheduledAt
      : resolveAgreementScheduledTimestamp(req.agreementTimeNote || '');
  const endMs = startMs + 60 * 60 * 1000; // 1 hour appointment slot

  const phoneDisplay =
    options?.canShowPhone && req.phone && !req.phone.includes('•')
      ? req.phone
      : 'مقفل داخل تطبيق خدّام DZ';

  const title = `موعد عمل (${req.craft}): ${req.title} — ${req.wilaya}`;
  const detailsLines = [
    `🛠️ الحرفة: ${req.craft}`,
    `📍 الولاية: ${req.wilaya}`,
    `📝 تفاصيل الطلب: ${req.desc}`,
    `⏰ ملاحظة وقت الإتفاق: ${req.agreementTimeNote || formatScheduledAppointmentAr(startMs)}`,
    req.agreedByCraftsmanName ? `👷 الحرفي المتفق: ${req.agreedByCraftsmanName}` : '',
    `📞 هاتف الزبون: ${phoneDisplay}`,
    `🌐 تطبيق خدّام ديزاد (Khadam DZ)`
  ].filter(Boolean);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: title,
    dates: `${toUtcCalendarStamp(startMs)}/${toUtcCalendarStamp(endMs)}`,
    details: detailsLines.join('\n'),
    location: `${req.wilaya}، الجزائر`
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * Generates and downloads a standard `.ics` (iCalendar) file with built-in alarm reminders
 * so the craftsman can add the work appointment to their phone's native Calendar app in 1 tap.
 */
export function downloadAppointmentIcsFile(
  req: RequestItem,
  options?: { canShowPhone?: boolean }
): void {
  const startMs =
    req.agreementScheduledAt && req.agreementScheduledAt > 1000000000000
      ? req.agreementScheduledAt
      : resolveAgreementScheduledTimestamp(req.agreementTimeNote || '');
  const endMs = startMs + 60 * 60 * 1000;
  const reminderMins = Math.max(5, Number(req.agreementReminderMinutes) || 30);

  const phoneDisplay =
    options?.canShowPhone && req.phone && !req.phone.includes('•')
      ? req.phone
      : 'داخل تطبيق خدّام DZ';

  const summary = `موعد عمل (${req.craft}): ${req.title}`.replace(/[\r\n]+/g, ' ');
  const description = [
    `الحرفة: ${req.craft}`,
    `الولاية: ${req.wilaya}`,
    `التفاصيل: ${req.desc}`,
    `وقت الإتفاق: ${req.agreementTimeNote || formatScheduledAppointmentAr(startMs)}`,
    `هاتف الزبون: ${phoneDisplay}`
  ]
    .join('\\n')
    .replace(/[\r\n]+/g, ' ');

  const location = `${req.wilaya} - الجزائر`.replace(/[\r\n]+/g, ' ');
  const nowStamp = toUtcCalendarStamp(Date.now());
  const startStamp = toUtcCalendarStamp(startMs);
  const endStamp = toUtcCalendarStamp(endMs);

  const icsLines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Khadam DZ//Craftsman Appointment Scheduler//AR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:khadam-apt-${req.id}-${startMs}@khadmadz.com`,
    `DTSTAMP:${nowStamp}`,
    `DTSTART:${startStamp}`,
    `DTEND:${endStamp}`,
    `SUMMARY:${summary}`,
    `DESCRIPTION:${description}`,
    `LOCATION:${location}`,
    'STATUS:CONFIRMED',
    'BEGIN:VALARM',
    `TRIGGER:-PT${reminderMins}M`,
    'ACTION:DISPLAY',
    `DESCRIPTION:⏰ تذكير خدّام DZ: بقي ${reminderMins} دقيقة على موعد العمل (${req.title})`,
    'END:VALARM',
    'BEGIN:VALARM',
    'TRIGGER:-PT5M',
    'ACTION:DISPLAY',
    `DESCRIPTION:🔔 تذكير خدّام DZ: يبدأ موعد العمل بعد 5 دقائق (${req.title})`,
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR'
  ];

  const blob = new Blob([icsLines.join('\r\n')], {
    type: 'text/calendar;charset=utf-8'
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `khadam-dz-appointment-${req.id}.ics`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}
