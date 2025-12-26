import pyotp
from django.core.mail import send_mail
from django.conf import settings

def send_otp_email(user):
    totp = pyotp.TOTP(user.email_otp, interval=300)
    code = totp.now()
    
    subject = "Verify your email"
    message = f"Hi {user.full_name},\n\nYour verification code is: {code}\n\nIt expires in 5 minutes."
    
    send_mail(
        subject,
        message,
        settings.EMAIL_HOST_USER,
        [user.email],
        fail_silently=False,
    )