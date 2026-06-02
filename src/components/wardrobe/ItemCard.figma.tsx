// @ts-nocheck
import figma from '@figma/code-connect';
import { ItemCard } from './ItemCard';

figma.connect(
  ItemCard,
  'https://www.figma.com/design/pAg1GnIlWiHeMF7IlXd3Jy/?node-id=FIGMA_NODE_ID',
  {
    props: {
      selectable: figma.boolean('Selectable'),
      selected: figma.boolean('Selected'),
    },
    example: ({ selectable, selected }) => (
      <ItemCard
        item={{
          id: 'demo',
          imageBlobKey: '',
          thumbnailDataUrl: '/favicon.svg',
          category: 'tops',
          source: 'seed',
          addedAt: 0,
        }}
        selectable={selectable}
        selected={selected}
      />
    ),
  },
);
