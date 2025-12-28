import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CoverImagePicker from '../components/CoverImagePicker';
import { ChevronDown, Loader2, ArrowLeft } from 'lucide-react';

const CreateAlbum = () => {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const preSelectedEventId = searchParams.get('event');
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);
    const [description, setDescription] = useState('');
    const [coverFile, setCoverFile] = useState(null);

    useEffect(() => {
    }, [preSelectedEventId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!preSelectedEventId) {
            toast.error("No event specified for this album.");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('name', name);
        formData.append('description', description);
        formData.append('event', preSelectedEventId); 
        if (coverFile) {
            formData.append('cover_image', coverFile);
        }

        try {
            await api.post('/api/gallery/albums/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            toast.success('Album created successfully!');
            navigate(`/event/${preSelectedEventId}`);
        } catch (error) {
            console.error(error);
            toast.error('Failed to create album.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 p-6 flex justify-center items-center">
            <div className="max-w-2xl w-full bg-slate-900/50 backdrop-blur-md border border-slate-800 rounded-3xl p-8 shadow-2xl relative">       
                <div className="mb-6">
                    <a href="/home" className="inline-flex items-center gap-2 text-slate-300 hover:text-blue-400 transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </a>
                </div>
                <div className="absolute -top-20 -right-20 w-64 h-64 bg-blue-600/10 rounded-full blur-3xl pointer-events-none"></div>
                <h2 className="text-3xl font-bold text-white mb-2">Create New Album</h2>
                <p className="text-slate-400 mb-8">Organize photos within an event</p>
                
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">  
                    <CoverImagePicker 
                        label="Album Cover Image"
                        onImageSelect={(file) => setCoverFile(file)} 
                    />

                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">Album Name</label>
                        <input 
                            type="text" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="e.g. Wedding Ceremony, After Party"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-slate-300 text-sm font-semibold mb-2">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="3"
                            className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-all"
                            placeholder="What is this album about?"
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                        {loading ? 'Creating Album...' : 'Create Album'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateAlbum;