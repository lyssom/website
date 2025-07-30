const gulp = require('gulp');

const babel = require('gulp-babel');
const uglify = require('gulp-uglify');
const htmlmin = require('gulp-htmlmin');
const replace = require('gulp-replace');
const cleanCSS = require('gulp-clean-css');

function buildHTML() {
  return gulp.src("./src/**/*.html", {sourcemaps: true})
    .pipe(replace(/src="(.*)"/g, 'src="https://static.tom.shea.at/$1"'))
    .pipe(replace(/href="(.*)\.css"/g, 'href="https://static.tom.shea.at/$1.css"')) // replace <link>s
    .pipe(htmlmin({collapseWhitespace: true, minifyCSS: true}))
    .pipe(gulp.dest("./dist"), {sourcemaps: "./"});
}

function buildJS() {
  return gulp.src("./src/**/*.js", {sourcemaps: true})
    .pipe(babel({
      presets: ["env"]
    }))
    .pipe(uglify({
      mangle: {toplevel: true},
    }))
    .pipe(gulp.dest("./dist", {sourcemaps: "./"}));
}

function buildCSS() {
  return gulp.src("./src/**/*.css", {sourcemaps: true})
    .pipe(cleanCSS())
    .pipe(gulp.dest("./dist", {sourcemaps: "./"}));
}

function copyAssets() {
  return gulp.src("./src/assets/**/*")
    .pipe(gulp.dest("./dist/assets"));
}

const child_process = require('child_process');

function throwIfDirty(done) {
  child_process.exec(`git diff --shortstat`, (err, stdout, stderr) => {
    if(stdout) {
      return done("Uncommited changes, refusing to proceed");
    }
    child_process.exec(`git ls-files --exclude-standard --others`, (err, stdout, stderr) => {
      if(stdout) {
        return done("Unstaged files, refusing to proceed");
      }
      done();
    });
  });
}

function pushToGithub(done) {
  const lastCommitMessage = child_process.execSync('git show -s --format=%B HEAD').toString();
  child_process.exec(`git push`, (err, stdout, stderr) => {
    if(err && stdout.match(/nothing to commit/)) {
      console.warn("nothing changed, not pushing to github");
      return done();
    }
    console.log(stdout, stderr);
    done(err)
  });
}

function pushHTMLToWebserver(done) {
  child_process.exec(`scp -r dist/*.html tom@dirt.shea.at:/srv/web/tom.shea.at/website`, done);
}


function pushToGithubPages(done) {
  const lastCommitMessage = child_process.execSync('git show -s --format=%B HEAD').toString().trim();

  // cd 到 dist，确保在 gh-pages 分支，添加、提交、推送到 origin gh-pages 分支
  const cmd = `
    cd dist && git checkout gh-pages && git add . && git commit -m "mod resume" && git push origin gh-pages
  `;

  child_process.exec(cmd, (err, stdout, stderr) => {
    if (err && stdout && stdout.includes('nothing to commit')) {
      console.warn("nothing changed, not pushing to github");
      return done();
    }
    console.log(stdout);
    console.error(stderr);
    done(err);
  });
}

module.exports = pushToGithub;


gulp.task(buildHTML);
gulp.task(buildJS);
gulp.task(buildCSS);
gulp.task(copyAssets);
gulp.task(throwIfDirty);
gulp.task("build", gulp.parallel(buildHTML, buildJS, buildCSS, copyAssets));
gulp.task(pushToGithub);
// gulp.task(pushHTMLToWebserver);

gulp.task("deploy", gulp.series(pushToGithub, pushToGithubPages));
gulp.task("publish", gulp.series("build", "deploy"));