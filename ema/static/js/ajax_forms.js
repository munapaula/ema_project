$('.ajaxFormCreateTask').submit(function(e) {
  e.preventDefault();
  $.ajax({
    url: "/matrix/create_task/",
    type: "POST",
    dataType: "json",
    data: {
      'task_name': $('#id_task_name').val(),
      'task_description': $('#id_task_description').val(),
      'due_date': $('#id_due_date').val(),
      'importance': $('#id_importance').val(),
      'topic': $('#id_topic').val()
    },
    success: function(data) {
      console.log("server responded ok!");
      console.log(data);
      TaskData.getTasks(data);
      Matrix.drawTasks(TaskData.data, TopicData.data, s.width, s.height);
      console.log("did draw!");
    },
    error: function(data) {
      console.log("an error occurred!");
    }
  });
});
