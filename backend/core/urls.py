from django.contrib import admin
from django.urls import path, include
from django.http import JsonResponse

def api_root(request):
    return JsonResponse({"message": "Welcome to the Employee Directory API", "status": "Online"})

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('employees.auth_urls')),
    path('api/employees/', include('employees.urls')),
    path('', api_root, name='api-root'),
]
