using System;
using MongoDB.Bson;
using MongoDB.Bson.Serialization.Attributes;
using MongoDB.Driver;

public class Quiz 
{
   [BsonId]
   public ObjectId Id { get; set; }

   [BsonElement("json")]
   public string Json { get; set; }

   [BsonElement("password")]
   public string Password { get; set; }
}
