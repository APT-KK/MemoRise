import { useEffect, useState, useCallback, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api/axios';
import { useDropzone } from 'react-dropzone';
import { ArrowLeft, User, Calendar, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { Album, Photo, FileUpload } from '../types';

const AlbumPage: React.FC = () => {
    const { id } = useParams();
    const [album, setAlbum] = useState<Album | null>(null);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [uploadModal, setUploadModal] = useState(false);
    const [files, setFiles] = useState<FileUpload[]>([]);
    const [overallProgress, setOverallProgress] = useState(0);
    const pollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const mappedFiles: FileUpload[] = acceptedFiles.map(file => ({
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
        const fetchFullAlbum = async () => {
            const res = await api.get(`/api/gallery/albums/${id}/`);
            let albumData = res.data;
            if (albumData.photos && albumData.photos.length && albumData.photos.length < (albumData.photo_count || 100000)) {
                let allPhotos = [...albumData.photos];
                let next = albumData.photos_next || null;
                if (!next && albumData.id) {
                    let photosRes = await api.get(`/api/gallery/photos/?album=${albumData.id}`);
                    allPhotos = photosRes.data.results || photosRes.data;
                    next = photosRes.data.next;
                    while (next) {
                        const url = next.startsWith('http') ? next : `${window.location.origin}${next}`;
                        const nextRes = await api.get(url);
                        allPhotos = allPhotos.concat(nextRes.data.results || []);
                        next = nextRes.data.next;
                    }
                }
                albumData.photos = allPhotos;
            }
            return albumData;
        };

        const loadAlbum = async () => {
            try {
                const albumData = await fetchFullAlbum();
                setAlbum(albumData);

                const hasUnprocessed = albumData.photos?.some((photo: Photo) => photo.is_processed !== true);
                if (hasUnprocessed && !pollIntervalRef.current) {
                    pollIntervalRef.current = setInterval(async () => {
                        try {
                            const updatedAlbumData = await fetchFullAlbum();

                            setAlbum(prevAlbum => {
                                if (JSON.stringify(updatedAlbumData) !== JSON.stringify(prevAlbum)) {
                                    return updatedAlbumData;
                                }
                                return prevAlbum;
                            });

                            const stillUnprocessed = updatedAlbumData.photos?.some((photo: Photo) => photo.is_processed !== true);
                            if (!stillUnprocessed && pollIntervalRef.current) {
                                clearInterval(pollIntervalRef.current);
                                pollIntervalRef.current = null;
                            }
                        } catch (error: any) {
                            if (error.code === 'ERR_NETWORK' || error.message?.includes('CORS')) {
                                if (pollIntervalRef.current) {
                                    clearInterval(pollIntervalRef.current);
                                    pollIntervalRef.current = null;
                                }
                            }
                        }
                    }, 3000);
                }
            } catch (error) {
            } finally {
                setLoading(false);
            }
        };

        loadAlbum();

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
                pollIntervalRef.current = null;
            }
        };
    }, [id]);

    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    const removeFile = (fileId: string) => {
        setFiles(files.filter(file => file.id !== fileId));
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
                formData.append('album', String(album!.id));

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
            try {
                const res = await api.get(`/api/gallery/albums/${album.id}/`);
                setAlbum(res.data);
            } catch (error) {
            }
        } else {
            toast.error('Some uploads failed. Please check the list.');
        }
    };

    const [selected, setSelected] = useState<number[]>([]);
    const [user, setUser] = useState<any>(null);
    const [deleteMode, setDeleteMode] = useState(false);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await api.get('/api/auth/users/me/');
                setUser(res.data);
            } catch (e) {
                setUser(null);
            }
        };
        fetchUser();
    }, []);

    const canDelete = user && (
        user.is_superuser ||
        ['Coordinator', 'Admin'].includes(user.role) ||
        ['coordinator', 'admin'].includes(user.role)
    );

    const handleSelect = (id: number) => {
        setSelected(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
    };

    const handleConfirmDelete = async () => {
        if (selected.length === 0) return;
        if (window.confirm('Delete selected photos?')) {
            await api.post('/api/gallery/mass-delete-photos/', { ids: selected });
            if (album) {
                setAlbum({ ...album, photos: album.photos.filter((p: Photo) => !selected.includes(p.id)) });
            }
            setSelected([]);
            setDeleteMode(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            {/* {user && (
                <div className="text-xs text-red-600 mb-2">user.role: {user.role || 'N/A'}</div>
            )} */}
            <Link
                to="/home"
                className="inline-flex items-center gap-2 text-black hover:underline mb-6 transition"
            >
                <ArrowLeft className="w-4 h-4" />
                Back
            </Link>

            {loading ? (
                <div className="text-center py-20">
                    <div className="text-black">Loading album...</div>
                </div>
            ) : !album ? (
                <div className="text-center py-20">
                    <div className="text-black">Album not found</div>
                </div>
            ) : (
                <>
                    <div className="bg-white rounded-lg p-8 border border-black mb-8">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-4">
                            <div>
                                <h1 className="text-3xl font-bold text-black mb-2">{album.name}</h1>
                                <div className="flex flex-wrap gap-4 text-gray-600 text-sm mb-2">
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
                                    <p className="text-gray-700 border-l-4 border-black pl-4 italic mb-0">
                                        {album.description}
                                    </p>
                                )}
                            </div>
                            <div className="flex gap-3">
                                <button
                                    className="bg-black hover:bg-gray-800 text-white px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 border border-black"
                                    onClick={() => setUploadModal(true)}
                                >
                                    <Upload className="w-5 h-5" />
                                    Upload Photos
                                </button>
                            </div>
                        </div>

                        {uploadModal && (
                            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
                                <div className="bg-white rounded-lg border border-black p-8 w-full max-w-lg relative">
                                    <button
                                        className="absolute top-3 right-3 text-black hover:text-gray-600 text-xl font-bold"
                                        onClick={() => { setUploadModal(false); setFiles([]); }}
                                        disabled={uploading}
                                    >
                                        ×
                                    </button>
                                    <h2 className="text-xl font-bold mb-4 text-black">Upload Photos to Album</h2>
                                    <div {...getRootProps()} className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer ${isDragActive ? 'border-black bg-black/5' : 'border-black bg-white'}`}>
                                        <input {...getInputProps()} disabled={uploading} />
                                        {isDragActive ? (
                                            <p className="text-black">Drop the files here ...</p>
                                        ) : (
                                            <p className="text-gray-600">Drag & drop images here, or click to select files</p>
                                        )}
                                    </div>
                                    {files.length > 0 && (
                                        <div className="mt-4 space-y-2 max-h-40 overflow-y-auto">
                                            {files.map(fileObj => (
                                                <div key={fileObj.id} className="flex items-center gap-3 bg-white border border-black rounded p-2">
                                                    <img src={fileObj.preview} alt="preview" className="w-10 h-10 object-cover rounded" />
                                                    <span className="flex-1 text-black text-sm truncate">{fileObj.file.name}</span>
                                                    {fileObj.status === 'uploading' && <span className="text-black text-xs">Uploading...</span>}
                                                    {fileObj.status === 'success' && <span className="text-black text-xs">Uploaded</span>}
                                                    {fileObj.status === 'error' && <span className="text-black text-xs">{fileObj.errorMessage}</span>}
                                                    <button className="text-gray-600 hover:text-black" onClick={() => removeFile(fileObj.id)} disabled={uploading}>×</button>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    {files.length > 0 && (
                                        <div className="mt-4 flex justify-between items-center">
                                            <button
                                                className="bg-black text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-black border border-black"
                                                onClick={handleUpload}
                                                disabled={uploading}
                                            >
                                                {uploading ? 'Uploading...' : 'Upload'}
                                            </button>
                                            <span className="text-gray-600 text-sm">{overallProgress}%</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    <div>
                        <h2 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                            Photos
                            <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                                {album.photos ? album.photos.length : 0}
                            </span>
                        </h2>


                        {canDelete && album.photos && album.photos.length > 0 && !deleteMode && (
                            <button
                                className="bg-red-600 text-white px-4 py-2 rounded mb-4"
                                onClick={() => setDeleteMode(true)}
                            >
                                Delete Images
                            </button>
                        )}

                        {canDelete && deleteMode && (
                            <div className="mb-4 flex gap-2">
                                <button
                                    className="bg-gray-300 text-black px-4 py-2 rounded"
                                    onClick={() => { setDeleteMode(false); setSelected([]); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="bg-red-600 text-white px-4 py-2 rounded"
                                    onClick={handleConfirmDelete}
                                    disabled={selected.length === 0}
                                >
                                    Confirm Delete
                                </button>
                            </div>
                        )}

                        {(!album.photos || album.photos.length === 0) ? (
                            <div className="text-center py-20 bg-white rounded-lg border border-dashed border-black">
                                <p className="text-gray-600 font-medium">This album is empty.</p>
                            </div>
                        ) : (
                            <div
                                className="columns-2 sm:columns-3 md:columns-4 xl:columns-6 gap-4 space-y-4"
                                style={{ width: '100%' }}
                            >
                                {album.photos
                                    .filter(photo => String(photo.album) === String(id))
                                    .map(photo => {
                                        let imageUrl = photo.thumbnail || photo.image;
                                        if (imageUrl && !imageUrl.startsWith('http') && !imageUrl.startsWith('/')) {
                                            imageUrl = '/' + imageUrl;
                                        }
                                        return (
                                            <div key={photo.id} className="relative mb-4 break-inside-avoid">
                                                {canDelete && deleteMode && (
                                                    <input
                                                        type="checkbox"
                                                        checked={selected.includes(photo.id)}
                                                        onChange={() => handleSelect(photo.id)}
                                                        className="absolute top-2 left-2 w-5 h-5 z-10"
                                                    />
                                                )}
                                                <Link
                                                    to={`/photos/${photo.id}`}
                                                    style={{ display: 'block' }}
                                                >
                                                    <img
                                                        src={imageUrl}
                                                        alt={photo.title || 'Album photo'}
                                                        className="w-full rounded-lg border border-black/10 shadow-sm hover:shadow-md transition cursor-pointer"
                                                    />
                                                </Link>
                                            </div>
                                        );
                                    })}
                            </div>
                        )}
                    </div>
                </>
            )}
        </div>
    );
};

export default AlbumPage;