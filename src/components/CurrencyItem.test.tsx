import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CurrencyItem from './CurrencyItem';
import { POPULAR_CURRENCIES, currenciesList } from '../data/currencies';

const removeCurrencyItem = vi.fn();
const togglefavourite = vi.fn();
const updateCurrencyItem = vi.fn();

vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    baseCurrency: 'USD',
    favouriteCurrencies: [],
    removeCurrencyItem,
    togglefavourite,
    updateCurrencyItem
  })
}));

const aed = currenciesList.find(c => c.iso_code === 'AED');

const baseProps = {
  id: 'test-1',
  code: 'USD',
  name: 'United States Dollar',
  symbol: '$',
  convertedAmount: 150,
  rate: 1.0,
  isfavourite: false
};

describe('CurrencyItem', () => {
  beforeEach(() => {
    removeCurrencyItem.mockClear();
    togglefavourite.mockClear();
    updateCurrencyItem.mockClear();
  });

  it('renders currency details', () => {
    render(<CurrencyItem {...baseProps} />);

    expect(screen.getByText('150')).toBeInTheDocument();
    expect(screen.getByText('USD - United States Dollar')).toBeInTheDocument();
    expect(screen.getByText('1 USD = 1 $')).toBeInTheDocument();
  });

  it('groups available currencies into Popular and Currencies optgroups', () => {
    render(<CurrencyItem {...baseProps} />);

    const select = screen.getByLabelText('Change currency');
    const groups = select.querySelectorAll('optgroup');

    expect(groups).toHaveLength(2);
    expect(groups[0]).toHaveAttribute('label', 'Popular');
    expect(groups[1]).toHaveAttribute('label', 'Currencies');
  });

  it('places popular currencies before the rest in the dropdown', () => {
    render(<CurrencyItem {...baseProps} />);

    const select = screen.getByLabelText('Change currency');
    const popularValues = Array.from(
      select.querySelector('optgroup[label="Popular"]')?.querySelectorAll('option') ?? []
    ).map((o) => (o as HTMLOptionElement).value);
    const otherValues = Array.from(
      select.querySelector('optgroup[label="Currencies"]')?.querySelectorAll('option') ?? []
    ).map((o) => (o as HTMLOptionElement).value);

    expect(popularValues).toContain('EUR');
    expect(popularValues).toContain('JPY');
    expect(popularValues.every(v => POPULAR_CURRENCIES.includes(v))).toBe(true);
    expect(otherValues).toContain('AED');
    expect(otherValues.every(v => !POPULAR_CURRENCIES.includes(v))).toBe(true);
  });

  it('calls removeCurrencyItem when the remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<CurrencyItem {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Remove currency' }));
    expect(removeCurrencyItem).toHaveBeenCalledWith(baseProps.id);
  });

  it('calls togglefavourite when the favourite button is clicked', async () => {
    const user = userEvent.setup();
    render(<CurrencyItem {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Add to favourites' }));
    expect(togglefavourite).toHaveBeenCalledWith(baseProps.id);
  });

  it('calls updateCurrencyItem when the user selects a different currency', async () => {
    const user = userEvent.setup();
    render(<CurrencyItem {...baseProps} />);

    const select = screen.getByLabelText('Change currency');
    await user.selectOptions(select, 'AED');

    expect(updateCurrencyItem).toHaveBeenCalledWith(baseProps.id, 'AED', aed);
  });
});
