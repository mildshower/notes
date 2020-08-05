const getProfileButton = () => document.querySelector('#profileButton');
const getProfileDropDown = () => document.querySelector('.profileDropDown');

getProfileButton().addEventListener('focusin', () => {
  getProfileDropDown().classList.remove('hidden');
});

getProfileButton().addEventListener('focusout', () => {
  getProfileDropDown().classList.add('hidden');
});
