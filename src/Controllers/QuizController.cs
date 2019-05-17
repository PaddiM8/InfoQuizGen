using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using InfoQuizMVC.Models;

namespace InfoQuizMVC.Controllers
{
    public class QuizController : Controller
    {
       [Route("q/{id}")]
       public IActionResult Index(string id)
       {
          Tuple<string, string> quizData = new DatabaseController().GetQuiz(id).Result;
          ViewData["name"] = quizData.Item1;
          ViewData["json"] = quizData.Item2;
          return View();
       }

       [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
       public IActionResult Error()
       {
          return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
       }
    }
}
