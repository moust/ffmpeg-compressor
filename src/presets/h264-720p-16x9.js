/*jshint node:true */
'use strict';

exports.load = function(ffmpeg) {
  ffmpeg
    .format('mp4')
    .videoBitrate('3500k')
    .videoCodec('libx264')
    .size('1280x720')
    .autopad()
    .audioBitrate('128k')
    .audioFrequency(44100)
    .audioChannels(2)
    .audioCodec('aac')
    .outputOptions(['-qmax 51', '-qmin 11', '-pix_fmt yuv420p', '-movflags faststart']);
};

exports.options = {
    format: 'mp4',
    videoBitrate: '3500k',
    videoCodec: 'libx264',
    size: '1280x720',
    autopad: true,
    audioBitrate: '128k',
    audioFrequency: 44100,
    audioChannels: 2,
    audioCodec: 'aac',
    outputOptions: ['-qmax 51', '-qmin 11', '-pix_fmt yuv420p', '-movflags faststart']
};
