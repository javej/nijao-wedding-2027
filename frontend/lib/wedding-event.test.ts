import { describe, it, expect } from 'vitest';
import { buildWeddingIcs, buildGoogleCalendarUrl } from './wedding-event';

const CHURCH = 'St. Therese of the Child Jesus and the Holy Face Parish Church';
const RECEPTION = '10 22 Lipa (Murraya Hall)';

describe('buildWeddingIcs', () => {
  const ics = buildWeddingIcs();

  it('names both venues in full so guests can navigate to them', () => {
    expect(ics).toContain(CHURCH);
    expect(ics).toContain(RECEPTION);
  });

  it('escapes commas per RFC 5545 §3.3.11', () => {
    const line = (prop: string) =>
      ics.split('\r\n').find((l) => l.startsWith(`${prop}:`));

    // LOCATION is the property that actually carries commas.
    expect(line('LOCATION')).toContain(`${CHURCH}\\, Lipa\\, Batangas`);

    // Parentheses are not reserved, so the hall name survives verbatim.
    expect(line('DESCRIPTION')).toContain(RECEPTION);
  });

  it('joins lines with CRLF and wraps the VEVENT correctly', () => {
    expect(ics.startsWith('BEGIN:VCALENDAR\r\n')).toBe(true);
    expect(ics.endsWith('END:VCALENDAR\r\n')).toBe(true);
    expect(ics).toContain('\r\nBEGIN:VEVENT\r\n');
    expect(ics).toContain('\r\nEND:VEVENT\r\n');
  });
});

describe('buildGoogleCalendarUrl', () => {
  it('carries the same venue names as the .ics', () => {
    const details = new URL(buildGoogleCalendarUrl()).searchParams.get('details');
    expect(details).toContain(CHURCH);
    expect(details).toContain(RECEPTION);
  });
});
