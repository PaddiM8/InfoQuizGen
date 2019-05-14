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
          ViewData["json"] = new DatabaseController().Get(id).Result;
          Console.WriteLine("Json: " + ViewData["json"]);
          return View();
       }

       [ResponseCache(Duration = 0, Location = ResponseCacheLocation.None, NoStore = true)]
       public IActionResult Error()
       {
          return View(new ErrorViewModel { RequestId = Activity.Current?.Id ?? HttpContext.TraceIdentifier });
       }
    }
}
