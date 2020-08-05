const getPostButton = () => document.querySelector('#postButton');
const getQuestionTitle = () => document.querySelector('#titleField').value;
const getTagHolder = () => document.querySelector('#tagsHolder');
const getTagInput = () => document.querySelector('#tagsField');
const getAllTags = () => document.querySelectorAll('#tagsHolder.tags .tag');
const getSuggestionBox = () => document.querySelector('#suggestionBox');

const addTag = function(tagInput) {
  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.innerText = tagInput.value.replace(' ', '');
  tag.innerText && getTagHolder().prepend(tag);
  tagInput.value = '';
};

const removeTag = function() {
  const currentTag = getTagInput().value;
  const tags = getAllTags();
  const lastTag = Array.from(tags).pop();
  let currentTagValue = currentTag;
  if (lastTag && !currentTag) {
    currentTagValue = lastTag.innerText;
    lastTag.remove();
  }
  getTagInput().value = currentTagValue;
};

const selectSuggestion = function(event) {
  const tag = document.createElement('div');
  tag.className = 'tag';
  tag.innerText = event.target.innerText;
  getTagHolder().prepend(tag);
  const tagInput = getTagInput();
  tagInput.value = '';
  tagInput.focus();
};

const showTagsSuggestion = function(tags) {
  const suggestionsBox = getSuggestionBox();
  if (!tags.length) {
    suggestionsBox.style.visibility = 'hidden';
    return;
  }
  suggestionsBox.style.visibility = 'unset';
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
    .then(showTagsSuggestion);
};

const manageTags = function(event) {
  const tag = getTagInput();
  showSuggestion(tag);
  if (event.keyCode === 32) {
    return addTag(tag);
  }
  if (event.keyCode === 8) {
    removeTag();
  }
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

const getQuestionTags = function() {
  const tags = Array.from(getAllTags(), (tag) => tag.innerText);
  return [...new Set(tags)];
};

const saveQuestion = function(editor) {
  getPostButton().onclick = () => { };
  const question = { title: getQuestionTitle() };
  question.body = JSON.stringify(editor.getContents());
  question.bodyText = editor.getText();
  question.tags = getQuestionTags();
  postData('/saveQuestion', question).then(({ id }) => {
    location.assign(`/question?id=${id}`);
  });
};

const main = function() {
  const editor = new Quill('#bodyField', getEditorConfig());
  getPostButton().onclick = saveQuestion.bind(null, editor);
  getTagInput().addEventListener('keyup', manageTags);
  getTagInput().addEventListener(
    'focus',
    showSuggestion.bind(null, getTagInput())
  );
};

window.onload = main;
