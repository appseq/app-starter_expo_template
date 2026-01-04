import * as WebBrowser from 'expo-web-browser';

/**
 * Opens a URL in the in-app browser (Safari View Controller on iOS, Custom Tabs on Android).
 * Provides better UX than opening external browser - user stays in app context.
 */
export async function openInAppBrowser(url: string): Promise<void> {
  if (!url || typeof url !== 'string') {
    console.warn('[Browser] Invalid URL provided:', url);
    return;
  }

  try {
    const urlObj = new URL(url);
    if (!['http:', 'https:'].includes(urlObj.protocol)) {
      console.warn('[Browser] Unsupported protocol:', urlObj.protocol);
      return;
    }

    await WebBrowser.openBrowserAsync(url, {
      presentationStyle: WebBrowser.WebBrowserPresentationStyle.AUTOMATIC,
      dismissButtonStyle: 'close',
    });
  } catch (error) {
    console.error('[Browser] Failed to open URL:', url, error);
  }
}
