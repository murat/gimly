# Gimly

<img width="250" height="249" style="width: 250px; height: 249px" src="https://e7.pngegg.com/pngimages/463/416/png-clipart-human-behavior-illustration-cartoon-facial-hair-animal-gimli-human-cartoon.png" />

_img credit: [https://www.pngegg.com](https://www.pngegg.com/tr/png-ovvoe)_

Gimly is a URL shortener service written in Golang. It's just a hobby project, so don't expect a lot of features. I'll add the necessary shortening service features if I have enough time to work on it.

# Up & Running

```bash
git clone git@github.com:murat/gimly.git && cd gimly
go mod download
cd web && npm install && npm run build && cd ..
go run cmd/gimly/main.go
# or
air # you need to install it
```

Will listen :8080 port 🤞

# API Contracts

[![Run in Postman](https://run.pstmn.io/button.svg)](https://app.getpostman.com/run-collection/1516159-27796f8e-78fb-48de-83e1-ec4487c1473c?action=collection%2Ffork&collection-url=entityId%3D1516159-27796f8e-78fb-48de-83e1-ec4487c1473c%26entityType%3Dcollection%26workspaceId%3D1345c377-be33-4081-a4b0-cc1445714b3c)

## Create a short url

```bash
echo '{"data":{"title":"Github","url":"https://github.com"}}' | http post :8080/api/url

{
    "data": {
        "url": {
            "title": "Github",
            "url": "https://github.com"
        },
        "short_id": "UrIRHQx9"
    }
}
```

## Get list of urls

```bash
http :8080/api/url

{
    "data": [{
        "url": {
            "title": "Github",
            "url": "https://github.com"
        },
        "short_id": "UrIRHQx9"
    }...],
}
```

## Get a short url

```bash
http :8080/u/UrIRHQx9
```

It will redirect with HTTP status 308 🤞

Cheers 🍻