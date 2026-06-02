// @ts-nocheck
/**
 * Code Connect: project-local mapping for our wardrobe BottomNav.
 *
 * This component is wardrobe-specific (not Fabric), so the node lives in the
 * project Figma file (pAg1GnIlWiHeMF7IlXd3Jy). Replace FIGMA_NODE_ID with the
 * node-id of the BottomNav frame when wiring up.
 */
import figma from '@figma/code-connect';
import { BottomNav } from './BottomNav';

figma.connect(
  BottomNav,
  'https://www.figma.com/design/pAg1GnIlWiHeMF7IlXd3Jy/?node-id=FIGMA_NODE_ID',
  {
    props: {
      active: figma.enum('Active tab', {
        Closet: '/wardrobe',
        Studio: '/studio',
        Planner: '/planner',
      }),
    },
    example: ({ active }) => <BottomNav active={active} onNavigate={() => {}} />,
  },
);
