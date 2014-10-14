/*jshint node:true */
'use strict';

exports.load = function(ffmpeg) {
  ffmpeg
    .format('webm')
    .videoBitrate('3500k')
    .videoCodec('libvpx')
    .size('1280x720')
    .autopad()
    .audioBitrate('128k')
    .audioFrequency(44100)
    .audioChannels(2)
    .audioCodec('libvorbis')
    .outputOptions(['-quality good', '-pix_fmt yuv420p', '-movflags faststart']);
};

exports.options = {
    format: 'webm',
    videoBitrate: '3500k',
    videoCodec: 'libvpx',
    size: '1280x720',
    autopad: true,
    audioBitrate: '128k',
    audioFrequency: 44100,
    audioChannels: 2,
    audioCodec: 'libvorbis',
    outputOptions: ['-quality good', '-pix_fmt yuv420p', '-movflags faststart']
};
