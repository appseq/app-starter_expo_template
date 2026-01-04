import * as ImageManipulator from 'expo-image-manipulator';

interface ImageOptimizationOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number;
  format?: 'jpeg' | 'png';
}

class ImageService {
  /**
   * Optimize image for upload - resizes and compresses to stay under size limits
   */
  async optimizeForUpload(
    imageUri: string,
    options: ImageOptimizationOptions = {}
  ): Promise<{ base64: string; sizeKB: number }> {
    try {
      const {
        maxWidth = 1920,  // Reduced from default to ensure smaller file size
        maxHeight = 1920,
        quality = 0.8,    // Reduced quality for smaller file size
        format = 'jpeg'
      } = options;

      console.log('Optimizing image for upload...');
      
      // First, resize the image to reasonable dimensions
      let manipulatorResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: maxWidth,
              height: maxHeight,
            },
          },
        ],
        {
          compress: quality,
          format: format === 'png' ? ImageManipulator.SaveFormat.PNG : ImageManipulator.SaveFormat.JPEG,
          base64: true,
        }
      );

      if (!manipulatorResult.base64) {
        throw new Error('Failed to convert image to base64');
      }

      let base64 = manipulatorResult.base64;
      let sizeKB = Math.round((base64.length * 0.75) / 1024);
      
      console.log(`Initial image size: ${sizeKB} KB`);
      
      // If still too large, progressively reduce quality and size
      let currentQuality = quality;
      let currentMaxDimension = Math.min(maxWidth, maxHeight);
      
      while (sizeKB > 2048 && currentQuality > 0.3) { // Target 2MB max
        currentQuality -= 0.1;
        currentMaxDimension = Math.round(currentMaxDimension * 0.8);
        
        console.log(`Image too large (${sizeKB} KB), reducing quality to ${currentQuality} and max dimension to ${currentMaxDimension}`);
        
        manipulatorResult = await ImageManipulator.manipulateAsync(
          imageUri,
          [
            {
              resize: {
                width: currentMaxDimension,
                height: currentMaxDimension,
              },
            },
          ],
          {
            compress: currentQuality,
            format: ImageManipulator.SaveFormat.JPEG, // Always use JPEG for smaller size
            base64: true,
          }
        );
        
        if (!manipulatorResult.base64) {
          throw new Error('Failed to convert image to base64');
        }
        
        base64 = manipulatorResult.base64;
        sizeKB = Math.round((base64.length * 0.75) / 1024);
      }
      
      if (sizeKB > 4096) {
        throw new Error('Image is too large even after compression. Please use a smaller image.');
      }
      
      console.log(`Final optimized image size: ${sizeKB} KB`);
      
      return { base64, sizeKB };
    } catch (error: any) {
      console.error('Image optimization error:', error);
      throw new Error(`Failed to optimize image: ${error.message}`);
    }
  }

  /**
   * Create a thumbnail for collection display
   */
  async createThumbnail(imageUri: string): Promise<string> {
    try {
      console.log('Creating thumbnail...');
      
      const manipulatorResult = await ImageManipulator.manipulateAsync(
        imageUri,
        [
          {
            resize: {
              width: 300,
              height: 300,
            },
          },
        ],
        {
          compress: 0.7,
          format: ImageManipulator.SaveFormat.JPEG,
        }
      );
      
      return manipulatorResult.uri;
    } catch (error) {
      console.error('Thumbnail creation failed, using original:', error);
      return imageUri;
    }
  }

  /**
   * Validate image before processing
   */
  async validateImage(imageUri: string): Promise<{ valid: boolean; error?: string }> {
    try {
      // Basic validation - check if URI exists and is accessible
      const response = await fetch(imageUri, { method: 'HEAD' });
      
      if (!response.ok) {
        return {
          valid: false,
          error: 'Image file not accessible.',
        };
      }

      // Check content type
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.startsWith('image/')) {
        return {
          valid: false,
          error: 'Invalid image format. Please use JPEG or PNG.',
        };
      }

      return { valid: true };
    } catch (error) {
      return {
        valid: false,
        error: 'Invalid image format. Please use JPEG or PNG.',
      };
    }
  }

  /**
   * Get image dimensions and size info
   */
  async getImageInfo(imageUri: string): Promise<{
    width: number;
    height: number;
    aspectRatio: number;
  }> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        resolve({
          width: img.width,
          height: img.height,
          aspectRatio: img.width / img.height,
        });
      };
      img.onerror = () => reject(new Error('Failed to get image information'));
      img.src = imageUri;
    });
  }
}

// Export singleton instance
export const imageService = new ImageService();

// Export types
export type { ImageOptimizationOptions };