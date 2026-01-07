from rest_framework import permissions

class IsEventCoordinatorOrAdmin(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user.is_authenticated and (
            request.user.role in ['Admin', 'Coordinator']
        )

class CanUploadPhotoOrCreateAlbum(permissions.BasePermission):
    def has_permission(self, request, view):
        # this only allows if not a Club Member or Guest
        return request.user.is_authenticated and (
            request.user.role not in ['Member', 'Guest']
        )
