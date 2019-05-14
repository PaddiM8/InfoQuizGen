"use strict";

let questions       = [];
let currentQuestion = -1;
let password        = "";
let quizId          = "";
const server = "http://localhost:5000/api/quiz";

let answers      = document.getElementById("answers").children;
let question     = document.getElementById("question-input");
let title        = document.getElementById("info-tile").children[0];
let text         = document.getElementById("text-editor");
let sources      = document.getElementById("sources");
let questionList = document.getElementById("question-list");
let publishStep2 = document.getElementById("publish-step2");


questionList.addEventListener("click", function (evt) {
   let index = Array.from(evt.target.parentNode.children).indexOf(evt.target);
   selectQuestion(index);
});

document.getElementById("publish-button").addEventListener("click", function() {
   toggleDialog(document.getElementById("publish-dialog"));
});

document.getElementById("new-question").addEventListener("click", createQuestion);

function selectQuestion(index) {
   question.value = questions[index].question;
   title.value    = questions[index].title;
   text.value     = questions[index].text;
   sources.value  = questions[index].sources[0];

   // Set background color to green on the "correct answer" tile
   for (let i = 0; i < answers.length; i++) {
      answers[i].value = questions[index].answers[i];
      if (questions[index].correctAnswer == i)
         answers[i].style.backgroundColor = "#26de81";
      else answers[i].style.backgroundColor = "#ffffff";
   }

   // If not wasn't already selected before, toggle the class that changes background color
   if (currentQuestion != index) {
      if (currentQuestion != -1)
         questionList.children[currentQuestion].classList.toggle("selected");
      questionList.children[index].classList.toggle("selected");
   }

   currentQuestion = index;
}

function createQuestion() {
   let correctAnswer = Math.floor(Math.random() * 4) + 0;
   let newQuestion = {
      question: "",
      answers: [
         "", "", "", ""
      ],
      correctAnswer: correctAnswer,
      title: "",
      text: "",
      sources: []
   };

   questions.push(newQuestion);

   // Add to list
   let listItem = document.createElement("li");
   listItem.appendChild(document.createTextNode("New Question"));
   document.getElementById("question-list").appendChild(listItem);

   selectQuestion(questions.length - 1);
}

function addQuestion(questionObj) {
   questions.push(questionObj);
   let listItem = document.createElement("li");
   listItem.appendChild(document.createTextNode(questionObj.question));
   document.getElementById("question-list").appendChild(listItem);

   selectQuestion(questions.length - 1);
}

function deselectQuestion(index) {

}

function toggleDialog(element) {
   let dialogBackground = document.getElementById("dialog-background");

   dialogBackground.classList.toggle("shown");

   // Adjust for update
   if (element.id == "publish-dialog") {
      if (password != "" && !element.classList.contains("shown")) {
         update(quizId, JSON.stringify(questions), password);
      } else if (quizId != "") {
         let labels = element.getElementsByTagName("p");
         labels[2].style.display = "none";
         labels[1].innerHTML = "Quiz Password";
         document.getElementById("publish-password-confirm").style.display = "none";
      } else {
         let labels = element.getElementsByTagName("p");
         labels[2].style.display = "block";
         labels[1].innerHTML = "Set a Password";
         document.getElementById("publish-password-confirm").style.display = "block";
      }
   }

   element.classList.toggle("shown");
}

document.getElementById("update-question").addEventListener("click", function() {
   questions[currentQuestion].question   = question.value;
   questions[currentQuestion].title      = title.value;
   questions[currentQuestion].text       = text.value;
   questions[currentQuestion].sources[0] = sources.value;

   if (question.value != "")
      questionList.children[currentQuestion].innerHTML = question.value;
   else questionList.children[currentQuestion].innerHTML = "New Question";

   for (let i = 0; i < answers.length; i++)
      questions[currentQuestion].answers[i] = answers[i].value;
   deselectQuestion(currentQuestion);

   // Set cookie to save question locally
   document.cookie = "q_" + currentQuestion + "=" +
      encodeURIComponent(JSON.stringify(questions[currentQuestion]));
});

function clearCookies() {
   let cookies = document.cookie.split(/; */);
   for(let i = 0; i < cookies.length; i++) {
      let sign  = cookies[i].indexOf("=");
      let name = cookies[i].substring(0, sign);
      if (cookies[i].startsWith("q_"))
         document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
   }
}

function update(id, json, pass) {
   if (id.startsWith("\"")) id = JSON.parse(id);
   let data = new URLSearchParams();
   data.append("json", json);
   data.append("password", pass);
   request("Update", data, id).then((result) => {
      showQuizUrl(result);
   });
}

function showQuizUrl(id) {
   if (id.startsWith("\"")) id = JSON.parse(id);
   publishStep2.style.display = "block";
   document.getElementById("publish-step1").style.display = "none";
   let linkElement = publishStep2.getElementsByTagName("input")[0];
   linkElement.value = location.protocol + "//" +
      window.location.host + "/q/" + id;
}

function request(action, data, id = "") {
   return new Promise((resolve, reject) => {
      const req = new XMLHttpRequest();
      let url = "/api/database/";

      if (action == "Create")
         req.open('POST', url);
      if (action == "Update")
         req.open('PUT', url + id);
      if (action == "Get")
         req.open('GET', url + id);

      req.setRequestHeader("Content-Type", "application/x-www-form-urlencoded; charset=UTF-8");
      req.onload = function() {
         if (req.status === 200) {
            resolve(req.response);
         } else reject(Error(req.statusText));
      }
      req.onerror = (e) => reject(Error(`Network Error: ${e}`));
      req.send(data.toString());
   });
}

document.getElementById("publish-submit").addEventListener("click", function() {
   let data  = new URLSearchParams();
   let pass  = document.getElementById("publish-password").value;
   let pass2 = document.getElementById("publish-password-confirm").value;
   data.append("json", JSON.stringify(questions));
   data.append("password", pass);


   // Add loader
   let publishDialog = document.getElementById("publish-dialog");
   publishDialog.children[1]
      .innerHTML += "<span class='loading'></span>";

   let action = "Update"; // Update existing
   if (quizId == "") { // Publish as new
      if (pass != pass2) {
         alert("Passwords don't match!'");
         return;
      }

      action = "Create";
   }

   if (quizId.startsWith("\"")) quizId = JSON.parse(quizId);
   request(action, data, quizId).then((result) => {
      // Remove loader
      let loader = publishDialog.getElementsByClassName("loading")[0];
      loader.parentNode.removeChild(loader);

      showQuizUrl(result);

      // Update local variables
      quizId   = result;
      password = pass;
      document.cookie = "q_id=" + result;
      document.getElementById("publish-button").innerHTML = "Publish Changes";
   }).catch(function(reject) {
      console.log("Error: " + reject);
   });
});

let copyButton = document.getElementById("publish-copy");
copyButton.addEventListener("click", function() {
   let input = copyButton.parentNode.getElementsByTagName("input")[0];
   input.select();
   document.execCommand("copy");
});

publishStep2.getElementsByTagName("button")[0].addEventListener("click", function() {
   toggleDialog(document.getElementById("publish-dialog"));
   publishStep2.style.display = "none";
   document.getElementById("publish-step1").style.display = "block";
});

document.getElementById("dialog-background").addEventListener("click", function()  {
   let publishDialog = document.getElementById("publish-dialog");
   if (publishDialog.classList.contains("shown"))
      toggleDialog(publishDialog);
});

window.onload = function() {
   // Load values stored in cookies
   let cookies = document.cookie.split(/; */);
   for(let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      if (cookie.startsWith("q_") && !cookie.endsWith("=")) {
         let sign  = cookie.indexOf("=");
         let name  = cookie.substring(0, sign);
         let value = cookie.substring(sign+1);

         if (name.match(/q_\d+/))
            addQuestion(JSON.parse(decodeURIComponent(value)));
         else if (name == "q_id")
            quizId = value;
      }
   }

   if (questions.length == 0) createQuestion();
   if (quizId != "")
      document.getElementById("publish-button").innerHTML = "Publish Changes";
}
