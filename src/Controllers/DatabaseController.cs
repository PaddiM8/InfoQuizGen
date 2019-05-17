using System;
using System.Web;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using Newtonsoft.Json.Linq;

namespace InfoQuizMVC.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class DatabaseController : ControllerBase
   {

      public async Task<Tuple<string, string>> GetQuiz(string id)
      {
         var quiz = await new Database().QuizCollection
            .FindAsync<Quiz>(x => x.Id == new ObjectId(id)).Result.SingleAsync();
         return new Tuple<string, string>(quiz.Name, quiz.Json);
      }

      // GET api/quiz/5
      [HttpGet("{id}")]
      public string Get(string id)
      {
         var quizData = GetQuiz(id).Result;
         return JsonConvert.SerializeObject(new
         {
            name = quizData.Item1,
            json = quizData.Item2
         });
      }

      // POST api/values
      [HttpPost]
      public async Task<ObjectId> Create([FromForm]string name, [FromForm]string json, [FromForm]string password)
      {
         var quiz = new Quiz
         {
            Name     = name,
            Json     = json,
            Password = PBKDF2.Hash(password)
         };

         await new Database().QuizCollection.InsertOneAsync(quiz);

         return quiz.Id;
      }

      // PUT api/quiz/5
      [HttpPut("{id}")]
      public async Task<string> Update(string id, [FromForm]string name, [FromForm]string json, [FromForm]string password)
      {
         var quiz = await new Database().QuizCollection
            .FindAsync<Quiz>(x => x.Id == new ObjectId(id)).Result
            .SingleAsync();

         if (PBKDF2.Validate(password, quiz.Password))
         {
            var update = Builders<Quiz>.Update.Set("name", name)
                                              .Set("json", json);

            await new Database().QuizCollection.UpdateOneAsync(
                  Builders<Quiz>.Filter.Eq("_id", new ObjectId(id)), update);
            return id;
         }
         else
         {
            return "[Error] Invalid Password";
         }
      }

      [HttpPut("{id}/changePassword")]
      public async Task<string> ChangePassword(string id, [FromForm]string oldPassword, [FromForm]string newPassword)
      {
         var quiz = await new Database().QuizCollection
            .FindAsync<Quiz>(x => x.Id == new ObjectId(id)).Result
            .SingleAsync();

         if (PBKDF2.Validate(oldPassword, quiz.Password))
         {
            await new Database().QuizCollection.UpdateOneAsync(
                  Builders<Quiz>.Filter.Eq("_id", new ObjectId(id)),
                  Builders<Quiz>.Update.Set("password", newPassword));
            return "0";
         }
         else
         {
            return "Incorrect password.";
         }
      }

      // DELETE api/values/5
      [HttpDelete("{id}")]
      public void Delete(int id)
      {

      }
   }
}
