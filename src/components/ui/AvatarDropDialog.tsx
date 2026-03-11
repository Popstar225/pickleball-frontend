import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import { useTranslation } from 'react-i18next';
import { X, Check, ZoomIn, ZoomOut } from 'lucide-react';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

interface AvatarCropDialogProps {
  imageSrc: string;
  onCropComplete: (croppedFile: File) => void;
  onCancel: () => void;
  originalFileName: string;
}

async function getCroppedImage(imageSrc: string, pixelCrop: CropArea, fileName: string): Promise<File> {
  const image = await createImageBitmap(await (await fetch(imageSrc)).blob());
  const canvas = document.createElement('canvas');
  const size = Math.min(pixelCrop.width, pixelCrop.height);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(
    image,
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height,
    0,
    0,
    size,
    size,
  );
  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      resolve(new File([blob!], fileName, { type: 'image/jpeg' }));
    }, 'image/jpeg', 0.92);
  });
}

export const AvatarCropDialog = ({ imageSrc, onCropComplete, onCancel, originalFileName }: AvatarCropDialogProps) => {
  const { t } = useTranslation();
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<CropArea | null>(null);

  const onCropCompleteInternal = useCallback((_: unknown, croppedPixels: CropArea) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    const file = await getCroppedImage(imageSrc, croppedAreaPixels, originalFileName);
    onCropComplete(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl border border-slate-700/50 w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700/50">
          <h3 className="text-lg font-bold text-white">{t('auth.optionalFields.crop_title')}</h3>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-lg bg-slate-700/50 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Crop Area */}
        <div className="relative w-full" style={{ height: '320px' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1}
            cropShape="round"
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropCompleteInternal}
            style={{
              containerStyle: { background: '#0f172a' },
              cropAreaStyle: { border: '3px solid #84cc16' },
            }}
          />
        </div>

        {/* Zoom Slider */}
        <div className="px-6 py-4 border-t border-slate-700/50">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
              className="text-slate-400 hover:text-primary transition-colors"
            >
              <ZoomOut className="w-5 h-5" />
            </button>
            <input
              type="range"
              min={1}
              max={3}
              step={0.05}
              value={zoom}
              onChange={(e) => setZoom(Number(e.target.value))}
              className="flex-1 accent-primary cursor-pointer"
            />
            <button
              onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
              className="text-slate-400 hover:text-primary transition-colors"
            >
              <ZoomIn className="w-5 h-5" />
            </button>
          </div>
          <p className="text-xs text-slate-500 text-center mt-2">{t('auth.optionalFields.crop_hint')}</p>
        </div>

        {/* Actions */}
        <div className="flex gap-3 px-6 pb-6">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-xl border border-slate-700/50 bg-slate-800/30 text-slate-300 font-semibold hover:bg-slate-800/50 transition-all duration-300"
          >
            {t('auth.optionalFields.crop_cancel')}
          </button>
          <button
            onClick={handleConfirm}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-primary to-lime-500 text-slate-900 font-bold hover:shadow-lg hover:shadow-primary/30 transition-all duration-300 flex items-center justify-center gap-2"
          >
            <Check className="w-5 h-5" />
            {t('auth.optionalFields.crop_apply')}
          </button>
        </div>
      </div>
    </div>
  );
};
