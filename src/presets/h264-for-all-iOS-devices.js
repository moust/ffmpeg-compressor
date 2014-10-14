/*jshint node:true */
'use strict';

// https://developer.apple.com/library/ios/technotes/tn2224/_index.html#//apple_ref/doc/uid/DTS40009745-CH1-ENCODEYOURVARIANTS

exports.load = function(ffmpeg) {
  ffmpeg
    .format('mp4')
    .videoBitrate('600k')
    .videoCodec('libx264')
    .size('480x320')
    .autopad()
    .audioBitrate('96k')
    .audioFrequency(44100)
    .audioChannels(2)
    .audioCodec('aac')
    .outputOptions(['-profile:v baseline', '-level 3.0', '-bf 0', '-maxrate 600k', '-bufsize 1200k', '-g 90', '-pix_fmt yuv420p', '-movflags faststart']);
};

exports.options = {
    format: 'mp4',
    videoBitrate: '600k',
    videoCodec: 'libx264',
    size: '480x320',
    autopad: true,
    audioBitrate: '96k',
    audioFrequency: 44100,
    audioChannels: 2,
    audioCodec: 'aac',
    outputOptions: ['-profile:v baseline', '-level 3.0', '-bf 0', '-maxrate 600k', '-bufsize 1200k', '-g 90', '-pix_fmt yuv420p', '-movflags faststart']
};
