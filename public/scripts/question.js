const getQuestionBox = () => document.querySelector('.questionBox');

const getAnswerButton = () => document.querySelector('#answerButton');

const getAnswerBody = () => document.querySelector('#answerBody');

const getAnswers = () => document.querySelectorAll('.answerBox');

const getAnswer = (id) => document.querySelector(`.answerBox[id="${id}"]`);

const getAnswerCount = () => document.querySelector('#answersHead .count');

const getClickableTicks = () => document.querySelectorAll('.clickable');

const getClickableTick = ancestor =>
  document.querySelector(ancestor + ' .clickable');

const deleteAnswer = function(answerId) {
  const msg = 'Are you sure to delete?';
  if (confirm(msg)) {
    postData('/deleteAnswer', { id: answerId })
      .then(({ isSucceeded }) => {
        if (isSucceeded) {
          getAnswer(answerId).remove();
          const count = getAnswerCount();
          count.innerText = +count.innerText - 1;
        }
      });
  }
};

const getVoteElements = boxQuery => {
  const voteBox = document.querySelector(`${boxQuery} .votes`);
  const [upVote, count, downVote] = voteBox.children;
  return { upVote, downVote, count };
};

const getCommentBar = ancestor =>
  document.querySelector(`${ancestor} .commentBar`);

const getCommentBox = ancestor =>
  document.querySelector(`${ancestor} .commentsBox`);

const removeAllTickHighlights = function() {
  getClickableTicks().forEach(tick => {
    tick.classList.remove('accepted');
  });
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

const loadQuestion = function() {
  const questionBox = getQuestionBox();
  fetch(`/questionDetails?id=${questionBox.id}`)
    .then(response => response.json())
    .then(({ body }) => {
      const question = new Quill('.questionBox .editor', getEditorConfig());
      question.setContents(JSON.parse(body));
      question.disable();
      disableToolbar('.questionBox');
    });
};

const loadAnswers = function() {
  const questionId = getQuestionBox().id;
  fetch(`/answers?id=${questionId}`)
    .then(response => response.json())
    .then(answers => {
      answers.forEach(({ id, body }) => {
        const ans = new Quill(`.answerBox[id="${id}"] .editor`, getEditorConfig());
        ans.setContents(JSON.parse(body));
        ans.disable();
        disableToolbar(`.answerBox[id="${id}"]`);
      });
    });
};

const saveAnswer = function(answer) {
  const body = JSON.stringify(answer.getContents());
  const bodyText = answer.getText();
  const quesId = getQuestionBox().id;
  postData('/saveAnswer', { body, bodyText, quesId })
    .then(({ isSaved }) => {
      if (isSaved) {
        location.reload();
      }
    });
};

const removeVoteHighlights = function(upVote, downVote) {
  upVote.classList.remove('chosen');
  downVote.classList.remove('chosen');
};

const handleVote = function(id, voteBox, isQuestionVote) {
  const { count, upVote, downVote } = voteBox;
  let endPoint = '/addVote';
  const isDeletion = this.className.includes('chosen');
  if (isDeletion) {
    endPoint = '/deleteVote';
  }
  const voteType = this.className.includes('upVote') ? 1 : 0;
  postData(endPoint, { id, voteType, isQuestionVote })
    .then(({ voteCount, isSucceeded }) => {
      if (isSucceeded) {
        removeVoteHighlights(upVote, downVote);
        count.innerText = voteCount;
        !isDeletion && this.classList.add('chosen');
      }
    });
};

const addVoteListener = function(ancestorQuery, id, isQuestionVote) {
  const voteBox = getVoteElements(ancestorQuery);
  const { upVote, downVote } = voteBox;
  upVote.onclick = handleVote.bind(upVote, id, voteBox, isQuestionVote);
  downVote.onclick = handleVote.bind(downVote, id, voteBox, isQuestionVote);
};

const addAcceptanceListener = function(ancestor, id) {
  const tick = getClickableTick(ancestor);
  if (!tick) {
    return;
  }
  const isRejection = tick.className.includes('accepted');
  const path = isRejection ? '/rejectAnswer' : '/acceptAnswer';
  tick.onclick = () => {
    postData(path, { answerId: id })
      .then(({ isSucceeded }) => {
        if (isSucceeded) {
          removeAllTickHighlights();
          !isRejection && tick.classList.add('accepted');
        }
      });
  };
};

const showComment = function(commentBox, { body, created, ownerName, owner }) {
  const commentElement = document.createElement('p');
  commentElement.innerHTML =
    `${body}&nbsp;&nbsp;-&nbsp;` +
    `<a class="strong" href="/profile?userId=${owner}">${ownerName}</a>` +
    `<span class="commentTime">&nbsp;&nbsp;${created}</span>`;
  commentElement.classList.add('comment');
  commentBox.appendChild(commentElement);
};

const addCommentListener = function(ancestor, id, isQuestionComment) {
  const commentBar = getCommentBar(ancestor);
  const commentBox = getCommentBox(ancestor);
  const [opener, body, poster, cancel] = commentBar.children;
  opener.onclick = () => {
    commentBar.classList.remove('closed');
    body.focus();
  };
  cancel.onclick = () => {
    commentBar.classList.add('closed');
    body.value = '';
  };
  poster.onclick = () => {
    postData('/saveComment', { body: body.value, id, isQuestionComment })
      .then(({ isSucceeded, comment }) => {
        if (isSucceeded) {
          showComment(commentBox, comment);
        }
        commentBar.classList.add('closed');
        body.value = '';
      });
  };
};

const attachContentListeners = function() {
  addVoteListener('.questionBox', getQuestionBox().id, true);
  addCommentListener('.questionBox', getQuestionBox().id, true);
  getAnswers().forEach(({ id }) => {
    const answerBoxQuery = `.answerBox[id="${id}"]`;
    addVoteListener(answerBoxQuery, id, false);
    addCommentListener(answerBoxQuery, id, false);
    addAcceptanceListener(answerBoxQuery, id);
  });
};

const main = function() {
  loadQuestion();
  loadAnswers();
  if (getAnswerBody()) {
    const newAnswer = new Quill('#answerBody > #editor', getEditorConfig());
    getAnswerButton().onclick = saveAnswer.bind(null, newAnswer);
    attachContentListeners();
  }
};

window.onload = main;
