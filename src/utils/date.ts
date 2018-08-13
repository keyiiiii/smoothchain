import { CONVERSIONS } from '../constant';

export function getCurrentTimestamp(): number {
  return Math.round(new Date().getTime() / CONVERSIONS.sec);
}
