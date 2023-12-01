export interface Crop {
  x: number;
  y: number;
  width?: number;
  height?: number;
}

export const createImage = (url: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.addEventListener('load', () => resolve(image));
    image.addEventListener('error', (error) => reject(error));
    image.src = url;
  });

export function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

/**
 * Returns the new bounding area of a rotated rectangle.
 */
export function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);

  return {
    width: Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height: Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height)
  };
}

/**
 * This function was adapted from the one in the ReadMe of https://github.com/DominicTobias/react-image-crop
 */
export async function getCroppedImg(
  imageSrc: string,
  pixelCrop: Crop,
  rotation = 0
): Promise<Blob | null> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement('canvas');
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    return null;
  }

  const rotRad = getRadianAngle(rotation);

  // calculate bounding box of the rotated image
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(image.width, image.height, rotation);

  // set canvas size to match the bounding box
  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  // translate canvas context to a central location to allow rotating and flipping around the center
  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.scale(1, 1);
  ctx.translate(-image.width / 2, -image.height / 2);

  // draw rotated image
  ctx.drawImage(image, 0, 0);

  // croppedAreaPixels values are bounding box relative
  // extract the cropped image using these values
  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width ?? image.width,
    pixelCrop.height ?? image.height
  );

  // set canvas width to final desired crop size - this will clear existing context
  canvas.width = pixelCrop.width ?? image.width;
  canvas.height = pixelCrop.height ?? image.height;

  // paste generated rotate image at the top left corner
  ctx.putImageData(data, 0, 0);

  const { canvas: scaledCanvas } = scaleCanvasToSquare(canvas, 320);

  // As a blob
  return new Promise((resolve) => {
    scaledCanvas.toBlob((file) => {
      resolve(file);
    }, 'image/jpeg');
  });
}

function scaleCanvasToSquare(
  canvas: HTMLCanvasElement,
  squareSize: number
): {
  canvas: HTMLCanvasElement;
} {
  const newCanvas = document.createElement('canvas');
  const context = newCanvas.getContext('2d');

  if (!context) {
    console.error('Canvas 2D context not available');
    return { canvas };
  }

  const currentWidth = canvas.width;
  const currentHeight = canvas.height;

  if (currentWidth === squareSize && currentHeight === squareSize) {
    // No need to scale if the canvas is already square
    return { canvas };
  }

  const scaleFactor = squareSize / Math.max(currentWidth, currentHeight);

  const newWidth = currentWidth * scaleFactor;
  const newHeight = currentHeight * scaleFactor;

  // Clear the canvas
  context.clearRect(0, 0, currentWidth, currentHeight);

  // Draw the scaled image back onto the canvas
  newCanvas.width = newWidth;
  newCanvas.height = newHeight;
  context.drawImage(canvas, 0, 0, currentWidth, currentHeight, 0, 0, newWidth, newHeight);
  return { canvas: newCanvas };
}
