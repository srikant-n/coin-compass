import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BaseCurrency } from './BaseCurrency';
import { CurrencyProvider } from '../contexts/CurrencyContext';
import { currenciesList, POPULAR_CURRENCIES } from '../data/currencies';

describe('BaseCurrency', () => {
  const renderWithProvider = () => {
    return render(
      <CurrencyProvider>
        <BaseCurrency />
      </CurrencyProvider>
    );
  };

  describe('Initial Render', () => {
    it('renders the component with default values', () => {
      renderWithProvider();
      
      expect(screen.getByText('I have exactly...')).toBeInTheDocument();
      expect(screen.getByLabelText('Enter amount')).toBeInTheDocument();
      expect(screen.getByLabelText('Select base currency')).toBeInTheDocument();
    });

    it('displays default amount (100) in input', () => {
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      expect(amountInput).toHaveValue(100);
    });

    it('displays default currency (USD) in select', () => {
      renderWithProvider();
      
      const currencySelect = screen.getByLabelText('Select base currency');
      expect(currencySelect).toHaveValue('USD');
    });

    it('displays currency symbol and code', () => {
      renderWithProvider();
      
      expect(screen.getByText('$')).toBeInTheDocument();
      expect(screen.getByText('USD')).toBeInTheDocument();
    });

    it('displays currency name when available', () => {
      renderWithProvider();
      
      // Check that currency name is displayed (may be in a different format)
      const currencyInfo = screen.getByText((content) => content.includes('USD') && content.includes('='));
      expect(currencyInfo).toBeInTheDocument();
    });

    it('renders all quick action buttons', () => {
      renderWithProvider();
      
      // Buttons are identified by their aria-labels
      expect(screen.getByRole('button', { name: /Set amount to \$50/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Set amount to \$1,000/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Round up amount to nearest hundred' })).toBeInTheDocument();
    });
  });

  describe('Amount Input', () => {
    it('allows user to change amount via input', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      await user.clear(amountInput);
      await user.type(amountInput, '250');
      
      expect(amountInput).toHaveValue(250);
    });

    it('handles decimal values', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      await user.clear(amountInput);
      await user.type(amountInput, '99.99');
      
      expect(amountInput).toHaveValue(99.99);
    });

    it('handles empty input', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      await user.clear(amountInput);
      
      // Empty number input defaults to 0 in this implementation
      expect(amountInput).toHaveValue(0);
    });
  });

  describe('Currency Select', () => {
    it('allows user to change currency', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const currencySelect = screen.getByLabelText('Select base currency');
      await user.selectOptions(currencySelect, 'EUR');
      
      expect(currencySelect).toHaveValue('EUR');
    });

    it('updates displayed symbol when currency changes', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const currencySelect = screen.getByLabelText('Select base currency');
      await user.selectOptions(currencySelect, 'EUR');
      
      expect(screen.getByText('€')).toBeInTheDocument();
      expect(screen.getByText('EUR')).toBeInTheDocument();
    });

    it('updates currency name when currency changes', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const currencySelect = screen.getByLabelText('Select base currency');
      await user.selectOptions(currencySelect, 'EUR');
      
      expect(screen.getByText('EUR = Euro')).toBeInTheDocument();
    });

    it('contains all currency options', () => {
      renderWithProvider();
      
      const currencySelect = screen.getByLabelText('Select base currency');
      const options = currencySelect.querySelectorAll('option');
      
      expect(options.length).toBeGreaterThan(0);
      expect(Array.from(options).some(opt => opt.value === 'USD')).toBe(true);
      expect(Array.from(options).some(opt => opt.value === 'EUR')).toBe(true);
      expect(Array.from(options).some(opt => opt.value === 'GBP')).toBe(true);
    });
  });

  describe('Quick Action Buttons', () => {
    it('sets amount to 50 when Quick $50 button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const quick50Button = screen.getByRole('button', { name: /Set amount to \$50/i });
      await user.click(quick50Button);
      
      const amountInput = screen.getByLabelText('Enter amount');
      expect(amountInput).toHaveValue(50);
    });

    it('sets amount to 1000 when Quick $1,000 button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const quick1000Button = screen.getByRole('button', { name: /Set amount to \$1,000/i });
      await user.click(quick1000Button);
      
      const amountInput = screen.getByLabelText('Enter amount');
      expect(amountInput).toHaveValue(1000);
    });

    it('rounds up amount to nearest hundred when Round Up button is clicked', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      await user.clear(amountInput);
      await user.type(amountInput, '234');
      
      const roundUpButton = screen.getByRole('button', { name: 'Round up amount to nearest hundred' });
      await user.click(roundUpButton);
      
      expect(amountInput).toHaveValue(300);
    });

    it('rounds up correctly for amount already at hundred boundary', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      await user.clear(amountInput);
      await user.type(amountInput, '500');
      
      const roundUpButton = screen.getByRole('button', { name: 'Round up amount to nearest hundred' });
      await user.click(roundUpButton);
      
      expect(amountInput).toHaveValue(500);
    });

    it('updates button labels when currency changes', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const currencySelect = screen.getByLabelText('Select base currency');
      await user.selectOptions(currencySelect, 'EUR');
      
      expect(screen.getByRole('button', { name: /Set amount to €50/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Set amount to €1,000/i })).toBeInTheDocument();
    });
  });

  describe('Accessibility', () => {
    it('has proper section structure with aria-labelledby', () => {
      renderWithProvider();
      
      const section = document.getElementById('converter-base');
      expect(section).toBeInTheDocument();
      expect(section).toHaveAttribute('aria-labelledby', 'base-currency-heading');
    });

    it('input has aria-label', () => {
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      expect(amountInput).toBeInTheDocument();
    });

    it('select has aria-label', () => {
      renderWithProvider();
      
      const currencySelect = screen.getByLabelText('Select base currency');
      expect(currencySelect).toBeInTheDocument();
    });

    it('buttons have descriptive aria-labels', () => {
      renderWithProvider();
      
      expect(screen.getByRole('button', { name: /Set amount to \$50/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Set amount to \$1,000/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Round up amount to nearest hundred' })).toBeInTheDocument();
    });

    it('visual custom select has aria-hidden', () => {
      renderWithProvider();
      
      const visualSelect = document.querySelector('[aria-hidden="true"]');
      expect(visualSelect).toBeInTheDocument();
    });
  });

  describe('Component Structure', () => {
    it('renders with correct section id', () => {
      renderWithProvider();
      
      const section = document.getElementById('converter-base');
      expect(section).toBeInTheDocument();
    });

    it('renders heading with correct id', () => {
      renderWithProvider();
      
      const heading = document.getElementById('base-currency-heading');
      expect(heading).toBeInTheDocument();
      expect(heading).toHaveTextContent('I have exactly...');
    });

    it('renders input and select in proper order', () => {
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      const currencySelect = screen.getByLabelText('Select base currency');
      
      expect(amountInput.compareDocumentPosition(currencySelect)).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });
  });

  describe('Edge Cases', () => {
    it('handles negative amounts (converted to positive)', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      await user.clear(amountInput);
      await user.type(amountInput, '-50');
      
      // Component converts negative to positive via Number()
      expect(amountInput).toHaveValue(50);
    });

    it('handles very large amounts', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      await user.clear(amountInput);
      await user.type(amountInput, '9999999');
      
      expect(amountInput).toHaveValue(9999999);
    });

    it('rounds up from 0 to 0', async () => {
      const user = userEvent.setup();
      renderWithProvider();
      
      const amountInput = screen.getByLabelText('Enter amount');
      await user.clear(amountInput);
      await user.type(amountInput, '0');
      
      const roundUpButton = screen.getByRole('button', { name: 'Round up amount to nearest hundred' });
      await user.click(roundUpButton);
      
      expect(amountInput).toHaveValue(0);
    });
  });

  describe('Dropdown grouping and sorting', () => {
    it('groups options under "Popular" and "Currencies"', () => {
      renderWithProvider();

      const select = screen.getByLabelText('Select base currency');
      const groups = select.querySelectorAll('optgroup');

      expect(groups).toHaveLength(2);
      expect(groups[0]).toHaveAttribute('label', 'Popular');
      expect(groups[1]).toHaveAttribute('label', 'Currencies');
    });

    it('lists all currencies exactly once', () => {
      renderWithProvider();

      const select = screen.getByLabelText('Select base currency');
      const options = select.querySelectorAll('option');

      expect(options).toHaveLength(currenciesList.length);
    });

    it('lists popular currencies first', () => {
      renderWithProvider();

      const select = screen.getByLabelText('Select base currency');
      const popularOptions = select.querySelector('optgroup[label="Popular"]')?.querySelectorAll('option');
      const popularCodes = Array.from(popularOptions ?? []).map((o) => (o as HTMLOptionElement).value);
      const expected = currenciesList
        .filter((c) => POPULAR_CURRENCIES.includes(c.iso_code))
        .map((c) => c.iso_code);

      expect(popularCodes).toEqual(expected);
    });

    it('sorts remaining currencies alphabetically by name', () => {
      renderWithProvider();

      const select = screen.getByLabelText('Select base currency');
      const otherOptions = select.querySelector('optgroup[label="Currencies"]')?.querySelectorAll('option');
      const otherNames = Array.from(otherOptions ?? []).map((o) => {
        const currency = currenciesList.find((c) => c.iso_code === (o as HTMLOptionElement).value);
        return currency?.name;
      });
      const sorted = [...otherNames].filter(Boolean).sort((a, b) => (a as string).localeCompare(b as string));

      expect(otherNames).toEqual(sorted);
    });
  });
});
