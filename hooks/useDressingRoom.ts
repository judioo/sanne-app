import { useState } from 'react';
import { trpc } from '../utils/trpc';
import md5 from 'md5';

interface DressingRoomResult {
  TOIUrl: string;
  uploadImgUrl: string;
  isProcessing: boolean;
}

/**
 * Custom hook to handle the "To The Dressing Room" feature
 * Uploads an image and generates a virtual try-on preview
 */
export function useDressingRoom() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<DressingRoomResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const dressingRoomMutation = trpc.products.toDressingRoom.useMutation({
    onSuccess: (data) => {
      setResult({
        ...data,
        isProcessing: true  // Initially true, client can poll or assume processing
      });
      setIsLoading(false);
      
      // Optional: Could set up polling here to check if image is ready
      // by attempting to fetch the TOIUrl periodically
    },
    onError: (err) => {
      setError(err.message || 'Failed to process image');
      setIsLoading(false);
    }
  });
  
  // Function to upload an image for virtual try-on
  const uploadToDressingRoom = async (
    imageFile: File,
    productId: number
  ): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Convert image to base64
      const base64Image = await fileToBase64(imageFile);
      
      // Calculate MD5 hash of the image
      const imgMD5 = md5(base64Image);
      
      // Call the TRPC mutation
      await dressingRoomMutation.mutateAsync({
        image: base64Image,
        imgMD5,
        productId
      });
    } catch (err: any) {
      setError(err.message || 'Failed to upload image');
      setIsLoading(false);
    }
  };
  
  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };
  
  return {
    uploadToDressingRoom,
    isLoading,
    result,
    error,
    reset: () => {
      setResult(null);
      setError(null);
    }
  };
}
