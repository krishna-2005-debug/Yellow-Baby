"""Custom exception handler for Yellow Baby API."""

from rest_framework.views import exception_handler
from rest_framework.response import Response
from rest_framework import status


def custom_exception_handler(exc, context):
    response = exception_handler(exc, context)

    if response is not None:
        custom_response = {
            'success': False,
            'status_code': response.status_code,
            'errors': response.data,
        }
        return Response(custom_response, status=response.status_code)

    return Response(
        {'success': False, 'message': 'An unexpected error occurred.'},
        status=status.HTTP_500_INTERNAL_SERVER_ERROR,
    )
