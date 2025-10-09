export const getPublicWall = async (req, res) => {
  const { username } = req.params; 

  if (!username) {
    return res.status(400).json({ error: 'Username required' });
  }

  try {
    const wall = await Wall.findOne({ username }).lean();
    if (!wall) {
      return res.status(404).json({ error: 'Wall not found' });
    }
    res.json(wall);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
};