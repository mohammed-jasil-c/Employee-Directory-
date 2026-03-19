from django.contrib import admin
from .models import User, Employee, Department


@admin.register(User)
class UserAdmin(admin.ModelAdmin):
    list_display = ['email', 'full_name', 'is_staff', 'is_active', 'date_joined']
    search_fields = ['email', 'full_name']


@admin.register(Department)
class DepartmentAdmin(admin.ModelAdmin):
    list_display = ['name', 'created_at']
    search_fields = ['name']


@admin.register(Employee)
class EmployeeAdmin(admin.ModelAdmin):
    list_display = ['full_name', 'email', 'role', 'department', 'is_active', 'created_at']
    list_filter = ['department', 'is_active']
    search_fields = ['full_name', 'email', 'role']
