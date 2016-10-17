const gulp = require('gulp');
const mongoData = require("gulp-mongodb-data");

gulp.task("db-init", () => {
    const dbUrl = process.env.DBURL || 'mongodb://localhost:27017/efog-oauth2';

    return gulp.src("deploy/data/*.json")
        .pipe(mongoData({
            'mongoUrl': dbUrl,
            'dropCollection': true
        }));
});