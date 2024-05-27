export default async function handler(req, res) {
  console.log(process.env.WEBHOOK_SECRET);
  console.log(process.env.WEBHOOK_SECRET);
  res.status(200).json({ now: new Date().toISOString() });
}
