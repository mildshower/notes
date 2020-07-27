const getPostButton = () => document.querySelector('#postButton');

const getQuestionTitle = () => document.querySelector('#titleField').value;

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

const saveQuestion = function(editor){
  getPostButton().onclick = () => {};
  const question = {title: getQuestionTitle()};
  question.body = JSON.stringify(editor.getContents());
  question.bodyText = editor.getText();
  postData('/saveQuestion', question)
    .then(({id}) => {
      location.assign(`/question?id=${id}`);
    });
};

const main = function () {
  setupSyntax();
  const editor = new Quill('#bodyField', getEditorConfig());
  getPostButton().onclick = saveQuestion.bind(null, editor);
};

window.onload = main;
