import { useState, useEffect, useRef } from 'react';
import { ImagePlus, X, UploadCloud } from 'lucide-react';

const CoverImagePicker = ({ label, onImageSelect, initialPreview = null }) => {
    const [preview, setPreview] = useState(initialPreview);
    const fileInputRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);

    useEffect(() => {
        return () => {
            if (preview && !preview.startsWith('http')) {
                URL.revokeObjectURL(preview);
            }
        };
    }, [preview]);

    const handleFile = (file) => {
        if (file && file.type.startsWith('image/')) {
            const objectUrl = URL.createObjectURL(file);
            setPreview(objectUrl);
            onImageSelect(file); 
        }
    };

    const handleChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            handleFile(e.target.files[0]);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            handleFile(e.dataTransfer.files[0]);
        }
    };

    const removeImage = (e) => {
        e.stopPropagation(); // this stops clicking the input
        setPreview(null);
        onImageSelect(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    return (
        <div className="mb-6">
            <label className="block text-black text-sm font-semibold mb-2">
                {label || "Cover Photo"}
            </label>
            
            <div 
                onClick={() => fileInputRef.current.click()}
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={handleDrop}
                className={`
                    relative group cursor-pointer w-full h-64 rounded-lg border-2 border-dashed transition-all duration-300 overflow-hidden
                    ${isDragging 
                        ? 'border-black bg-black/5' 
                        : 'border-black bg-white hover:bg-black/5'}
                `}
            >
                <input 
                    type="file" 
                    ref={fileInputRef} 
                    onChange={handleChange} 
                    accept="image/*" 
                    className="hidden" 
                />

                {preview ? (
                    <>
                        <img 
                            src={preview} 
                            alt="Cover Preview" 
                            className="w-full h-full object-cover"
                        />
                        {/* Hover Overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <p className="text-white font-medium flex items-center gap-2">
                                <ImagePlus className="w-5 h-5" /> Change Photo
                            </p>
                        </div>
                        {/* Remove Button */}
                        <button 
                            onClick={removeImage}
                            className="absolute top-3 right-3 p-2 bg-black/80 text-white rounded-full hover:bg-black transition-colors z-10"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-gray-600">
                        <div className={`p-4 rounded-full bg-black mb-3 transition-transform duration-300 ${isDragging ? 'scale-110' : ''}`}>
                            <UploadCloud className={`w-8 h-8 text-white`} />
                        </div>
                        <p className="font-medium text-black">Click to upload cover</p>
                        <p className="text-xs text-gray-600 mt-1">SVG, PNG, JPG or GIF (max 5MB)</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CoverImagePicker;