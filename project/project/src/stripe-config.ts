export interface StripeProduct {
  id: string;
  priceId: string;
  name: string;
  description: string;
  mode: 'payment' | 'subscription';
  price: number;
  currency: string;
  interval?: 'month' | 'year';
}

export const STRIPE_PRODUCTS: StripeProduct[] = [
  {
    id: 'prod_SLigIHOco5Rx41',
    priceId: 'price_1RR1FJB3TntnqxEZcwm5pfEs',
    name: 'Dreamflux Pro',
    description: 'Monthly unlimited subscription.',
    mode: 'subscription',
    price: 30.00,
    currency: 'usd',
    interval: 'month'
  },
  {
    id: 'prod_SLiVfupbr0pRfE',
    priceId: 'price_1RR14vB3TntnqxEZzIblxVuG',
    name: 'Dreamflux Pro',
    description: 'Unlimited creations with Dreamflux Pro 1 year subscription',
    mode: 'subscription',
    price: 79.99,
    currency: 'usd',
    interval: 'year'
  }
];

export const getProductByPriceId = (priceId: string): StripeProduct | undefined => {
  return STRIPE_PRODUCTS.find(product => product.priceId === priceId);
};

export const getProductsByMode = (mode: 'payment' | 'subscription'): StripeProduct[] => {
  return STRIPE_PRODUCTS.filter(product => product.mode === mode);
};