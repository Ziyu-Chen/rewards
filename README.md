# Rewards

## Build a docker image for this application:
```sh
docker build -t rewards:1.0 .
```

## Create a container using the above image
```sh
docker run -d -p 5656:3000 --name rewards rewards:1.0
```
And now you can access this application at port 5656

## Test the following APIs
/users/:userId/rewards
```sh
curl --location -g --request GET 'localhost:5656/users/1/rewards?at=2022-05-01T12:00:00Z'
```
/users/:userId/rewards/:availableAt/redeem
```sh
curl --location -g --request PATCH 'localhost:5656/users/1/rewards/2022-05-01T12:00:00Z/redeem'
```
