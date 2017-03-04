# Runnable example of unit testing Typescript on the fly in Karma with Istanbul coverage, inside a Docker container.

## Installation

*Please note that this document assumes Docker is already installed and fully functional on the host operative system.*

First, install `karma-typescript` and change to the docker example directory:
```
npm install karma-typescript
cd node_modules/karma-typescript/examples/docker
```

Build the example image and check that the local registry contains the images `node` and `karma-typescript/example`:
```
docker build -t karma-typescript/example .
docker images
```

## Running the tests

Run a new container with the image created in the previous step:
```
docker run -d --name test-container karma-typescript/example
```

List all running containers, `karma-typescript/example` should be there with the name `test-container`:
```
docker ps
```

Check the logs to see the output from the test run and check that coverage has been created inside the container:
```
docker logs test-container
docker exec test-container ls -la coverage
```
