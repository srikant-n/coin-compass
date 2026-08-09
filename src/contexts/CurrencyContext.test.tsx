import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { CurrencyProvider, useCurrency } from './CurrencyContext';

describe('CurrencyContext', () => {
  describe('CurrencyProvider', () => {
    it('provides default values', () => {
      function TestComponent() {
        const { baseCurrency, amount } = useCurrency();
        return (
          <div>
            <span data-testid="currency">{baseCurrency}</span>
            <span data-testid="amount">{amount}</span>
          </div>
        );
      }

      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );

      expect(screen.getByTestId('currency')).toHaveTextContent('USD');
      expect(screen.getByTestId('amount')).toHaveTextContent('100');
    });

    it('allows updating baseCurrency', async () => {
      function TestComponent() {
        const { baseCurrency, setBaseCurrency } = useCurrency();
        return (
          <div>
            <span data-testid="currency">{baseCurrency}</span>
            <button onClick={() => setBaseCurrency('EUR')}>Change to EUR</button>
          </div>
        );
      }

      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );

      const currencyDisplay = screen.getByTestId('currency');
      expect(currencyDisplay).toHaveTextContent('USD');

      const button = screen.getByRole('button', { name: 'Change to EUR' });
      await userEvent.click(button);

      expect(currencyDisplay).toHaveTextContent('EUR');
    });

    it('allows updating amount', async () => {
      function TestComponent() {
        const { amount, setAmount } = useCurrency();
        return (
          <div>
            <span data-testid="amount">{amount}</span>
            <button onClick={() => setAmount(500)}>Set to 500</button>
          </div>
        );
      }

      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );

      const amountDisplay = screen.getByTestId('amount');
      expect(amountDisplay).toHaveTextContent('100');

      const button = screen.getByRole('button', { name: 'Set to 500' });
      await userEvent.click(button);

      expect(amountDisplay).toHaveTextContent('500');
    });

    it('allows multiple updates to both currency and amount', async () => {
      function TestComponent() {
        const { baseCurrency, amount, setBaseCurrency, setAmount } = useCurrency();
        return (
          <div>
            <span data-testid="currency">{baseCurrency}</span>
            <span data-testid="amount">{amount}</span>
            <button onClick={() => setBaseCurrency('GBP')}>Change to GBP</button>
            <button onClick={() => setAmount(250)}>Set to 250</button>
          </div>
        );
      }

      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );

      const currencyDisplay = screen.getByTestId('currency');
      const amountDisplay = screen.getByTestId('amount');

      expect(currencyDisplay).toHaveTextContent('USD');
      expect(amountDisplay).toHaveTextContent('100');

      const gbpButton = screen.getByRole('button', { name: 'Change to GBP' });
      await userEvent.click(gbpButton);
      expect(currencyDisplay).toHaveTextContent('GBP');

      const amountButton = screen.getByRole('button', { name: 'Set to 250' });
      await userEvent.click(amountButton);
      expect(amountDisplay).toHaveTextContent('250');
    });
  });

  describe('useCurrency', () => {
    it('throws error when used outside CurrencyProvider', () => {
      function TestComponent() {
        useCurrency();
        return <div>Test</div>;
      }

      expect(() => render(<TestComponent />)).toThrow(
        'useCurrency must be used within a CurrencyProvider'
      );
    });

    it('returns context values when used inside CurrencyProvider', () => {
      function TestComponent() {
        const context = useCurrency();
        return (
          <div>
            <span data-testid="has-currency">{context.baseCurrency}</span>
            <span data-testid="has-amount">{context.amount}</span>
            <span data-testid="has-set-currency">
              {typeof context.setBaseCurrency}
            </span>
            <span data-testid="has-set-amount">
              {typeof context.setAmount}
            </span>
          </div>
        );
      }

      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );

      expect(screen.getByTestId('has-currency')).toHaveTextContent('USD');
      expect(screen.getByTestId('has-amount')).toHaveTextContent('100');
      expect(screen.getByTestId('has-set-currency')).toHaveTextContent('function');
      expect(screen.getByTestId('has-set-amount')).toHaveTextContent('function');
    });
  });

  describe('Context isolation', () => {
    it('separates state between different providers', async () => {
      function TestComponent({ label }: { label: string }) {
        const { baseCurrency, setBaseCurrency } = useCurrency();
        return (
          <div>
            <span data-testid={`${label}-currency`}>{baseCurrency}</span>
            <button onClick={() => setBaseCurrency('JPY')}>Change to JPY</button>
          </div>
        );
      }

      render(
        <>
          <CurrencyProvider>
            <TestComponent label="first" />
          </CurrencyProvider>
          <CurrencyProvider>
            <TestComponent label="second" />
          </CurrencyProvider>
        </>
      );

      const firstCurrency = screen.getByTestId('first-currency');
      const secondCurrency = screen.getByTestId('second-currency');

      expect(firstCurrency).toHaveTextContent('USD');
      expect(secondCurrency).toHaveTextContent('USD');

      const buttons = screen.getAllByRole('button', { name: 'Change to JPY' });
      await userEvent.click(buttons[0]);

      expect(firstCurrency).toHaveTextContent('JPY');
      expect(secondCurrency).toHaveTextContent('USD');
    });
  });

  describe('View-specific state', () => {
    it('restores the stored base and targets for each view', async () => {
      localStorage.setItem('viewMode', 'currency');
      localStorage.setItem('baseCurrency', 'EUR');
      localStorage.setItem('baseCountry', 'Japan');
      localStorage.setItem(
        'selectedCurrencies',
        JSON.stringify([{
          id: 'gbp',
          code: 'GBP',
          name: 'British Pound',
          symbol: '£',
          convertedAmount: 100,
          rate: 1,
          isfavourite: false
        }])
      );
      localStorage.setItem(
        'selectedCountries',
        JSON.stringify([{
          id: 'france',
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          convertedAmount: 100,
          rate: 1,
          isfavourite: false,
          country: 'France',
          ppp: null,
          pppAmount: null
        }])
      );

      function TestComponent() {
        const { baseCurrency, baseCountry, currencyItems, setViewMode } = useCurrency();
        return (
          <div>
            <span data-testid="currency">{baseCurrency}</span>
            <span data-testid="country">{baseCountry}</span>
            <span data-testid="count">{currencyItems.length}</span>
            <button onClick={() => setViewMode('country')}>Country</button>
            <button onClick={() => setViewMode('currency')}>Currency</button>
          </div>
        );
      }

      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );

      expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
      expect(screen.getByTestId('country')).not.toHaveTextContent('Japan');
      expect(screen.getByTestId('count')).toHaveTextContent('1');

      await userEvent.click(screen.getByRole('button', { name: 'Country' }));
      expect(screen.getByTestId('currency')).toHaveTextContent('JPY');
      expect(screen.getByTestId('country')).toHaveTextContent('Japan');
      expect(screen.getByTestId('count')).toHaveTextContent('1');

      await userEvent.click(screen.getByRole('button', { name: 'Currency' }));
      expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
      expect(screen.getByTestId('country')).not.toHaveTextContent('Japan');
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });

    it('persists country base and targets to localStorage', async () => {
      localStorage.setItem('viewMode', 'country');

      function TestComponent() {
        const { setBaseCountry, addCurrencyItem, currencyItems } = useCurrency();
        const handleAdd = () => {
          addCurrencyItem({
            code: 'EUR',
            name: 'Euro',
            symbol: '€',
            convertedAmount: 100,
            rate: 1,
            isfavourite: false,
            country: 'France'
          });
        };
        return (
          <div>
            <span data-testid="count">{currencyItems.length}</span>
            <button onClick={() => setBaseCountry('France')}>Set France</button>
            <button onClick={handleAdd}>Add France</button>
          </div>
        );
      }

      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );

      await userEvent.click(screen.getByRole('button', { name: 'Set France' }));
      await waitFor(() => {
        expect(localStorage.getItem('baseCountry')).toBe('France');
      });

      await userEvent.click(screen.getByRole('button', { name: 'Add France' }));
      expect(screen.getByTestId('count')).toHaveTextContent('2');
      await waitFor(() => {
        const stored = JSON.parse(localStorage.getItem('selectedCountries') || '[]') as { country?: string }[];
        expect(stored.some((item) => item.country === 'France')).toBe(true);
      });
    });
  });

  describe('resetCurrentView', () => {
    it('resets currency view to default base and targets', async () => {
      localStorage.setItem('viewMode', 'currency');
      localStorage.setItem('baseCurrency', 'EUR');
      localStorage.setItem('baseCountry', 'Japan');
      localStorage.setItem(
        'selectedCurrencies',
        JSON.stringify([{
          id: 'gbp',
          code: 'GBP',
          name: 'British Pound',
          symbol: '£',
          convertedAmount: 100,
          rate: 1,
          isfavourite: false
        }])
      );
      localStorage.setItem(
        'selectedCountries',
        JSON.stringify([{
          id: 'japan',
          code: 'JPY',
          name: 'Japanese Yen',
          symbol: '¥',
          convertedAmount: 100,
          rate: 1,
          isfavourite: false,
          country: 'Japan',
          ppp: null,
          pppAmount: null
        }])
      );

      function TestComponent() {
        const { baseCurrency, currencyItems, resetCurrentView, setViewMode } = useCurrency();
        return (
          <div>
            <span data-testid="currency">{baseCurrency}</span>
            <span data-testid="count">{currencyItems.length}</span>
            <span data-testid="first-code">{currencyItems[0]?.code}</span>
            <button onClick={() => setViewMode('country')}>Country</button>
            <button onClick={resetCurrentView}>Reset</button>
          </div>
        );
      }

      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );

      expect(screen.getByTestId('currency')).toHaveTextContent('EUR');
      expect(screen.getByTestId('first-code')).toHaveTextContent('GBP');

      await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
      expect(screen.getByTestId('currency')).toHaveTextContent('USD');
      expect(screen.getByTestId('first-code')).toHaveTextContent('EUR');

      await userEvent.click(screen.getByRole('button', { name: 'Country' }));
      const storedBase = localStorage.getItem('baseCountry');
      expect(storedBase).toBe('Japan');
    });

    it('resets country view to default base and targets', async () => {
      localStorage.setItem('viewMode', 'country');
      localStorage.setItem('baseCountry', 'Japan');
      localStorage.setItem(
        'selectedCountries',
        JSON.stringify([{
          id: 'france',
          code: 'EUR',
          name: 'Euro',
          symbol: '€',
          convertedAmount: 100,
          rate: 1,
          isfavourite: false,
          country: 'France',
          ppp: null,
          pppAmount: null
        }])
      );

      function TestComponent() {
        const { baseCurrency, baseCountry, currencyItems, resetCurrentView } = useCurrency();
        return (
          <div>
            <span data-testid="currency">{baseCurrency}</span>
            <span data-testid="country">{baseCountry}</span>
            <span data-testid="count">{currencyItems.length}</span>
            <span data-testid="first-country">{currencyItems[0]?.country}</span>
            <button onClick={resetCurrentView}>Reset</button>
          </div>
        );
      }

      render(
        <CurrencyProvider>
          <TestComponent />
        </CurrencyProvider>
      );

      expect(screen.getByTestId('currency')).toHaveTextContent('JPY');
      expect(screen.getByTestId('country')).toHaveTextContent('Japan');
      expect(screen.getByTestId('first-country')).toHaveTextContent('France');

      await userEvent.click(screen.getByRole('button', { name: 'Reset' }));
      expect(screen.getByTestId('currency')).toHaveTextContent('USD');
      expect(screen.getByTestId('country')).toHaveTextContent('United States');
      expect(screen.getByTestId('first-country')).not.toHaveTextContent('France');
      expect(screen.getByTestId('count')).toHaveTextContent('1');
    });
  });
});
