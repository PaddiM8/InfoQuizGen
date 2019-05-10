let questions = [];
let currentQuestion = -1;

let answers      = document.getElementById("answers").children;
let question     = document.getElementById("question-input");
let title        = document.getElementById("info-tile").children[0];
let text         = document.getElementById("text-editor");
let questionList = document.getElementById("question-list");


questionList.addEventListener("click", function (evt) {
   let index = Array.from(evt.target.parentNode.children).indexOf(evt.target);
   selectQuestion(index);
});

document.getElementById("new-question").addEventListener("click", createQuestion);

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
