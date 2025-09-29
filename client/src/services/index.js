import { 
  login, 
  register, 
  createWall, 
  submitFeedback, 
  getUserProfile 
} from './services';


await login(credentials);
await register(userData);
await createWall(wallData);
await submitFeedback(feedbackData);
await getUserProfile();