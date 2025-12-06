// Narrowing checks for non-empty guards
import { isNonEmptyString, isNonEmptyArray, isNonEmptyRecord, isNonZeroNumber, isNonEmpty } from './assertroute';

function checkString(x: unknown) {
  if (isNonEmptyString(x)) {
    const s: string = x; // should narrow to string
    const len: number = s.length; // ok
    // @ts-expect-error number-specific op shouldn't be allowed on string
    const n: number = x as number;
  }
}

function checkArray(x: unknown) {
  if (isNonEmptyArray<string>(x)) {
    const a: string[] = x; // should narrow to string[]
    const first: string = a[0]; // ok
    // length > 0 guaranteed at runtime, but type is still string[]
  }
}

function checkRecord(x: unknown) {
  if (isNonEmptyRecord(x)) {
    const r: Record<string, unknown> = x; // narrowed
    const keys: string[] = Object.keys(r); // ok
  }
}

function checkNumber(x: unknown) {
  if (isNonZeroNumber(x)) {
    const n: number = x; // narrowed
    const inv: number = 1 / n; // ok; n !== 0 at runtime
  }
}

function checkComposite(x: unknown) {
  if (isNonEmpty(x)) {
    const v: string | any[] | Record<string, unknown> | number = x;
    // Discriminate further
    if (typeof v === 'string') {
      const l = v.length;
    } else if (Array.isArray(v)) {
      const l = v.length;
    } else if (typeof v === 'number') {
      const pos = v > 0;
    } else {
      const k = Object.keys(v);
    }
  }
}

export function runAll() {
  checkString('hi');
  checkArray(['a']);
  checkRecord({ a: 1 });
  checkNumber(2);
  checkComposite('x');
}
