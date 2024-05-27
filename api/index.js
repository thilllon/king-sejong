export default async function handler(req, res) {
  res.status(200).json({ now: new Date().toISOString() });
}
