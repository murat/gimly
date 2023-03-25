# Gimly

![gimly](https://e7.pngegg.com/pngimages/463/416/png-clipart-human-behavior-illustration-cartoon-facial-hair-animal-gimli-human-cartoon.png)
_img credit: [https://www.pngegg.com](https://www.pngegg.com/tr/png-ovvoe)_

Gimly is a URL shortener service written in Golang. It's just a hobby project, so don't expect a lot of features. I'll add the necessary shortening service features if I have enough time to work on it.

# API Contracts

## Create a short url

```bash
echo '{"data":{"title":"duayen","url":"https://murat.duayen.dev"}}' | http post :8080
```

## Get a short url

```bash
http :8080/mlI4J_X0
```
