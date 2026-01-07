from django.contrib import admin
from django.urls import include, path
from django.conf import settings
from django.conf.urls.static import static
from gallery.views import view_shared_photo

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('users.urls')),
    path('api/gallery/', include('gallery.urls')),
    path('api/interactions/', include('interactions.urls')),
    path('share/photos/<uuid:share_token>/', view_shared_photo, name='view_shared_photo'),
]

# in development mode , we can serve media files using this
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

