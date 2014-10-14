'use strict';

var gui = require('nw.gui'),
    win = gui.Window.get(),
    Ffmpeg = require('fluent-ffmpeg'),
    fs = require('fs');

var App = {

  initialize: function () {
    // Focus the window when the app opens
    win.focus();

    // show developer toots
    // win.showDevTools();

    this.initGuiMenu();

    this.initFfmpeg();

    this.resetView();

    this.updateViewOptions();

    // init tooltips
    $('[data-toggle="tooltip"]').tooltip({html:true});

    this.attachListeners();
  },

  initGuiMenu: function () {
    // Creates the default OSX menus (App, Edit and Window)
    var nativeMenuBar = new gui.Menu({type: "menubar"});
    if (process.platform === "darwin") {
      nativeMenuBar.createMacBuiltin(win.title);
    }
    win.menu = nativeMenuBar;
  },

  initFfmpeg: function () {
    Ffmpeg.setFfmpegPath('/usr/local/bin/ffmpeg');
    Ffmpeg.setFfprobePath('/usr/local/bin/ffprobe');
  },

  updateViewOptions: function () {
    Ffmpeg.getAvailableFormats(_.bind(function(err, formats) {
      console.log('Available formats:');
      console.dir(formats);
      this.updateAvailableFormats(formats);
    }, this));

    Ffmpeg.getAvailableCodecs(_.bind(function(err, codecs) {
      console.log('Available codecs:');
      console.dir(codecs);
      // this.updateAvailableCodecs(codecs);
    }, this));

    Ffmpeg.getAvailableEncoders(_.bind(function(err, encoders) {
      console.log('Available encoders:');
      console.dir(encoders);
      this.updateAvailableEncoders(encoders);
    }, this));

    Ffmpeg.getAvailableFilters(_.bind(function(err, filters) {
      console.log("Available filters:");
      console.dir(filters);
    }, this));

    this.loadPresets('./src/presets', _.bind(this.updateAvailablePresets, this));
  },

  updateAvailableFormats: function (formats) {
    var $select = $('#format');
    $select.empty();
    for (var format in formats) {
      if (!!formats[format].canMux) {
        $select.append('<option value="' + format + '">' + formats[format].description + '</option>');
      }
    }
  },

  updateAvailableCodecs: function (codecs) {
    var $videoCodec = $('#videoCodec');
    var $audioCodec = $('#audioCodec');
    $videoCodec.empty();
    $audioCodec.empty();
    for (var codec in codecs) {
      if (!!codecs[codec].canEncode) {
        if (codecs[codec].type === 'video') {
          $videoCodec.append('<option value="' + codec + '">' + codecs[codec].description + '</option>');
        }
        else if (codecs[codec].type === 'audio') {
          $audioCodec.append('<option value="' + codec + '">' + codecs[codec].description + '</option>');
        }
      }
    }
  },

  updateAvailableEncoders: function (encoders) {
    var $videoCodec = $('#videoCodec');
    var $audioCodec = $('#audioCodec');
    $videoCodec.empty();
    $audioCodec.empty();
    for (var encoder in encoders) {
      if (encoders[encoder].type === 'video') {
        $videoCodec.append('<option value="' + encoder + '">' + encoders[encoder].description + '</option>');
      }
      else if (encoders[encoder].type === 'audio') {
        $audioCodec.append('<option value="' + encoder + '">' + encoders[encoder].description + '</option>');
      }
    }
  },

  loadPresets: function (dir, callback) {
    var files = fs.readdirSync(dir)
      .map(function (filename) {
        var tmp = filename.split('.');
        tmp.pop();
        return tmp.join('.');
      });
    callback.call(this, files);
  },

  updateAvailablePresets: function (presets) {console.dir(presets);
    var $preset = $('#preset');
    $preset.empty();
    $preset.append('<option></option>');
    for (var preset in presets) {
      $preset.append('<option>' + presets[preset] + '</option>');
    }
  },

  attachListeners: function () {
    var preventDefault = function(e) {
      e.preventDefault();
    };
    // Prevent dropping files into the window
    window.addEventListener("dragover", preventDefault, false);
    window.addEventListener("drop", preventDefault, false);
    // Prevent dragging files outside the window
    window.addEventListener("dragstart", preventDefault, false);

    // open external url in user browser
    $('a[href^="http"]').on('click', function (e) {
      e.preventDefault();
      gui.Shell.openExternal(this.href);
      return false;
    });

    // update options xhan a preset is selected
    $('#preset').on('change', _.bind(function (e) {
      var preset = $(e.target).val();
      if (preset) {
        var module = require('./presets/' + preset);
        this.setOptions(module.options);
      }
    }, this));

    // reset preset select when changed an option
    $('input, select').not('#preset').on('change', function() {
      $('#preset').val(null);
    });

    // disable video options when "withVideo is uncheck"
    $('#withVideo').on('change', function () {
      if ($(this).is(':checked')) {
        $('#video-tab').find('input, select').not('#withVideo').prop('disabled', false);
      } else {
        $('#video-tab').find('input, select').not('#withVideo').prop('disabled', true);
      }
    });

    // disable audio options when "withAudio is uncheck"
    $('#withAudio').on('change', function () {
      if ($(this).is(':checked')) {
        $('#audio-tab').find('input, select').not('#withAudio').prop('disabled', false);
      } else {
        $('#audio-tab').find('input, select').not('#withAudio').prop('disabled', true);
      }
    });

    $('#btn-encode').on('click', _.bind(this.encode, this));
  },

  progress: function (progress) {
    console.info('Processing: ' + progress.percent + '% done');
    this.updateProgressBar(progress);
  },

  updateProgressBar: function (progress) {
    $('.progress').show();
    $('.progress-bar').css('width', progress.percent + '%').attr('aria-valuenow', progress.percent).text(Math.round(progress.percent) + '%');
  },

  resetView: function () {
    this.updateProgressBar({percent: 0});
    $('.progress').hide();
    $('#btn-encode').attr('disabled', false);
  },

  onError: function (err, stdout, stderr) {
    console.error('Cannot process video: ' + err.message);
    console.error('stderr: ' + stderr);
    alert('Cannot process video: ' + err.message);
    this.resetView();
  },

  onCodecData: function (data) {
    console.info('Input is ' + data.audio + ' audio ' + 'with ' + data.video + ' video');
  },

  onEnd: function () {
    console.info('Transcoding succeeded!');
    alert('Transcoding succeeded!');
    this.resetView();
  },

  getOptions: function () {
    var options = $('#form-options').serializeArray().reduce(function(obj, item) {
      obj[item.name] = item.value;
      return obj;
    }, {});
    return options;
  },

  setOptions: function (options) {
    // reset value
    $('#format, #video-tab input, #video-tab select, #audio-tab input, #audio-tab select').not('#withVideo, #withAudio').val(null).prop('checked', false);
    // set new values
    for (var option in options) {
      var $input = $('#'+option);
      if ($input.is(':checkbox')) {
        $input.prop('checked', true);
      } else {
        var value = options[option];
        if (_.isArray(value)) {
          value = value.join(' ');
        }
        $input.val(value);
      }
    }
  },

  encode: function () {
    $('#btn-encode').attr('disabled', true);

    var options = this.getOptions();
    console.dir(options);

    var command = new Ffmpeg();

    var input = document.getElementById('inputFile').value;
    console.log(input);

    if (!input) {
      alert('You must specify a media file to encode.');
      this.resetView();
      return;
    }

    command.input(input);

    var output = document.getElementById('outputFile').value;
    console.log(output);

    if (!output) {
      alert('You must specify an output filename.');
      this.resetView();
      return;
    }

    command.output(output);

    command.format(options.format);

    if (options.withVideo) {
      command.videoCodec(options.videoCodec);
      command.videoBitrate(options.videoBitrate, options.videoBitrateConstant);
      command.fps(options.fps);
      command.size(options.size);
      command.aspect(options.aspect);
      if (options.autopad) {
        command.autopad();
      }
    }
    else {
      command.noVideo();
    }

    if (options.withAudio) {
      command.audioCodec(options.audioCodec);
      command.audioBitrate(options.audioBitrate);
      command.audioChannels(options.audioChannels);
      command.audioFrequency(options.audioFrequency);
    }
    else {
      command.noAudio();
    }

    if (options.outputOptions) {
      var outputOptions = options.outputOptions.match(/((-\w+) (\w+))/ig);
      command.outputOptions(outputOptions);
    }

    command.on('codecData', _.bind(this.onCodecData, this));

    command.on('error', _.bind(this.onError, this));

    command.on('progress', _.bind(this.progress, this));

    command.on('end', _.bind(this.onEnd, this));

    command.run();
  }

};

App.initialize();
