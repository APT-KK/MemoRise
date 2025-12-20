from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from django.views.static import serve

def serve_media_with_cors(request, path):
    """Serve media files with CORS headers"""
    response = serve(request, path, document_root=settings.MEDIA_ROOT)
    response['Access-Control-Allow-Origin'] = '*'
    response['Access-Control-Allow-Methods'] = 'GET, OPTIONS'
    response['Access-Control-Allow-Headers'] = '*'
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
    media_url = settings.MEDIA_URL.strip('/')
    urlpatterns += [
        path(f'{media_url}/<path:path>', serve_media_with_cors),
    ]