import express, { Request, Response } from 'express';

const router = express.Router();

router.get('/', (req: Request, res: Response) => {
  res.send(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>TYPESCRIPT_VIBE</title>
        <link rel="icon" href="/favicon.ico" type="image/x-icon">
        <style>
          body { font-family: sans-serif; display: flex; justify-content: center; align-items: center; height: 100vh; background-color: #f0f2f5; }
          form { background-color: white; padding: 2rem; border-radius: 8px; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); }
          input { display: block; width: 100%; padding: 0.5rem; margin-bottom: 1rem; border: 1px solid #ddd; border-radius: 4px; }
          button { width: 100%; padding: 0.75rem; border: none; border-radius: 4px; background-color: #007bff; color: white; font-size: 1rem; cursor: pointer; }
          button:hover { background-color: #0056b3; }
        </style>
      </head>
      <body>
        <form action="/login" method="post">
          <h2>Login</h2>
          <input type="text" name="username" placeholder="Username" required maxlength="12">
          
          <button type="submit">Log In</button>
        </form>
      </body>
    </html>
  `);
});

router.post('/login', (req: Request, res: Response) => {
    const username = req.body.username;
    // NOTE: This is a placeholder for actual login logic.
    // In a real application, you would validate the username and password.
    if (username) {
        res.redirect(`/users?username=${encodeURIComponent(username)}`);
    } else {
        res.redirect('/');
    }
});

export default router;
