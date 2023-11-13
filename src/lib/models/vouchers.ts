import type { WithId } from './utils';

export type VoucherType = '/organizations/new';

export interface VoucherProps {
  /**
   * The user id of the person who owns this voucher.
   */
  uid: string;
  type: VoucherType;
  redeemed: boolean;
}

export type Voucher = VoucherProps & WithId;
