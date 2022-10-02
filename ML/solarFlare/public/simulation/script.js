let option = document.querySelector("#option");
let file = document.getElementsByName("csvInput")[0];
let submit = document.querySelector("#Submit");
let result = document.querySelector("#result");

let optionMap = new Map(
  Object.entries(
    { 1: "Partical Velocity" },
    { 2: "Magnetic Field" },
    { 3: "Both of them" }
  )
);
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
          result.innerHTML = "Some implementation is here"
        }else{
          result.innerHTML = "failed please try again probabl some server error";
        }
    }
  }  
});
