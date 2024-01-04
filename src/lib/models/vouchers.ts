import type { WithRef } from './utils';

export type VoucherType = '/d/organizations/new';

export interface VoucherProps {
  /**
   * The user id of the person who owns this voucher.
   */
  uid: string;
  type: VoucherType;
  redeemed: boolean;
}

export type Voucher = VoucherProps & WithRef;
