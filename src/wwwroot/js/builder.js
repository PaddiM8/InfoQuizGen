"use strict";

let questions       = [];
let currentQuestion = -1;
let quizId          = "";
let quizName        = "";
let password        = "";
const server = "http://localhost:5000/api/quiz";

const editor = {
   "answers":  document.getElementById("answers").children,
   "question": document.getElementById("question-input"),
   "title":    document.getElementById("info-tile").children[0],
   "text":     document.getElementById("text-editor"),
   "sources":  document.getElementById("sources"),
   "submit":   document.getElementById("update-question")
};

const questionsArea = {
   "list":   document.getElementById("question-list"),
   "button": document.getElementById("new-question")
};

const dialogBackground = document.getElementById("dialog-background");

const publishDialog = {
   "step1":            document.getElementById("publish-step1"),
   "step2":            document.getElementById("publish-step2"),
   "submit":           document.getElementById("publish-submit"),
   "name":             document.getElementById("publish-name"),
   "password":         document.getElementById("publish-password"),
   "passwordConfirm":  document.getElementById("publish-password-confirm"),
   "copyButton":       document.getElementById("publish-copy"),
   "cancel":           document.getElementById("publish-dialog").getElementsByClassName("cancel")[0]
};

const openDialog = {
   "submit":   document.getElementById("open-submit"),
   "url":      document.getElementById("open-url"),
   "password": document.getElementById("open-password"),
   "cancel":   document.getElementById("open-dialog").getElementsByClassName("cancel")[0]
};

window.onload = function() {
   // Load values stored in cookies
   let cookies = document.cookie.split(/; */);
   for(let i = 0; i < cookies.length; i++) {
      let cookie = cookies[i];
      if (cookie.startsWith("q_") && !cookie.endsWith("=")) {
         let sign  = cookie.indexOf("=");
         let key  = cookie.substring(0, sign);
         let value = cookie.substring(sign+1);
if (key.match(/q_\d+/))
            addQuestion(JSON.parse(decodeURIComponent(value)));
         else if (key == "q_id")
            quizId = value;
         else if (key == "q_name")
            quizName = value;
      }
   }

   if (questions.length == 0) createQuestion();
   if (quizId != "") {
      document.getElementById("publish-button").innerHTML = "Publish Changes";
      showIdBox();
   }

   let copyButtons = document.getElementsByClassName("copy-button");
   for (let k = 0; k < copyButtons.length; k++) {
      copyButtons[k].onclick = function() {
         let input = document.getElementById(copyButtons[k].getAttribute("relative")).select();
         document.execCommand("copy");
      }
   }
}

questionsArea.list.onclick = function (evt) {
   if (evt.target.tagName == "LI") {
      let index = Array.from(evt.target.parentNode.children).indexOf(evt.target);
      selectQuestion(index);
   } else if (evt.target.tagName == "SPAN") {
      let index = Array.from(evt.target.parentNode.parentNode.children)
         .indexOf(evt.target.parentNode);
      deleteQuestion(index);
   }
};

document.getElementById("open-button").onclick = function() {
   openDialog.url.value = "";
   toggleDialog(document.getElementById("open-dialog"));
};

document.getElementById("new-button").onclick = function() {
   if (confirm("Creating a new question will discard any un-saved information, are you sure you want to proceed?"))
      newQuestion();
}

document.getElementById("publish-button").onclick =  function() {
   publishDialog.name.value = quizName;
   toggleDialog(document.getElementById("publish-dialog"));
};

questionsArea.button.onclick = createQuestion;

function selectQuestion(index) {
   editor.question.value = questions[index].question;
   editor.title.value    = questions[index].title;
   editor.text.value     = questions[index].text;
   editor.sources.value  = questions[index].sources[0];

   // Set background color to green on the "correct answer" tile
   for (let i = 0; i < editor.answers.length; i++) {
      editor.answers[i].value = questions[index].answers[i];
      if (questions[index].correctAnswer == i)
         editor.answers[i].style.backgroundColor = "#26de81";
      else editor.answers[i].style.backgroundColor = "#ffffff";
   }

   // If not wasn't already selected before, toggle the class that changes background color
   if (currentQuestion != index) {
      if (currentQuestion >= 0)
         questionsArea.list.children[currentQuestion].classList.toggle("selected");
      questionsArea.list.children[index].classList.toggle("selected");
   }

   currentQuestion = index;
}

function deleteQuestion(id) {
   if (questions.length - 1 > id) selectQuestion(id + 1); // Select next question if possible
   else if (id != 0) selectQuestion(id - 1);
   else createQuestion();

   questions.splice(id, 1);
   questionsArea.list.children[id].remove();

   if (id < currentQuestion) currentQuestion--;
}

function createQuestionItem(name) {
   let listItem = document.createElement("li");
   let deleteButton = document.createElement("span");
   deleteButton.className = "deleteButton";

   listItem.appendChild(document.createTextNode(name));
   listItem.appendChild(deleteButton);

   return listItem;
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
      sources: [""]
   };

   questions.push(newQuestion);

   // Add to list
   //let listItem = document.createElement("li");
   //listItem.appendChild(document.createTextNode("New Question"));
   questionsArea.list.appendChild(createQuestionItem("New Question"));

   selectQuestion(questions.length - 1);
}

function newQuestion() {
   questions = [];
   questionsArea.list.innerHTML = "";
   clearCookies();
   document.getElementById("id-box").style.display = "none";
   document.getElementById("publish-button").innerHTML = "Publish";
   currentQuestion = -1;
   createQuestion();
}

function addQuestion(questionObj, select = true) {
   questions.push(questionObj);
   //let listItem = document.createElement("li");
   //listItem.appendChild(document.createTextNode(questionObj.question));
   questionsArea.list.appendChild(createQuestionItem(questionObj.question));

   if (select) selectQuestion(questions.length - 1);
}

function toggleDialog(element) {
   dialogBackground.classList.toggle("shown");

   // Adjust for update
   if (element.id == "publish-dialog") {
      if (password != "" && !element.classList.contains("shown")) {
         update(quizId, JSON.stringify(questions), quizName, password);
      } else if (quizId != "") {
         let labels = element.getElementsByTagName("p");
         labels[2].style.display = "none";
         labels[1].innerHTML = "Quiz Password";
         publishDialog.passwordConfirm.style.display = "none";
      } else {
         let labels = element.getElementsByTagName("p");
         labels[2].style.display = "block";
         labels[1].innerHTML = "Set a Password";
         publishDialog.passwordConfirm.style.display = "block";
      }
   }

   element.classList.toggle("shown");
}

editor.submit.onclick = function() {
   questions[currentQuestion].question   = editor.question.value;
   questions[currentQuestion].title      = editor.title.value;
   questions[currentQuestion].text       = editor.text.value;
   questions[currentQuestion].sources[0] = editor.sources.value;

   if (question.value != "")
      questionsArea.list.children[currentQuestion].innerHTML = editor.question.value + "<span class='deleteButton'></span>";
   else questionsArea.list.children[currentQuestion].innerHTML = "New Question<span class'deleteButton'></span>";

   for (let i = 0; i < editor.answers.length; i++)
      questions[currentQuestion].answers[i] = editor.answers[i].value;
   //deselectQuestion(currentQuestion);

   // Set cookie to save question locally
   document.cookie = "q_" + currentQuestion + "=" +
      encodeURIComponent(JSON.stringify(questions[currentQuestion]));
};

function clearCookies() {
   let cookies = document.cookie.split(/; */);
   for(let i = 0; i < cookies.length; i++) {
      let sign  = cookies[i].indexOf("=");
      let name = cookies[i].substring(0, sign);
      if (cookies[i].startsWith("q_"))
         document.cookie = name + "=; expires=Thu, 01 Jan 1970 00:00:01 GMT;";
   }
}

function update(id, json, name, pass) {
   if (id.startsWith("\"")) id = JSON.parse(id);
   let data = new URLSearchParams();
   data.append("json", json);
   data.append("name", name)
   data.append("password", pass);
   request("Update", data, id).then((result) => {
      showQuizUrl(result);
   });
}

function getQuizUrl(id) {
   return location.protocol + "//" +
      window.location.host + "/q/" + id;
}

function showQuizUrl(id) {
   if (id.startsWith("\"")) id = JSON.parse(id);
   publishDialog.step2.style.display = "block";
   publishDialog.step1.style.display = "none";
   let linkElement = publishDialog.step2.getElementsByTagName("input")[0];
   linkElement.value = getQuizUrl(id);
}

function showIdBox() {
   let idBox = document.getElementById("id-box");
   idBox.value = getQuizUrl(quizId);
   idBox.style.display = "block";
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

publishDialog.submit.onclick = function()  {
   let data  = new URLSearchParams();
   let name  = publishDialog.name.value;
   let pass  = publishDialog.password.value;
   let pass2 = publishDialog.passwordConfirm.value;
   data.append("json", JSON.stringify(questions));
   data.append("name", name)
   data.append("password", pass);

   // Add loader
   let dialog = document.getElementById("publish-dialog");
   dialog.children[1]
      .innerHTML += "<span class='loading'></span>";

   let action = "Update"; // Update existing
   if (quizId == "") { // Publish as new
      if (pass != pass2) {
         document.getElementById("publish-confirm-error").style.display = "inline";
         dialog.getElementsByClassName("loading")[0].remove();
         return true;
      }

      action = "Create";
   }

   if (quizId.startsWith("\"")) quizId = JSON.parse(quizId);
   request(action, data, quizId).then((result) => {
      // Remove loader
      let loader = dialog.getElementsByClassName("loading")[0];
      loader.parentNode.removeChild(loader);

      if (result.startsWith("\"")) result = JSON.parse(result);
      showQuizUrl(result);

      // Update local variables
      quizId   = result;
      quizName = name;
      password = pass;
      document.cookie = "q_id=" + result;
      document.cookie = "q_name=" + name;
      document.getElementById("publish-button").innerHTML = "Publish Changes";

      showIdBox();
   }).catch(function(reject) {
      console.log("Error: " + reject);
   });
};

openDialog.submit.onclick = function() {
   let url  = openDialog.url.value;
   let pass = openDialog.password.value;
   let data = new URLSearchParams();
   if (url.endsWith("/")) url = url.substring(0, url.length - 2);
   let id = url.substring(url.lastIndexOf("/") + 1);
   data.append("id", id); // Get ID from url
   //data.append("password", document.getElementById("open-password").value);

   // Confirm
   if (questions != []) {
      if (!confirm("Opening a quiz will overwrite any local quiz data(published quizzes will be intact), are you sure you want to continue?"))
         return;
   }

   // Add loader
   let dialog = document.getElementById("open-dialog");
   dialog.children[0].innerHTML += "<span class='loading'></span>";

   request("Get", data, id).then((result) => {
      // Remove loader
      let loader = dialog.getElementsByClassName("loading")[0];
      loader.parentNode.removeChild(loader);

      // Clear
      clearCookies();
      questions = [];
      questionsArea.list.innerHTML = "";

      // Open
      let resultObj       = JSON.parse(result);
      let openedQuestions = JSON.parse(resultObj.json);
      currentQuestion = 0;
      for (let i = 0; i < openedQuestions.length; i++) {
         document.cookie = "q_" + i + "=" + encodeURIComponent(
            JSON.stringify(openedQuestions[i]));
         addQuestion(openedQuestions[i], i == 0);
      }

      questionsArea.list.children[0].classList.toggle("selected");

      // Update local variables
      quizId   = id;
      quizName = resultObj.name;
      password = pass;
      document.cookie = "q_id=" + id;
      document.cookie = "q_name=" + resultObj.name;
      document.cookie = "q_password=" + pass;
      document.getElementById("publish-button").innerHTML = "Publish Changes";

      showIdBox();
      toggleDialog(document.getElementById("open-dialog"));
   });
};

/*publishDialog.copyButton.addEventListener("click", function() {
   let input = publishDialog.copyButton.parentNode.getElementsByTagName("input")[0];
   input.select();
   document.execCommand("copy");
});*/

publishDialog.step2.getElementsByTagName("button")[0].onclick = function() {
   toggleDialog(document.getElementById("publish-dialog"));
   publishDialog.step2.style.display = "none";
   publishDialog.step1.style.display = "block";
};

publishDialog.cancel.onclick = function() {
   publishDialog.name.value = "";
   publishDialog.password.value = "";
   publishDialog.passwordConfirm.value = "";
   toggleDialog(document.getElementById("publish-dialog"));
}

openDialog.cancel.onclick = function() {
   openDialog.url.value = "";
   openDialog.password.value = "";
   toggleDialog(document.getElementById("open-dialog"));
}

dialogBackground.addEventListener("click", function()  {
   if (document.getElementById("publish-dialog").classList.contains("shown"))
      toggleDialog(document.getElementById("publish-dialog"));
   if (document.getElementById("open-dialog").classList.contains("show"))
      toggleDialog(document.getElementById("open-dialog"));
});
