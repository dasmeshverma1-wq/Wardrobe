/**
 * Lightweight, no-op-by-default telemetry hook.
 *
 * Real Myntra would wire this into Adobe Analytics / Segment / their custom pipeline.
 * Here it just logs to console (gated behind ?telemetry=1) so the call sites are real
 * and the PRD events are demonstrably instrumented.
 *
 * PRD §10 events:
 *  - item_added
 *  - outfit_saved
 *  - outfit_shared
 *  - planner_pin
 *  - planner_unpin
 *  - wardrobe_view
 * Additional helpful events for the demo:
 *  - bg_removal_used, bg_removal_failed, ctl_shown, ctl_clicked, item_removed
 */

export type TelemetryEvent =
  | 'item_added'
  | 'item_removed'
  | 'outfit_saved'
  | 'outfit_shared'
  | 'planner_pin'
  | 'planner_unpin'
  | 'wardrobe_view'
  | 'home_view'
  | 'bg_removal_used'
  | 'bg_removal_failed'
  | 'ctl_shown'
  | 'ctl_clicked'
  | 'onboarding_completed'
  | 'discover_view'
  | 'discover_swipe'
  | 'discover_add_to_bag'
  | 'discover_mix'
  | 'discover_try_on'
  | 'try_on_started'
  | 'try_on_completed'
  | 'try_on_failed'
  | 'try_on_shared';

const debug = (() => {
  if (typeof window === 'undefined') return false;
  try {
    return (
      new URL(window.location.href).searchParams.has('telemetry') ||
      localStorage.getItem('wardrobe:telemetry') === '1'
    );
  } catch {
    return false;
  }
})();

const buffer: { event: TelemetryEvent; props?: Record<string, unknown>; t: number }[] = [];

export function track(event: TelemetryEvent, props?: Record<string, unknown>) {
  const entry = { event, props, t: Date.now() };
  buffer.push(entry);
  if (debug) {
    // eslint-disable-next-line no-console
    console.info('[telemetry]', event, props ?? {});
  }
}

/** Test/inspection helper. */
export function _getTelemetryBuffer() {
  return buffer.slice();
}
