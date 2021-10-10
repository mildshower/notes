const getSearchBar = () => document.querySelector('#searchField');

window.onkeydown = (event) => {
  if(event.metaKey && event.keyCode === 75) return getSearchBar().focus();
}