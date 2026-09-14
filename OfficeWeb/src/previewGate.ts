/** Whether this client should be capturing its screen at all.
 *
 * Kept free of React so the rule itself can be unit-tested. Capturing used to run
 * whenever the client held a desk, even with nobody able to watch, and one frame
 * cost 552ms of main-process time - so the answer matters.
 */
export function shouldPreview(input: {
  desktop: boolean; connected: boolean; seated: boolean; wanted: boolean;
}) {
  return input.desktop && input.connected && input.seated && input.wanted;
}
