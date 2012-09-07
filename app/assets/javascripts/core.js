//Reusable functions
var Alphagov = {
  daysInMsec: function(d) {
    return d * 24 * 60 * 60 * 1000;
  },
  cookie_domain: function() {
    var host_parts = document.location.host.split(':')[0].split('.').slice(-3);
    return '.' + host_parts.join('.');
  },
  read_cookie: function(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
        var cookie = jQuery.trim(cookies[i]);
        if (cookie.substring(0, name.length + 1) == (name + '=')) {
          cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
          break;
        }
      }
    }
    return cookieValue;
  },
  delete_cookie: function(name) {
    if (document.cookie && document.cookie !== '') {
      var date = new Date();
      date.setTime(date.getTime() - Alphagov.daysInMsec(1)); // 1 day ago
      document.cookie = name + "=; expires=" + date.toGMTString() + "; domain=" + Alphagov.cookie_domain() + "; path=/";
    }
  },
  write_cookie: function(name, value) {
    var date = new Date();
    date.setTime(date.getTime() + Alphagov.daysInMsec(4 * 30)); // 4 nominal 30-day months in the future
    document.cookie = name + "=" + encodeURIComponent(value) + "; expires=" + date.toGMTString() + "; domain=" + Alphagov.cookie_domain() + "; path=/";
  }
};

function recordOutboundLink(e) {
  _gat._getTrackerByName()._trackEvent(this.href, 'Outbound Links');
  setTimeout('document.location = "' + this.href + '"', 100);
  return false;
}

$(document).ready(function() {
  $('.print-link a').attr('target', '_blank');
  
  if(window.location.hash && $(".design-principles").length != 1 && $('.section-page').length != 1) {
    contentNudge(window.location.hash);
  } 

  $("nav").delegate('a', 'click', function(){
    var hash;
    var href = $(this).attr('href');
    if(href.charAt(0) === '#'){
      hash = href; 
    } 
    else if(href.indexOf("#") > 0){
      hash = "#" + href.split("#")[1];
    }
    if($(hash).length == 1){
      $("html, body").animate({scrollTop: $(hash).offset().top - $("#global-header").height()},10);
    }
  });
  
  function contentNudge(hash){
    if($(hash).length == 1){
      if($(hash).css("top") == "auto" || "0"){
        $(window).scrollTop( $(hash).offset().top - $("#global-header").height()  );
      }
    }
  }
  
  // related box fixer
  if($(window).width() >= "670"){
    if($(".related-positioning").length !== 0){
      $(".related-positioning").css("position", "absolute");
      var viewPort = $(window).height();
      var relatedBox = $(".related").height();
      var boxOffset = $(".related-positioning").position();
      var topBoxOffset = boxOffset.top;
      if(relatedBox > (viewPort - topBoxOffset)){
        $(".related-positioning").css("position", "absolute");
      }
      else{
        $(".related-positioning").css("position", "fixed");
      }
    }
  }
 
  // toggle for reporting a problem (on all content pages)
  $('.report-a-problem-toggle a').on('click', function() {
    $('.report-a-problem-container').toggle();
      return false;
  });

});


