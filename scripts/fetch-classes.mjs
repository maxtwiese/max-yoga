import ical from 'node-ical';
import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const CALENDAR_URL =
  'https://calendar.google.com/calendar/ical/79fa4d4b403e57b49297bae3b2085a0a536dd2b534ffe22dc0b13810124fbbbd%40group.calendar.google.com/public/basic.ics';
const GRACE_URL = 'https://gracecathedral.org/series/yoga/';
const OUTPUT = resolve(ROOT, 'data/classes.json');
const MAX_EVENTS = 6;
const WEEKS_AHEAD = 3;
const TZ = 'America/Los_Angeles';

async function main() {
  const now = new Date();
  const cutoff = new Date(now.getTime() + WEEKS_AHEAD * 7 * 24 * 60 * 60 * 1000);

  console.log(`Fetching events: ${fmtDate(now)} → ${fmtDate(cutoff)}`);

  let data;
  try {
    data = await ical.async.fromURL(CALENDAR_URL);
  } catch (err) {
    console.error(`Failed to fetch calendar: ${err.message}`);
    process.exit(1);
  }

  const upcoming = [];

  for (const event of Object.values(data)) {
    if (event.type !== 'VEVENT') continue;
    collectOccurrences(event, now, cutoff, upcoming);
  }

  upcoming.sort((a, b) => a._ts - b._ts);
  const result = upcoming.slice(0, MAX_EVENTS).map(({ _ts, ...rest }) => rest);

  const dir = dirname(OUTPUT);
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  writeFileSync(OUTPUT, JSON.stringify(result, null, 2) + '\n');

  console.log(`Wrote ${result.length} event(s) to data/classes.json`);
  for (const e of result) console.log(`  ${e.date}  ${e.time}  ${e.title}`);
  if (!result.length) console.warn('Warning: no upcoming events in the next 3 weeks');
}

function collectOccurrences(event, rangeStart, rangeEnd, out) {
  if (event.rrule) {
    const duration = new Date(event.end).getTime() - new Date(event.start).getTime();
    const dates = event.rrule.between(rangeStart, rangeEnd, true);

    for (const rawDate of dates) {
      const date = fixRruleDate(rawDate);
      if (isExcluded(event, date)) continue;

      const override = getOverride(event, date);
      if (override) {
        out.push(buildEntry(override));
      } else {
        out.push(buildEntry({
          summary: event.summary,
          start: date,
          end: new Date(date.getTime() + duration),
          location: event.location || '',
          description: event.description || '',
        }));
      }
    }
    return;
  }

  const start = new Date(event.start);
  if (start >= rangeStart && start <= rangeEnd) {
    out.push(buildEntry(event));
  }
}

function buildEntry(event) {
  const start = new Date(event.start);
  const end = new Date(event.end);
  const location = cleanLocation(event.location || '');
  const description = (event.description || '').trim();

  let link, linkLabel;
  const momenceMatch = description.match(/https?:\/\/[^\s<>"]*momence\.com[^\s<>"]*/i);
  if (momenceMatch) {
    link = momenceMatch[0];
    linkLabel = 'Register';
  } else if (/grace\s*cathedral/i.test(location)) {
    link = GRACE_URL;
    linkLabel = 'Info';
  }

  return {
    title: (event.summary || 'Untitled').trim(),
    date: fmtDate(start),
    time: fmtTimeRange(start, end),
    location,
    ...(link && { link, linkLabel }),
    _ts: start.getTime(),
  };
}

function fixRruleDate(floatingDate) {
  // rrule.between() returns dates with wall-clock values stuffed into UTC fields.
  // Re-interpret those values as local time in the calendar's timezone.
  const utcMs = floatingDate.getTime();
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric', month: 'numeric', day: 'numeric',
    hour: 'numeric', minute: 'numeric', second: 'numeric',
    hour12: false,
  }).formatToParts(floatingDate);
  const get = type => +parts.find(p => p.type === type).value;
  const localMs = Date.UTC(get('year'), get('month') - 1, get('day'),
                           get('hour') % 24, get('minute'), get('second'));
  return new Date(utcMs + (utcMs - localMs));
}

function fmtDate(d) {
  return d.toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', timeZone: TZ,
  });
}

function fmtTimeRange(start, end) {
  const opts = { hour: 'numeric', minute: '2-digit', timeZone: TZ };
  return `${start.toLocaleTimeString('en-US', opts)} – ${end.toLocaleTimeString('en-US', opts)}`;
}

function cleanLocation(raw) {
  let loc = raw.split('\n')[0].trim();
  loc = loc.replace(/,\s*\d.*$/, '').trim();
  return loc;
}

function sameDay(a, b) {
  const da = new Date(a).toLocaleDateString('en-US', { timeZone: TZ });
  const db = new Date(b).toLocaleDateString('en-US', { timeZone: TZ });
  return da === db;
}

function isExcluded(event, date) {
  if (!event.exdate) return false;
  return Object.values(event.exdate).some(ex => sameDay(ex, date));
}

function getOverride(event, date) {
  if (!event.recurrences) return null;
  for (const override of Object.values(event.recurrences)) {
    if (sameDay(override.start, date)) return override;
  }
  return null;
}

main();
