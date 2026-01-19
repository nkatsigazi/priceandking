from django.apps import AppConfig

class CrmConfig(AppConfig):
    default_auto_field = 'django.db.models.BigAutoField'
    name = 'crm'

    def ready(self):
        # We import the signals file here. 
        # This ensures they are registered as soon as the app is loaded.
        import crm.signals