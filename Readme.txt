Build Instructions

Note: 
    By default, the server runs at port 3000 and the UI should run at port 3001. So make sure both ports are free.
    If not, the port can be changed in my-pet-store/index.js
    And change line 27 in the UI to have the desired port. (tofetch("http://localhost:3000/rates/best")

1. Get the server and UI from Github.

2. Install NodeJS

3. Install VScode for debugging if necessary

4. Go inside each directory and run the command: npm install

5. Start the server in the server's directory using the command: nodemon index

6. The server runs at port 3000 so make sure to run it before running the UI

7. Start the UI in the UI's directory using the command: npm start

8. It will ask you if you want to run the UI on another port. Select: Y. It will run on port 3001


Postman option:

You can also test with Postman doing a post to: http://localhost:3000/rates/best

And using the following payload:

POST /rates/best HTTP/1.1
Host: localhost:3000
Content-Type: application/json

{
	"address_line_one": "336 Revere Ave",
    "address_line_two": "",
    "city": "Montréal",
    "province": "Québec",
    "postalCode": "H3P1C3",
    "country": "Canada"
 }
