import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { X, Check } from "lucide-react";

interface ImageCropperProps {
    file: File;
    onCropDone: (croppedFile: File) => void;
    onCancel: () => void;
}

const getCroppedImg = (imageSrc: string, pixelCrop: Area): Promise<File> => {
    return new Promise((resolve, reject) => {
        const image = new Image();
        image.src = imageSrc;
        image.onload = () => {
            const canvas = document.createElement("canvas");
            canvas.width = pixelCrop.width;
            canvas.height = pixelCrop.height;
            const ctx = canvas.getContext("2d");
            ctx?.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            );
            canvas.toBlob((blob) => {
                if (blob) {
                    resolve(new File([blob], "cropped.jpg", { type: "image/jpeg" }));
                } else {
                    reject(new Error("Canvas empty"));
                }
            }, "image/jpeg");
        };
        image.onerror = reject;
    });
};

const ImageCropper: React.FC<ImageCropperProps> = ({ file, onCropDone, onCancel }) => {
    const [imageSrc, setImageSrc] = useState<string | null>(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

    React.useEffect(() => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => setImageSrc(reader.result as string);
    }, [file]);

    const onCropComplete = useCallback((_: Area, areaPixels: Area) => {
        setCroppedAreaPixels(areaPixels);
    }, []);

    const handleConfirm = async () => {
        if (imageSrc && croppedAreaPixels) {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropDone(croppedFile);
        }
    };

    if (!imageSrc) return null;

    return (
        <div className="fixed inset-0 z-[99999] bg-black flex flex-col pb-6">
            <div className="flex items-center justify-between p-4 text-white">
                <button onClick={onCancel} className="p-2"><X size={24} /></button>
                <span className="font-bold">Rogner la photo</span>
                <button onClick={handleConfirm} className="p-2 text-green-400"><Check size={24} /></button>
            </div>
            <div className="flex-1 relative">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={1}
                    onCropChange={setCrop}
                    onZoomChange={setZoom}
                    onCropComplete={onCropComplete}
                />
            </div>
            <div className="p-4 text-white">
                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-full"
                />
            </div>
        </div>
    );
};

export default ImageCropper;