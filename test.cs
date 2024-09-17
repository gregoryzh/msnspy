using Newtonsoft.Json;
using System;
using System.IO;
using System.Net.Http;
using System.Text;
using System.Threading.Tasks;

class Program
{
    private const string API_KEY = "YOUR_API_KEY"; // Set your key here
    private const string IMAGE_PATH = "YOUR_IMAGE_PATH"; // Set your image path here
    private const string QUESTION = "YOUR_QUESTION"; // Set your question here

    private const string ENDPOINT  = "https://msnspy.openai.azure.com/openai/deployments/gpt-4o/chat/completions?api-version=2024-02-15-preview";
    static async Task Main()
    {
        var encodedImage = Convert.ToBase64String(File.ReadAllBytes(IMAGE_PATH));
        using (var httpClient = new HttpClient())
        {
            httpClient.DefaultRequestHeaders.Add("api-key", API_KEY);
            var payload = new
            {
                messages = new object[]
                {
                  new {
                      role = "system",
                      content = new object[] {
                          new {
                              type = "text",
                              text = "You are an AI assistant that helps people find information."
                          }
                      }
                  },
                  new {
                      role = "user",
                      content = new object[] {
                          new {
                              type = "image_url",
                              image_url = new {
                                  url = $"data:image/jpeg;base64,{encodedImage}"
                              }
                          },
                          new {
                              type = "text",
                              text = QUESTION
                          }
                      }
                  }
                },
                temperature = 0.7,
                top_p = 0.95,
                max_tokens = 800,
                stream = false
            };

            var response = await httpClient.PostAsync(ENDPOINT , new StringContent(JsonConvert.SerializeObject(payload), Encoding.UTF8, "application/json"));

            if (response.IsSuccessStatusCode)
            {
                var responseData = JsonConvert.DeserializeObject<dynamic>(await response.Content.ReadAsStringAsync());
                Console.WriteLine(responseData);
            }
            else
            {
                Console.WriteLine($"Error: {response.StatusCode}, {response.ReasonPhrase}");
            }
        }
    }
}