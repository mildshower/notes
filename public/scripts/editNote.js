const getQuestionBox = () => document.querySelector('.newQuestionBox');
const getPostButton = () => document.querySelector('#postButton');
const getQuestionTitle = () => document.querySelector('#titleField').value;
const getTitleBox = () => document.querySelector('#titleField');
const getTagHolder = () => document.querySelector('#tagsHolder');
const getTagInput = () => document.querySelector('#tagsField');
const getAllTags = () => document.querySelectorAll('#tagsHolder.tags .tag');
const getSuggestionBox = () => document.querySelector('#suggestionBox');

const createCrossButton = function() {
  const cross = document.createElement('img');
  cross.src = '/images/crossButton.svg';
  cross.onclick = (event) => {
    event.target.parentNode.remove();
    getTagInput().focus();
  };
  return cross;
};

const addTag = function(tagInput) {
  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.innerText = tagInput.value.replace(' ', '');
  if (tag.innerText) {
    tag.appendChild(createCrossButton());
    getTagHolder().prepend(tag);
  }
  tagInput.value = '';
};

const removeTag = function() {
  const tagInput = getTagInput();
  const currentTag = tagInput.value;
  const lastTag = getAllTags()[0];
  if(!lastTag || currentTag){
    return;
  }
  tagInput.value = lastTag.innerText;
  lastTag.remove();
};

const selectSuggestion = function(event) {
  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.innerText = event.target.innerText;
  tag.appendChild(createCrossButton());
  getTagHolder().prepend(tag);
  const tagInput = getTagInput();
  tagInput.value = '';
  tagInput.focus();
};

const displayMatchedTags = function(tags) {
  const suggestionsBox = getSuggestionBox();
  if (!tags.length) {
    suggestionsBox.style.display = 'none';
    return;
  }
  suggestionsBox.style.display = 'block';
  const tagsBox = suggestionsBox.querySelector('.tags');
  Array.from(tagsBox.children).forEach(prevTag => prevTag.remove());
  tags.forEach((tagName) => {
    const tag = document.createElement('div');
    tag.className = 'tag';
    tag.innerText = tagName;
    tag.onclick = selectSuggestion;
    tagsBox.appendChild(tag);
  });
};

const showSuggestion = function(tag) {
  fetch(`/tags?exp=${tag.value}`)
    .then((res) => res.json())
    .then(displayMatchedTags);
};

const manageTags = function(event) {
  const tag = getTagInput();
  if (event.keyCode === 32) {
    addTag(tag);
    return showSuggestion({value: ""});
  }
  if (event.keyCode === 8) {
    removeTag();
  }
  showSuggestion(tag);
};

const getQuestionTags = function() {
  const tags = Array.from(getAllTags(), (tag) => tag.innerText);
  return [...new Set(tags)];
};

const saveQuestion = function(editor, noteId) {
  getPostButton().onclick = () => { };
  const question = { title: getQuestionTitle() };
  question.body = JSON.stringify(editor.getContents());
  question.bodyText = editor.getText();
  question.tags = getQuestionTags();
  postData(`/user/editNote?id=${noteId}`, question).then(() => {
    location.assign(`/question/${noteId}`);
  });
};

const loadQuestion = function(id, editor) {
  fetch(`/questionDetails?id=${id}`)
    .then(response => response.json())
    .then(({ body, title, tags }) => {
      editor.setContents(JSON.parse(body));
      getTitleBox().value = title;
      tags.forEach(tag => addTag({value: tag}));
    });
};

const main = function() {
  const questionBox = getQuestionBox();
  const editor = new Quill('#bodyField', getEditorConfig());
  loadQuestion(questionBox.id, editor);
  getPostButton().onclick = saveQuestion.bind(null, editor, questionBox.id);
  const tagInput = getTagInput();
  tagInput.addEventListener('keyup', manageTags);
  tagInput.addEventListener(
    'focus',
    showSuggestion.bind(null, tagInput)
  );
};

window.onload = main;
