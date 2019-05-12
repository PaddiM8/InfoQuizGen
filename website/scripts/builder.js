let questions = [];
let currentQuestion = -1;
const server = "http://localhost:5000/api/quiz";

let answers      = document.getElementById("answers").children;
let question     = document.getElementById("question-input");
let title        = document.getElementById("info-tile").children[0];
let text         = document.getElementById("text-editor");
let questionList = document.getElementById("question-list");


questionList.addEventListener("click", function (evt) {
   let index = Array.from(evt.target.parentNode.children).indexOf(evt.target);
   selectQuestion(index);
});

document.getElementById("publish-button").addEventListener("click", function() {
   toggleDialog(document.getElementById("publish-dialog"));
});

document.getElementById("publish-submit").addEventListener("click", function() {
   document.getElementById("publish-dialog").children[1]
      .innerHTML += "<span class='loading'></span>";

   let result = request("POST", "", {
      json: questions,
      password: document.getElementById("publish-password")
   });

   if (result == "0") {
      document.getElementById("publish-dialog")
         .getElementByClassName("loading")[0].delete();
   }
});

document.getElementById("new-question").addEventListener("click", createQuestion);

function request(type, url, data) {
   let xhr = new XMLHttpRequest();
   xhr.open(type, server + "/" + url, true);
   xhr.onreadystatechange = function () {
      if (this.status == 200) {
         return this.responseText;
      }
   };

   xhr.setRequestHeader('Content-Type', 'application/json');
   xhr.send(JSON.stringify(data));
}

function selectQuestion(index) {
   question.value = questions[index].question;
   title.value    = questions[index].title;
   text.value = questions[index].text;

   // Set background color to green on the "correct answer" tile
   for (i = 0; i < answers.length; i++) {
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

function deselectQuestion(index) {

}

function toggleDialog(element) {
   let dialogBackground = document.getElementById("dialog-background");

   dialogBackground.classList.toggle("shown");
   element.classList.toggle("shown");
}

document.getElementById("update-question").addEventListener("click", function() {
   questions[currentQuestion].question = question.value;
   questions[currentQuestion].title = title.value;
   questions[currentQuestion].text = text.value;

   if (question.value != "")
      questionList.children[currentQuestion].innerHTML = question.value;
   else questionList.children[currentQuestion].innerHTML = "New Question";

   for (i = 0; i < answers.length; i++)
      questions[currentQuestion].answers[i] = answers[i].value;

   deselectQuestion(currentQuestion);
});

window.onload = createQuestion;
