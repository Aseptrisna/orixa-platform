import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'IDR'): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(date: Date | string, format: 'short' | 'medium' | 'full' = 'medium'): string {
  const options: Intl.DateTimeFormatOptions = format === 'short' 
    ? { dateStyle: 'short' }
    : format === 'full'
    ? { dateStyle: 'full', timeStyle: 'short' }
    : { dateStyle: 'medium', timeStyle: 'short' };
  
  return new Intl.DateTimeFormat('id-ID', options).format(new Date(date));
}

export function generateOrderCode(): string {
  const chars = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

export function formatRupiahInput(value: string): string {
  const number = value.replace(/\D/g, '');
  return number.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

export function parseRupiahInput(value: string): number {
  return parseInt(value.replace(/\./g, '')) || 0;
}
