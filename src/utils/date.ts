import { CONVERSIONS } from '../constant';

export function getCurrentTimestamp(): number {
  return Math.round(Date.now() / CONVERSIONS.sec);
}
