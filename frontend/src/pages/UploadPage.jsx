import {useCallback , useState, useEffect} from 'react'
import {useDropzone} from 'react-dropzone'
import { Link, useNavigate, useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { Upload, ArrowLeft, X, CheckCircle, AlertCircle } from 'lucide-react';

const UploadPage = () => {
    const navigate = useNavigate();
    const { eventId } = useParams();
    const [files, setFiles] = useState([]);
    const [uploading, setUploading] = useState(false);
    const [overallProgress, setOverallProgress] = useState(0);
    const [eventName, setEventName] = useState(''); 

    // fetching event name from backend!
    useEffect(() => {
        if (eventId) {
            const fetchEvent = async () => {
                try {
                    const res = await api.get(`/api/gallery/events/${eventId}/`);
                    setEventName(res.data.name);
                } catch (err) {
                    console.error("Failed to fetch event name", err);
                }
            };
            fetchEvent();
        }
    }, [eventId]);

    const onDrop = useCallback(acceptedFiles => {
        const mappedFiles = acceptedFiles.map(file => ({
            file,
            id: Math.random().toString(36).substring(2, 9),
            preview: URL.createObjectURL(file), // allocates browser memory
            status: 'pending',
            errorMessage: ''
        }));
        setFiles(current => [...current, ...mappedFiles])
    }, []);

    // Cleanup memory from browser
    useEffect(() => {
        return () => files.forEach(file => URL.revokeObjectURL(file.preview));
    }, [files]);

    const {getRootProps, getInputProps, isDragActive} = useDropzone({onDrop,
        accept: {'image/*': [] },
        multiple: true
    })

    const removeFile = (id) => {
        setFiles(files.filter(file => file.id !== id));
    }

    const handleUpload = async () => {
        if(files.length === 0)  return;

        setUploading(true);
        let uploadedCount = 0;

        const NewFileState = [...files];

        for (let i = 0; i < NewFileState.length; i++) {
            const fileObj = NewFileState[i];

            if (fileObj.status == 'success') {
                uploadedCount++;
                continue; 
            }

            fileObj.status = 'uploading';
            setFiles([...NewFileState]);

            try {
                const formData = new FormData();
                formData.append('image', fileObj.file);
                if (eventId) {
                    formData.append('event', eventId);
                }

                await api.post('/api/gallery/photos/', formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
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
            toast.success("All photos uploaded successfully!");
            setTimeout(() => navigate(eventId ? `/event/${eventId}` : '/home'), 1500);      
          } else {
            toast.error("Some uploads failed. Please check the list.");
        }
    };

    return (
        <div className="min-h-screen bg-white p-6">
            <div className="max-w-5xl mx-auto">
                <div className="flex items-center justify-between mb-6">
                    <Link to={eventId ? `/event/${eventId}` : "/home"} className="flex items-center gap-2 text-black hover:underline">
                        <ArrowLeft className="w-5 h-5" />
                        {eventId ? 'Back to Event' : 'Back to Gallery'}
                    </Link>
                    
                    <div className="text-right">
                        <h1 className="text-2xl font-bold text-black">Upload Photos</h1>
                        {eventName && (
                            <p className="text-sm text-black font-medium">
                                To Event: {eventName}
                            </p>
                        )}
                    </div>
                </div>

                {!uploading && (
                    <div
                        {...getRootProps()}
                        className={`border-4 border-dashed rounded-lg p-10 text-center cursor-pointer transition-colors
                            ${isDragActive ? 'border-black bg-black/5' : 'border-black bg-white hover:bg-black/5'}`}
                    >
                        <input {...getInputProps()} />
                        <div className="flex flex-col items-center justify-center gap-4">
                            <div className="bg-black p-4 rounded-full">
                                <Upload className={`w-8 h-8 text-white ${isDragActive ? 'animate-bounce' : ''}`} />
                            </div>
                            <div>
                                <p className="text-xl font-medium text-black">
                                    {isDragActive ? "Drop files here..." : "Drag & drop photos here"}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">or click to select files (100+ supported)</p>
                            </div>
                        </div>
                    </div>
                )}

                {uploading && (
                    <div className="bg-white p-6 rounded-lg border border-black mb-6">
                        <div className="flex justify-between text-sm font-medium mb-2">
                            <span className="text-black">Uploading...</span>
                            <span className="text-black">{overallProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div
                                className="bg-black h-2.5 rounded-full transition-all duration-300"
                                style={{ width: `${overallProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {files.length > 0 && (
                    <div className="mt-8">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-semibold text-black">Selected Files ({files.length})</h3>
                            {!uploading && (
                                <button
                                    onClick={handleUpload}
                                    className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800 transition flex items-center gap-2 font-medium border border-black"
                                >
                                    <Upload className="w-4 h-4" />
                                    Start Upload
                                </button>
                            )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
                            {files.map((fileObj) => (
                                <div key={fileObj.id} className="relative group bg-white rounded-lg border border-black overflow-hidden">

                                    <div className="aspect-square bg-gray-100 relative">
                                        <img
                                            src={fileObj.preview}
                                            alt="preview"
                                            className="w-full h-full object-cover"
                                            // Memory cleanup on load
                                            onLoad={() => { URL.revokeObjectURL(fileObj.preview) }}
                                        />

                                        <div className="absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity opacity-0 group-hover:opacity-100">
                                            {fileObj.status === 'pending' && !uploading && (
                                                <button
                                                    onClick={() => removeFile(fileObj.id)}
                                                    className="bg-black text-white p-2 rounded-full hover:bg-gray-800"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        {fileObj.status === 'success' && (
                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center">
                                                <CheckCircle className="w-8 h-8 text-white" />
                                            </div>
                                        )}
                                        {fileObj.status === 'error' && (
                                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center flex-col p-2 text-center">
                                                <AlertCircle className="w-8 h-8 text-white mb-1" />
                                                <span className="text-white text-xs font-bold">Failed</span>
                                            </div>
                                        )}
                                        {fileObj.status === 'uploading' && (
                                            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="p-2">
                                        <p className="text-[10px] text-gray-600">
                                            {fileObj.file ? `${(fileObj.file.size / 1024 / 1024).toFixed(2)} MB` : ''}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPage;