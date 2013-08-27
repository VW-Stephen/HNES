$(document).ready(function() {
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
		myDepth = + newComments[i].depth;
		if(myDepth != 0) {
			// I'm not a root comment, so work backwards to find my parent
			for(j = i; j >= 0; j--) {
				theirDepth = + newComments[j].depth;
				if(theirDepth < myDepth) {
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
			$('#hnes_comments').append(createDiv(newComments[i]));
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

	// Register the save buttons' click event
	$('.tagSave').click(function() {
		// Get the user link
		var userLink = $(this).parent().parent().find('.userLink');
		var tag = $(this).prev('input[type=text]').val();

		// Save the tag, update it on the page
		localStorage.setItem("hnes." + userLink.text() + ".tag", tag);
		tagUser(userLink, tag);

		// Hide the panel
		$(this).parent().css({'display':'none'});
	});

	// TODO: Highlight the OP

	/**********************************************
	 * Typographic bullshit that I can't do in CSS
	 **********************************************/

	 // Make links be underlined. For some reason they aren't. Huh.
	 $('a').not('.userLink').css({'text-decoration':'underline'});
});

// Extracts the important content from the table row and returns it as a nice object.
function extractComment(content) {
	depthContent = $(content).find('img').eq(0).attr('width');
	voteContent = $(content).find('center').eq(0).html();
	headerContent = $(content).find('.comhead').eq(0).html();
	
	// Get the comment info
	var commentSpan = $(content).find('.comment').eq(0);
	commentContent = commentSpan.html();

	// Hack around the bullshit HN generator that puts comment content OUTSIDE the comment span. Thanks guys. A+ job, all around.
	var commentKids = commentSpan.parent().children('p');
	if(commentKids.length > 0) {
		for(var i = 0; i < commentKids.length; i++) {
			commentContent += '<p>' + commentKids.eq(i).html() + '</p>';
		}
	}
	return {
		odd : false,
		depth : depthContent,
		vote : voteContent,
		header : headerContent,
		comment : commentContent,
		parent : null,
		children : [],
		html : ""
	};
}

// Creates the div content for the given comment, recurses into its children and does them too.
function createDiv(comment) {
	// Create the comment div(s)
	var odd = comment.odd ? " odd" : "";
	comment.html = "<div class='commentWrapper" + odd + "'><span class='collapse'>-</span><div class='commentHeader'>" + comment.vote + comment.header +
		" | <a class='tagLink'>tag user</a><div class='userPanel'><input type='text'/> <input type='button' class='tagSave' value='Save'/></div></div><div class='commentBody'>" + comment.comment;

	// Add any children
	//var newParent = $(parent).children('.commentWrapper').last().children('.commentBody').first();
	for(var i = 0; i < comment.children.length; i++) {
		comment.html += createDiv(comment.children[i]);
		comment.children[i] = null;
	}

	// Close the divs, rejoice
	comment.html += "</div></div>";
	return comment.html;
}