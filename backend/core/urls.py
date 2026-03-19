from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/auth/', include('employees.auth_urls')),
    path('api/employees/', include('employees.urls')),
]
