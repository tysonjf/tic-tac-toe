The dockerfiles should be at the root in docker/server/Dockerfile?
the docker-compose should be at the root of the monorepo

I will need to copy in the whole monorepo and then just install the
dependencies related to the server (which will include the shared folders)
the commands to start or dev the server will be in the package.json of the monorepo

