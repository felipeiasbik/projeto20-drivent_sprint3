import { ApplicationError } from '@/protocols';

export function paymentRequired(): ApplicationError {
  return {
    name: 'PaymentRequired',
    message: 'No payment found!',
  };
}
