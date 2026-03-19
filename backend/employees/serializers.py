from rest_framework import serializers
from django.contrib.auth import authenticate
from .models import User, Employee, Department


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField(write_only=True)

    def validate(self, data):
        email = data.get('email', '').strip().lower()
        password = data.get('password', '')

        if not email:
            raise serializers.ValidationError({'email': 'Email is required.'})
        if not password:
            raise serializers.ValidationError({'password': 'Password is required.'})

        user = authenticate(username=email, password=password)
        if not user:
            raise serializers.ValidationError({'non_field_errors': 'Invalid email or password.'})
        if not user.is_active:
            raise serializers.ValidationError({'non_field_errors': 'Account is disabled.'})

        data['user'] = user
        return data


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'email', 'full_name', 'date_joined']


class DepartmentSerializer(serializers.ModelSerializer):
    employee_count = serializers.SerializerMethodField()

    class Meta:
        model = Department
        fields = ['id', 'name', 'employee_count']

    def get_employee_count(self, obj):
        return obj.employees.filter(is_active=True).count()


class EmployeeListSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = [
            'id', 'full_name', 'email', 'role',
            'department', 'department_name', 'phone',
            'location', 'avatar_url', 'is_active',
            'date_joined', 'created_at'
        ]


class EmployeeDetailSerializer(serializers.ModelSerializer):
    department_name = serializers.CharField(source='department.name', read_only=True)

    class Meta:
        model = Employee
        fields = '__all__'

    def validate_email(self, value):
        value = value.strip().lower()
        instance = self.instance
        qs = Employee.objects.filter(email=value)
        if instance:
            qs = qs.exclude(pk=instance.pk)
        if qs.exists():
            raise serializers.ValidationError('An employee with this email already exists.')
        return value

    def validate_full_name(self, value):
        value = value.strip()
        if len(value) < 2:
            raise serializers.ValidationError('Name must be at least 2 characters.')
        return value

    def validate_role(self, value):
        value = value.strip()
        if not value:
            raise serializers.ValidationError('Role is required.')
        return value
