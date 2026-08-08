import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CurrencyItem from './CurrencyItem';
import { currenciesByCode } from '../data/currencies';
import { countriesListSorted } from '../data/countries';

const removeCurrencyItem = vi.fn();
const togglefavourite = vi.fn();
const updateCurrencyItem = vi.fn();

vi.mock('../contexts/CurrencyContext', () => ({
  useCurrency: () => ({
    viewMode: 'country',
    baseCurrency: 'USD',
    baseCountry: 'United States',
    favouriteCurrencies: [],
    removeCurrencyItem,
    togglefavourite,
    updateCurrencyItem
  })
}));

const gbp = currenciesByCode['GBP'];

const baseProps = {
  id: 'test-1',
  code: 'GBP',
  name: gbp?.name ?? 'British Pound Sterling',
  symbol: '£',
  convertedAmount: 100,
  rate: 1.0,
  isfavourite: false,
  country: 'United Kingdom',
  ppp: 1.2,
  pppAmount: 120
};

describe('CurrencyItem in country view', () => {
  beforeEach(() => {
    removeCurrencyItem.mockClear();
    togglefavourite.mockClear();
    updateCurrencyItem.mockClear();
  });

  it('renders the country and currency label', () => {
    render(<CurrencyItem {...baseProps} />);

    expect(screen.getByText('United Kingdom (GBP)', { selector: 'div' })).toBeInTheDocument();
    expect(screen.getByTitle('100')).toBeInTheDocument();
  });

  it('renders the PPP adjusted amount and index', () => {
    render(<CurrencyItem {...baseProps} />);

    const card = screen.getByTitle('120').closest('.group') as HTMLElement;
    expect(screen.getByTitle('120')).toBeInTheDocument();
    expect(screen.getByTitle('120').nextElementSibling).toHaveTextContent('PPP Adjusted');
    expect(card).toHaveTextContent('PPP Index: 1.2');
  });

  it('renders the country selector instead of the currency selector', () => {
    render(<CurrencyItem {...baseProps} />);

    expect(screen.getByLabelText('Change country')).toBeInTheDocument();
    expect(screen.queryByLabelText('Change currency')).not.toBeInTheDocument();
  });

  it('hides the favourite button in country view', () => {
    render(<CurrencyItem {...baseProps} />);

    expect(screen.queryByRole('button', { name: 'Add to favourites' })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remove currency' })).toBeInTheDocument();
  });

  it('calls updateCurrencyItem when a different country is selected', async () => {
    const user = userEvent.setup();
    render(<CurrencyItem {...baseProps} />);

    const target = countriesListSorted.find(
      (c) => c.name !== 'United States' && c.name !== 'United Kingdom' && currenciesByCode[c.currency_code]
    );
    if (!target) throw new Error('No target country found for country selection test');

    const select = screen.getByLabelText('Change country');
    await user.selectOptions(select, target.name);

    const targetCurrency = currenciesByCode[target.currency_code];
    expect(updateCurrencyItem).toHaveBeenCalledWith(baseProps.id, target.currency_code, targetCurrency, target.name);
  });
});
