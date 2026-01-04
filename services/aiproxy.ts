import Constants from 'expo-constants';
import { APP_CONFIG } from '@/constants/appConfig';
import i18n from '@/locales';

// AIProxy configuration from centralized config
const PARTIAL_KEY = APP_CONFIG.services.aiproxy.partialKey;
const SERVICE_URL = APP_CONFIG.ai.serviceUrl;
const DEVICECHECK_BYPASS = APP_CONFIG.services.aiproxy.deviceCheckBypass;
const API_TIMEOUT = APP_CONFIG.ai.timeout;

interface ObjectIdentificationRequest {
  image: string; // Base64 encoded image
  prompt?: string;
}

interface ObjectIdentificationResponse {
  name: string;
  confidence: number;
  composition: string[];
  formation: string;
  locations: string[];
  uses: string[];
  funFact: string;
  description?: string;  // Brief description of the item
  // Additional jewelry-specific fields
  rarity?: string;
  gemstone?: string;
  caratWeight?: string;
  jewelryWeight?: string;
  estimatedValue?: string;  // AI-provided market value estimate
}

interface AIProxyError {
  error: string;
  code: string;
  statusCode: number;
  message?: string; // Optional message field
}

const getLocalizedError = (key: string, fallback: string): string => {
  try {
    const translated = i18n.t(key);
    return typeof translated === 'string' && translated !== key ? translated : fallback;
  } catch (error) {
    console.warn(`Failed to load translation for ${key}:`, error);
    return fallback;
  }
};

// Simple UUID generator for device ID
function generateSimpleUUID(): string {
  return 'device-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

class AIProxyService {
  private deviceId: string;
  private bundleId: string;

  constructor() {
    // Generate a simple device ID for rate limiting
    this.deviceId = Constants.deviceId || Constants.installationId || this.getOrCreateDeviceId();
    // Use bundle identifier from config
    this.bundleId = APP_CONFIG.ios.bundleIdentifier;
    
    console.log('AIProxy Service initialized:', {
      deviceId: this.deviceId,
      bundleId: this.bundleId,
      platform: Constants.platform
    });
  }

  private getOrCreateDeviceId(): string {
    // For web/development, use a consistent device ID
    if (Constants.platform?.web) {
      return 'web-dev-' + (Constants.sessionId || 'default');
    }
    
    // For mobile, generate a unique ID
    const newId = generateSimpleUUID();
    console.log('Generated device ID:', newId);
    return newId;
  }

  // Helper method to create proper image URL for OpenAI, similar to Swift example
  private createImageDataURL(imageBase64: string): string {
    return `data:image/jpeg;base64,${imageBase64}`;
  }

  private async makeRequest(endpoint: string, body: any): Promise<any> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

    // For AIProxy, we use the service URL directly with OpenAI endpoint paths
    const url = endpoint ? `${SERVICE_URL}${endpoint}` : SERVICE_URL;
    console.log('Making API request to:', url);
    console.log('Request headers:', {
      'aiproxy-partial-key': PARTIAL_KEY ? `${PARTIAL_KEY.slice(0, 10)}...` : 'NOT SET',
      'aiproxy-client-id': this.deviceId,
      'aiproxy-devicecheck-bypass': DEVICECHECK_BYPASS ? 'SET' : 'NOT SET',
    });

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'aiproxy-partial-key': PARTIAL_KEY,
          'aiproxy-client-id': this.deviceId,
          ...(DEVICECHECK_BYPASS && { 'aiproxy-devicecheck-bypass': DEVICECHECK_BYPASS }),
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorMessage = `Request failed with status ${response.status}`;
        try {
          const error = await response.json() as AIProxyError;
          console.error('API Error Response:', error);
          
          // Handle specific error codes
          if (response.status === 429) {
            errorMessage = 'OpenAI rate limit reached. Please wait a moment and try again.';
          } else if (response.status === 401) {
            errorMessage = 'Authentication failed. Please check your API configuration.';
          } else if (response.status === 400) {
            errorMessage = 'Invalid request. The image may be too large or in an unsupported format.';
          } else {
            errorMessage = error.error || error.message || errorMessage;
          }
        } catch (jsonError) {
          console.error('Failed to parse error response:', jsonError);
          if (response.status === 429) {
            errorMessage = 'Rate limit reached. Please try again in a few seconds.';
          }
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error: any) {
      clearTimeout(timeoutId);
      
      if (error.name === 'AbortError') {
        throw new Error('Request timeout. Please try again.');
      }
      
      throw error;
    }
  }

  private buildLocalizedPrompt(): string {
    const t = i18n.t.bind(i18n);

    // Build the prompt dynamically based on current language
    const prompt = `${t('ai.prompt.analyzeInstruction')}

${t('ai.prompt.jsonOnlyWarning')}

${t('ai.prompt.unableToIdentify.instruction')}
{
  "name": "${t('ai.prompt.unableToIdentify.name')}",
  "confidence": 0,
  "composition": [],
  "formation": "${t('ai.prompt.unableToIdentify.formationMessage')}",
  "locations": [],
  "uses": [],
  "funFact": "${t('ai.prompt.unableToIdentify.funFactMessage')}",
  "description": "Unable to provide description",
  "rarity": "common",
  "gemstone": "Unknown",
  "caratWeight": "Unknown",
  "jewelryWeight": "Unknown",
  "estimatedValue": "Unknown"
}

${t('ai.prompt.analyzableInstruction')}
{
  "name": "${t('ai.prompt.fields.name')}",
  "confidence": ${t('ai.prompt.fields.confidence')},
  "composition": ["${t('ai.prompt.fields.composition')}"],
  "formation": "${t('ai.prompt.fields.formation')}",
  "locations": ["${t('ai.prompt.fields.locations')}"],
  "uses": ["${t('ai.prompt.fields.uses')}"],
  "funFact": "${t('ai.prompt.fields.funFact')}",
  "description": "${t('ai.prompt.fields.description')}",
  "rarity": "${t('ai.prompt.fields.rarity')}",
  "gemstone": "${t('ai.prompt.fields.gemstone')}",
  "caratWeight": "${t('ai.prompt.fields.caratWeight')}",
  "jewelryWeight": "${t('ai.prompt.fields.jewelryWeight')}",
  "estimatedValue": "${t('ai.prompt.fields.estimatedValue')}"
}

${t('ai.prompt.responseLanguageInstruction')}`;

    return prompt;
  }

  async identify(imageBase64: string, retryCount = 0): Promise<ObjectIdentificationResponse> {
    const prompt = this.buildLocalizedPrompt();
    const currentLanguage = i18n.language || 'en';

    console.log(`Starting ${APP_CONFIG.ai.objectType} identification...`, {
      imageSize: imageBase64.length,
      partialKey: PARTIAL_KEY ? `${PARTIAL_KEY.substring(0, 10)}...` : 'NOT SET',
      language: currentLanguage,
      promptPreview: prompt.substring(0, 100) + '...'
    });

    if (__DEV__) {
      console.log('🌐 Localized AI Prompt:', prompt);
    }

    try {
      // Use direct HTTP request to AIProxy endpoint, similar to Swift example pattern
      const response = await this.makeRequest('/v1/chat/completions', {
        model: APP_CONFIG.ai.model,
        messages: [
          {
            role: 'user',
            content: [
              { type: 'text', text: prompt },
              { 
                type: 'image_url', 
                image_url: {
                  url: this.createImageDataURL(imageBase64),
                  detail: 'auto'  // Use 'auto' detail like the Swift example
                }
              }
            ]
          }
        ],
        max_tokens: APP_CONFIG.ai.maxTokens,
        temperature: APP_CONFIG.ai.temperature
      });

      // Parse the AI response
      console.log('API Response received:', response);
      const aiResponse = response.choices?.[0]?.message?.content;
      if (!aiResponse) {
        throw new Error('No response content from API');
      }
      console.log('AI Response content:', aiResponse);
      
      let parsedResponse;
      try {
        // Try to extract JSON from the response
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          throw new Error('No JSON found in response');
        }
      } catch (parseError) {
        console.error('Failed to parse JSON response:', parseError);
        
        // Check if the response indicates an image quality issue
        const lowerResponse = aiResponse.toLowerCase();
        if (lowerResponse.includes('black') || lowerResponse.includes('obscured') || 
            lowerResponse.includes('unclear') || lowerResponse.includes('unable to analyze')) {
          throw new Error(
            getLocalizedError(
              'ui.errors.imageQualityPoor',
              'Image quality insufficient. Please provide a clear, well-lit image.'
            )
          );
        }
        
        // Create a fallback response from plain text for other cases
        parsedResponse = {
          name: `Unknown ${APP_CONFIG.ai.objectType.charAt(0).toUpperCase() + APP_CONFIG.ai.objectType.slice(1)}`,
          confidence: 0,
          composition: [],
          formation: 'Unable to determine formation process',
          locations: [],
          uses: [],
          funFact: aiResponse.length > 100 ? aiResponse.slice(0, 100) + '...' : aiResponse
        };
      }

      // Validate and sanitize the response
      return this.validateResponse(parsedResponse);
    } catch (error: any) {
      console.error('AIProxy Error Details:', {
        message: error.message,
        stack: error.stack,
        name: error.name,
        retryCount
      });
      
      // Auto-retry once for rate limits with delay
      if (error.message.includes('rate limit') && retryCount === 0) {
        console.log('Rate limited. Retrying in 20 seconds...');
        await new Promise(resolve => setTimeout(resolve, 20000));  // 20 seconds for OpenAI rate limits
        return this.identify(imageBase64, retryCount + 1);
      }
      
      // Check for specific error types
      if (error.message.includes('rate limit') || error.message.includes('Rate limit')) {
        throw new Error('OpenAI rate limit reached. Please wait 20 seconds and try again.');
      }
      
      if (error.message.includes('timeout')) {
        throw new Error('Request timed out. Please try again.');
      }
      
      // Pass through the error message if it's already descriptive
      const identificationFailedMessage = getLocalizedError(
        'ui.errors.identificationFailed',
        'Failed to identify. Please try again.'
      );
      throw new Error(error.message || identificationFailedMessage);
    }
  }

  private validateResponse(data: any): ObjectIdentificationResponse {
    // Validate rarity against allowed values
    const validRarities = ['common', 'uncommon', 'rare', 'very_rare', 'legendary'];
    const normalizedRarity = data.rarity?.toLowerCase()?.replace(/\s+/g, '_');

    // Helper to check if a string value is valid (not unknown/none)
    const isValidStringValue = (value: any): boolean => {
      if (typeof value !== 'string') return false;
      const lower = value.toLowerCase().trim();
      return lower !== 'unknown' && lower !== 'none' && lower !== 'n/a' && lower.length > 0;
    };

    // Ensure all required fields exist with defaults
    return {
      name: data.name || `Unknown ${APP_CONFIG.ai.objectType.charAt(0).toUpperCase() + APP_CONFIG.ai.objectType.slice(1)}`,
      confidence: Math.min(100, Math.max(0, data.confidence || 50)),
      composition: Array.isArray(data.composition) ? data.composition.slice(0, 6) : [],
      formation: data.formation || 'Formation process unknown',
      locations: Array.isArray(data.locations) ? data.locations.slice(0, 3) : [],
      uses: Array.isArray(data.uses) ? data.uses.slice(0, 4) : [],
      funFact: data.funFact || `This ${APP_CONFIG.ai.objectType} has unique properties worth studying!`,
      description: isValidStringValue(data.description) ? data.description : undefined,
      // Additional jewelry-specific fields with defensive validation
      rarity: validRarities.includes(normalizedRarity) ? normalizedRarity : undefined,
      gemstone: isValidStringValue(data.gemstone) ? data.gemstone : undefined,
      caratWeight: isValidStringValue(data.caratWeight) ? data.caratWeight : undefined,
      jewelryWeight: isValidStringValue(data.jewelryWeight) ? data.jewelryWeight : undefined,
      estimatedValue: isValidStringValue(data.estimatedValue) ? data.estimatedValue : undefined,
    };
  }

  // Check if AIProxy is properly configured
  isConfigured(): boolean {
    const isValid = !!PARTIAL_KEY && 
                   PARTIAL_KEY !== 'your_partial_key_here' && 
                   PARTIAL_KEY !== 'demo_mode_key' &&
                   PARTIAL_KEY.startsWith('v2|');  // AIProxy keys start with v2|
    
    console.log('AIProxy Config Check:', {
      partialKey: PARTIAL_KEY ? `${PARTIAL_KEY.substring(0, 10)}...` : 'NOT SET',
      serviceURL: SERVICE_URL,
      isValid
    });
    
    return isValid;
  }

  // Get current device ID for debugging
  getDeviceInfo() {
    return {
      deviceId: this.deviceId,
      bundleId: this.bundleId,
      platform: Constants.platform?.ios ? 'ios' : 'android',
      appVersion: Constants.expoConfig?.version,
    };
  }
}

// Export singleton instance
export const aiProxyService = new AIProxyService();

// Export types
export type { ObjectIdentificationRequest, ObjectIdentificationResponse, AIProxyError };
