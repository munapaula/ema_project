// Erweiterung des bootstrap modals
$('#ajaxModal').on('show.bs.modal', function (event) {
  var button = $(event.relatedTarget); // Button that triggered the modal
  var task_id = button.data('task'); // Extract info from data-* attributes
  var modal = $(this);
  hideDeleteQuestion();
  // empty error fields
  $('.help-block').empty();
  $('.form-group.has-error').attr('class', 'form-group');
  // wenn eine neue Aufgabe hinzugefuegt wird
  if(task_id == "0") {
    var topic_id = button.data('topic');
    $('#taskModalHeader').text('Add a new task to topic:');
    // sichergehen dass das Form leer ist
    $('#ajaxTask')[0].reset();
    // vorbereiten
    $('select#id_topic').val(topic_id).attr('selected', 'selected');
    //$('#id_topic option[value="'+topic_id+'"]').attr("selected",true);
    var submitInput = $('#submitAjax');
    submitInput.val('add task');
    submitInput.attr('class', 'btn btn-success center-block');
    submitInput.data('task_id', task_id);
    $('#ajaxDeleteConfirm').css('display', 'none');
    modal.find('#done').css('display', 'none');
  } else {
    // Aufgabe bearbeiten
    $('#taskModalHeader').text('Edit task "' + TaskData.data[task_id].name + '"');
    $('#submitAjax').val('save task');
    var modal_body = modal.find('form#ajaxTask').children('.modal-body');
    var modal_header = modal.find('form#ajaxTask').children('.modal-header');
    var submit_footer = modal.find('.modal-footer');
    submit_footer.children('#submitAjax').attr('class', 'btn btn-success gap');
    submit_footer.children('#ajaxDeleteConfirm').css('display', 'inline-block');
    modal_body.find('#done').css('display', 'block');
    prefillForm(task_id, modal_body, modal_header, submit_footer);
  }
});

// not possible to add task when there is no topic
$('#nullTopic').on('click', function(e) {
  displayMessage("noTopic", -1);
});

// AJAX Request fuer Urgent Axis
$('#saveDefaultAxis').on('click', function(e) {
  e.preventDefault();
  var urgent_buttons = $('prefsMonth');
  var month = -1;
  if($('#months-1').css('backgroundColor') == 'rgb(43, 70, 96)') {
    month = 0;
  } else if ($('#months-2').css('backgroundColor') == 'rgb(43, 70, 96)') {
    month = 1;
  } else if ($('#months-4').css('backgroundColor') == 'rgb(43, 70, 96)') {
    month = 2;
  }
  $.ajax({
    url: "/account/",
    type: "POST",
    dataType: "json",
    data: {
      'urgent_axis': month
    },
    success: function(data) {
      console.log(data[0].urgent_axis);
      displayMessage("settingsMonth", data[0].urgent_axis);
      Sidebar.prefsMonths(data[0].urgent_axis);
    },
    error: function(data) {
      console.log("error!");
      console.log(data);
    }
  });
});

// AJAX Request fuer erstellen oder bearbeiten einer Aufgabe
$('#submitAjax').on('click', function(e) {
  e.preventDefault();
  var task_id = $('#submitAjax').data('task_id');
  var form = $('form#ajaxTask');
  // url je nach erstellen oder bearbeiten
  var urlAjax = "/matrix/"+task_id+"/taskediting/";
  if (task_id == "0") {
    urlAjax = "/matrix/adding/";
  }
  $.ajax({
    url: urlAjax,
    type: "POST",
    dataType: "json",
    data: {
      'task_name': form.find('#id_task_name').val(),
      'task_description': form.find('#id_task_description').val(),
      // richtiges zeitformat, richtige zeitzone
      'due_date': formatDate2Form(moment.utc(form.find($('#datetimepicker')).data("DateTimePicker").date()).format()),
      'importance': form.find('#id_importance').val(),
      'topic': form.find('#id_topic').val(),
      'duration': form.find('#id_duration').val(),
      'done': form.find('#id_done').prop('checked')
    },
    success: function(data) {
      // alle Aufgaben neu zeichnen, updaten
      Matrix.updateMatrixAjax(data);
      // Ersatz fuer django messages System
      displayMessage("task", task_id);
      // Sidebar updaten
      var topic = $('#ajaxTask').find('#id_topic').val();
      updateSidebarNumbers(task_id, topic);
      // Form reseten
      $('#ajaxTask')[0].reset();
      // und schliessen
      $('#ajaxModal').find('button[data-dismiss="modal"]').click();
    },
    error: function(data) {
      // zurueckbekommene fehler durchgehen und an die entsprechenden felder
      // schreiben
      for(error in data.responseJSON) {
        var divWithError = form.find('#'+error);
        divWithError.attr('class', 'form-group has-error');
        divWithError.children('.help-block').text(data.responseJSON[error]);
      }
    }
  });
});

// Hilfsfunktion fuer den delete button
$('#ajaxDeleteConfirm').on('click', function(e) {
  e.preventDefault();
  showDeleteQuestion();
});

// Hilfsfunktion fuer den cancel button
$('#ajaxDeleteCancel').on('click', function(e) {
  e.preventDefault();
  hideDeleteQuestion();
});

// AJAX Request fuer delete task
$('#ajaxDeleteSubmit').on('click', function(e) {
  e.preventDefault();
  var task_id = $('#ajaxDeleteSubmit').data('task_id');
  $.ajax({
    url: "/matrix/"+task_id+"/taskdelete/",
    type: "POST",
    success: function(data) {
      Matrix.updateMatrixAjax(data);
      displayMessage("delete", -1);
      var topic = $('#ajaxTask').find('#id_topic').val();
      updateSidebarNumbers("-1", topic);
      $('#ajaxTask')[0].reset();
      hideDeleteQuestion();
      $('#ajaxModal').find('button[data-dismiss="modal"]').click();
    },
    error: function(data) {
      for(error in data.responseJSON) {
        var divWithError = form.find('#'+error);
        divWithError.attr('class', 'form-group has-error');
        divWithError.children('.help-block').text(data.responseJSON[error]);
      }
    }
  });
});

// Hilfsfunktion um die Nummern neben den Themen in der Sidebar anzupassen
function updateSidebarNumbers(task_id, topic) {
  if (task_id == "0" || task_id == "-1") {
    var button2change = $('button#'+topic).children('span');
    var stringTo = button2change.text();
    var this_number = parseInt(stringTo.replace(/[^0-9\.]/g, ''), 10);
    if (task_id == "0") {
      button2change.text('('+(this_number+1)+')');
    } else {
      button2change.text('('+(this_number-1)+')');
    }
  }
}

// Hilfsfunktion um bei der Bearbeitung die Werte der Aufgabe einzutragen
function prefillForm(task_id, editForm, headerForTopic, submit_footer) {
  var task = TaskData.data[task_id];
  editForm.find('input#id_task_name').val(task.name);
  editForm.find('textarea#id_task_description').val(task.description);
  datum = new Date(task.due_date);
  editForm.find('#datetimepicker').data('DateTimePicker').date(datum);
  editForm.find('select#id_importance').val(task.importance).attr('selected', 'selected');
  headerForTopic.find('select#id_topic').val(task.topic).attr('selected', 'selected');
  editForm.find('#id_duration').val(task.duration);
  // don't need to fill in done, because all displayed tasks are not done!
  submit_footer.find('input[type="submit"]#submitAjax').data('task_id', task_id);
  submit_footer.find('input[type="submit"]#ajaxDeleteSubmit').data('task_id', task_id);
}

// Formattierung eines Datums, um das richtige Format an django zu liefern
function formatDate2Form(date) {
  var dueDate = new Date(date);
  var formattedDate = "";
  if(dueDate.getDate() < 10) {
    formattedDate += "0";
  }
  formattedDate += dueDate.getDate();
  formattedDate += "/";
  if(dueDate.getMonth() < 9) {
    formattedDate += "0";
  }
  formattedDate += (dueDate.getMonth()+1);
  formattedDate += "/";
  formattedDate += dueDate.getFullYear();
  formattedDate += " ";
  if(dueDate.getHours() < 10) {
    formattedDate += "0";
  }
  formattedDate += dueDate.getHours();
  formattedDate += ":"
  if(dueDate.getMinutes() < 10) {
    formattedDate += "0";
  }
  formattedDate += dueDate.getMinutes();
  return formattedDate;
}

// Hilfsfunktion, Ersatz fuer das django messages system
/* modes
  created
  delete
  noTopic
  done
  edited
  settingsMonth
*/
function displayMessage(mode, id) {
  // empty notifications of before
  $('.messages .text').empty();
  var text_span = $('<span/>');
  // created
  if (mode == "settingsMonth") {
    var months = "";
    if (id == 0) {
      months = "1 month";
    } else if (id == 1) {
      months = "2 months";
    } else if (id == 2) {
      months = "4 months";
    }
    text_span.text('Successfully changed default settings to ' + months + '!');
  } else if (mode == "task") {
    if (id == 0) {
      text_span.text('Successfully created new task!');
    } else if (TaskData.data[id] == undefined) {
      text_span.text('Great Job!');
    }
  } else if (mode == "delete") {
    text_span.text('Deleted!');
  } else if (mode == "noTopic") {
    text_span.text('You cannot add a Task without having a Topic. Please add a Topic first!');
  } else {
  // edited
    text_span.text('Successfully edited task "' + TaskData.data[id].name +  '"');
  }
  $('.messages').css('display', 'block');
  $('.messages .text').prepend(text_span);
}

// Hilfsfunktionen Delete and Cancel
function showDeleteQuestion() {
  $('.deleteConfirmDialog').css('display', 'inline-block');
  $('#ajaxDeleteConfirm').attr('disabled', 'disabled');
  $('#submitAjax').attr('disabled', 'disabled');
}

function hideDeleteQuestion() {
  $('.deleteConfirmDialog').css('display', 'none');
  $('#ajaxDeleteConfirm').removeAttr('disabled');
  $('#submitAjax').removeAttr('disabled');
}
