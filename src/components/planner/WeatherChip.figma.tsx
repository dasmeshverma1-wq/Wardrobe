// @ts-nocheck
import figma from '@figma/code-connect';
import { WeatherChip } from './WeatherChip';

figma.connect(
  WeatherChip,
  'https://www.figma.com/design/pAg1GnIlWiHeMF7IlXd3Jy/?node-id=FIGMA_NODE_ID',
  {
    props: {
      size: figma.enum('Size', { Sm: 'sm', Md: 'md' }),
      condition: figma.enum('Condition', {
        Sunny: 'sunny',
        Cloudy: 'cloudy',
        Rainy: 'rainy',
        Stormy: 'stormy',
        Snowy: 'snowy',
      }),
    },
    example: ({ size, condition }) => (
      <WeatherChip
        size={size}
        forecast={{ date: '2026-06-01', tempMaxC: 27, tempMinC: 21, precipMm: 0, condition }}
      />
    ),
  },
);
