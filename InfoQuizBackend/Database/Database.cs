using System;
using MongoDB.Bson;
using MongoDB.Driver;

public class Database
{
   public IMongoCollection<Quiz> QuizCollection { get; private set; }
   public Database()
   {
      var client = new MongoClient("mongodb://localhost:27017");
      QuizCollection = client.GetDatabase("InfoQuiz")
         .GetCollection<Quiz>("Quizzes");
   }
}
