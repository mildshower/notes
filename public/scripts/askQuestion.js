const getPostButton = () => document.querySelector('#postButton');
const getQuestionTitle = () => document.querySelector('#titleField').value;
const getTagHolder = () => document.querySelector('#tagsHolder');
const getTagInput = () => document.querySelector('#tagsField');
const getAllTags = () => document.querySelectorAll('#tagsHolder.tags .tag');
const getSuggestionBox = () => document.querySelector('#suggestionBox .tags');

const addTag = function (tag) {
  const div = document.createElement('div');
  div.className = 'tag';
  div.innerText = tag.value.replace(' ', '');
  div.innerText && getTagHolder().appendChild(div);
  tag.value = '';
};

const removeTag = function () {
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

const showTagsSuggestion = function (tags) {
  const suggestionsBox = getSuggestionBox();
  Array.from(suggestionsBox.children).forEach(prevTag => prevTag.remove());
  tags.forEach((tagName) => {
    const tag = document.createElement('div')
    tag.className = 'tag';
    tag.innerText = tagName;
    suggestionsBox.appendChild(tag);
  })
};

const showSuggestion = function (tag) {
  fetch(`/tags?exp=${tag.value}`)
    .then((res) => res.json())
    .then(showTagsSuggestion);
};

const manageTags = function (event) {
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

const getQuestionTags = function () {
  const tags = Array.from(getAllTags(), (tag) => tag.innerText);
  return [...new Set(tags)];
};

const saveQuestion = function (editor) {
  getPostButton().onclick = () => {};
  const question = { title: getQuestionTitle() };
  question.body = JSON.stringify(editor.getContents());
  question.bodyText = editor.getText();
  question.tags = getQuestionTags();
  postData('/saveQuestion', question).then(({ id }) => {
    location.assign(`/question?id=${id}`);
  });
};

const main = function () {
  const editor = new Quill('#bodyField', getEditorConfig());
  getPostButton().onclick = saveQuestion.bind(null, editor);
  getTagInput().addEventListener('keyup', manageTags);
  getTagInput().addEventListener(
    'focus',
    showSuggestion.bind(null, getTagInput())
  );
};

window.onload = main;
