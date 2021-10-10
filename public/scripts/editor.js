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
      ['bold', 'italic', 'underline'],        // toggled buttons
    ['blockquote', 'code-block'],
      
    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript
      
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
      
    [{ 'color': [] }],          // dropdown with defaults from theme
      
    ],
    syntax: true,
  },
});
