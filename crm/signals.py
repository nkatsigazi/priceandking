from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from .models import EngagementTask

@receiver([post_save, post_delete], sender=EngagementTask)
def update_engagement_progress(sender, instance, **kwargs):
    """
    Automatically updates the Engagement's completion percentage 
    whenever a task is saved, updated, or deleted.
    """
    engagement = instance.engagement
    total_tasks = engagement.tasks.count() # Uses the related_name='tasks'
    
    if total_tasks > 0:
        completed_tasks = engagement.tasks.filter(status='DONE').count()
        engagement.completion_percentage = int((completed_tasks / total_tasks) * 100)
    else:
        engagement.completion_percentage = 0
        
    # update_fields prevents a recursive loop by only saving the percentage
    engagement.save(update_fields=['completion_percentage'])