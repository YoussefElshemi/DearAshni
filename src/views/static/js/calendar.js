let calendar, prevEvent;

document.addEventListener('DOMContentLoaded', function() {
	const calendarEl = document.getElementById('calendar');
  calendar = new FullCalendar.Calendar(calendarEl, {
		editable: true,
    dayMaxEvents: true,
		themeSystem: 'bootstrap',
		eventColor: '#333333',
		initialView: 'timeGridWeek',
		nowIndicator: true,
		headerToolbar: {
      center: 'addEventButton deleteEventButton'
    },
		selectable: true,	
		unselectAuto: false,		
		customButtons: {
      addEventButton: {
        text: 'Add Event',
        click: function() {
					$("#add-event").modal({ show: true });
				}
			},
			deleteEventButton: {
				text: 'Delete Event',
				click: function() {
					$("#delete-event").modal({ show: true });
				}
			}
		},
		select: function(info) {
			$(prevEvent).css('background-color', '#333333');
			document.getElementById('id').value = '';
			const { start, end, allDay } = info;
			document.getElementById('start').value = start;
			document.getElementById('end').value = end;
			document.getElementById('allDay').value = allDay;
		},
		unselect: function() {
			document.getElementById('start').value = '';
			document.getElementById('end').value = '';
			document.getElementById('allDay').value = '';
		},
		eventClick: function(event) {
			if ($(event.el).css('background-color') === 'rgb(51, 51, 51)') {
				$(event.el).css('background-color', '#555555');
				document.getElementById('id').value = event.event.id;
			} else {
				document.getElementById('id').value = '';
				$(event.el).css('background-color', '#333333');
			}

			if (!$(prevEvent).is($(event.el))) {
				$(prevEvent).css('background-color', '#333333');
				prevEvent = event.el;
			}
		},
		eventDrop: function({ event }) {
			$.ajax({
				type: "POST",
				url: '/calendar/update',
				data: {
					id: event.id,
					start: event.start,
					end: event.end,
					allDay: event.allDay
				},
				dataType: 'json'
			});
		},
		eventResize: function({ event }) {
			$.ajax({
				type: "POST",
				url: '/calendar/update',
				data: {
					id: event.id,
					start: event.start,
					end: event.end,
					allDay: event.allDay
				},
				dataType: 'json'
			});
		},
		events: '/calendar/query'
  });
      
	calendar.render();

	$(document.body).find('button').each(function() {
		$(this).addClass('btn').addClass('btn-primary').removeClass('fc-button').removeClass('fc-button-primary');
	});

	$('#add-event-submit').click(function(e) {
		e.preventDefault();
		const data = { };

		$('#add-event-form').serializeArray().forEach(c => {
			data[c.name] = c.value
		});

		$.ajax({
			type: 'POST',
			url: '/calendar/new/',
			data,
			dataType: 'json',
			success: function({ event }) {
				calendar.addEvent(event);
				$("#add-event").modal('hide');
				$('#add-event-form').trigger("reset");
			},
			error: function({ responseJSON }) {
				$('#main').append(`
					<div class="alert alert-danger alert-dismissible fade show" role="alert">
						${responseJSON.message}
						<button type="button" class="close" data-dismiss="alert" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
				`);
        
				$('#add-event').modal('hide');
				$('#add-event-form').trigger("reset");
			}
		});
	});

	$('#delete-event-submit').click(function(e) {
		e.preventDefault();
		const data = { };
		
    $('#delete-event-form').serializeArray().forEach(c => {
			data[c.name] = c.value
		});

		$.ajax({
			type: 'POST',
			url: '/calendar/delete/',
			data,
			dataType: 'json',
			success: function({ event }) {
				calendar.getEventById(event.id).remove();
				$('#delete-event').modal('hide');
				$('#delete-event-form').trigger('reset');
			},
			error: function({ responseJSON }) {
				$("#main").append(`
					<div class="alert alert-danger alert-dismissible fade show" role="alert">
						${responseJSON.message}
						<button type="button" class="close" data-dismiss="alert" aria-label="Close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
				`);

				$("#delete-event").modal('hide');
				$('#delete-event-form').trigger("reset");
			}
		});
	});

	$('html').keyup(function (e) {
		if(e.keyCode == 46) {
			$("#delete-event").modal({ show: true });
		}
	});

	$('#delete-event-form input').keydown(function(e) {
    if (e.keyCode == 13) {
      $('#delete-event-form').submit();
    }
	});

	$('#add-event-form input').keydown(function(e) {
    if (e.keyCode == 13) {
      $('#delete-event-form').submit();
    }
	});
});