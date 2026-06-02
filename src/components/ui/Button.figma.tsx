// @ts-nocheck
/**
 * Code Connect: maps our `<Button>` to Myntra Fabric's Button component-set.
 *
 * Source of truth for the node id is the Fabric library file
 * (https://www.figma.com/design/vpZ4JeTx6eEhGh7gjTTnHo). To complete this
 * mapping interactively:
 *
 *   1. Open the Fabric library in Figma desktop
 *   2. Select the Button component-set frame
 *   3. Replace FIGMA_NODE_ID below with the node-id from the URL
 *      (convert dashes to colons: 1-23 -> 1:23)
 *   4. Run `npx figma connect publish` to push the mapping
 *
 * Variant names below mirror the property names exposed on Fabric's published
 * "Buttons v0.1" set. Adjust to match the live set when wiring up.
 */
import figma from '@figma/code-connect';
import { Button } from './Button';

figma.connect(
  Button,
  'https://www.figma.com/design/vpZ4JeTx6eEhGh7gjTTnHo/?node-id=FIGMA_NODE_ID',
  {
    props: {
      variant: figma.enum('Variant', {
        Primary: 'primary',
        Secondary: 'secondary',
        Tertiary: 'ghost',
        Danger: 'danger',
        Ink: 'ink',
      }),
      size: figma.enum('Size', { Sm: 'sm', Md: 'md', Lg: 'lg' }),
      children: figma.string('Label'),
      disabled: figma.boolean('Disabled'),
    },
    example: ({ variant, size, children, disabled }) => (
      <Button variant={variant} size={size} disabled={disabled}>
        {children}
      </Button>
    ),
  },
);
