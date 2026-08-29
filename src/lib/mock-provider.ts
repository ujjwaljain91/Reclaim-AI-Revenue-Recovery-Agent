import { Payment, FailureReason } from './types';

export interface PaymentProvider {
  name: string;
  isSandbox: boolean;
  retryPayment(paymentId: string): Promise<{ success: boolean; message: string; transactionId?: string }>;
  createPaymentLink(paymentId: string, amount: number, customerEmail: string): Promise<{ link: string; expiresAt: string }>;
  requestPaymentMethodUpdate(customerId: string): Promise<{ updateUrl: string; token: string }>;
  verifyStatus(paymentId: string): Promise<'success' | 'failed' | 'pending'>;
}

export class MockPaymentProvider implements PaymentProvider {
  name = 'MockPaymentProvider (Razorpay Sandbox)';
  isSandbox = true;

  async retryPayment(paymentId: string): Promise<{ success: boolean; message: string; transactionId?: string }> {
    // Fast realistic gateway response
    await new Promise((res) => setTimeout(res, 180));

    // For Acme Corp demo, retry is successful (82% probability)
    const isSuccess = Math.random() < 0.85;

    if (isSuccess) {
      return {
        success: true,
        message: 'Payment authorized successfully via Razorpay UPI auto-debit.',
        transactionId: `pay_tx_${Date.now()}`,
      };
    } else {
      return {
        success: false,
        message: 'Payment retry failed: Insufficient bank balance reported by issuing bank.',
      };
    }
  }

  async createPaymentLink(paymentId: string, amount: number, customerEmail: string): Promise<{ link: string; expiresAt: string }> {
    await new Promise((res) => setTimeout(res, 100));
    return {
      link: `https://rzp.io/i/reclaim_${paymentId.slice(-6)}`,
      expiresAt: new Date(Date.now() + 86400000 * 3).toISOString(),
    };
  }

  async requestPaymentMethodUpdate(customerId: string): Promise<{ updateUrl: string; token: string }> {
    await new Promise((res) => setTimeout(res, 100));
    return {
      updateUrl: `https://reclaim.fintech/update-card?cid=${customerId}&t=${Date.now()}`,
      token: `tok_upd_${Math.random().toString(36).substring(2, 9)}`,
    };
  }

  async verifyStatus(paymentId: string): Promise<'success' | 'failed' | 'pending'> {
    await new Promise((res) => setTimeout(res, 120));
    return 'success';
  }
}

export const mockPaymentProvider = new MockPaymentProvider();
