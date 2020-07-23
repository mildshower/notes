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

const main = function () {
  setupSyntax();
  const editor = new Quill('#bodyField', getEditorConfig());
};

window.onload = main;
