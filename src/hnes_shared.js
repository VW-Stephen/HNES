$(document).ready(function() {
	// Include jQuery in the page source as well, to make debugging easier
	$('head').append("<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'></script>");

	/***************************************
	 * Inject the user tags
	 ***************************************/

	// Find all user links
	var userLinks = $(document).find('a').filter(function() {
		if($(this).attr('href') == null)
			return false;
		return $(this).attr('href').indexOf('user') == 0;
	});
	userLinks.addClass('userLink');

	// Get the username of the poster, if we can
	var poster = $('table').eq(0).find('tr').eq(3).find('.userLink').eq(0);
	if(poster != null && poster.text() != '')
	{
		poster = poster.text();
		console.debug("HNES - Found poster '" + poster + "'");
	}

	// For each user link, get their tag (if they have one)
	for(var i = 0; i < userLinks.length; i++) {
		var username = $(userLinks[i]).text();
		var tag = "hnes." + username + ".tag";

		var data = localStorage.getItem(tag);
		if(data != null)
			tagUser(userLinks[i], data);

		// Flag the poster, if we can
		if(poster != null && poster != '' && username == poster)
			$(userLinks[i]).addClass('poster');
	}
	console.debug("HNES - Registered tag callbacks");
});

// Tags the given user link with the given tag string
function tagUser(link, tag) {
	// If there's already a user tag on this link, remove it
	var existing = $(link).next('.userTag');
	if(existing != null)
		existing.remove();

	// Set the input box's text to match the tag (for nicer editing)
	$(link).parent().find('input[type=text]').val(tag);

	// If the tag is empty, do nothing
	if(tag == null || tag == "")
		return;

	// Otherwise, add the tag span
	console.debug("HNES - Tagging user '" + $(link).text() + "' as '" + tag + "'");
	$(link).after("<span class='userTag'>" + tag + "</span>");
}