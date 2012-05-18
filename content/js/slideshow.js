/* Javascript for collective.mediaShow - By David Jonas */

mediaShow={};

//States of a slide
mediaShow.NOT_LOADED = 0;
mediaShow.LOADING = 1;
mediaShow.LOADED = 2;
mediaShow.mouseX = 0;
mediaShow.mouseY = 0;

//This function gets the base URL of the site to get the loader image depending only on a relative path
mediaShow.getBaseURL = function () {
    var url = location.href;  // entire url including querystring - also: window.location.href;
    var baseURL = url.substring(0, url.indexOf('/', 14));


    if (baseURL.indexOf('http://localhost') != -1) {
        // Base Url for localhost
        var url = location.href;  // window.location.href;
        var pathname = location.pathname;  // window.location.pathname;
        var index1 = url.indexOf(pathname);
        var index2 = url.indexOf("/", index1 + 1);
        var baseLocalUrl = url.substr(0, index2);

        return baseLocalUrl + "/";
    }
    else {
        // Root Url for domain name
        return baseURL + "/";
    }
}

//Create a loader image obect with a spinner for loading and a button sprite url
//sprite URL
//mediaShow.buttonSprite = mediaShow.getBaseURL() + "buttons.png";
mediaShow.buttonSprite = "buttons.png";
//loader
mediaShow.loader = "ajax-loader.gif";
mediaShow.loaderObj = new Image();
$(mediaShow.loaderObj).addClass("ajax_loader").attr('src', mediaShow.loader).css({'position':'absolute', 'top':'50%', 'left':'50%', 'margin-top':'-32px', 'margin-left':'-32px', 'z-index':'-1'});

//Hash cache to check for changes
mediaShow.lastHash = "";
mediaShow.hashCheckRunning = false;

//Start Checking for hash changes every second
mediaShow.startHashCheck = function ()
{
  if(!mediaShow.hashCheckRunning)
  {
    mediaShow.hashCheckRunning = true;
    
    setInterval(function() {
      if(mediaShow.lastHash != window.location.hash) {
          mediaShow.hashChanged();
          mediaShow.lastHash = window.location.hash;
      }
    }, 500);
  }
}


//Run if hash has changed
mediaShow.hashChanged = function ()
{
  mediaShow.readURLAndUpdate();
}

//Array of slideshows
mediaShow.slideshows = new Array();

//This searches for slideshows on the DOM and creates the data structure in memory
mediaShow.findSlideshows = function ()
{
  $('.embededMediaShow a').each(function (){
        //Hide the link that generates the mediaShow
        $(this).css('display', 'none');
        $(this).parent().addClass('javascripted');

        //-------------------- Declaration of Slideshow ------------------
        mediaShow.slideshows.push(
                                  {"obj": $(this).parent(),
                                   "url": $(this).attr("href"),
                                   "currentSlide": 0,
                                   "slides": new Array(),
                                   "initialized": false,
                                   "size": 0,
                                   "hash": "",
                                   "presentation": $(this).parent().hasClass('presentationShow'),
                                   "height": 0,
                                   "width": 0
                                  });
    });  
};

//This runs after findSlideshows for each slideShow found, Makes an AJAX call to
//get the content listing for that slideshow.
//ATTENTION: This is an asynch call. The slideshow is only marked initialized after
//           the call is sucessfull.
//TODO: handle URL failure and JSON error
mediaShow.getContentListing = function (slideshow)
{
    var URL;
    URL = slideshow.url;
    
    $.getJSON(URL, function(data) {

        $.each(data, function(index, item) {
            //-------------------- Declaration of Slide ------------------
            slideshow.slides.push({
                "url":item.url,
                "UID" : item.UID,
                "loaded": mediaShow.NOT_LOADED
                });
            slideshow.size++;
        });
        
        mediaShow.markAsInitialized(slideshow);
    });
}

//This starts loading the content. Loads first item and recursively the others.
//loadNext is called twice to have allways two items loading at the same time.
mediaShow.startLoading = function (slideshow)
{
    mediaShow.loadNext(slideshow);
    mediaShow.loadNext(slideshow);
};

//This decides which is the next item that should be loaded and starts loading
mediaShow.loadNext = function (slideshow)
{
    if(slideshow.initialized)
    {
        var current = slideshow.currentSlide;
        if(slideshow.slides[current].loaded == mediaShow.NOT_LOADED)
        {
            slideshow.slides[current].loaded = mediaShow.LOADING;
            mediaShow.loadSlide(slideshow, current);
        }
        else
        {
            var distanceForward = -1;
            var distanceBackward = -1;
            var itemForward = -1;
            var itemBackward = -1;
            
            for(var i=current; i<slideshow.slides.length; i++)
            {
                if(slideshow.slides[i].loaded == mediaShow.NOT_LOADED)
                {
                    itemForward = i;
                    distanceForward = i-current;
                    break;
                }
            }
            
            for(var j=current; j>=0; j--)
            {
                if(slideshow.slides[j].loaded == mediaShow.NOT_LOADED)
                {
                    itemBackward = j;
                    distanceBackward = current-j;
                    break;
                }
            }
            
            if (distanceForward == -1 && distanceBackward == -1)
            {
                return;
            }
            if(distanceForward > -1 && distanceBackward == -1)
            {
                slideshow.slides[itemForward].loaded = mediaShow.LOADING;
                mediaShow.loadSlide(slideshow, itemForward);
            }
            else if (distanceBackward > -1 && distanceForward == -1)
            {
                slideshow.slides[itemBackward].loaded = mediaShow.LOADING;
                mediaShow.loadSlide(slideshow, itemBackward);
            }
            else if (distanceForward <= distanceBackward)
            {
                slideshow.slides[itemForward].loaded = mediaShow.LOADING;
                mediaShow.loadSlide(slideshow, itemForward);
            }
            else
            {
                slideshow.slides[itemBackward].loaded = mediaShow.LOADING;
                mediaShow.loadSlide(slideshow, itemBackward);
            }
        }
    }
}

//This starts loading a slide assynchrounosly and when it finishes loading it starts the next one
mediaShow.loadSlide = function (slideshow, slideNumber)
{
    var slide = slideshow.slides[slideNumber];
    var URL = slide.url;
    
    if(slideshow.presentation)
    {
      URL = slide.url + '&presentation=true'
    }
    else{
      URL = slide.url;
    }
    
    $.getJSON(URL, function(data, textStatus, jqXHR) {
        var slideContainer = $(slideshow.obj).find(".mediaShowSlide_" + slideNumber);
        
        if (slideNumber == 4)
        {
          test = "breakpoint";
        }
        
        //var titleDiv = '<div class="mediaShowTitle"><h2><a href="'+slide.url+'">'+data.title+'</a></h2></div>';
        var descriptionDiv = "";
        if(slideshow.presentation)
        {
          descriptionDiv = '<div class="mediaShowDescription">'+$("<div />").html(data.description).text();+'</div>';
        }
        else
        {
          descriptionDiv = $('<div class="mediaShowDescription">'+data.description+'</div>');
        }
        var infoDiv = $('<div class="mediaShowInfo"></div>');
        
        infoDiv.append(descriptionDiv);
        slideContainer.append(infoDiv);
        
        //INFO: Uncomment this if you want clickable pictures
        /*var link = '<a href="'+slide.url+'"></a>';
        if (data.media.type == 'Video' || data.media.type == 'Youtube' || data.media.type == 'Vimeo')
        {
          var link = "<a></a>";
        }*/
        
        //INFO: Comment next line if you want clickable pictures 
        var link = "<a></a>";
        
        slideContainer.append('<div class="mediaShowMedia mediaShowMediaType_'+data.media.type+'">'+link+'</div>');
        
        if (slideshow.height == 0)
        {
          slideshow.height = $(slideContainer).find(".mediaShowMedia").height();
          slideshow.width = $(slideContainer).find(".mediaShowMedia").width();
        }
        
        //TODO: Here I prepend the loader image but for now it is not working so well I need to change the loading event processing a bit no make it nicer.
        //slideContainer.find('.mediaShowMedia').prepend(mediaShow.loaderObj);
        
        slideContainer.find('.mediaShowMedia a').append(mediaShow.getMediaObject(data.media, slideshow));
        
        if (data.media.type == "Video")
        {
            //slideContainer.find('.mediaShowMedia a video').each(function (){$(this).VideoJS();})
            _V_(data.media.url, {}, function(){
                // Player (this) is initialized and ready.
            });
        }
        
        if(slideshow.presentation)
        {
          slideContainer.find('.mediaShowDescription').css({'top': '50%', 'margin-top': -(slideContainer.find('.mediaShowDescription').height()/2)});
        }
        
        slide.loaded = mediaShow.LOADED;
        
        $(slideContainer).touchwipe({
            wipeLeft: function() {mediaShow.next(mediaShow.indexOf(slideshow)) },
            wipeRight: function() { mediaShow.next(mediaShow.indexOf(slideshow)) },
            preventDefaultEvents: false
    });

        
        mediaShow.loadNext(slideshow);
    });
}

//This generates the html for the media, here we add support for the different kinds of media
mediaShow.getMediaHTML = function (media)
{
  switch(media.type)
  {
    case "Image":
                  return '<img src="'+media.url+'" />'
                  break;
  }
}

//This generates a DOM object with the media loaded into it sized to the slideshow it will fit on
mediaShow.getMediaObject = function(media, slideshow)
{
  switch(media.type)
  {
    case "Image":
                  var img = new Image();
                  $(img)
                  .load(function (){
                      var sizeOfContainer = slideshow.height;
                      if($(this).height() > 0 && $(this).height() < sizeOfContainer)
                      {
                        var margin = (sizeOfContainer - $(this).height())/2;
                        $(this).css('margin-top', margin);
                      }
                  })
                  .attr('src', media.url);
                  return img;
                  break;
    case "Video":
                  var video = mediaShow.getVideoTag(media);
                  return video;
                  break;
    case "Youtube":
                  var youtube = mediaShow.getYoutubeEmbed(media);
                  return youtube;
                  break;
    case "Vimeo":
                  var youtube = mediaShow.getVimeoEmbed(media);
                  return youtube;
                  break;
    default:
                  return "";
                  break;
  }
};


mediaShow.getVideoTag = function (media)
{
  var video = '<video id="' + media.url + '" class="video-js vjs-default-skin" controls preload="auto" width="480" height="270"> <source src="' + media.url + '" type="video/mp4" /></video>';
  return video;
}

mediaShow.getYoutubeEmbed = function (media)
{
  var youtubeId;
  if(media.url.indexOf("&") != -1)
  {
    youtubeId = media.url.substring(media.url.indexOf("?v=")+3, media.url.indexOf("&"));
  }
  else{
    youtubeId = media.url.substring(media.url.indexOf("?v=")+3, media.url.length);
  }
  
  var embed = '<iframe width="100%" height="100%" src="http://www.youtube.com/embed/'+youtubeId+'" frameborder="0" allowfullscreen></iframe>';
  return embed;
}

mediaShow.getVimeoEmbed = function (media)
{
  var urlSplit = media.url.split('vimeo.com/');
  var vimeoID = urlSplit[1];
  var embed = '<iframe src="http://player.vimeo.com/video/'+vimeoID+'?title=0&amp;byline=0&amp;portrait=0" width="100%" height="100%" frameborder="0"></iframe>';
  return embed;
}

//This runs when the slideshow listing has arrived. We create the DOM wrappers for the slides here and then start loading content
mediaShow.markAsInitialized = function (slideshow)
{
    $.each(slideshow.slides, function (index, slide){
        slideshow.obj.append('<div class="mediaShowSlide mediaShowSlide_'+index+'"></div>');
      });
    
    slideshow.obj.find(".mediaShowSlide_"+slideshow.currentSlide).show();
    
    slideshow.initialized = true;
    mediaShow.hashChanged();
    mediaShow.startHashCheck();
    mediaShow.startLoading(slideshow);
};

//This returns the index of a given slideshow in the main slideshows array
mediaShow.indexOf = function (slideshow)
{
  var slideshowIndex = -1;
  
  $.each(mediaShow.slideshows, function (index, currentSlideshow)
       {
          if(currentSlideshow == slideshow)
          {
            slideshowIndex = index;
          }
       });
  
  return slideshowIndex;
}

//This function adds the navigation buttons to the slideshow
mediaShow.addButtons = function (slideshow)
{ 
  var slideshowIndex = mediaShow.indexOf(slideshow);
  var buttonNext = $('<a href="#" class="buttonNext" onclick="return mediaShow.next('+slideshowIndex+')">&raquo;</a>').css('background-image', 'url('+mediaShow.buttonSprite+')');
  var buttonPrev = $('<a href="#" class="buttonPrev" onclick="return mediaShow.prev('+slideshowIndex+')">&laquo;</a>').css('background-image', 'url('+mediaShow.buttonSprite+')');
  //var container = '<div class="mediaShowButtons">'+buttonPrev+buttonNext+'</div>';
  var container = $('<div class="mediaShowButtons"></div>');
  $(container).append(buttonPrev);
  $(container).append(buttonNext);
  
  slideshow.obj.append(container);
}

//Show the next slide in the given slideshow
mediaShow.next = function (slideshowIndex)
{
  var slideshow = mediaShow.slideshows[slideshowIndex];
  if(slideshow.currentSlide + 1 <= slideshow.size - 1)
  { 
    mediaShow.goToSlide(slideshow.currentSlide + 1, slideshow); 
  }
  else
  {
    mediaShow.goToSlide(0, slideshow);
  }
  
  return false;
}

//Show the previews slide in given slideshow
mediaShow.prev = function (slideshowIndex)
{
  var slideshow = mediaShow.slideshows[slideshowIndex];
  if(slideshow.currentSlide - 1 >= 0)
  {
    mediaShow.goToSlide(slideshow.currentSlide - 1, slideshow);
  }
  else
  {
    mediaShow.goToSlide(slideshow.size-1, slideshow);
  }
  
  return false;
}

//This returns the index of the slide with the provided UID.
mediaShow.idToIndex = function (slideshow, uid)
{
  var found = -1;
  $.each(slideshow.slides, function(index, slide){
    if(slide.UID == uid)
    {
      found = index;
    }
  });
  return found;
};

//This reads the URL hash and updates the slideshows acordingly
mediaShow.readURLAndUpdate = function ()
{
  var hash = document.location.hash;
  if(hash == "")
    return;
  
  var hash_split = hash.substring(1,hash.length).split(",");
  $.each(hash_split, function(index, hsh){
    $.each(mediaShow.slideshows, function(index, slideshow){
      var slideIndex = mediaShow.idToIndex(slideshow, hsh);
      if (slideIndex > -1)
      {
        slideshow.hash = hsh;
        mediaShow.goToSlide(slideIndex, slideshow);
        return false;
      }
      return true;
    });
  });
};

//This function will update the browser's url to the current state of the multiple slideshows.
mediaShow.updateURL = function (slideshow, slideNumber)
{
  var uid = slideshow.slides[slideNumber].UID;
  var old_hash = document.location.hash;
  var new_hash = uid;
  var hash_split = old_hash.substring(1,old_hash.length).split(",");
  var hash = new Array();
  
  var replaced = false;
  $.each(hash_split, function(index, hsh){
    if(hsh == slideshow.hash)
    {
      hash.push(new_hash);
      replaced = true;
    }
    else
    {
      hash.push(hsh);
    }
  });
  
  if(!replaced)
  {
    hash.push(new_hash);
  }
  
  document.location.hash = hash.join(",");
  slideshow.hash = new_hash;
};

//This shows slide number x on the given slideshow
mediaShow.goToSlide = function (x, slideshow)
{
  mediaShow.updateURL(slideshow, x);
  if(slideshow.slides[x].loaded == mediaShow.NOT_LOADED)
  {
    slideshow.currentSlide = x;
  }
  {
    slideshow.obj.find(".mediaShowSlide_"+x).show();
    var sizeOfContainer = slideshow.height;
    var img = slideshow.obj.find(".mediaShowSlide_"+x).find('img')[0];
    //height = $(img).attr('offsetHeight');
    height = $(img).height();
    //alert("height of this puppy: " + height);
    //alert("image: " + img);
    if(height > 0 && height < sizeOfContainer)
    {
      var margin = (sizeOfContainer - height)/2;
      $(img).css('margin-top', margin);
    }
    
    if(slideshow.presentation)
    {
      slideshow.obj.find(".mediaShowSlide_"+x).find('.mediaShowDescription').css({'top': '50%', 'margin-top': -(slideshow.obj.find(".mediaShowSlide_"+x).find('.mediaShowDescription').height()/2)});
    }
    
    slideshow.currentSlide = x;
    
    $.each(slideshow.slides, function (index, slide) {
                                if(index != x)
                                {
                                  slideshow.obj.find(".mediaShowSlide_"+index).hide();
                                }
                              });
  }
}

//This is the first function to run, finds slideshows on the page and initializes them
mediaShow.init = function ()
{
    mediaShow.findSlideshows();
    $.each(mediaShow.slideshows, function (index, slideshow)
           {
                mediaShow.getContentListing(slideshow);
                mediaShow.addButtons(slideshow)
           });
};

//This function checks if an element is visible on the window
mediaShow.isVisible = function (element, tolerance) {
    var windowTop = $(document).scrollTop() - tolerance;
    var elementTop = $(element).offset().top;
    var elementBottom = $(element).offset().top + $(element).height();
    var windowBottom = $(document).scrollTop() + $(window).height() + tolerance;
  
    if (elementTop > windowTop && elementBottom < windowBottom)
    {
      return true;
    }
    else
    {
      return false;
    }
}

//This functions tests which of two element is more likely to have the attention of the user
mediaShow.getAttentionSlug = function (elements)
{
  var slug = null;
  
  //first test if the mouse is over any of them
  $.each(elements, function(index, element)
  {
    var elementTop = $(element).offset().top;
    var elementBottom = $(element).offset().top + $(element).height();
    if(mediaShow.mouseY > elementTop && mediaShow.mouseY < elementBottom)
    {
      slug = element;
      return false;
    }
    return true;
  });
  
  if(slug)
  {
    return slug;
  }
  else
  {
    return elements[0];
  }
}

//This makes sure all the alignments stay put
$(window).resize(function()
{
  $.each(mediaShow.slideshows, function(index, slideshow)
         {
            if(slideshow.presentation && slideshow.width != $(slideshow.obj).width())
            {
              slideshow.width = $(slideshow.obj).width();
              $.each(slideshow.slides, function(x, slide)
                     {
                        slideshow.obj.find(".mediaShowSlide_"+x).find('.mediaShowDescription').css({'top': '50%', 'margin-top': -(slideshow.obj.find(".mediaShowSlide_"+x).find('.mediaShowDescription').height()/2)});
                        //var sizeOfContainer = slideshow.height
                        var sizeOfContainer = slideshow.obj.find(".mediaShowSlide_"+slideshow.currentSlide).find('.mediaShowMedia').height();
                        
                        var img = slideshow.obj.find(".mediaShowSlide_"+x).find('img')[0];
                        height = $(img).attr('offsetHeight');
                        if(height > 0 && height <= sizeOfContainer)
                        {
                          var margin = (sizeOfContainer - height)/2;
                          $(img).css('margin-top', margin);
                        }
                     });
            }
            
          });
});

// This starts the whole process when the DOM is completely loaded
$(function(){
    mediaShow.init();
        
    $(document).mousemove(function(e){
      mediaShow.mouseX = e.pageX;
      mediaShow.mouseY = e.pageY; 
    }); 
    
    $(document).keydown(function(e){
        if(document.activeElement.nodeName.toLowerCase() == "body" || document.activeElement.nodeName.toLowerCase() == "a")
        {
            var slideshowIndex = -1;
            
            $.each(mediaShow.slideshows, function (index, slideshow){
              if(mediaShow.isVisible(slideshow.obj, 130))
              {
                if(slideshowIndex == -1)
                {
                  slideshowIndex = index;
                }
                else
                {
                  if(mediaShow.getAttentionSlug([mediaShow.slideshows[slideshowIndex].obj, mediaShow.slideshows[index].obj]) == mediaShow.slideshows[slideshowIndex].obj)
                  {
                    slideshowIndex = slideshowIndex;
                  }
                  else
                  {
                    slideshowIndex = index;
                  }
                }
              }
              return true;
            }); 
            
            if (slideshowIndex > -1)
            {
              if (e.keyCode == 37) { 
                mediaShow.prev(slideshowIndex);
                return false;
              }
              else if (e.keyCode == 39) 
              {
                mediaShow.next(slideshowIndex);
                return false;
              }
            }
        }
        return true;
    });
});