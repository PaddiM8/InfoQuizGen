var currentQuestion = 0;
var volume = 0.3;

window.onload = function() { loadQuestion(0); }

var answers = document.getElementById("answers");
var continueButton = document.getElementById("continue");

answers.addEventListener("click", function (evt) {
   var question = questions[currentQuestion];
   var correctAnswerId = question.correctAnswer;

   if (evt.target.className == "answer tile") {
      for (i = 0; i < answers.children.length; i++)
         answers.children[i].classList.add("inactive");

      if (question.answers[correctAnswerId] == evt.target.innerHTML) {
         evt.target.className = "answer tile correct";
         var audio = new Audio("../res/quiz/Correct.wav");
         audio.volume = volume;
         audio.play();
      } else {
         evt.target.className = "answer tile incorrect";
         answers.children[correctAnswerId].className = "answer tile correct";
         var audio = new Audio("../res/quiz/Buzz.wav");
         audio.volume = volume;
         audio.play();
      }

      continueButton.classList.toggle("slide-down");
   }
}, false);

document.getElementById("continueArrow").addEventListener("click", toggleQuiz);

var quizMode = true;
function toggleQuiz() {
   var audio = new Audio("../res/quiz/Click.wav");
   audio.volume = volume;
   audio.play();

   continueButton.classList.toggle("slide-down");

   for (i = 0; i < answers.children.length; i++) {
      var answer = answers.children[i];
      answer.classList.toggle("expand");

      if (answer.classList.contains("correct")) answer.classList.toggle("correct");
      if (answer.classList.contains("incorrect")) answer.classList.toggle("incorrect");
   }

   answers.children[2].classList.toggle("bottom-left-radius");
   answers.children[3].classList.toggle("bottom-right-radius");

   if (answers.style.marginBottom != "10px")
        answers.style.marginBottom = "10px";
   else answers.style.marginBottom = "0";

   document.getElementById("question").classList.toggle("expand-question");

   if (quizMode) {
      setTimeout(function() {
         document.getElementById("text").classList.toggle("show-text");
      }, 200);

      setTimeout(function() {
         continueButton.classList.toggle("slide-down");
         quizMode = false;
      }, 800);
   } else {
      for (i = 0; i < answers.children.length; i++) {
         if (answers.children[i].classList.contains("inactive"))
            answers.children[i].classList.toggle("inactive");
      }

      document.getElementById("text").classList.toggle("show-text");
      quizMode = true;
      if (currentQuestion < questions.length -  1)
           loadQuestion(currentQuestion + 1);
      else loadQuestion(0);
   }
}

function loadQuestion(id) {
   var question = document.getElementById("question");
   question.innerHTML = questions[id].question;
   currentQuestion = id;

   for (i = 0; i < answers.children.length; i++)
      answers.children[i].innerHTML = questions[id].answers[i];

   let text = "<h2>" + questions[id].title + "</h2>" + questions[id].text;
   document.getElementById("content").innerHTML = text;
   document.getElementById("sources").innerHTML = questions[id].sources.join("<br />");
}
