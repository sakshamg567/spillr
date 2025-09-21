import { 
  login, 
  register, 
  createWall, 
  submitFeedback, 
  getUserProfile 
} from './services';


await login(credentials);
await createWall(wallData);
await submitFeedback(feedbackData);
await getUserProfile();