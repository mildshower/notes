const postData = function(path, data){
  return fetch(
    path,
    {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    }
  ).then(response => response.json());
};
