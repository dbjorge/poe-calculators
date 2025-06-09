export default function assert(condition: boolean, msg?: string) {
  if (!condition) {
    const suffix = msg ? `: ${msg}` : "";
    throw new Error(`Assertion failed${suffix}`);
  }
}
