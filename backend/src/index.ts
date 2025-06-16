import { app } from './app';
import { config } from './config/index';

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${config.env}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  
  if (config.env === 'development') {
    console.log(`📝 API Documentation: http://localhost:${PORT}/api/docs`);
  }
});
