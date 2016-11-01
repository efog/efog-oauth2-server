const gulp = require('gulp'),
    gulpFilter = require('gulp-filter'),
    gulpInject = require('gulp-inject'),
    wiredep = require('wiredep');
const mongoData = require("gulp-mongodb-data");

gulp.task("db-init", () => {
    const dbUrl = process.env.DBURL || 'mongodb://localhost:27017/efog-oauth2';

    return gulp.src("deploy/data/*.json")
        .pipe(mongoData({
            'mongoUrl': dbUrl,
            'dropCollection': true
        }));
});


const inject = () => {
    const stream = wiredep.stream;
    const bowerOptions = {
        'bowerJson': require('./bower.json'),
        'directory': './oauth/pages/bower_modules'
    };
    const injectOptions = {
        'relative': true
    };

    const injectSrc = gulp.src([
        './oauth/pages/assets/**/*.js',
        './oauth/pages/assets/**/*.css'],
        {
            'read': false
        });

    return gulp.src('./oauth/pages/*.html')
        .pipe(stream(bowerOptions))
        .pipe(gulpInject(injectSrc, injectOptions))
        .pipe(gulp.dest('./oauth/pages/'));
};

gulp.task('inject', () => {
    return inject();
});

gulp.task('build', ['inject']);