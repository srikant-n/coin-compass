import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CurrencyItem from './CurrencyItem';

const removeCurrencyItem = vi.fn();
const toggleFavorite = vi.fn();

vi.mock('../../contexts/CurrencyContext', () => ({
  useCurrency: () => ({ removeCurrencyItem, toggleFavorite }),
}));

const baseProps = {
  id: 'test-1',
  code: 'USD',
  name: 'United States Dollar',
  symbol: '$',
  convertedAmount: 150,
  rate: 1.0,
  isFavorite: false,
  availableCurrencies: [
    { iso_code: 'EUR', name: 'Euro', symbol: '€' },
    { iso_code: 'JPY', name: 'Japanese Yen', symbol: '¥' },
    { iso_code: 'AED', name: 'United Arab Emirates Dirham', symbol: 'د.إ' },
  ],
  onCurrencyChange: vi.fn(),
};

describe('CurrencyItem', () => {
  beforeEach(() => {
    removeCurrencyItem.mockClear();
    toggleFavorite.mockClear();
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

    expect(popularValues).toEqual(['EUR', 'JPY']);
    expect(otherValues).toEqual(['AED']);
  });

  it('calls removeCurrencyItem when the remove button is clicked', async () => {
    const user = userEvent.setup();
    render(<CurrencyItem {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Remove currency' }));
    expect(removeCurrencyItem).toHaveBeenCalledWith(baseProps.id);
  });

  it('calls toggleFavorite when the favorite button is clicked', async () => {
    const user = userEvent.setup();
    render(<CurrencyItem {...baseProps} />);

    await user.click(screen.getByRole('button', { name: 'Add to favorites' }));
    expect(toggleFavorite).toHaveBeenCalledWith(baseProps.id);
  });

  it('calls onCurrencyChange when the user selects a different currency', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    render(<CurrencyItem {...baseProps} onCurrencyChange={onChange} />);

    const select = screen.getByLabelText('Change currency');
    await user.selectOptions(select, 'AED');

    expect(onChange).toHaveBeenCalledWith('AED', baseProps.availableCurrencies[2]);
  });
});
