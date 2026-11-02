import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { EntourageSection } from './EntourageSection';
import type { EntourageMemberResult } from '@/sanity/queries/entourage';

function member(name: string, role: string): EntourageMemberResult {
  return { _id: `${role}-${name}`, name, role };
}

function namesUnder(heading: string): string[] {
  const list = screen.getByRole('heading', { name: heading }).nextElementSibling;
  return Array.from(list?.querySelectorAll('li') ?? []).map((li) => li.textContent ?? '');
}

describe('EntourageSection', () => {
  // The veil is draped over the couple (clothing them); the cord is looped
  // around them (binding them). Swapping these headings went unnoticed once.
  it('puts each secondary sponsor under its own symbolic heading', () => {
    render(
      <EntourageSection
        padrinos={[]}
        weddingParty={[
          member('Candle Pair', 'Candle Sponsor'),
          member('Veil Pair', 'Veil Sponsor'),
          member('Cord Pair', 'Cord Sponsor'),
        ]}
      />,
    );

    expect(namesUnder('To Light Our Path')).toEqual(['Candle Pair']);
    expect(namesUnder('To Clothe Us As One')).toEqual(['Veil Pair']);
    expect(namesUnder('To Bind Us As One')).toEqual(['Cord Pair']);
  });
});
