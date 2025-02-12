const router = require('express').Router();

router.post('/', (req, res) => {
    const { price, inc } = req.body;

    const eff = inc/price;

    res.status(200).json({
        eff: eff
    });
});

module.exports = router;