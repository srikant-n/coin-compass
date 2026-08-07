import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyProvider } from '../../contexts/CurrencyContext';
import ConversionSection from './ConversionSection';

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
    expect(screen.getByText('EUR - Euro')).toBeInTheDocument();
    expect(screen.getByLabelText('Change currency')).toBeInTheDocument();
  });

  it('adds multiple currencies in sorted order', async () => {
    const user = userEvent.setup();
    renderWithProvider();

    const addButton = screen.getByRole('button', { name: 'Add currency' });
    await user.click(addButton);
    await user.click(addButton);

    expect(screen.getByText('EUR - Euro')).toBeInTheDocument();
    expect(screen.getByText('JPY - Japanese Yen')).toBeInTheDocument();
  });
});
