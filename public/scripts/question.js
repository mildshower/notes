const getEditorConfig = () => ({
  theme: 'snow',
  formats: [
    'bold',
    'italic',
    'color',
    'code',
    'link',
    'script',
    'underline',
    'blockquote',
    'header',
    'code-block',
  ],
  modules: {
    toolbar: [
      ['bold', 'italic', 'underline', { script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ color: [] }, 'link', { header: [false, 1, 2, 3, 4, 5, 6] }],
    ],
    syntax: true,
  },
});

const setupSyntax = () => {
  hljs.configure({
    languages: ['javascript', 'ruby', 'python', 'node.js', 'c'],
  });
};

const showQuestion = function () {
  const question = new Quill(
    '#questionBox > .body > .editor',
    getEditorConfig()
  );
  // setTimeout(() => {
  question.disable();
  document.querySelector('#questionBox > .body > .ql-toolbar').style.display =
      'none';
  // }, 5000);
  question.setContents({
    ops: [
      { insert: 'This is my question' },
      { attributes: { header: 1 }, insert: '\n' },
      { insert: 'int a = 10;' },
      { attributes: { 'code-block': true }, insert: '\n' },
      { insert: 'b = a' },
      { attributes: { 'code-block': true }, insert: '\n' },
      { insert: 'fi = a - b;' },
      { attributes: { 'code-block': true }, insert: '\n' },
      { insert: 'function fi(5);' },
      { attributes: { 'code-block': true }, insert: '\n' },
      { insert: 'now what will it print\nso that\nI c\ncan \nhello\nhatt\n' },
    ],
  });
  return question;
};

const showAnswers = function(){
  const answer = new Quill(
    '.answerBox > .body > .editor',
    getEditorConfig()
  );
  answer.disable();
  document.querySelector('.answerBox > .body > .ql-toolbar').style.display =
      'none';
  answer.setContents({
    ops: [
      { insert: 'This is my question' },
      { attributes: { header: 1 }, insert: '\n' },
      { insert: 'int a = 10;' },
      { attributes: { 'code-block': true }, insert: '\n' },
      { insert: 'b = a' },
      { attributes: { 'code-block': true }, insert: '\n' },
      { insert: 'fi = a - b;' },
      { attributes: { 'code-block': true }, insert: '\n' },
      { insert: 'function fi(5);' },
      { attributes: { 'code-block': true }, insert: '\n' },
      { insert: 'now what will it print\nso that\nI c\ncan \nhello\nhatt\n' },
    ],
  });
};

const main = function () {
  setupSyntax();
  const question = showQuestion();
  showAnswers();
};

window.onload = main;
