/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

import { Platform } from 'react-native';

const tintColorLight = '#5bc3bb'; // Icon variation 1 (Primary Accent)
const tintColorDark = '#5bc3bb';

export const Colors = {
  light: {
    text: '#2c3444', // Dark background color used for text in light mode
    background: '#f1f1f1', // Logo letters color used for background in light mode
    tint: tintColorLight,
    icon: '#747c86', // Icon variation 3
    tabIconDefault: '#8c949c', // Icon variation 2
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#f1f1f1', // Logo letters
    background: '#2c3444', // Background color
    tint: tintColorDark,
    icon: '#8c949c', // Icon variation 2
    tabIconDefault: '#747c86', // Icon variation 3
    tabIconSelected: tintColorDark,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});
