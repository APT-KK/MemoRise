import { useEffect, useState, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, User, Calendar, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import PhotoCard from '../components/PhotoCard'; 

const AlbumPage = () => {
    const { id } = useParams();
    const [album, setAlbum] = useState(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [files, setFiles] = useState([]);
    const [overallProgress, setOverallProgress] = useState(0);

    const onDrop = useCallback(acceptedFiles => {
        const mappedFiles = acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substring(2, 9),
            preview: URL.createObjectURL(file),
            status: 'pending',
            errorMessage: ''
        }));
        setFiles(current => [...current, ...mappedFiles]);
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { 'image/*': [] },
        multiple: true
    });

    useEffect(() => {
        const fetchAlbum = async () => {
            try {
                const res = await api.get(`/api/gallery/albums/${id}/`);
                setAlbum(res.data);
            } catch (error) {
                console.error("Error fetching album", error);
                toast.error("Failed to load album");
            } finally {
                setLoading(false);
            }
        };
        fetchAlbum();
    }, [id]);

    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    const removeFile = (id) => {
        setFiles(files.filter(file => file.id !== id));
    };

    const handleUpload = async () => {
        if (files.length === 0) return;
        setUploading(true);
        let uploadedCount = 0;
        const NewFileState = [...files];
        
        for (let i = 0; i < NewFileState.length; i++) {
            const fileObj = NewFileState[i];
            if (fileObj.status === 'success') {
                uploadedCount++;
                continue;
            }
            fileObj.status = 'uploading';
            setFiles([...NewFileState]);
            
            try {
                const formData = new FormData();
                formData.append('image', fileObj.file);
                formData.append('album', album.id);
                
                await api.post('/api/gallery/photos/', formData, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });
                
                NewFileState[i].status = 'success';
            } catch (error) {
                NewFileState[i].status = 'error';
                NewFileState[i].errorMessage = error.response?.data?.detail || 'Upload failed';
            }
            
            uploadedCount++;
            setOverallProgress(Math.round((uploadedCount / files.length) * 100));
            setFiles([...NewFileState]);
        }

        setUploading(false);
        
        const allSuccess = NewFileState.every(f => f.status === 'success');
        
        if (allSuccess) {
            toast.success('All photos uploaded successfully!');
            setFiles([]);
            setUploadModal(false);
            try {
                const res = await api.get(`/api/gallery/albums/${album.id}/`);
                setAlbum(res.data);
            } catch (error) {
                console.error("Error refreshing album", error);
            }
        } else {
            toast.error('Some uploads failed. Please check the list.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Loading album...</div>
            </div>
        );
    }

    if (!album) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-gray-500">Album not found</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                <Link 
                    to={album.event ? `/event/${album.event}` : "/home"} 
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-blue-600 mb-6 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    {album.event ? "Back to Event" : "Back to Home"}
                </Link>

                <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-100 mb-8">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2">{album.name}</h1>
                            <div className="flex flex-wrap gap-4 text-gray-500 text-sm mb-2">
                                <span className="flex items-center gap-1">
                                    <User className="w-4 h-4" /> 
                                    By {album.owner || "Unknown"}
                                </span>
                                <span className="flex items-center gap-1">
                                    <Calendar className="w-4 h-4" /> 
                                    {new Date(album.created_at).toLocaleDateString()}
                                </span>
                            </div>
                            {album.description && (
                                <p className="text-gray-600 border-l-4 border-blue-200 pl-4 italic mb-0">
                                    {album.description}
                                </p>
                            )}
                        </div>
                        <div className="flex gap-3">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-medium shadow-lg shadow-blue-200 transition flex items-center gap-2"
                                onClick={() => setUploadModal(true)}
                            >
                                <Upload className="w-5 h-5" />
                                Upload Photos
                            </button>
                        </div>
                    </div>

                    {uploadModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                            <div className="bg-white rounded-xl shadow-xl p-8 w-full max-w-lg relative">
                                <button
                                    className="absolute top-3 right-3 text-gray-400 hover:text-red-500 text-xl font-bold"
                                    onClick={() => { setUploadModal(false); setFiles([]); }}
                                    disabled={uploading}
                                >
                                    ×
                                </button>
                                <h2 className="text-xl font-bold mb-4 text-gray-900">Upload Photos to Album</h2>
                                <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}`}>
                                    <input {...getInputProps()} disabled={uploading} />
                                    {isDragActive ? (
                                        <p className="text-blue-600">Drop the files here ...</p>
                                    ) : (
                                        <p className="text-gray-500">Drag & drop images here, or click to select files</p>
                                    )}
                                </div>
                                {files.length > 0 && (
                                    <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                                        {files.map(fileObj => (
                                            <div key={fileObj.id} className="flex items-center gap-3 bg-gray-100 rounded p-2">
                                                <img src={fileObj.preview} alt="preview" className="w-10 h-10 object-cover rounded" />
                                                <span className="flex-1 text-gray-700 text-sm truncate">{fileObj.file.name}</span>
                                                {fileObj.status === 'uploading' && <span className="text-blue-600 text-xs">Uploading...</span>}
                                                {fileObj.status === 'success' && <span className="text-green-600 text-xs">Uploaded</span>}
                                                {fileObj.status === 'error' && <span className="text-red-600 text-xs">{fileObj.errorMessage}</span>}
                                                <button className="text-gray-400 hover:text-red-500" onClick={() => removeFile(fileObj.id)} disabled={uploading}>×</button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                                {files.length > 0 && (
                                    <div className="mt-4 flex justify-between items-center">
                                        <button
                                            className="bg-blue-600 text-white px-4 py-2 rounded-lg font-semibold hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            onClick={handleUpload}
                                            disabled={uploading}
                                        >
                                            {uploading ? 'Uploading...' : 'Upload'}
                                        </button>
                                        <span className="text-gray-500 text-sm">{overallProgress}%</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        Photos 
                        <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                            {album.photos ? album.photos.length : 0}
                        </span>
                    </h2>

                    {(!album.photos || album.photos.length === 0) ? (
                        <div className="text-center py-20 bg-white rounded-xl border border-dashed border-gray-300">
                            <p className="text-gray-500 font-medium">This album is empty.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {album.photos.map(photo => (
                                <PhotoCard key={photo.id} photo={photo} /> 
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AlbumPage;