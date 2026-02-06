/* global describe, it, expect */
import { stripHtml } from './htmlUtils';


describe('stripHtml', () => {
  it('removes HTML tags from simple string', () => {
    const input = '<p>Hello World</p>';
    const expected = 'Hello World';
    expect(stripHtml(input)).toBe(expected);
  });

  it('removes nested HTML tags', () => {
    const input = '<div><p>Hello <b>World</b></p></div>';
    const expected = 'Hello World';
    expect(stripHtml(input)).toBe(expected);
  });

  it('converts HTML entities', () => {
    const input = '&nbsp;&lt;&gt;&amp;&quot;&#039;';
    const expected = ' <>&"\'';
    expect(stripHtml(input)).toBe(expected);
  });

  it('handles mixed HTML and entities', () => {
    const input = '<p>Hello &amp; goodbye</p>';
    const expected = 'Hello & goodbye';
    expect(stripHtml(input)).toBe(expected);
  });

  it('returns empty string for null/undefined', () => {
    expect(stripHtml(null)).toBe(null);
    expect(stripHtml(undefined)).toBe(undefined);
  });

  it('returns plain text as is', () => {
    const input = 'Just plain text';
    expect(stripHtml(input)).toBe(input);
  });
});
