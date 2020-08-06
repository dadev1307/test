'use strict';

module.exports = function() {
    $.gulp.task('sprite', function() {
        var spriteData = $.gulp.src('./src/sprite/*.png')
            .pipe($.sprite({
                imgName: 'sprite.png',
                cssName: 'sprite.sass',
                cssFormat: 'sass',
                algorithm: 'binary-tree',
                cssVarMap: function (sprite) {
                    sprite.name = 's-' + sprite.name;
                }

            }));
        spriteData.img.pipe($.gulp.dest($.config.root + '/img'));
        spriteData.css.pipe($.gulp.dest($.config.root + '/css'));
        return spriteData;
    })
};
