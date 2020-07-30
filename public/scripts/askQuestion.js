const getPostButton = () => document.querySelector('#postButton');
const getQuestionTitle = () => document.querySelector('#titleField').value;
const getTagHolder = () => document.querySelector('#tagsHolder');
const getTagInput = () => document.querySelector('#tagsField');
const getAllTags = () => document.querySelectorAll('.tag');

const addTag = function() {
  const tag = getTagInput();
  const div = document.createElement('div');
  div.className = 'tag';
  div.innerText = tag.value.replace(' ', '');
  div.innerText && getTagHolder().appendChild(div);
  tag.value = '';
};

const removeTag = function() {
  const currentTag = getTagInput().value;
  const tags = getAllTags();
  const lastTag = Array.from(tags).pop();
  let currentTagValue = currentTag.slice(0, currentTag.length - 1);
  if (!currentTag) {
    currentTagValue = lastTag.innerText;
    lastTag.remove();
  }
  getTagInput().value = currentTagValue;
};

const manageTags = function(event) {
  if (event.code === 'Space') {
    return addTag();
  }
  if (event.code === 'Backspace') {
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
      ['bold', 'italic', 'underline', { script: 'sub' }, { script: 'super' }],
      ['blockquote', 'code-block'],
      [{ color: [] }, 'link', { header: [false, 1, 2, 3, 4, 5, 6] }],
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
  postData('/saveQuestion', question)
    .then(({ id }) => {
      location.assign(`/question?id=${id}`);
    });
};

const main = function() {
  const editor = new Quill('#bodyField', getEditorConfig());
  getPostButton().onclick = saveQuestion.bind(null, editor);
  getTagInput().addEventListener('keyup', manageTags);
};

window.onload = main;
