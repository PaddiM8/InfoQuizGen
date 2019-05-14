using System;
using System.Web;
using MongoDB.Driver;
using MongoDB.Bson;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;

namespace InfoQuizMVC.Controllers
{
   [Route("api/[controller]")]
   [ApiController]
   public class DatabaseController : ControllerBase
   {
      // GET api/quiz/5
      [HttpGet("{id}")]
      public async Task<string> Get(string id)
      {
         var quiz = await new Database().QuizCollection
            .FindAsync<Quiz>(x => x.Id == new ObjectId(id)).Result.SingleAsync();
         return quiz.Json;
      }

      // POST api/values
      [HttpPost]
      public async Task<ObjectId> Create([FromForm]string json, [FromForm]string password)
      {
         var quiz = new Quiz
         {
            Json     = json,
            Password = PBKDF2.Hash(password)
         };

         await new Database().QuizCollection.InsertOneAsync(quiz);

         return quiz.Id;
      }

      // PUT api/quiz/5
      [HttpPut("{id}")]
      public async Task<string> Update(string id, [FromForm]string json, [FromForm]string password)
      {
         var quiz = await new Database().QuizCollection
            .FindAsync<Quiz>(x => x.Id == new ObjectId(id)).Result
            .SingleAsync();

         if (PBKDF2.Validate(password, quiz.Password))
         {
            await new Database().QuizCollection.UpdateOneAsync(
                  Builders<Quiz>.Filter.Eq("_id", new ObjectId(id)),
                  Builders<Quiz>.Update.Set("json", json));
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
