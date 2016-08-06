from __future__ import absolute_import

from django.conf.urls import url
from django.contrib.auth.decorators import login_required

from . import views
from .views import AddTopicView, AddTaskView, TaskUpdate, TaskCreate
from .views import TopicUpdate, TaskDelete

urlpatterns = [
    # /matrix/
    url(r'^$', views.matrix, name='matrix'),
    # /matrix/addtopic
    url(r'^addtopic/$', AddTopicView.as_view(), name='addtopic'),
    # /matrix/5/
    url(r'^(?P<topic_id>[0-9]+)/$', views.topics, name='topics'),
    # /matrix/5/tasks
    url(r'^(?P<task_id>[0-9]+)/tasks/$', views.tasks, name='tasks'),
    # /matrix/5/adding
    # url(r'^(?P<topic_id>[0-9]+)/adding/$', TaskCreate.as_view(), name='adding'),
    # url(r'^(?P<topic_id>[0-9]+)/adding/$', AddTaskView.as_view(), name='adding'),
    url(r'^adding/$', login_required(AddTaskView.as_view()), name='adding'),
    # /matrix/5/edittopic
    url(r'^(?P<topic_id>[0-9]+)/topicediting/$', TopicUpdate.as_view(),
            name='topicediting'),
    # /matrix/5/tasks/editing
    url(r'^(?P<task_id>[0-9]+)/taskediting/$', TaskUpdate.as_view(), name='taskediting'),
    # /matrix/5/tasks/deleting
    url(r'^(?P<task_id>[0-9]+)/taskdeleting/$', TaskDelete.as_view(), name='taskdeleting')
]
