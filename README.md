# Virtual Voice Assistant - Docker Deployment Guide

This repository contains a containerized Next.js application with a virtual voice assistant powered by Vapi.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop)

## Environment Variables

The application requires the following environment variables:

- `NEXT_PUBLIC_VAPI_API_KEY`: Your Vapi API key
- `NEXT_PUBLIC_VAPI_ASSISTANT_ID`: Your Vapi assistant ID

These can be provided in a `.env` file for local development, but for production deployment, you should pass them securely to your container.

## Building and Running with Docker

### Option 1: Using Docker Compose (Recommended)

1. Ensure your environment variables are set in your shell or in a `.env` file

2. Build and run the container:

```bash
docker-compose up --build
```

3. Access the application at [http://localhost:3000](http://localhost:3000)

### Option 2: Using Docker Directly

1. Build the Docker image:

```bash
docker build -t virtual-voice-assistant \
  --build-arg NEXT_PUBLIC_VAPI_API_KEY=your-api-key \
  --build-arg NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-assistant-id .
```

2. Run the container:

```bash
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_VAPI_API_KEY=your-api-key \
  -e NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-assistant-id \
  virtual-voice-assistant
```

3. Access the application at [http://localhost:3000](http://localhost:3000)

## Production Deployment

For production environments, consider the following:

1. Use a secure method to inject environment variables
2. Consider using Docker Swarm or Kubernetes for orchestration
3. Set up proper monitoring and logging
4. Configure a reverse proxy like Nginx for SSL termination

### Example Docker Swarm Deployment

```bash
docker service create --name virtual-voice-assistant \
  --publish 3000:3000 \
  --env NEXT_PUBLIC_VAPI_API_KEY=your-api-key \
  --env NEXT_PUBLIC_VAPI_ASSISTANT_ID=your-assistant-id \
  --replicas 2 \
  virtual-voice-assistant
```

## Security Considerations

- Never commit `.env` files to version control
- Use secrets management in production environments
- Use non-root users in containers (already configured in Dockerfile)
- Keep Docker and all dependencies updated

## License

This project is private. All rights reserved.
