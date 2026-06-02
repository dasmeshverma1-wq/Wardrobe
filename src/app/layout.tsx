import { useEffect } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { BottomNav } from '@/components/ui/BottomNav';
import { ToastHost } from '@/components/ui/Toast';
import { useBootstrap } from './useBootstrap';
import { selectHideBottomNav, useChrome } from '@/store/chromeStore';

const IMMERSIVE_PREFIXES = ['/studio/try-on', '/onboarding', '/create-outfit'];

export function AppLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const ready = useBootstrap();
  const setImmersive = useChrome((s) => s.setImmersive);
  const hideBottomNavFromChrome = useChrome(selectHideBottomNav);
  const isV2 = useChrome((s) => s.wireframeVersion === 'v2');

  const isImmersiveRoute = IMMERSIVE_PREFIXES.some((p) => location.pathname.startsWith(p));

  useEffect(() => {
    setImmersive(isImmersiveRoute);
  }, [isImmersiveRoute, setImmersive]);

  useEffect(() => {
    if (ready && isV2) {
      const v2BannedRoutes = ['/planner', '/discover', '/wardrobe'];
      if (v2BannedRoutes.some((r) => location.pathname.startsWith(r))) {
        navigate('/home', { replace: true });
      }
    }
  }, [location.pathname, isV2, ready, navigate]);

  if (!ready) {
    return (
      <div className="mobile-shell items-center justify-center">
          <div className="flex flex-col items-center gap-3 text-ink-subtle">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-ink/15 border-t-ink" />
            <p className="text-[13px]">Opening your wardrobe</p>
          </div>
        </div>
    );
  }

  const shouldHideBottomNav = hideBottomNavFromChrome || isV2;

  return (
    <div className="mobile-shell relative flex min-h-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <Outlet />
      </div>
      {!shouldHideBottomNav && (
        <BottomNav
          active={location.pathname}
          onNavigate={(to) => navigate(to)}
          onCreateOutfit={() => navigate('/create-outfit')}
        />
      )}
      <ToastHost />
    </div>
  );
}
