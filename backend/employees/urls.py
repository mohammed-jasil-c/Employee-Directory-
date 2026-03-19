from django.urls import path
from .views import EmployeeListCreateView, EmployeeDetailView, DepartmentListView

urlpatterns = [
    path('', EmployeeListCreateView.as_view(), name='employee-list-create'),
    path('<int:pk>/', EmployeeDetailView.as_view(), name='employee-detail'),
    path('departments/', DepartmentListView.as_view(), name='department-list'),
]
