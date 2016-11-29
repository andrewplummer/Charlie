var charlieSheenPath;

(function($){

  var sounds = [
    'addicted',
    'bingo',
    'bi-winning',
    'blood',
    'boom',
    'brain',
    'bring',
    'cant',
    'disease',
    'droopy',
    'drug',
    'drugs',
    'dying',
    'enjoy',
    'f18',
    'fires',
    'free',
    'gift',
    'gnarly',
    'going',
    'items',
    'job',
    'live',
    'love',
    'math',
    'medicine',
    'no',
    'orca',
    'pee',
    'remember',
    'rocks',
    'trolls',
    'underwear',
    'view',
    'violently',
    'withme'
  ];

  var images = [
    'bueller',
    'clean',
    'crazy',
    'duh',
    'interview',
    'normal',
    'shots'
  ];

  var imageData = {};
  var timer;
  var charlie;
  var imagePreload;
  var playing;
  var soundReady;
  var imagesReady;
  var ready;

  function winning(options){
    if(playing) return;
    if(!ready){
      $(document).bind('charlie_is_ready', function(){
        $.winning(options);
      });
      return;
    }
    options = options || {};
    charlie.stop(true, true);

    var image = getOptionalOrRandom(images, options.image);
    var sound = getOptionalOrRandom(sounds, options.sound);
    var right = options.right || 10;
    var height = imageData[image].height;

    charlie.attr('src', getImage(image)).css({ right: right+'%', bottom: -height }).show();
    charlie.animate({ bottom: 0 }, { duration: 300 });
    clearTimeout(timer);

    $.playAudio(getSound(sound), function(){
      timer = setTimeout(function(){
        charlie.animate({ bottom: -height }, { duration: 300 });
        playing = false;
      }, 100);
    });

    playing = true;
  }

  function getImage(file){
    return charlieSheenPath + 'images/' + file + '.png';
  }

  function getSound(file){
    return charlieSheenPath + 'sounds/' + file + '.mp3';
  }

  function preloadAll(){
    var loaded = 0;
    $.each(images, function(i, url){
      var img = $('<img src="'+getImage(url)+'" />');
      imageData[url] = {};
      img.load(function(){
        imageData[url].height = img.height();
        imageData[url].width = img.width();
        loaded++;
        if(loaded == images.length){
          imagesReady = true;
          checkReady();
        }
      });
      imagePreload.append(img);
    });
    $.each(sounds, function(i, url){
      $.loadAudio(getSound(url));
    });
  }

  function checkReady(){
    if(soundReady && imagesReady){
      ready = true;
      $(document).trigger('charlie_is_ready');
    }
  }


  function getOptionalOrRandom(arr, name){
    if(name && $.inArray(name, arr) !== -1){
      return name;
    } else {
      return arr[Math.floor(Math.random() * arr.length)];
    }
  }

  function getPath(){
    var src = $('script[src$="charlie.js"]').attr('src');
    var match = src.match(/(?:\/\/.*?\/)?(.*)charlie\.js/);
    if(match){
      charlieSheenPath = match[1];
    } else {
      charlieSheenPath = '';
    }
  }

  function initialize(){
    imagePreload = $('<div id="charlie_preload"/>').appendTo(document.body).css({ position: 'fixed', left: -20000 });
    charlie = $('<img id="charlie_sheen_winning"/>').appendTo(document.body).css({ display: 'block', position: 'fixed', bottom: -1000, zIndex: 50000 });
  }

  $.winning = winning;
  $.winning.images = images;
  $.winning.sounds = sounds;
  $(document).ready(initialize);
  $(document).bind('sound_player_ready', function(){
    preloadAll();
    soundReady = true;
    checkReady();
  })

  getPath();

  var script   = document.createElement("script");
  script.type  = 'text/javascript';
  script.src   = charlieSheenPath + 'audio.js';
  document.body.appendChild(script);

})(jQuery);
