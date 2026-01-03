import { useState, useEffect } from 'react';
import { X, Search, UserPlus, Check } from 'lucide-react';
import api from '../api/axios'; 

const TaggingComp = ({ photo, isOpen, onClose, onUpdate }) => {

    if (!isOpen) return null;
    const [query, setQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedIds, setSelectedIds] = useState(
        photo.tagged_users_details ? photo.tagged_users_details.map(u => u.id) : []
    ); // to send ids to backend
    const [isSaving, setIsSaving] = useState(false);

    // this will search users via the query
    useEffect(() => {
        const findUsers = setTimeout(async () => {
            if (query.length >= 2) {
                try {
                    const res = await api.get(`/api/users/search/?q=${query}`);
                    setSearchResults(res.data);
                } catch (err) {
                    console.error("Search failed", err);
                }
            } else {
                setSearchResults([]);
            }
        }, 300); 
        // we use Timeout to prevent Debouncing(API spamming)

        return () => clearTimeout(findUsers);
    }, [query]);

    const toggleUser = (userId) => {
        setSelectedIds(prev => 
            prev.includes(userId) 
                ? prev.filter(id => id !== userId) //untag user 
                : [...prev, userId] 
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const payload = { tagged_user_ids: selectedIds };
            const res = await api.patch(`/api/gallery/photos/${photo.id}/`, payload);
            onUpdate(res.data); 
            onClose();
        } catch (err) {
            alert("Failed to update tags");
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-950/90 backdrop-blur-sm">
            <div className="bg-neutral-900 w-full max-w-lg rounded-2xl border border-neutral-800 shadow-2xl overflow-hidden">
                <div className="p-5 border-b border-neutral-800 flex justify-between items-center">
                    <h3 className="text-white font-semibold text-lg tracking-tight">Tag People</h3>
                    <button onClick={onClose} className="text-neutral-400 hover:text-white transition-colors">
                        <X size={22} />
                    </button>
                </div>

                <div className="p-5 border-b border-neutral-800/60">
                    <div className="relative">
                        <Search className="absolute left-3 top-3 text-neutral-400 w-5 h-5" />
                        <input
                            type="text"
                            placeholder="Search users..."
                            className="w-full bg-neutral-950 text-white rounded-xl pl-11 pr-4 py-2.5 border border-neutral-800 focus:border-blue-500 focus:outline-none placeholder:text-neutral-500 text-base"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            autoFocus
                        />
                    </div>
                </div>

                <div className="max-h-64 overflow-y-auto p-3">
                    {searchResults.length === 0 && query.length > 2 && (
                        <p className="text-center text-neutral-500 py-6">No users found.</p>
                    )}
                    {searchResults.map(user => {
                        const isSelected = selectedIds.includes(user.id);
                        return (
                            <div
                                key={user.id}
                                onClick={() => toggleUser(user.id)}
                                className={`flex items-center justify-between p-3 rounded-xl cursor-pointer transition-colors border ${
                                    isSelected
                                        ? 'bg-blue-700/20 border-blue-500/60 shadow-sm'
                                        : 'border-transparent hover:bg-neutral-800/80'
                                }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-neutral-800 flex items-center justify-center text-base font-bold text-white shadow-inner">
                                        {user.username[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-base font-medium text-white leading-tight">{user.username}</p>
                                        <p className="text-xs text-neutral-400 leading-tight">{user.first_name} {user.last_name}</p>
                                    </div>
                                </div>
                                {isSelected ? <Check size={18} className="text-blue-400" /> : <UserPlus size={18} className="text-neutral-500" />}
                            </div>
                        );
                    })}
                </div>

                <div className="p-5 border-t border-neutral-800 flex justify-between items-center bg-neutral-900">
                    <span className="text-xs text-neutral-400">
                        {selectedIds.length} person{selectedIds.length !== 1 && 's'} selected
                    </span>
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-blue-600 hover:bg-blue-500 text-white px-7 py-2.5 rounded-xl text-base font-semibold transition-all disabled:opacity-60 shadow-md"
                    >
                        {isSaving ? 'Saving...' : 'Done'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default TaggingComp;