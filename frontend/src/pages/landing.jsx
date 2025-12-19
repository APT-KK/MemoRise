import { Link } from 'react-router-dom';
import { Camera } from 'lucide-react';

const LandingPage = () => {
  const images = [
    "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1517457373958-b7bdd4587205?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1500917293891-ef795e70e1f6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=600&q=80",
  ];

  const aspectRatios = [
    'aspect-[3/4]', 'aspect-[4/3]', 'aspect-square', 'aspect-[16/9]', 'aspect-[9/16]', 'aspect-[5/4]', 'aspect-[4/5]'
  ];

  return (
    <div className="min-h-screen bg-black text-white flex flex-col font-sans">
      <header className="flex items-center justify-center px-8 py-6 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Camera className="h-5 w-5 text-white" />
          <span className="text-2xl font-bold">MEMORISE</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center text-center px-4">
        <h1 className="text-6xl font-extrabold mb-4">Capture the Moment</h1>
        <p className="text-lg text-gray-400 max-w-xl mb-8">
          A modern gallery for photographers and enthusiasts. Share your best shots and explore stunning visuals.
        </p>
        <div className="flex gap-4">
          <Link 
            to="/signup" 
            className="px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition"
          >
            Sign Up
          </Link>
          <Link 
            to="/login" 
            className="px-6 py-3 bg-gray-800 text-white font-semibold rounded-lg hover:bg-gray-700 transition"
          >
            Log In
          </Link>
        </div>
      </main>

      <section className="columns-2 md:columns-3 lg:columns-4 gap-4 p-8 w-full max-w-7xl mx-auto">
        {images.map((src, index) => (
          <div 
            key={index} 
            className={`mb-4 rounded-lg overflow-hidden break-inside-avoid ${aspectRatios[index % aspectRatios.length]}`}
          >
            <img 
              src={src} 
              alt={`Gallery ${index}`} 
              className="w-full h-full object-cover transition duration-500 group-hover:scale-105"
            />
          </div>
        ))}
      </section>

      <footer className="text-center py-6 text-gray-500 text-sm border-t border-gray-800">
        © 2025 Gallery. All rights reserved.
      </footer>
    </div>
  );
};

export default LandingPage;