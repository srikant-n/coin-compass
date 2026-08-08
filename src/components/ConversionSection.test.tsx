import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import ConversionSection from './ConversionSection';
import { countriesListSorted } from '../data/countries';

vi.mock('../../api/currencyConversion', () => ({
  getLatestRates: vi.fn(async () => ({
    amount: 1,
    base: 'USD',
    date: '2026-08-07',
    rates: { EUR: 0.92, JPY: 150, GBP: 0.79 }
  }))
}));

describe('ConversionSection', () => {
  const renderWithProvider = () =>
    render(
      <CurrencyProvider>
        <ConversionSection />
      </CurrencyProvider>
    );

  it('renders the section heading and Add currency button', () => {
    renderWithProvider();

    expect(screen.getByText("Around the world, that's...")).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Add currency' })).toBeInTheDocument();
    expect(screen.getByLabelText('Add another currency')).toBeInTheDocument();
  });

  it('adds the first available currency when Add is clicked', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const addButton = screen.getByRole('button', { name: 'Add currency' });
    await user.click(addButton);

    // Default base is USD, so the next sorted currency (EUR) is added
    expect(await screen.findByText('EUR - Euro')).toBeInTheDocument();
    expect(screen.getByLabelText('Change currency')).toBeInTheDocument();
  });

  it('adds multiple currencies in sorted order', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const addButton = screen.getByRole('button', { name: 'Add currency' });
    await user.click(addButton);

    // Wait for the first async add before clicking again so the second click
    // reads the updated list and does not duplicate the same currency.
    await screen.findByText('JPY - Japanese Yen', { selector: 'div' });
    await user.click(addButton);

    expect(await screen.findByText('EUR - Euro', { selector: 'div' })).toBeInTheDocument();
    expect(await screen.findByText('JPY - Japanese Yen', { selector: 'div' })).toBeInTheDocument();
  });
});

describe('ConversionSection - country view', () => {
  const firstCountry = countriesListSorted.find((c) => c.name !== 'United States');

  const renderCountryView = () => {
    localStorage.setItem('viewMode', 'country');
    return render(
      <CurrencyProvider>
        <ConversionSection />
      </CurrencyProvider>
    );
  };

  it('renders country-specific add buttons', () => {
    renderCountryView();

    expect(screen.getByRole('button', { name: 'Add country' })).toBeInTheDocument();
    expect(screen.getByLabelText('Add another country')).toBeInTheDocument();
  });

  it('adds the first available country when Add is clicked', async () => {
    if (!firstCountry) throw new Error('No available country found');

    const user = userEvent.setup();
    renderCountryView();

    const addButton = screen.getByLabelText('Add another country');
    await user.click(addButton);

    // handleAdd is async, so wait for the new country select to appear.
    await waitFor(() => expect(screen.getAllByLabelText('Change country')).toHaveLength(2));
    expect(
      screen.getByText(`${firstCountry.name} (${firstCountry.currency_code})`, { selector: 'div' })
    ).toBeInTheDocument();
  });
});
