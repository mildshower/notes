const getLoginBtn = () => document.querySelector('#pop-up-container > .popUp > div > #login');
const getSignUpBtn = () => document.querySelector('#pop-up-container > .popUp > div > #signUp');
const getContainer = () => document.querySelector('#pop-up-container');

const showPopUp = function(targetPath){
  getLoginBtn().href = `/entry/?type=login&targetPath=${targetPath}`;
  getSignUpBtn().href = `/entry/?type=signUp&targetPath=${targetPath}`;
  getContainer().classList.remove('hidden');
};

const closePopUp = function(){
  getContainer().classList.add('hidden');
};
