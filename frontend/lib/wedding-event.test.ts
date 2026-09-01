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

  it('escapes the comma after the hall per RFC 5545 §3.3.11', () => {
    const description = ics
      .split('\r\n')
      .find((line) => line.startsWith('DESCRIPTION:'));
    expect(description).toBeDefined();
    // Parentheses are not reserved, so the hall name survives verbatim.
    expect(description).toContain(`${RECEPTION}\\, Batangas`);
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
