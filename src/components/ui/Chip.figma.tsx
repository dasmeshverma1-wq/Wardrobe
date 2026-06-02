// @ts-nocheck
/**
 * Code Connect: maps our `<Chip>` to Myntra Fabric's Pill / Chip component-set.
 *
 * Source library: Fabric "Pills v0.1" (file vpZ4JeTx6eEhGh7gjTTnHo).
 * Set FIGMA_NODE_ID to the Pill component-set node-id when wiring up.
 *
 * Visual contract:
 *   - radius 16 (NOT 999)
 *   - selected = 2px Watermelon/600 border + Watermelon/100 bg + Watermelon/600 text
 *   - default  = 1px Grey/100 hairline + Grey/600 text
 */
import figma from '@figma/code-connect';
import { Chip } from './Chip';

figma.connect(
  Chip,
  'https://www.figma.com/design/vpZ4JeTx6eEhGh7gjTTnHo/?node-id=FIGMA_NODE_ID',
  {
    props: {
      active: figma.enum('State', { Default: false, Selected: true }),
      size: figma.enum('Size', { Sm: 'sm', Md: 'md' }),
      children: figma.string('Label'),
      count: figma.boolean('Show count', { true: 12, false: undefined }),
    },
    example: ({ active, size, children, count }) => (
      <Chip active={active} size={size} count={count}>
        {children}
      </Chip>
    ),
  },
);
