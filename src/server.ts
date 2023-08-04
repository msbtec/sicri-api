import app from './app';

app.listen(process.env.API_PORT, () => {
  console.log(`🚀 SISID running on port ${process.env.API_PORT}`);
});
