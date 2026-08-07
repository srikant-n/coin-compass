import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
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
});
