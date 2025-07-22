from django.contrib import admin
from django.db.models import Sum

from .models import Question, Choice

class QuestionAdmin(admin.ModelAdmin):
    list_display = ['question_text', 'pub_date', 'total_votes']

    @admin.display(
        description='Total Votes',
        ordering='total_votes_sum'
    )
    def total_votes_for_display(self, obj: Question):
        return obj.total_votes() or 0

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        queryset = queryset.annotate(total_votes_sum=Sum('choice__votes'))
        return queryset

admin.site.register(Question, QuestionAdmin)
admin.site.register(Choice)