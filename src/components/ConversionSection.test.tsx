import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import ConversionSection from './ConversionSection';

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
    await user.click(addButton);

    expect(await screen.findByText('EUR - Euro')).toBeInTheDocument();
    expect(await screen.findByText('JPY - Japanese Yen')).toBeInTheDocument();
  });
});
