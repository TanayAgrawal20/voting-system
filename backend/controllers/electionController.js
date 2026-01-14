exports.startElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);

        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }

        election.status = "active"; // 🔥 updated
        await election.save();

        res.json({ message: "Election is now ACTIVE", election });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


exports.endElection = async (req, res) => {
    try {
        const election = await Election.findById(req.params.id);

        if (!election) {
            return res.status(404).json({ message: "Election not found" });
        }

        election.status = "past";
        await election.save();

        res.json({ message: "Election ended successfully", election });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
