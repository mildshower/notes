const getQuestionBox = () => document.querySelector('.questionBox');

const getAnswerButton = () => document.querySelector('#answerButton');

const getAnswerBody = () => document.querySelector('#answerBody');

const disableToolbar = ancestor => {
  const toolbar = document.querySelector(`${ancestor} .ql-toolbar`);
  toolbar.classList.add('hidden');
};

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

const loadQuestion = function () {
  const questionBox = getQuestionBox();
  fetch(`/questionDetails?id=${questionBox.id}`)
    .then(response => response.json())
    .then(({body}) => {
      const question = new Quill('.questionBox .editor', getEditorConfig());
      question.setContents(JSON.parse(body));
      question.disable();
      disableToolbar('.questionBox');
    });
};

const loadAnswers = function(){
  const questionId = getQuestionBox().id;
  fetch(`/answers?id=${questionId}`)
    .then(response => response.json())
    .then(answers => {
      answers.forEach(({id, body}) => {
        const ans = new Quill(`.answerBox[id="${id}"] .editor`, getEditorConfig());
        ans.setContents(JSON.parse(body));
        ans.disable();
        disableToolbar(`.answerBox[id="${id}"]`);
      });
    });
};

const saveAnswer = function(answer){
  const body = JSON.stringify(answer.getContents());
  const bodyText = answer.getText();
  const quesId = getQuestionBox().id;
  postData('/saveAnswer', {body, bodyText, quesId})
    .then(({isSaved}) => {
      if(isSaved){
        location.reload();
      }
    });
};

const main = function () {
  setupSyntax();
  loadQuestion();
  loadAnswers();
  if(getAnswerBody()){
    const newAnswer = new Quill('#answerBody > #editor', getEditorConfig());
    getAnswerButton().onclick = saveAnswer.bind(null, newAnswer);
  }
};

window.onload = main;
