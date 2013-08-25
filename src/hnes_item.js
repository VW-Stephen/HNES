$(document).ready(function() {
	// TODO: For debugging only, remove when the time comes to... not... debug...
	str = "<script type='text/javascript' src='https://ajax.googleapis.com/ajax/libs/jquery/1.10.2/jquery.min.js'></script>";
	$('head').append(str);

	/***************************************
	 * Make the comments look nicer
	 ***************************************/

	// Get the first table. Then get its third row. Then its first column. Then the second table in that. Then get all the rows in the tbody. Then say "fuck web design principals!". Then weep uncontrollably.
	comments = $('table').first().find('tr').eq(3).children('td').eq(0).children('table').eq(1).children('tbody').eq(0).children('tr');
	numComments = comments.length;
	console.debug("HNES - # comments: " + numComments);

	// If there are no comments, then we're done I guess?
	if(numComments == 0)
		return;

	// Go get all the comments and turn em into objects
	newComments = [];
	for(i = 0; i < numComments; i++) {
		newComments.push(extractComment(comments[i]));
		comments[i] = null;
	}
	comments = null;

	// Got the nice new comments, now we iterate through them and create the nested comment structure
	for(i = 1; i < numComments; i++) {
		myDepth = newComments[i].depth;
		if(myDepth != 0) {
			// I'm not a root comment, so work backwards to find my parent
			for(j = i; j >= 0; j--) {
				if(newComments[j].depth < myDepth) {
					// The depth of the item we just found is less than ours. So that's our parent!
					newComments[j].children.push(newComments[i]);

					// If the paren't isn't odd, then we are
					if(!newComments[j].odd)
						newComments[i].odd = true;
					break;
				}
			}
		}
	}
	console.debug("HNES - Finished creating parent/child relationships");

	// Get the table row that holds all the comments, and clear it out
	commentRow = $('table').first().find('tr').eq(3).children('td').eq(0).children('table').eq(1);
	commentRow.after('<div id="hnes_comments"></div>');
	commentRow.remove();

	// Put the content on the page, plz
	for(var i = 0; i < numComments; i++) {
		if(newComments[i].depth == 0) {
			createDiv(newComments[i], '#hnes_comments');
			newComments[i] = null;
		}
	}
	newComments = null;
	console.debug("HNES - Divs created");

	// Register the collapse click functions
	$('.collapse').click(function() {
		var commentBody = $(this).nextAll('.commentBody').eq(0);
		if(commentBody.css('display') == 'none')
		{
			// Show the comment
			commentBody.css({'display' : 'block'});
			$(this).html('-');
		}
		else
		{
			// Hide the comment
			commentBody.css({'display' : 'none'});
			$(this).html('+');
		}
	});

	/***************************************
	 * Enable tagging of users
	 ***************************************/

	// Find all user links
	var userLinks = $(document).find('a').filter(function() {
		if($(this).attr('href') == null)
			return false;
		return $(this).attr('href').indexOf('user') == 0;
	});
	userLinks.addClass('userLink');

	// Register their click events
	$('.tagLink').click(function() {
		if($(this).next('.userPanel').css('display') == 'none') {
			$(this).next('.userPanel').css({'display':'inline-block'});
		}
		else {
			$(this).next('.userPanel').css({'display':'none'});
		}
		return false;
	});
	console.debug("HNES - User panels created");

	// For each user link, get their tag (if they have one)
	for(var i = 0; i < userLinks.length; i++) {
		var username = $(userLinks[i]).html();
		var tag = "hnes." + username + ".tag";

		var data = localStorage.getItem(tag);
		if(data != null)
			tagUser(userLinks[i], data);
	}
	console.debug("HNES - Registered tag callbacks");

	// Register the save buttons' click event
	$('.tagSave').click(function() {
		// Get the user link
		var userLink = $(this).parent().parent().find('.userLink');
		var tag = $(this).prev('input[type=text]').val();

		// Save the tag, update it on the page
		localStorage.setItem("hnes." + userLink.html() + ".tag", tag);
		tagUser(userLink, tag);

		// Hide the panel
		$(this).parent().css({'display':'none'});
	});
});

// Extracts the important content from the table row and returns it as a nice object.
function extractComment(content) {
	depthContent = $(content).find('img').eq(0).attr('width');
	voteContent = $(content).find('center').eq(0).html();
	headerContent = $(content).find('.comhead').eq(0).html();
	commentContent = $(content).find('.comment').eq(0).html();

	return {
		odd : false,
		depth : depthContent,
		vote : voteContent,
		header : headerContent,
		comment : commentContent,
		parent : null,
		children : []
	};
}

// Creates the div content for the given comment, recurses into its children and does them too.
function createDiv(comment, parent) {
	// Create the comment div(s)
	var odd = comment.odd ? " odd" : "";
	$(parent).append("<div class='commentWrapper" + odd + "'><span class='collapse'>-</span><div class='commentHeader'>" + comment.vote + comment.header +
		" | <a class='tagLink'>tag user</a><div class='userPanel'><input type='text'/> <input type='button' class='tagSave' value='Save'/></div></div><div class='commentBody'>" + comment.comment);

	// Add any children
	var newParent = $(parent).children('.commentWrapper').last().children('.commentBody').first();
	for(var i = 0; i < comment.children.length; i++) {
		$('#hnes_comments').append(createDiv(comment.children[i], newParent));
		comment.children[i] = null;
	}

	// Close the divs, rejoice
	$('#hnes_comments').append("</div></div>");
}

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
	console.debug("HNES - Tagging user '" + $(link).html() + "' as '" + tag + "'");
	$(link).after("<span class='userTag'>" + tag + "</span>");
}