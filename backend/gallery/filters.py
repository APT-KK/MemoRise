import django_filters
from .models import Photo

class PhotoFilter(django_filters.FilterSet):

    event_name = django_filters.CharFilter(field_name='event__name', lookup_expr='icontains')
    album_name = django_filters.CharFilter(field_name='album__name', lookup_expr='icontains')

    date_min = django_filters.DateFilter(field_name='date_taken', lookup_expr='gte') # >= exact date
    date_max = django_filters.DateFilter(field_name='date_taken', lookup_expr='lte') # <= exact date

    photographer = django_filters.CharFilter(field_name='photographer__full_name', lookup_expr='icontains')
    tagged_user = django_filters.CharFilter(field_name='tagged_users__full_name', lookup_expr='icontains')

    class Meta:
        model = Photo
        fields = ['event_name', 'album_name', 'date_min', 'date_max', 'photographer', 'tagged_user']