import AsyncStorage from '@react-native-async-storage/async-storage';
import type { SavedReport } from './types';

const KEYS = {
  report: '@eq:lastReport',
  paid: '@eq:paid',
};

export async function saveReport(report: SavedReport): Promise<void> {
  await AsyncStorage.setItem(KEYS.report, JSON.stringify(report));
}

export async function loadReport(): Promise<SavedReport | null> {
  const raw = await AsyncStorage.getItem(KEYS.report);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SavedReport;
  } catch {
    return null;
  }
}

export async function setPaid(paid: boolean): Promise<void> {
  await AsyncStorage.setItem(KEYS.paid, paid ? '1' : '0');
}

export async function getPaid(): Promise<boolean> {
  return (await AsyncStorage.getItem(KEYS.paid)) === '1';
}

export async function clearAll(): Promise<void> {
  await AsyncStorage.multiRemove([KEYS.report, KEYS.paid]);
}
