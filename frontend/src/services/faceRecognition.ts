import * as faceapi from 'face-api.js';

class FaceRecognitionService {
  private modelsLoaded = false;
  private modelPath = '/models';

  async loadModels(): Promise<void> {
    if (this.modelsLoaded) return;

    try {
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(this.modelPath),
        faceapi.nets.faceLandmark68Net.loadFromUri(this.modelPath),
        faceapi.nets.faceRecognitionNet.loadFromUri(this.modelPath),
        faceapi.nets.faceExpressionNet.loadFromUri(this.modelPath),
      ]);
      
      this.modelsLoaded = true;
      console.log('✅ Face recognition models loaded successfully');
    } catch (error) {
      console.error('❌ Error loading face recognition models:', error);
      throw new Error('Failed to load face recognition models');
    }
  }

  async detectFace(input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>> | null> {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    try {
      const detection = await faceapi
        .detectSingleFace(input, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptor();

      return detection || null;
    } catch (error) {
      console.error('Error detecting face:', error);
      return null;
    }
  }

  async detectAllFaces(input: HTMLImageElement | HTMLVideoElement | HTMLCanvasElement): Promise<faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>[]> {
    if (!this.modelsLoaded) {
      await this.loadModels();
    }

    try {
      const detections = await faceapi
        .detectAllFaces(input, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceDescriptors();

      return detections;
    } catch (error) {
      console.error('Error detecting faces:', error);
      return [];
    }
  }

  getFaceDescriptor(detection: faceapi.WithFaceDescriptor<any>): Float32Array {
    return detection.descriptor;
  }

  compareFaces(descriptor1: Float32Array | number[], descriptor2: Float32Array | number[]): number {
    // Convert to arrays if needed
    const desc1 = Array.isArray(descriptor1) ? descriptor1 : Array.from(descriptor1);
    const desc2 = Array.isArray(descriptor2) ? descriptor2 : Array.from(descriptor2);

    // Calculate Euclidean distance
    let sum = 0;
    for (let i = 0; i < desc1.length; i++) {
      sum += Math.pow(desc1[i] - desc2[i], 2);
    }
    const distance = Math.sqrt(sum);

    // Convert distance to similarity score (0-1, higher is better)
    const similarity = Math.max(0, 1 - distance);
    
    return similarity;
  }

  async captureImageFromVideo(video: HTMLVideoElement): Promise<string> {
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Failed to get canvas context');
    }

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    
    return canvas.toDataURL('image/jpeg', 0.95);
  }

  drawDetections(
    canvas: HTMLCanvasElement,
    detections: faceapi.WithFaceDetection<any>[],
    options?: {
      drawBox?: boolean;
      drawLandmarks?: boolean;
      boxColor?: string;
      lineWidth?: number;
    }
  ): void {
    const {
      drawBox = true,
      drawLandmarks = false,
      boxColor = '#2563EB',
      lineWidth = 2,
    } = options || {};

    const displaySize = { width: canvas.width, height: canvas.height };
    faceapi.matchDimensions(canvas, displaySize);

    const resizedDetections = faceapi.resizeResults(detections, displaySize);

    if (drawBox) {
      const drawBoxOptions = new faceapi.draw.DrawBoxOptions({
        boxColor,
        lineWidth,
      });
      resizedDetections.forEach((detection) => {
        const box = detection.detection.box;
        new faceapi.draw.DrawBox(box, drawBoxOptions).draw(canvas);
      });
    }

    if (drawLandmarks) {
      faceapi.draw.drawFaceLandmarks(canvas, resizedDetections);
    }
  }

  calculateQualityScore(detection: faceapi.WithFaceDetection<any>): number {
    // Quality score based on detection confidence and face size
    const confidence = detection.detection.score;
    const box = detection.detection.box;
    const faceSize = box.width * box.height;
    
    // Normalize face size (assuming 640x480 video)
    const normalizedSize = Math.min(faceSize / (640 * 480), 1);
    
    // Combine confidence and size for quality score
    const qualityScore = (confidence * 0.7 + normalizedSize * 0.3);
    
    return Math.min(qualityScore, 1);
  }

  isGoodQuality(detection: faceapi.WithFaceDetection<any>, minScore: number = 0.7): boolean {
    const qualityScore = this.calculateQualityScore(detection);
    return qualityScore >= minScore;
  }

  async validateFaceImage(imageElement: HTMLImageElement): Promise<{
    isValid: boolean;
    message: string;
    detection?: faceapi.WithFaceDescriptor<faceapi.WithFaceLandmarks<faceapi.WithFaceDetection<{}>>>;
  }> {
    const detection = await this.detectFace(imageElement);

    if (!detection) {
      return {
        isValid: false,
        message: 'No face detected. Please ensure your face is clearly visible.',
      };
    }

    const qualityScore = this.calculateQualityScore(detection);

    if (qualityScore < 0.6) {
      return {
        isValid: false,
        message: 'Face quality is too low. Please ensure good lighting and face the camera directly.',
      };
    }

    return {
      isValid: true,
      message: 'Face detected successfully!',
      detection,
    };
  }
}

export default new FaceRecognitionService();
