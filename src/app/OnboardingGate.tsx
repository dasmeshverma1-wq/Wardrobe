import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useProfileStore } from '@/store/profileStore';
import { useChrome } from '@/store/chromeStore';

/**
 * Redirects first-time visitors to /onboarding.
 * Once the user completes (or skips) the quiz, the profile is persisted
 * and the gate becomes a no-op.
 */
export function OnboardingGate() {
  const profile = useProfileStore((s) => s.profile);
  const hydrated = useProfileStore((s) => s.hydrated);
  const isV2 = useChrome((s) => s.wireframeVersion === 'v2');
  const location = useLocation();

  if (!hydrated) return null;
  if (isV2) return <Outlet />;

  if (!profile && location.pathname !== '/onboarding') {
    return <Navigate to="/onboarding" replace />;
  }
  return <Outlet />;
}
