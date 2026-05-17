"""
SMS service — Fast2SMS integration for OTP delivery.
Falls back silently in dev mode when OTP_DEV_BYPASS=True.
"""

import logging
import requests
from django.conf import settings

logger = logging.getLogger(__name__)

FAST2SMS_URL = 'https://www.fast2sms.com/dev/bulkV2'


def send_otp_sms(mobile: str, code: str) -> bool:
    """
    Send OTP to the given mobile number via Fast2SMS.
    Returns True on success, False on failure.
    """
    api_key = getattr(settings, 'FAST2SMS_API_KEY', None)

    if not api_key:
        logger.warning('[SMS] FAST2SMS_API_KEY not set — OTP not delivered.')
        return False

    # Strip country code if present
    number = mobile.lstrip('+').lstrip('91') if mobile.startswith('+91') else mobile

    try:
        resp = requests.post(
            FAST2SMS_URL,
            headers={
                'authorization': api_key,
                'Content-Type': 'application/json',
            },
            json={
                'route': 'otp',
                'variables_values': code,
                'flash': 0,
                'numbers': number,
            },
            timeout=10,
        )
        data = resp.json()
        if data.get('return'):
            logger.info(f'[SMS] OTP sent to {mobile}')
            return True
        else:
            logger.error(f'[SMS] Fast2SMS error: {data}')
            return False
    except Exception as exc:
        logger.exception(f'[SMS] Failed to send OTP to {mobile}: {exc}')
        return False
