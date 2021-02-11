# python-react-tagging-standalone

## Description

Standalone web-application aimed at tagging students answers with misconceptions from 
https://progmiscon.org/misconceptions

The application aims at improving the efficiency of tagging students answers by providing aids in the tagging procedure,
this will allow for a more scalable tagging experience.

##Project Structure
- frontend: React Typescript application
- model: models of the project
- mongodb: init script for MongoDB server, initial data
- tagging service: Python Flask server


## Usage
The application is entirely dockerized and as such can be run as long as Docker is installed, to run it:
```
cd python-react-tagging-standalone

docker-compose up --build
```
then connect to http://localhost:8080/

To stop the containers
```
docker-compose down
```



## Connect to a specific container

The host can connect to the various containers at the following addresses
- frontend: http://localhost:8080/
- tagging service:   http://localhost:5000/
- MongoDB database:     http://localhost:27017/

Note:
We can see the available endpoints of the tagging service by connecting directly to its container http://localhost:5000/

