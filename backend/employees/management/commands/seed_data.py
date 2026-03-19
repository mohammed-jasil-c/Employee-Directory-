from django.core.management.base import BaseCommand
from employees.models import User, Employee, Department


class Command(BaseCommand):
    help = 'Seed the database with sample data'

    def handle(self, *args, **kwargs):
        self.stdout.write('Seeding data...')

        # Create admin user
        if not User.objects.filter(email='admin@company.com').exists():
            User.objects.create_superuser(
                email='admin@company.com',
                password='admin123',
                full_name='Admin User'
            )
            self.stdout.write(self.style.SUCCESS('Created admin user: admin@company.com / admin123'))
        else:
            self.stdout.write('Admin user already exists.')

        # Create departments
        departments_data = [
            'Engineering', 'Product', 'Design', 'Marketing',
            'Sales', 'Human Resources', 'Finance', 'Operations'
        ]
        departments = {}
        for dep_name in departments_data:
            dep, _ = Department.objects.get_or_create(name=dep_name)
            departments[dep_name] = dep

        # Create employees
        employees_data = [
            {'full_name': 'Alice Johnson', 'email': 'alice@company.com', 'role': 'Senior Engineer', 'department': 'Engineering', 'phone': '+1-555-0101', 'location': 'New York'},
            {'full_name': 'Bob Smith', 'email': 'bob@company.com', 'role': 'Product Manager', 'department': 'Product', 'phone': '+1-555-0102', 'location': 'San Francisco'},
            {'full_name': 'Carol White', 'email': 'carol@company.com', 'role': 'UX Designer', 'department': 'Design', 'phone': '+1-555-0103', 'location': 'Austin'},
            {'full_name': 'David Brown', 'email': 'david@company.com', 'role': 'Marketing Lead', 'department': 'Marketing', 'phone': '+1-555-0104', 'location': 'Chicago'},
            {'full_name': 'Eva Martinez', 'email': 'eva@company.com', 'role': 'Sales Executive', 'department': 'Sales', 'phone': '+1-555-0105', 'location': 'Miami'},
            {'full_name': 'Frank Lee', 'email': 'frank@company.com', 'role': 'Backend Engineer', 'department': 'Engineering', 'phone': '+1-555-0106', 'location': 'Seattle'},
            {'full_name': 'Grace Kim', 'email': 'grace@company.com', 'role': 'HR Manager', 'department': 'Human Resources', 'phone': '+1-555-0107', 'location': 'Boston'},
            {'full_name': 'Henry Wilson', 'email': 'henry@company.com', 'role': 'Finance Analyst', 'department': 'Finance', 'phone': '+1-555-0108', 'location': 'Denver'},
            {'full_name': 'Iris Chen', 'email': 'iris@company.com', 'role': 'Frontend Engineer', 'department': 'Engineering', 'phone': '+1-555-0109', 'location': 'Portland'},
            {'full_name': 'Jack Davis', 'email': 'jack@company.com', 'role': 'Operations Manager', 'department': 'Operations', 'phone': '+1-555-0110', 'location': 'Phoenix'},
            {'full_name': 'Karen Taylor', 'email': 'karen@company.com', 'role': 'Product Designer', 'department': 'Design', 'phone': '+1-555-0111', 'location': 'Los Angeles'},
            {'full_name': 'Liam Anderson', 'email': 'liam@company.com', 'role': 'DevOps Engineer', 'department': 'Engineering', 'phone': '+1-555-0112', 'location': 'Atlanta'},
        ]

        created = 0
        for emp_data in employees_data:
            dep_name = emp_data.pop('department')
            emp_data['department'] = departments[dep_name]
            _, created_flag = Employee.objects.get_or_create(
                email=emp_data['email'],
                defaults=emp_data
            )
            if created_flag:
                created += 1

        self.stdout.write(self.style.SUCCESS(f'Created {created} employees.'))
        self.stdout.write(self.style.SUCCESS('Seeding complete!'))
