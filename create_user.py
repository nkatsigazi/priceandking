import os
import django

# Setup Django environment
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from core.models import User

def setup_users():
    # 1. Create Admin (Staff)
    if not User.objects.filter(email="admin@pk.com").exists():
        print("Creating Admin...")
        User.objects.create_superuser(
            email="admin@pk.com",
            password="1234@ABC",
            role="PARTNER",
            first_name="Admin",
            last_name="User"
        )
    
    # 2. Create Client
    if not User.objects.filter(email="kk@pk.com").exists():
        print("Creating Client...")
        User.objects.create_user(
            email="kk@pk.com",
            password="1234@ABC",
            role="CLIENT",
            first_name="K",
            last_name="K"
        )

if __name__ == "__main__":
    setup_users()
    print("User setup complete.")