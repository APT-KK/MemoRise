from rest_framework import permissions

# making custom permission so only owner of profile can edit it
# others can still view it
class IsOwnerOrReadOnly(permissions.BasePermission):

    def has_object_permission(self, request, obj):
        # safe methods are GET, HEAD, OPTIONS
        # allowing read-only access for these methods
        if request.method in permissions.SAFE_METHODS:
            return True
        return obj == request.user # write permission only to owner
    # obj is user instance being accessed