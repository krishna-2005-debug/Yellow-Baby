import os
import django
import sys

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'yellow_baby_backend.settings')
django.setup()

from django.contrib.auth import get_user_model

def reset_admin(mobile, password):
    User = get_user_model()
    user, created = User.objects.get_or_create(mobile=mobile)
    user.is_staff = True
    user.is_superuser = True
    user.set_password(password)
    user.save()
    
    status = "Created new" if created else "Updated existing"
    print(f"\n✅ SUCCESS: {status} admin user!")
    print(f"👉 ID / Mobile: {mobile}")
    print(f"👉 Password:    {password}\n")

if __name__ == "__main__":
    print("--- YELLOW BABY ADMIN RESET ---")
    mobile = input("Enter admin mobile number (e.g., 9999999999): ").strip()
    password = input("Enter new password: ").strip()
    
    if mobile and password:
        reset_admin(mobile, password)
    else:
        print("❌ Error: Mobile and password cannot be empty.")
        sys.exit(1)
