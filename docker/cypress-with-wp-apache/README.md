## Build

```bash
docker build --platform linux/amd64 --squash . -t gravitywiz/cypress-with-wp:apache
```

## Pushing to Docker Hub

```bash
docker push gravitywiz/cypress-with-wp:apache
```