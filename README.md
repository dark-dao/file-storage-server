# file-storage-server

Simple service of file storage.
(stores files in encrypted form)

## How use

#### Save file
*Request:*
```
  POST localhost:5007/file
  body:
    ---------------------------acebdf13572468
      Content-Disposition: form-data; name="file"; filename="filename.jpg"
      Content-Type: image/jpeg

      <@INCLUDE *C:\filename.jpg*@>
    ---------------------------acebdf13572468--
```

*Response:*
```json
  {
    "success":true,
    "id":"30b6d952-35ea-42b1-a19f-af37a2a8a8d6",
    "message":"Encrypted file written to disk!"
  }
```

#### Get file
*Request*
```
  GET localhost:5007file/{id}
```

#### Delete file
*Request*
```
  DELETE localhost:5007/file/{id}
```
*Response*
```json
  {
    "success":true,
    "id":"30b6d952-35ea-42b1-a19f-af37a2a8a8d6",
    "message":"File is deleted!"
  }
```
