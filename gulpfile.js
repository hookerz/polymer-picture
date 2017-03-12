const dom5 = require('dom5');
const parse5 = require('parse5');
const map = require('map-stream');
const gulp = require('gulp');
const sass = require('node-sass');
const treeAdapter = parse5.treeAdapters.default;
const pred = dom5.predicates;

const compilesass = () => {
  return map((file, cb) => {
    const isSassStyleTag = pred.AND(pred.hasTagName('style'), pred.hasAttr('lang'));
    const contents = file.contents.toString();
    const doc = parse5.parseFragment(contents);
    const styleTags = dom5.queryAll(doc, isSassStyleTag, [], dom5.childNodesIncludeTemplate);
    styleTags.forEach((styleTag) => {
      let source = dom5.getTextContent(styleTag);
      let result = sass.renderSync({
        data: source,
        outputStyle: 'expanded',
        sourceMap: true,
        sourceMapEmbed: true,
        sourceMapContents: true
      });
      dom5.removeAttribute(styleTag, 'lang');
      dom5.setTextContent(styleTag, result.css);
    });
    const str = parse5.serialize(doc);
    file.contents = new Buffer(str);
    cb(null, file);
  });
};

gulp.task('build', () => {
  gulp.src('src/**/*.html')
    .pipe(compilesass())
    .pipe(gulp.dest('.'))
});

gulp.task('watch', ['build'], () => {
  gulp.watch('src/**/*.html', ['build']).on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
});
