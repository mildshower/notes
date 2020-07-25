const getAnchor = ()=>document.querySelector("#pop-up-container > .popUp > div > #login");
const getContainer = ()=>document.querySelector("#pop-up-container");

const showPopUp = function(targetPath){
  getAnchor().href = `/entry?targetPath=${targetPath}`;
  getContainer().classList.remove('hidden');
}

const closePopUp = function(){
  getContainer().classList.add('hidden');
}