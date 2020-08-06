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
