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
      ['bold', 'italic', 'underline', { script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ color: [] }, 'link', { header: [false, 1, 2, 3, 4, 5, 6] }],
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

const castVote = function(contentId, {upVote, count, downVote}, contentType) {
  const voteType = this.className.includes('upVote') ? 1 : 0;
  postData('/vote', {voteType, contentId, contentType})
    .then(({error, action, currVoteCount}) => {
      if(error){
        return;
      }
      removeVoteHighlights(upVote, downVote);
      count.innerText = currVoteCount;
      if(action === 'added'){
        this.classList.add('chosen');
      }
    });
};

const addVoteListener = function(ancestorQuery, contentType, id){
  const voteBox = getVoteElements(ancestorQuery);
  const {upVote, downVote} = voteBox;
  upVote.onclick = castVote.bind(upVote, id, voteBox, contentType);
  downVote.onclick = castVote.bind(downVote, id, voteBox, contentType);
};

const attachVoteListeners = function(){
  addVoteListener('.questionBox', 'question', getQuestionBox().id);
  getAnswers().forEach(answer => {
    addVoteListener(`.answerBox[id="${answer.id}"]`, 'answer', answer.id);
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
