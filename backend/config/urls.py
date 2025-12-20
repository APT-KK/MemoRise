from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve
from django.http import HttpResponse, HttpResponseNotAllowed
import os

def serve_media_with_cors(request, path):
    """Serve media files with CORS headers"""
    if request.method == 'OPTIONS':
        # Handle CORS preflight
        response = HttpResponse()
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
        response['Access-Control-Allow-Headers'] = '*'
        response['Access-Control-Max-Age'] = '3600'
        return response
    
    if request.method != 'GET':
        return HttpResponseNotAllowed(['GET', 'OPTIONS'])
    
    # Serve the file
    file_path = os.path.join(settings.MEDIA_ROOT, path)
    if not os.path.exists(file_path):
        return HttpResponse('File not found', status=404)
    
    response = serve(request, path, document_root=settings.MEDIA_ROOT)
    # Add CORS headers
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response['Access-Control-Allow-Headers'] = '*'
    response['Cross-Origin-Resource-Policy'] = 'cross-origin'
    return response

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/gallery/', include('gallery.urls')),
    path('api/interactions/', include('interactions.urls')),
]

# in development mode , we can serve media files using this
if settings.DEBUG:
    # Use custom view to add CORS headers to media files
    # Match /media/... URLs
    urlpatterns += [
        path('media/<path:path>', serve_media_with_cors),
    ]