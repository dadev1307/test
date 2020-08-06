'use strict';

global.$ = {
    package: require('./package.json'),
    config: require('./gulp/config'),
    //pugDir: require('./src/content.json'),
    path: {
        task: require('./gulp/paths/tasks.js'),
        jsFoundation: require('./gulp/paths/js.foundation.js'),
        cssFoundation: require('./gulp/paths/css.foundation.js'),
        app: require('./gulp/paths/app.js')
    },
    gulp: require('gulp'),
    del: require('del'),
    sprite: require('gulp.spritesmith'),
    browserSync: require('browser-sync').create(),
    gp: require('gulp-load-plugins')({ rename: {'gulp-group-css-media-queries':'gcmq'}})
};

$.path.task.forEach(function (taskPath) {
    require(taskPath)();
});

$.gulp.task('default', $.gulp.series(
    'clean',
    $.gulp.parallel(
        'less',
        //'sass',
        //'pug',
        'copy:html',
        'js:foundation',
        'js:process',
        'copy:image',
        'copy:fonts',
        //'css:foundation',
        'sprite:svg'
    ),
    $.gulp.parallel(
        'watch',
        'serve'
    )
));
