'use client'

import { ThemeProvider } from 'styled-components'
import {
  BorderRadiusEnum,
  BorderSizeEnum,
  BorderTypeEnum,
  BreakpointsEnum,
  ColorsEnum,
  ColorsToneEnum,
  FontWeightEnum,
  ShadowsEnum,
  SpacingEnum,
  TypographyEnum,
  ZIndexEnum,
} from '@/types/cssTypes'
import { IChildrenNode } from '@/types/propTypes'
import { Fonts } from './Fonts'
import { GlobalStyles } from './GlobalStyles'

// weights
const fontWeightMap = {
  [FontWeightEnum.bold]: 700,
  [FontWeightEnum.medium]: 600,
  [FontWeightEnum.normal]: 400,
}

// heights used in constants
export const defaultHeights = {
  navbarHeight: 72,
  navbarwithBreadcrumbsHeight: 84,
  pageTitleHeight: 68,
  tableHeadHeight: 56,
  paginationHeight: 44,
  breadcrumbHeight: 62,
}

// helpers
const typography = (fontSize: number, lineHeight: number, fontWeight: FontWeightEnum): string =>
  `font-size: ${fontSize}rem; line-height: ${lineHeight}rem; font-weight: ${fontWeightMap[fontWeight]};`

const themeConstant = (valueInPixels: number): string => `${valueInPixels * 0.0625}rem`

const breakpoints = (maxWidth: number, columns: number, gap: number, margin: number): string => `
display: grid;
max-width: ${maxWidth}px;
grid-template-columns: repeat(${columns}, auto);
grid-column-gap: ${gap}px;
margin: 0px ${margin}px;
`

// NOTE: use ColorsToneEnum.neutral for solid UI elements like buttons (paired with white text/icons)
const border = (size: number, type: BorderTypeEnum, color: ColorsEnum, colorTone: ColorsToneEnum): string =>
  `${size}px ${type} ${theme.colors[color][colorTone]}`

export const theme = {
  borderRadius: {
    [BorderRadiusEnum.normal]: '0.25rem', // 4px
    [BorderRadiusEnum.rounded]: '0.5rem', // 8px
    [BorderRadiusEnum.circle]: '50%',     // circle
  },

  spacing: {
    [SpacingEnum.xxxs]: '0.25rem', // 4px
    [SpacingEnum.xxs]:  '0.5rem',  // 8px
    [SpacingEnum.xs]:   '0.75rem', // 12px
    [SpacingEnum.s]:    '1rem',    // 16px
    [SpacingEnum.m]:    '1.25rem', // 20px
    [SpacingEnum.l]:    '1.5rem',  // 24px
    [SpacingEnum.xl]:   '1.75rem', // 28px
    [SpacingEnum.xxl]:  '2rem',    // 32px
    [SpacingEnum.xxxl]: '2.25rem', // 36px
  },

  // ---- Color System (soft, modern; strong neutrals for surfaces; vivid-enough neutrals for white-on-color buttons) ----
  colors: {
    // Indigo/Periwinkle primary — excellent for white text
    [ColorsEnum.primary]: {
      [ColorsToneEnum.darker]:   '#1B2A6B',
      [ColorsToneEnum.dark]:     '#2B3F8F',
      [ColorsToneEnum.neutral]:  '#5271FF', // use this for solid primary buttons (white text/icons)
      [ColorsToneEnum.light]:    '#DCE3FF',
      [ColorsToneEnum.lighter]:  '#E8EDFF',
      [ColorsToneEnum.lightest]: '#F5F7FF',
    },

    // Warm Apricot secondary — friendly CTA/secondary emphasis
    [ColorsEnum.secondary]: {
      [ColorsToneEnum.darker]:   '#7A3E1D',
      [ColorsToneEnum.dark]:     '#9A542D',
      [ColorsToneEnum.neutral]:  '#F5A97F', // good with white icons/text
      [ColorsToneEnum.light]:    '#FFE1CF',
      [ColorsToneEnum.lighter]:  '#FFEADB',
      [ColorsToneEnum.lightest]: '#FFF6F2',
    },

    // Mint/Aqua tertiary — positive and fresh
    [ColorsEnum.tertiary]: {
      [ColorsToneEnum.darker]:   '#0D4A46',
      [ColorsToneEnum.dark]:     '#10635C',
      [ColorsToneEnum.neutral]:  '#4FC3B3', // good with white text/icons
      [ColorsToneEnum.light]:    '#CFEFEB',
      [ColorsToneEnum.lighter]:  '#E4F7F4',
      [ColorsToneEnum.lightest]: '#F3FCFB',
    },

    // Neutral greys — cool, readable
    [ColorsEnum.grey]: {
      [ColorsToneEnum.darker]:   '#0F172A',
      [ColorsToneEnum.dark]:     '#475569',
      [ColorsToneEnum.neutral]:  '#94A3B8',
      [ColorsToneEnum.light]:    '#CBD5E1',
      [ColorsToneEnum.lighter]:  '#E2E8F0',
      [ColorsToneEnum.lightest]: '#F8FAFC',
    },

    // Semantic: Success (green)
    [ColorsEnum.success]: {
      [ColorsToneEnum.darker]:   '#0E4A2F',
      [ColorsToneEnum.dark]:     '#156A42',
      [ColorsToneEnum.neutral]:  '#45B97C', // passes with white
      [ColorsToneEnum.light]:    '#C6EBD7',
      [ColorsToneEnum.lighter]:  '#E6F7EF',
      [ColorsToneEnum.lightest]: '#F6FCF9',
    },

    // Semantic: Warning (amber)
    [ColorsEnum.warning]: {
      [ColorsToneEnum.darker]:   '#5A3C0E',
      [ColorsToneEnum.dark]:     '#7A5314',
      [ColorsToneEnum.neutral]:  '#E5B55B', // white readable
      [ColorsToneEnum.light]:    '#FFE6B3',
      [ColorsToneEnum.lighter]:  '#FFF1D1',
      [ColorsToneEnum.lightest]: '#FFF9EC',
    },

    // Semantic: Error (rose/red)
    [ColorsEnum.error]: {
      [ColorsToneEnum.darker]:   '#6E0F17',
      [ColorsToneEnum.dark]:     '#961F28',
      [ColorsToneEnum.neutral]:  '#E66868', // white readable
      [ColorsToneEnum.light]:    '#F9C8C8',
      [ColorsToneEnum.lighter]:  '#FDE8E8',
      [ColorsToneEnum.lightest]: '#FFF7F7',
    },

    // Semantic: Info (azure)
    [ColorsEnum.info]: {
      [ColorsToneEnum.darker]:   '#154B8F',
      [ColorsToneEnum.dark]:     '#1F6FD3',
      [ColorsToneEnum.neutral]:  '#3D9BFA', // white readable
      [ColorsToneEnum.light]:    '#CFE8FF',
      [ColorsToneEnum.lighter]:  '#E8F3FF',
      [ColorsToneEnum.lightest]: '#F5FAFF',
    },

    // Background & text neutrals (UI canvas)
    [ColorsEnum.neutral]: {
      [ColorsToneEnum.darker]:   '#1F2937',
      [ColorsToneEnum.dark]:     '#374151',
      [ColorsToneEnum.neutral]:  '#6B7280',
      [ColorsToneEnum.light]:    '#F3F4F6',
      [ColorsToneEnum.lighter]:  '#FAFAFB',
      [ColorsToneEnum.lightest]: '#FFFFFF',
    },
  },

  borders: {
    [BorderSizeEnum.s]: {
      [BorderTypeEnum.solid]: (color: ColorsEnum, tone: ColorsToneEnum) => border(1, BorderTypeEnum.solid, color, tone),
      [BorderTypeEnum.dashed]: (color: ColorsEnum, tone: ColorsToneEnum) => border(1, BorderTypeEnum.dashed, color, tone),
    },
    [BorderSizeEnum.m]: {
      [BorderTypeEnum.solid]: (color: ColorsEnum, tone: ColorsToneEnum) => border(2, BorderTypeEnum.solid, color, tone),
      [BorderTypeEnum.dashed]: (color: ColorsEnum, tone: ColorsToneEnum) => border(2, BorderTypeEnum.dashed, color, tone),
    },
    [BorderSizeEnum.l]: {
      [BorderTypeEnum.solid]: (color: ColorsEnum, tone: ColorsToneEnum) => border(4, BorderTypeEnum.solid, color, tone),
      [BorderTypeEnum.dashed]: (color: ColorsEnum, tone: ColorsToneEnum) => border(4, BorderTypeEnum.dashed, color, tone),
    },
  },

  fontWeight: {
    ...fontWeightMap,
  },

  fontFamily: {
    openSans: 'Open Sans',
    roboto: "'Roboto', sans-serif",
    milliard: "'Milliard', sans-serif",
  },

  // Typography scale (in rems)
  typography: {
    [TypographyEnum.h1]: {
      [FontWeightEnum.normal]: typography(2.25, 3.5, FontWeightEnum.normal), // 36 / 56
      [FontWeightEnum.medium]: typography(2.25, 3.5, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(2.25, 3.5, FontWeightEnum.bold),
    },
    [TypographyEnum.h2]: {
      [FontWeightEnum.normal]: typography(2, 3, FontWeightEnum.normal), // 32 / 48
      [FontWeightEnum.medium]: typography(2, 3, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(2, 3, FontWeightEnum.bold),
    },
    [TypographyEnum.h3]: {
      [FontWeightEnum.normal]: typography(1.75, 2.5, FontWeightEnum.normal), // 28 / 40
      [FontWeightEnum.medium]: typography(1.75, 2.5, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(1.75, 2.5, FontWeightEnum.bold),
    },
    [TypographyEnum.h4]: {
      [FontWeightEnum.normal]: typography(1.5, 2.25, FontWeightEnum.normal), // 24 / 36
      [FontWeightEnum.medium]: typography(1.5, 2.25, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(1.5, 2.25, FontWeightEnum.bold),
    },
    [TypographyEnum.h5]: {
      [FontWeightEnum.normal]: typography(1.25, 1.75, FontWeightEnum.normal), // 20 / 28
      [FontWeightEnum.medium]: typography(1.25, 1.75, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(1.25, 1.75, FontWeightEnum.bold),
    },
    [TypographyEnum.h6]: {
      [FontWeightEnum.normal]: typography(1.125, 1.5, FontWeightEnum.normal), // 18 / 24
      [FontWeightEnum.medium]: typography(1.125, 1.5, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(1.125, 1.5, FontWeightEnum.bold),
    },
    [TypographyEnum.m]: {
      [FontWeightEnum.normal]: typography(1, 1.5, FontWeightEnum.normal), // 16 / 24
      [FontWeightEnum.medium]: typography(1, 1.5, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(1, 1.5, FontWeightEnum.bold),
    },
    [TypographyEnum.s]: {
      [FontWeightEnum.normal]: typography(0.875, 1, FontWeightEnum.normal), // 14 / 16
      [FontWeightEnum.medium]: typography(0.875, 1, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(0.875, 1, FontWeightEnum.bold),
    },
    [TypographyEnum.xs]: {
      [FontWeightEnum.normal]: typography(0.75, 1, FontWeightEnum.normal), // 12 / 16
      [FontWeightEnum.medium]: typography(0.75, 1, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(0.75, 1, FontWeightEnum.bold),
    },
    [TypographyEnum.xxs]: {
      [FontWeightEnum.normal]: typography(0.625, 1, FontWeightEnum.normal), // 10 / 16
      [FontWeightEnum.medium]: typography(0.625, 1, FontWeightEnum.medium),
      [FontWeightEnum.bold]:   typography(0.625, 1, FontWeightEnum.bold),
    },
  },

  constants: {
    navbarHeight: themeConstant(defaultHeights.navbarHeight),
    navbarwithBreadcrumbsHeight: themeConstant(defaultHeights.navbarwithBreadcrumbsHeight),
    pageTitleHeight: themeConstant(defaultHeights.pageTitleHeight),
    tableHeadHeight: themeConstant(defaultHeights.tableHeadHeight),
    paginationHeight: themeConstant(defaultHeights.paginationHeight),
    breadcrumbHeight: themeConstant(defaultHeights.breadcrumbHeight),
  },

  breakpoints: {
    [BreakpointsEnum.s]: breakpoints(320, 4, 24, 16),
    [BreakpointsEnum.m]: breakpoints(768, 8, 24, 24),
    [BreakpointsEnum.l]: breakpoints(1440, 12, 24, 24),
  },

  shadows: {
    [ShadowsEnum.normal]:  '0px 4px 8px rgba(0, 0, 0, 0.04)',
    [ShadowsEnum.light]:   '0px 8px 14px rgba(0, 0, 0, 0.06)',
    [ShadowsEnum.lighter]: '0px 8px 16px rgba(0, 0, 0, 0.10)',
    [ShadowsEnum.intense]: '0px 12px 24px rgba(0, 0, 0, 0.20)',
  },

  zIndex: {
    [ZIndexEnum.blackHole]: -9999,
    [ZIndexEnum.low]: 1,
    [ZIndexEnum.sticky]: 100,
    [ZIndexEnum.overlay]: 800,
    [ZIndexEnum.modal]: 900,
    [ZIndexEnum.topOfTheWorld]: 10000,
  },

  util: {
    constants: { pixelToRem: 0.0625 },
    pixelToRem(pixels: number): string {
      return `${this.constants.pixelToRem * pixels}rem`
    },
    // calc(100vh - x) - x - x ...
    subtractFromAbsoluteViewportHeight(unit: string, multiplier: number): string {
      return Array.from({ length: multiplier - 1 }).reduce(
        (acc: string) => `calc(${acc} - ${unit})`,
        `calc(100vh - ${unit})`,
      )
    },
  },
}

// Provider
export const Theme = ({ children }: IChildrenNode) => (
  <ThemeProvider theme={theme}>
    <>
      <Fonts />
      <GlobalStyles />
      {children}
    </>
  </ThemeProvider>
)

export type ThemeType = typeof theme
