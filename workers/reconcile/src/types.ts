/** Razorpay payment, reduced to what the check needs. Amounts in paise. */
export type PaymentStatus = 'created' | 'authorized' | 'captured' | 'refunded' | 'failed';

export type Payment = {
  id: string;
  orderId: string | null;
  status: PaymentStatus;
  amount: number;
  amountRefunded: number;
  createdAt: Date;
};

/** Cal ID's own record of a payment on a booking. `externalId` is the Razorpay order ID. */
export type BookingPayment = {
  externalId: string | null;
  success: boolean;
  refunded: boolean;
  amount: number;
};

export type BookingStatus = 'ACCEPTED' | 'PENDING' | 'CANCELLED' | 'REJECTED' | 'AWAITING_HOST';

export type Booking = {
  id: number;
  uid: string;
  status: BookingStatus;
  startTime: Date;
  createdAt: Date;
  /** uid of the booking this one replaced, when rescheduled. */
  fromReschedule: string | null;
  firstName: string;
  /** Event price in paise. 0 means a free event. */
  price: number;
  payments: BookingPayment[];
};

/** A record the checker could not read. Reported as "can't verify", never dropped. */
export type Unreadable = { source: 'Razorpay' | 'Cal ID'; id: string; reason: string };

export type Fetched<T> = { items: T[]; unreadable: Unreadable[] };
