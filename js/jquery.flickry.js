/*
	jQuery.flickry.js
	Copyright 2010 Tim Broddin - tim@brodd.in - http://tim.brodd.in

*/
(function($){
	var methods = {
		init: function(options) {
			var ctx = $(this); // input which holds the widget
			var images = []; // array for easy access later on
			var thumbs = []; // array for easy access later on
			var settings = {
				api:
					{ url: 'http://api.flickr.com/services/rest/?jsoncallback=?',
					  key: 'ebe7787af56999af2687900ba2219380'
					},
				thumbnailSize: 25,
				keyboardControl: true,
				keyboardOnHover: true,
				fadeDuration: 250,
				setId: '',
				userId: '',
				search: '',
				limit: 50
			};
			$.extend(true, settings,options);
			
			// add class flickry to the parent
			ctx.addClass('flickry');
			
			// not using .data() since it rounds the value
			var setId = ctx.attr('data-set-id') || settings.setId;
			var userId = ctx.attr('data-user-id') || settings.userId;
			var search = ctx.attr('data-search') || settings.search;
			var limit = ctx.attr('data-limit') || settings.limit;
			if(limit) {
				settings.limit = limit;
			}
					
			// counters
			var currentIndex = 0;
			var totalCount;

			// load gallery
			if(setId) {
				flickryLoadSet(setId);
			} else if(userId && !search) {
				flickryLoadUser(userId);
			} else if(search) {
				flickryLoadSearch(search);
			}
						
			function flickryLoadSet(setId) {
				$.get(settings.api.url, {method: 'flickr.photosets.getPhotos', api_key: settings.api.key, photoset_id: setId, format: 'json'}, 
					function(r) { 
						if(r.stat == 'fail') {
							ctx.html(r.message + '. Photoset: ' + setId);
						} else {
							flickryLoadSlideshow(r.photoset.photo);
						}
					}, 'json');	
			}
			
			function flickryLoadUser(galleryId) {
				$.get(settings.api.url, {method: 'flickr.people.getPublicPhotos', api_key: settings.api.key, user_id: userId, format: 'json'}, 
					function(r) { 
						if(r.stat == 'fail') {
							ctx.html(r.message + '. User id: ' + userId);
						} else {
							flickryLoadSlideshow(r.photos.photo);
						}
					}, 'json');	
			}
			
			function flickryLoadSearch(search) {
				$.get(settings.api.url, {method: 'flickr.photos.search', api_key: settings.api.key, user_id: userId, text: search, format: 'json'}, 
					function(r) { 
						if(r.stat == 'fail') {
							ctx.html(r.message + '. Search string: ' + search);
						} else {
							flickryLoadSlideshow(r.photos.photo);
						}
					}, 'json');	
			}
			
			function flickryLoadSlideshow(photos) {
				var viewer = $('<div class="flickry-viewer" />');
				var thumbnails = $('<div class="flickry-thumbnails" />');
				ctx.append(viewer);
				ctx.append(thumbnails);
				totalCount = 0;
				$.each(photos, function(i, photo) { 
					// limit results
					if(i>=settings.limit) return;
					// keep count					
					totalCount = totalCount+1;
					// add full size image
					var div = $('<div class="image" />');
					var img = $('<img />').attr(
						{
							src: 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '.jpg',
							alt: photo.title,
							title: photo.title,
							'data-photo-index': i+1 // switch to next one on click
						});
					img.hide();	
					div.append(img);	
					images[i] = img;
					viewer.append(div);
					// add thumbnail image
					var img = $('<img />').attr(
						{
							src: 'http://farm' + photo.farm + '.static.flickr.com/' + photo.server + '/' + photo.id + '_' + photo.secret + '_s.jpg',
							alt: photo.title,
							title: photo.title,
							width: settings.thumbnailSize,
							height: settings.thumbnailSize,
							'data-photo-index': i
						});
					thumbnails.append(img);
					thumbs[i] = img;
				});
				
				// bind thumbnail and full size image clicks
				$('img', ctx).bind('click', function() { 
					var photoIndex = $(this).attr('data-photo-index');
					flickrySwitchTo(photoIndex);
				});
				
				// fadeIn first image and highlight thumb
				if(totalCount) {
					var firstThumb = thumbs[0];
					var firstImage = images[0];
					firstThumb.addClass('hover');
					firstImage.fadeIn(settings.fadeDuration);	
				}
				
				// keyboard control
				if(settings.keyboardControl) {
					ctx.bind('mouseover', function(e) { 
						ctx.data('hover', 1);					
					});
					
					ctx.bind('mouseout', function(e) { 
						ctx.data('hover', 0);					
					});
					
					$(document).bind('keyup', function(e) { 
						if(!settings.keyboardOnHover || ctx.data('hover') == 1) {			
							if (e.keyCode == 37) {
		      					flickrySwitchTo(currentIndex-1);
		      				} else if (e.keyCode == 39) {
								flickrySwitchTo(currentIndex+1)
		    				}
	    				}						
					});
				
				}
			}
			
			function flickrySwitchTo(index) {
				if(index >= totalCount) {
					index = 0;
					
				}
				if(index < 0) {
					index = totalCount-1;
				}
				images[currentIndex].fadeOut(settings.fadeDuration);
				images[index].fadeIn(settings.fadeDuration, function() {
					currentIndex = index;
					$('.flickry-thumbnails img', ctx).removeClass('hover');
					thumbs[currentIndex].addClass('hover');
				});
			}
			
		}		
	};

	$.fn.flickry = function(method) {
		argv = arguments;
		return this.each(function() {
			if (methods[method] ) {
      			return methods[ method ].apply( this, Array.prototype.slice.call(argv, 1));
    		} else if ( typeof method === 'object' || ! method ) {
      			options = [method];	
      			return methods.init.apply(this, options);
    		}	
		}); 
	};
	
})( jQuery );
