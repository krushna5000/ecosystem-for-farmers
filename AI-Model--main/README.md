# plant-api

endpoint for prediction : https://plant-api-arqz.onrender.com/predict

POST /predict
Description:
Uploads an image of a plant leaf and returns the predicted plant and disease class based on the trained model.

Request
Method: POST

Content-Type: multipart/form-data

Form Field:

image: (required) The image file of the plant leaf (JPG, PNG, etc.)

Example using curl: curl -X POST http://<your-server-ip>:10000/predict \
  -F image=@/path/to/your/leaf.jpg

  Response
Status Code: 200 OK if successful, or 400 Bad Request if image is missing.

Success Response:
json
{
  "plant": "Tomato",
  "disease": "Tomato_Yellow_Leaf_Curl_Virus",
  "label": "Tomato_Tomato_Yellow_Leaf_Curl_Virus",
  "confidence": 0.9845325946807861
}

 Error Response (No image uploaded):
json

{
  "error": "No image uploaded"
}

Notes
1.The model expects images resized to 224x224 pixels internally.
2.Confidence is a float between 0 and 1, representing the model’s confidence in its prediction.
3.If the label contains "___", it will be split into plant and disease.
4.If not, disease will be marked as "Unknown".
