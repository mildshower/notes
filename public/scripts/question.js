const getQuestionBox = () => document.querySelector('.questionBox');

const getAnswerButton = () => document.querySelector('#answerButton');

const getAnswerBody = () => document.querySelector('#answerBody');

const getAnswers = () => document.querySelectorAll('.answerBox');

const getVoteElements = boxQuery => {
  const voteBox = document.querySelector(`${boxQuery} .votes`);
  const [upVote, count, downVote] = voteBox.children;
  return {upVote, downVote, count};
};

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
      ['bold', 'underline'],
      ['blockquote', 'code-block'],
      ['link', { header: [false, 1, 2, 3, 4, 5, 6] }],
    ],
    syntax: true,
  },
});

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

const removeVoteHighlights = function(upVote, downVote){
  upVote.classList.remove('chosen');
  downVote.classList.remove('chosen');
};

const handleVote = function(id, voteBox, isQuestionVote){
  const {count, upVote, downVote} = voteBox;
  let endPoint = '/addVote';
  const isDeletion = this.className.includes('chosen');
  if(isDeletion){
    endPoint = '/deleteVote';
  }
  const voteType = this.className.includes('upVote') ? 1 : 0;
  postData(endPoint, {id, voteType, isQuestionVote})
    .then(({voteCount, isSucceeded}) => {
      if(isSucceeded){
        removeVoteHighlights(upVote, downVote);
        count.innerText = voteCount;
        !isDeletion && this.classList.add('chosen');
      }
    });
};

const addVoteListener = function(ancestorQuery, id, isQuestionVote){
  const voteBox = getVoteElements(ancestorQuery);
  const {upVote, downVote} = voteBox;
  upVote.onclick = handleVote.bind(upVote, id, voteBox, isQuestionVote);
  downVote.onclick = handleVote.bind(downVote, id, voteBox, isQuestionVote);
};

const attachVoteListeners = function(){
  addVoteListener('.questionBox', getQuestionBox().id, true);
  getAnswers().forEach(({id}) => {
    addVoteListener(`.answerBox[id="${id}"]`, id, false);
  });
};

const main = function () {
  loadQuestion();
  loadAnswers();
  if(getAnswerBody()){
    const newAnswer = new Quill('#answerBody > #editor', getEditorConfig());
    getAnswerButton().onclick = saveAnswer.bind(null, newAnswer);
    attachVoteListeners();
  }
};

window.onload = main;
