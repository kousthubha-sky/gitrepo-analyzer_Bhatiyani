# Backend Deployment Guide to Render

## Prerequisites
- A Render account (https://render.com)
- Your GitHub repository connected to Render
- Your existing environment variables

## Step-by-Step Deployment Guide

### 1. Project Preparation

First, ensure your backend repository has these required files:

#### requirements.txt
```bash
fastapi==0.68.0
uvicorn==0.15.0
python-dotenv==0.19.0
requests==2.26.0
supabase==0.7.1
python-jose==3.3.0
gunicorn==20.1.0
```

#### Create a render.yaml file
Create a new file called `render.yaml` in your backend directory with:

```yaml
services:
  - type: web
    name: github-analyzer-backend
    env: python
    buildCommand: pip install -r requirements.txt
    startCommand: gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT
    envVars:
      - key: PYTHON_VERSION
        value: 3.11
```

### 2. Render Dashboard Setup

1. Log in to your Render dashboard
2. Click "New +" and select "Web Service"
3. Connect your GitHub repository
4. Configure the service:
   - **Name**: github-analyzer-backend
   - **Runtime**: Python 3
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:$PORT`

### 3. Environment Variables Setup

Add these environment variables in Render dashboard:

```
SUPABASE_URL=https://omejwbqsqoagliaykmxx.supabase.co
SUPABASE_ANON_KEY=[your-supabase-key]
GITHUB_TOKEN=[your-new-github-token]
GITHUB_API_BASE_URL=https://api.github.com
SECRET_KEY=[your-production-secret-key]
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
FRONTEND_URL=[your-frontend-url]
DEBUG=False
ENVIRONMENT=production
```

### 4. Deploy

1. Click "Create Web Service"
2. Wait for the initial deployment to complete
3. Your API will be available at: `https://github-analyzer-backend.onrender.com`

### 5. Post-Deployment Steps

1. Update CORS settings in your backend code if needed
2. Test API endpoints using the provided Render URL
3. Update your frontend's API endpoint to point to the new Render URL

### 6. Monitoring and Maintenance

- Monitor your application logs in the Render dashboard
- Set up alerts for any failures
- Check usage metrics and adjust instance size if needed

## Troubleshooting

Common issues and solutions:

1. **502 Bad Gateway**
   - Check your start command
   - Verify all environment variables are set
   - Check application logs for errors

2. **CORS Issues**
   - Verify FRONTEND_URL is correctly set
   - Check CORS middleware configuration

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check network access rules

## Important Notes

1. **Security**:
   - Never commit .env files to Git
   - Use secure, unique values for SECRET_KEY
   - Regularly rotate GitHub tokens

2. **Performance**:
   - Monitor response times
   - Adjust worker count based on load
   - Consider caching strategies

3. **Costs**:
   - Free tier has limitations
   - Monitor usage to avoid unexpected charges

## Useful Commands for Local Testing

Test your production setup locally:

```bash
# Install production dependencies
pip install -r requirements.txt

# Run with Gunicorn (same as Render)
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```
