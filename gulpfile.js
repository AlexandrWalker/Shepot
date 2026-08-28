import gulp from 'gulp';

//GLOBAL
import notify from 'gulp-notify';
import plumber from 'gulp-plumber';
import replace from 'gulp-replace';
import newer from 'gulp-newer';
import browserSync from 'browser-sync';
const bs = browserSync.create();
import clean from 'gulp-clean';
import fs from 'fs';
import gulpIf from 'gulp-if';

//HTML
import fileInclude from 'gulp-file-include';
import typograf from 'gulp-typograf';

// JS
import uglify from 'gulp-uglify';

//SASS
import * as dartSass from 'sass';
import gulpsass from 'gulp-sass';
import autoprefixer from 'gulp-autoprefixer';
import bulkSass from 'gulp-sass-glob-use-forward';
import postcss from 'gulp-postcss';
import sortMediaQueries from 'postcss-sort-media-queries';
import cleanCss from 'gulp-clean-css';

const sass = gulpsass(dartSass);

//IMAGES
import imagemin, { gifsicle, mozjpeg, optipng, svgo } from 'gulp-imagemin';
import svgsprite from 'gulp-svg-sprite';

//FONTS
import fonter from 'gulp-fonter-fix';
import ttf2woff2 from 'gulp-ttf2woff2';

import * as nodePath from 'path';
const rootFolder = nodePath.basename(nodePath.resolve());

const srcFolder = './src/';
const buildFolder = './build/';
const docsFolder = './docs/';

const isModeP = process.argv.includes('--docs');
const imgMinify = process.argv.includes('--imgmin');
const isModeD = !isModeP;
const destFolder = isModeP ? docsFolder : buildFolder;

// TUMBLERS
const svgHtml = false; // Также нужно вкл или выкл коммент в index.html
const imgAvif = false;
const imgMin = imgMinify || isModeP ? true : false;
const typography = false;

const plumberNotify = (title) => {
  return {
    errorHandler: notify.onError({
      title: title,
      message: 'Error <%= error.message %>',
      sound: false,
    }),
  };
};

gulp.task('clean', function (done) {
  if (fs.existsSync(`${docsFolder}`)) {
    return gulp.src(`${docsFolder}`, { read: false }).pipe(clean({ force: true }));
  }
  if (!isModeP) {
    if (fs.existsSync(`${buildFolder}`)) {
      return gulp.src(`${buildFolder}`, { read: false }).pipe(clean({ force: true }));
    }
  }
  done();
});

gulp.task('html', function () {
  return gulp
    .src([
      `${srcFolder}html/**/*.html`,
      `!${srcFolder}html/blocks/*.html`,
      `!${srcFolder}html/elements/*.html`,
      `!${srcFolder}html/privacy/*.html`,
    ])
    .pipe(plumber(plumberNotify('HTML')))
    .pipe(fileInclude({ prefix: '@@', basepath: '@file' }))
    .pipe(
      replace(
        /(?<=src=|href=|srcset=)(['"])(\.(\.)?\/)*(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        '$1./$4$5$7$1'
      )
    )
    .pipe(
      gulpIf(
        typography,
        typograf({
          locale: ['ru', 'en-US'],
          htmlEntity: { type: 'digit' },
          safeTags: [
            ['<\\?php', '\\?>'],
            ['<no-typography>', '</no-typography>'],
          ],
        })
      )
    )
    .pipe(gulp.dest(`${destFolder}`))
    .pipe(bs.stream());
});

gulp.task('styles', function () {
  return gulp
    .src(`${srcFolder}scss/*.scss`)
    .pipe(plumber(plumberNotify('SCSS')))
    .pipe(bulkSass())
    .pipe(sass.sync({ outputStyle: 'expanded' }).on('error', sass.logError))
    .pipe(postcss([sortMediaQueries()]))
    .pipe(autoprefixer({ cascade: false }))
    .pipe(
      replace(
        /(['"]?)(\.\.\/)+(img|images|fonts|css|scss|sass|js|files|audio|video)(\/[^\/'"]+(\/))?([^'"]*)\1/gi,
        '$1$2$3$4$6$1'
      )
    )
    .pipe(gulpIf(isModeP, cleanCss()))
    .pipe(gulp.dest(`${destFolder}css/`))
    .pipe(bs.stream());
});

gulp.task('js', function () {
  return gulp
    .src(`${srcFolder}js/**/*.js`)
    .pipe(newer(`${destFolder}js`))
    .pipe(gulpIf(isModeP, uglify()))
    .pipe(plumber(plumberNotify('JS')))
    .pipe(gulp.dest(`${destFolder}js/`))
    .pipe(bs.stream());
});

gulp.task('images', function () {
  const imgSrc = [`${srcFolder}images/**/*.*`, `!${srcFolder}images/sprite/**/*.*`, `!${srcFolder}images/**/*.mp4`,];
  return gulp
    .src(imgSrc, { encoding: false })
    .pipe(newer(`${destFolder}images`))
    .pipe(
      gulpIf(
        imgMin,
        imagemin([
          gifsicle({ interlaced: true }),
          mozjpeg({ quality: 90, progressive: true }),
          optipng({ optimizationLevel: 3 }),
        ], { verbose: true })
      )
    )
    .pipe(gulp.dest(`${destFolder}images`))
    .pipe(bs.stream());
});

gulp.task('video', function () {
  return gulp
    .src(`${srcFolder}files/video/**/*.*`, { encoding: false })
    .pipe(newer(`${destFolder}video/`))
    .pipe(gulp.dest(`${destFolder}video/`))
    .pipe(bs.stream());
});

gulp.task('svg', function (done) {
  if (!fs.existsSync(`${srcFolder}images/sprite`)) {
    return done();
  }
  return gulp
    .src(`${srcFolder}images/sprite/**/*.svg`)
    .pipe(plumber(plumberNotify('SVG:dev')))
    .pipe(
      svgsprite({
        mode: {
          symbol: {
            sprite: svgHtml ? '../sprite.html' : '../sprite.svg',
            inline: svgHtml ? svgHtml : !svgHtml,
          },
        },
        shape: {
          transform: [
            {
              svgo: {
                js2svg: { indent: 4, pretty: true },
                plugins: [{ name: 'removeAttrs', params: { attrs: '(fill|stroke)' } }],
              },
            },
          ],
        },
      })
    )
    .pipe(
      svgHtml
        ? gulp.dest(`${srcFolder}html/blocks/`)
        : gulp.dest(`${destFolder}images/`)
    );
});

gulp.task('cleanSvg', function (done) {
  if (fs.existsSync(`${srcFolder}html/blocks/sprite.html`)) {
    return gulp
      .src(`${srcFolder}html/blocks/sprite.html`, { read: false })
      .pipe(clean({ force: true }));
  }
  done();
});

gulp.task('otfToTtf', () => {
  return gulp
    .src(`${srcFolder}fonts/*.otf`, {})
    .pipe(fonter({ formats: ['ttf'] }))
    .pipe(gulp.dest(`${srcFolder}fonts/`))
    .pipe(
      plumber(
        notify.onError({
          title: 'FONTS',
          message: 'Error: <%= error.message %>. File: <%= file.relative %>!',
        })
      )
    );
});

// Конвертируем TTF в woff2
gulp.task('ttfToWoff', () => {
  return gulp
    .src([`${srcFolder}fonts/*.ttf`])
    .pipe(
      plumber(
        notify.onError({
          title: 'FONTS',
          message: 'Error: <%= error.message %>',
        })
      )
    )
    .pipe(ttf2woff2())
    .pipe(gulp.dest(`${destFolder}fonts/`));
});

// Генерируем _fontsAutoGen.scss только из woff2 файлов
gulp.task('fontsStyle', () => {
  let fontsFile = `${srcFolder}scss/bases/_fontsAutoGen.scss`;
  fs.readdir(`${buildFolder}fonts/`, function (err, fontsFiles) {
    if (fontsFiles) {
      fontsFiles = fontsFiles.filter(
        (file) => file.endsWith('.woff2')
      );
      fs.writeFile(fontsFile, '', cb);
      let newFileOnly;
      for (var i = 0; i < fontsFiles.length; i++) {
        let fontFileName = fontsFiles[i].split('.')[0];
        if (newFileOnly !== fontFileName) {
          let fontName = fontFileName.split('-')[0] ? fontFileName.split('-')[0] : fontFileName;
          let fontWeight = fontFileName.split('-')[1] ? fontFileName.split('-')[1] : fontFileName;
          if (fontWeight.toLowerCase() === 'thin') {
            fontWeight = 100;
          } else if (
            fontWeight.toLowerCase() === 'extralight' ||
            fontWeight.toLowerCase() === 'ultralight'
          ) {
            fontWeight = 200;
          } else if (fontWeight.toLowerCase() === 'light') {
            fontWeight = 300;
          } else if (fontWeight.toLowerCase() === 'medium') {
            fontWeight = 500;
          } else if (
            fontWeight.toLowerCase() === 'semibold' ||
            fontWeight.toLowerCase() === 'demibold'
          ) {
            fontWeight = 600;
          } else if (fontWeight.toLowerCase() === 'bold') {
            fontWeight = 700;
          } else if (
            fontWeight.toLowerCase() === 'extrabold' ||
            fontWeight.toLowerCase() === 'ultrabold'
          ) {
            fontWeight = 800;
          } else if (
            fontWeight.toLowerCase() === 'black' ||
            fontWeight.toLowerCase() === 'ultra' ||
            fontWeight.toLowerCase() === 'extrablack' ||
            fontWeight.toLowerCase() === 'ultrablack' ||
            fontWeight.toLowerCase() === 'heavy' ||
            fontWeight.toLowerCase() === 'fat'
          ) {
            fontWeight = 900;
          } else {
            fontWeight = 400;
          }
          fs.appendFile(
            fontsFile,
            `@font-face {\n\tfont-family: ${fontName};\n\tfont-display: swap;\n\tsrc: url("../fonts/${fontFileName}.woff2") format("woff2");\n\tfont-weight: ${fontWeight};\n\tfont-style: normal;\n}\r\n`,
            cb
          );
          newFileOnly = fontFileName;
        }
      }
    }
  });

  return gulp.src(`${srcFolder}`);
  function cb() { }
});

gulp.task('files', function () {
  return gulp
    .src([
      `${srcFolder}files/**/*.*`,
      `!${srcFolder}files/icons/fonts/**/*.*`,
      `!${srcFolder}files/video/**/*.*`,
    ])
    .pipe(gulp.dest(`${destFolder}`))
    .pipe(bs.stream());
});

gulp.task('icons', function () {
  return gulp
    .src(`${srcFolder}files/icons/**/*.*`, { encoding: false })
    .pipe(newer(`${destFolder}icons/`))
    .pipe(gulp.dest(`${destFolder}icons/`));
});

gulp.task('server', function () {
  bs.init({
    server: { baseDir: destFolder },
    browser: 'google chrome',
    open: false,
    notify: false,
    port: 3000,
    ghostMode: {
      clicks: false,
      forms: false,
      location: false,
      scroll: false,
    },
  });
});

gulp.task('watch', function () {
  gulp.watch(`${srcFolder}scss/**/*.scss`, gulp.parallel('styles'));
  gulp.watch(
    [`${srcFolder}html/**/*.html`, `${srcFolder}**/*.json`],
    gulp.parallel('html')
  ).on('change', bs.reload);
  gulp.watch(`${srcFolder}images/**/*.*`, gulp.parallel('images', 'svg'));
  gulp.watch(`${srcFolder}js/**/*.js`, gulp.parallel('js'));
  gulp.watch(`${srcFolder}files/**/*`, gulp.parallel('files'));
  gulp.watch(`${srcFolder}files/video/**/*.*`, gulp.parallel('video'));
  gulp.watch(`${srcFolder}files/icons/**/*.*`, gulp.parallel('icons'));
});

gulp.task('fonts', gulp.series('otfToTtf', 'ttfToWoff', 'fontsStyle'));

gulp.task(
  'default',
  gulp.series(
    'clean',
    'fonts',
    gulp.series('cleanSvg', 'svg'),
    gulp.series('html', 'styles', 'files', 'icons', 'js', 'images', 'video'),
    gulp.parallel('server', 'watch')
  )
);

gulp.task(
  'build',
  gulp.series(
    'clean',
    'fonts',
    gulp.series('cleanSvg', 'svg'),
    gulp.series('html', 'styles', 'files', 'icons', 'js', 'images', 'video')
  )
);