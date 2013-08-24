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
			console.debug("HNES - Creating root comment for # " + i);
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
	})

	$('.commentWrapper').filter(function(index) {
		return index % 2 == 1;
	}).addClass('odd');



	/***************************************
	 * Enable tagging of users
	 ***************************************/

	 // Find all user links
	 var userLinks = $(document).find('a').filter(function() {
	 	return $(this).attr('href').indexOf('user') == 0;
	 });
	 userLinks.addClass('userLink');

	 // Register their click events
	 $('.userLink').click(function() {
	 	if($(this).next('.userPanel').length > 0) {
	 		// Remove the user panel
	 		$(this).next('.userPanel').first().remove();
	 	}
	 	else {
	 		// Show the user panel
	 		$(this).after('<div class="userPanel"><a href="' + $(this).attr('href') + '">Profile</a><br/>Tag: <input type="text" </div>');
	 	}
	 	return false;
	 });
});

// Extracts the important content from the table row and returns it as a nice object.
function extractComment(content) {
	depthContent = $(content).find('img').eq(0).attr('width');
	voteContent = $(content).find('center').eq(0).html();
	headerContent = $(content).find('.comhead').eq(0).html();
	commentContent = $(content).find('.comment').eq(0).html();

	return {
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
	$(parent).append("<div class='commentWrapper'><span class='collapse'>-</span><div class='commentHeader'>" + comment.vote + comment.header + "</div><div class='commentBody'>" + comment.comment);
	
	// Add any children
	var newParent = $(parent).children('.commentWrapper').last().children('.commentBody').first();
	for(var i = 0; i < comment.children.length; i++) {
		console.debug("HNES - # of children: " + comment.children.length);
		$('#hnes_comments').append(createDiv(comment.children[i], newParent));
		comment.children[i] = null;
	}

	// Close the divs, rejoice
	$('#hnes_comments').append("</div></div>");
}
