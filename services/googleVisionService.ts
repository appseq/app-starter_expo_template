import * as FileSystem from 'expo-file-system';
import { APP_CONFIG } from '@/constants/appConfig';

/**
 * Google Cloud Vision API response types
 */
interface VisionLabel {
  description: string;
  score: number;
  topicality?: number;
}

interface VisionObject {
  name: string;
  score: number;
}

interface VisionResponse {
  responses: Array<{
    labelAnnotations?: VisionLabel[];
    localizedObjectAnnotations?: VisionObject[];
    error?: {
      code: number;
      message: string;
    };
  }>;
}

/**
 * GoogleVisionService - Analyzes images using Google Cloud Vision API
 *
 * Uses label detection and object localization to extract visual attributes
 * from jewelry images, improving search accuracy.
 *
 * FREE tier: 1,000 units/month
 */
class GoogleVisionService {
  private static instance: GoogleVisionService;

  private readonly API_URL = 'https://vision.googleapis.com/v1/images:annotate';
  private readonly TIMEOUT_MS = 15000;
  private readonly MIN_CONFIDENCE = 0.6;
  private readonly MAX_LABELS = 10;

  private constructor() {
    // Private constructor for singleton
  }

  /**
   * Get singleton instance
   */
  static getInstance(): GoogleVisionService {
    if (!GoogleVisionService.instance) {
      GoogleVisionService.instance = new GoogleVisionService();
    }
    return GoogleVisionService.instance;
  }

  /**
   * Check if Vision API is configured and enabled
   */
  isEnabled(): boolean {
    const config = APP_CONFIG.googleVision;
    return config?.enabled && !!config?.apiKey;
  }

  /**
   * Get image labels from Google Cloud Vision API
   *
   * @param imageUri - Local file URI or base64 string
   * @returns Array of descriptive labels (e.g., ["diamond", "ring", "vintage"])
   */
  async getImageLabels(imageUri: string): Promise<string[]> {
    if (!this.isEnabled()) {
      console.log('[GoogleVisionService] Vision API not configured, skipping');
      return [];
    }

    try {
      // Convert image to base64 if it's a file URI
      const base64Image = await this.getBase64FromUri(imageUri);
      if (!base64Image) {
        console.error('[GoogleVisionService] Failed to convert image to base64');
        return [];
      }

      console.log('[GoogleVisionService] Analyzing image with Vision API...');

      // Call Vision API
      const response = await this.callVisionAPI(base64Image);

      // Extract labels
      const labels = this.extractLabels(response);
      console.log(`[GoogleVisionService] Found ${labels.length} labels:`, labels.slice(0, 5));

      return labels;

    } catch (error) {
      console.error('[GoogleVisionService] Error analyzing image:', error);
      return [];
    }
  }

  /**
   * Get base64 string from image URI
   */
  private async getBase64FromUri(imageUri: string): Promise<string | null> {
    try {
      // If already base64 (starts with data: or is long string without file://)
      if (imageUri.startsWith('data:')) {
        // Extract base64 part from data URL
        const base64Match = imageUri.match(/base64,(.+)/);
        return base64Match ? base64Match[1] : null;
      }

      // If it's a file URI, read and convert to base64
      if (imageUri.startsWith('file://') || imageUri.startsWith('/')) {
        const base64 = await FileSystem.readAsStringAsync(imageUri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        return base64;
      }

      // If it's a remote URL, we can't process it directly
      // (would need to download first)
      console.log('[GoogleVisionService] Unsupported image URI format');
      return null;

    } catch (error) {
      console.error('[GoogleVisionService] Error reading image:', error);
      return null;
    }
  }

  /**
   * Call Google Cloud Vision API
   */
  private async callVisionAPI(base64Image: string): Promise<VisionResponse> {
    const config = APP_CONFIG.googleVision;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.TIMEOUT_MS);

    try {
      const response = await fetch(`${this.API_URL}?key=${config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          requests: [
            {
              image: {
                content: base64Image,
              },
              features: [
                {
                  type: 'LABEL_DETECTION',
                  maxResults: this.MAX_LABELS,
                },
                {
                  type: 'OBJECT_LOCALIZATION',
                  maxResults: 5,
                },
              ],
            },
          ],
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[GoogleVisionService] API error:', response.status, errorText);
        throw new Error(`Vision API error: ${response.status}`);
      }

      const data: VisionResponse = await response.json();

      // Check for API-level errors
      if (data.responses?.[0]?.error) {
        const error = data.responses[0].error;
        console.error('[GoogleVisionService] API returned error:', error.message);
        throw new Error(error.message);
      }

      return data;

    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Vision API request timed out');
      }
      throw error;
    }
  }

  /**
   * Extract labels from Vision API response
   */
  private extractLabels(response: VisionResponse): string[] {
    const labels: string[] = [];
    const seen = new Set<string>();

    const result = response.responses?.[0];
    if (!result) return labels;

    // Extract from label annotations (general labels)
    if (result.labelAnnotations) {
      for (const label of result.labelAnnotations) {
        if (label.score >= this.MIN_CONFIDENCE) {
          const normalized = label.description.toLowerCase();
          if (!seen.has(normalized)) {
            seen.add(normalized);
            labels.push(label.description);
          }
        }
      }
    }

    // Extract from object annotations (specific objects detected)
    if (result.localizedObjectAnnotations) {
      for (const obj of result.localizedObjectAnnotations) {
        if (obj.score >= this.MIN_CONFIDENCE) {
          const normalized = obj.name.toLowerCase();
          if (!seen.has(normalized)) {
            seen.add(normalized);
            labels.push(obj.name);
          }
        }
      }
    }

    // Filter to jewelry-relevant labels and prioritize
    return this.prioritizeJewelryLabels(labels);
  }

  /**
   * Prioritize jewelry-relevant labels
   */
  private prioritizeJewelryLabels(labels: string[]): string[] {
    // Keywords that are most relevant for jewelry search
    const highPriority = [
      'diamond', 'ring', 'necklace', 'bracelet', 'earring', 'pendant',
      'gold', 'silver', 'platinum', 'pearl', 'ruby', 'sapphire', 'emerald',
      'vintage', 'antique', 'art deco', 'victorian', 'engagement',
      'wedding', 'gemstone', 'crystal', 'brooch', 'watch',
    ];

    const mediumPriority = [
      'jewelry', 'jewellery', 'accessory', 'ornament', 'fashion',
      'metal', 'stone', 'gem', 'bead', 'chain', 'band',
    ];

    // Keywords to filter out (not useful for jewelry search)
    const filterOut = [
      'fashion accessory', 'body jewelry', 'close-up', 'macro',
      'photography', 'still life', 'product', 'object',
    ];

    // Score and sort labels
    const scored = labels
      .filter(label => {
        const lower = label.toLowerCase();
        return !filterOut.some(f => lower.includes(f));
      })
      .map(label => {
        const lower = label.toLowerCase();
        let score = 0;
        if (highPriority.some(p => lower.includes(p))) score = 2;
        else if (mediumPriority.some(p => lower.includes(p))) score = 1;
        return { label, score };
      })
      .sort((a, b) => b.score - a.score);

    return scored.map(s => s.label).slice(0, this.MAX_LABELS);
  }
}

// Export singleton instance
export const googleVisionService = GoogleVisionService.getInstance();

// Export class for testing
export { GoogleVisionService };
