import { describe, it, expect } from 'vitest';
import { deriveParkingLine, parkingFromAnswer, parkingNeedsPlate } from './rsvp-view-state';

describe('deriveParkingLine', () => {
  it('is null unless the guest is attending', () => {
    expect(deriveParkingLine('pending', null)).toBeNull();
    expect(deriveParkingLine('declined', { status: 'plate', plate: 'ABC 1234' })).toBeNull();
  });

  it('shows the plate on file', () => {
    expect(deriveParkingLine('attending', { status: 'plate', plate: 'ABC 1234' })).toBe(
      'Car plate: ABC 1234',
    );
  });

  it('says the guest is not sure yet', () => {
    expect(deriveParkingLine('attending', { status: 'unsure', plate: null })).toBe(
      'Car plate: not sure yet',
    );
  });

  it('confirms a guest who is not driving', () => {
    expect(deriveParkingLine('attending', { status: 'none', plate: null })).toBe('Not driving.');
  });

  it('invites an attending guest who was never asked', () => {
    expect(deriveParkingLine('attending', null)).toBe('Car plate: not added yet');
  });

  it('treats a "plate" status with no plate value as never asked', () => {
    expect(deriveParkingLine('attending', { status: 'plate', plate: null })).toBe(
      'Car plate: not added yet',
    );
  });
});

describe('parkingNeedsPlate', () => {
  it('is false unless attending', () => {
    expect(parkingNeedsPlate('pending', null)).toBe(false);
    expect(parkingNeedsPlate('declined', { status: 'unsure', plate: null })).toBe(false);
  });

  it('is true for attending guests who are unsure or were never asked', () => {
    expect(parkingNeedsPlate('attending', null)).toBe(true);
    expect(parkingNeedsPlate('attending', { status: 'unsure', plate: null })).toBe(true);
  });

  it('is false once a plate is on file or the guest is not driving', () => {
    expect(parkingNeedsPlate('attending', { status: 'plate', plate: 'ABC 1234' })).toBe(false);
    expect(parkingNeedsPlate('attending', { status: 'none', plate: null })).toBe(false);
  });
});

describe('parkingFromAnswer', () => {
  it('maps a plate answer onto the guest-doc shape', () => {
    expect(parkingFromAnswer({ status: 'plate', plate: 'ABC 1234' })).toEqual({
      status: 'plate',
      plate: 'ABC 1234',
    });
  });

  it('maps the plate-less answers with a null plate', () => {
    expect(parkingFromAnswer({ status: 'unsure' })).toEqual({ status: 'unsure', plate: null });
    expect(parkingFromAnswer({ status: 'none' })).toEqual({ status: 'none', plate: null });
  });
});
