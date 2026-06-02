import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from './layout';
import { Home } from '@/pages/Home';
import { WardrobeHome } from '@/pages/WardrobeHome';
import { CreateOutfit } from '@/pages/CreateOutfit';
import { AddItem } from '@/pages/AddItem';
import { Studio, RedirectToStudio } from '@/pages/Studio';
import { OutfitDetail } from '@/pages/OutfitDetail';
import { CuratedLookPage } from '@/pages/CuratedLookPage';
import { PlannerMonth } from '@/pages/PlannerMonth';
import { PlannerWeek } from '@/pages/PlannerWeek';
import { TryOnStudio } from '@/pages/TryOnStudio';
import { Onboarding } from '@/pages/Onboarding';
import { OnboardingGate } from './OnboardingGate';
import { Discover } from '@/pages/Discover';

export const router = createBrowserRouter(
  [
  {
    element: <AppLayout />,
    children: [
      { path: '/onboarding', element: <Onboarding /> },
      {
        element: <OnboardingGate />,
        children: [
          { path: '/', element: <Navigate to="/home" replace /> },
          { path: '/home', element: <Home /> },
          { path: '/wardrobe', element: <WardrobeHome /> },
          { path: '/create-outfit', element: <CreateOutfit /> },
          { path: '/wardrobe/add', element: <AddItem /> },
          { path: '/studio', element: <Studio /> },
          { path: '/studio/collage', element: <RedirectToStudio /> },
          { path: '/studio/dressing-room', element: <RedirectToStudio /> },
          { path: '/studio/try-on', element: <TryOnStudio /> },
          { path: '/try-on', element: <TryOnStudio /> },
          { path: '/look/:id', element: <CuratedLookPage /> },
          { path: '/outfit/:id', element: <OutfitDetail /> },
          { path: '/discover', element: <Discover /> },
          { path: '/planner', element: <PlannerWeek /> },
          { path: '/planner/month', element: <PlannerMonth /> },
          { path: '*', element: <Navigate to="/home" replace /> },
        ],
      },
    ],
  },
  ],
  { basename: import.meta.env.BASE_URL },
);
