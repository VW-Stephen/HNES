$(document).ready(function() {
	// Find the user label
	var userLabel = $('td').filter(function() {
		return $(this).html().indexOf('user:') == 0;
	});

	// Add any tags to the user label
	if(userLabel.length > 0) {
		userLabel = $(userLabel[0]);
		var userName = userLabel.next('td').text();

		var tag = localStorage.getItem('hnes.' + userName + '.tag');
		if(tag != null && tag != "")
			userLabel.next('td').append("<span class='userTag'>" + tag + "</span>");
	}

	// BUG: Why's this required?
	// Make sure the user tag is getting the CSS correctly. For some reason it's not? I dunno.
	$('.userTag').css({
		'background':'#fdd',
		'border':'1px solid #644',
		'color':'#644',
		'margin-left':'5px',
		'padding':'1px 3px'
	});
});