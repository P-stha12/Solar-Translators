let option = document.querySelector("#option");
let file = document.getElementsByName("csvInput")[0];
let submit = document.querySelector("#Submit");
let result = document.querySelector("#result");
let hours= document.querySelector('#hours');

let optionMap = { 1: 1 , 2:2};
let formData = new FormData();
submit.addEventListener("click",async (event) => {
  if (option.value == 0) {
    result.innerHTML("Please select the proper value");
    result.style.color = "red";
    setTimeout(() => {
      result.innerHTML("Result");
      result.style.color = "black";
    }, 2000);
  } else {
    formData.append("dataType", optionMap[option.value]);
    if(file.files.length===0){
        result.innerHTML("Please input csv file");
        result.style.color = "red";
        setTimeout(() => {
          result.innerHTML("Result");
          result.style.color = "black";
        }, 2000);
    }else{
      if(!hours.value){
        result.innerHTML("Please enter a valid value");
        result.style.color = "red";
        setTimeout(() => {
          result.innerHTML("Result");
          result.style.color = "black";
        }, 2000);
      }else{
        formData.append('hours',hours.value);
        formData.append('file',file.files[0])
        result.innerHTML = "Loading ... ";
        let graphData = await fetch("../graph",{
            headers:{
                "enctype":"multiipart/form-data"
            },
            method:"POST",
            body:formData
        })
        graphData = await graphData.json();
        if(graphData.status){
          console.log(graphData.graph);
          result.innerHTML = graphData.graph;
        }else{
          result.innerHTML = "failed please try again probably some server error";
        }
      }
    }
  }  
});
