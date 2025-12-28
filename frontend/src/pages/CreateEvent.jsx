import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';
import CoverImagePicker from '../components/CoverImagePicker';
import { ArrowLeft } from 'lucide-react';

const CreateEvent = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [location, setLocation] = useState('');
    const [coverFile, setCoverFile] = useState(null); 

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const formData = new FormData();
        formData.append('name', title);
        formData.append('description', description);
        formData.append('date', date);
        formData.append('location', location);
        if (coverFile) {
            formData.append('cover_image', coverFile);
        }

        try {

            await api.post('/api/gallery/events/', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            toast.success('Event created successfully!');
            navigate('/home');

        } catch (error) {
            console.error(error);
            toast.error('Failed to create event.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white p-6 flex justify-center items-center">
            <div className="max-w-2xl w-full bg-white border border-black rounded-lg p-8">
                <div className="mb-6">
                    <a href="/home" className="inline-flex items-center gap-2 text-black hover:underline transition-colors font-medium">
                        <ArrowLeft className="w-4 h-4" /> Back to Home
                    </a>
                </div>
                <h2 className="text-3xl font-bold text-black mb-8">Create New Event</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                    <CoverImagePicker 
                        label="Event Cover Image"
                        onImageSelect={(file) => setCoverFile(file)} 
                    />
                    <div>
                        <label className="block text-black text-sm font-semibold mb-2">Event Title</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-white border border-black rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            placeholder="e.g. Summer Music Festival"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-black text-sm font-semibold mb-2">Date</label>
                            <input 
                                type="date" 
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                className="w-full bg-white border border-black rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-black text-sm font-semibold mb-2">Location</label>
                            <input
                                type="text"
                                value={location}
                                onChange={(e) => setLocation(e.target.value)}
                                className="w-full bg-white border border-black rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                                placeholder="e.g. Central Park, NY"
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-black text-sm font-semibold mb-2">Description</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows="4"
                            className="w-full bg-white border border-black rounded-lg px-4 py-3 text-black focus:outline-none focus:ring-2 focus:ring-black transition-all"
                            placeholder="Describe the event..."
                        />
                    </div>
                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-black hover:bg-gray-800 text-white font-semibold py-4 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-black"
                    >
                        {loading ? 'Creating Event...' : 'Create Event'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default CreateEvent;