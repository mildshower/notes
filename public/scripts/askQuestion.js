const addTags = function(event) {
  if (event.code === 'Space') {
    const tag = document.querySelector('#tagsField');
    const tag_holder = document.querySelector('#tagsHolder');
    const div = document.createElement('div');
    div.className = 'tag';
    div.innerText = tag.value;
    tag_holder.appendChild(div);
    tag.value = '';
  }
  if (event.code === 'Backspace') {
    const tag = document.querySelector('#tagsField');
    const tags = document.querySelectorAll('.tag');
    Array.from(tags).pop().remove();
  }
};

const getPostButton = () => document.querySelector('#postButton');

const getTagInput = () => document.querySelector('#tagsField');

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

const saveQuestion = function(editor){
  getPostButton().onclick = () => {};
  const question = {title: getQuestionTitle()};
  question.body = JSON.stringify(editor.getContents());
  question.bodyText = editor.getText();
  postData('/saveQuestion', question)
    .then(({ id }) => {
      location.assign(`/question?id=${id}`);
    });
};

const main = function () {
  const editor = new Quill('#bodyField', getEditorConfig());
  getPostButton().onclick = saveQuestion.bind(null, editor);
  getTagInput().addEventListener('keyup', addTags);
};

window.onload = main;
